import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(msg: string, status = 400) {
  return json({ error: msg }, status);
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// ---- Layer + game constants ----
const LAYER_DEFS = [
  { minLayer: 1, maxLayer: 10, digsRequired: 5, baseCarbon: 1 },
  { minLayer: 11, maxLayer: 25, digsRequired: 8, baseCarbon: 2 },
  { minLayer: 26, maxLayer: 50, digsRequired: 12, baseCarbon: 4 },
  { minLayer: 51, maxLayer: 70, digsRequired: 18, baseCarbon: 10 },
  { minLayer: 71, maxLayer: 100, digsRequired: 30, baseCarbon: 35 },
];

function getLayerDef(layer: number) {
  for (const ld of LAYER_DEFS) {
    if (layer >= ld.minLayer && layer <= ld.maxLayer) return ld;
  }
  return LAYER_DEFS[LAYER_DEFS.length - 1];
}

function getActForLayer(layer: number): number {
  if (layer <= 10) return 1;
  if (layer <= 25) return 2;
  if (layer <= 50) return 3;
  if (layer <= 70) return 4;
  return 5;
}

const TOOL_MULTIPLIERS = [1, 1.5, 2, 3];
const TOOL_CRIT_BONUS = [0, 0.02, 0.05, 0.08];
const TOOL_COSTS = [0, 100, 500, 2000];
const HELPER_COSTS = [50, 150, 400];
const HELPER_INCOME = [10, 25, 60];
const DAILY_REWARDS = [10, 15, 20, 30, 40, 50, 100];
const RESOURCE_TYPES = ["iron", "glass", "fossils", "quartz", "diamond", "obsidian", "artifact"];
const RESOURCE_DROPS: Record<string, string[]> = {
  "1-10": ["glass", "fossils"],
  "11-25": ["glass", "quartz"],
  "26-50": ["iron", "quartz"],
  "51-70": ["quartz", "fossils"],
  "71-100": ["diamond", "obsidian"],
};

function getResourcesForLayer(layer: number): string[] {
  if (layer <= 10) return RESOURCE_DROPS["1-10"];
  if (layer <= 25) return RESOURCE_DROPS["11-25"];
  if (layer <= 50) return RESOURCE_DROPS["26-50"];
  if (layer <= 70) return RESOURCE_DROPS["51-70"];
  return RESOURCE_DROPS["71-100"];
}

// ---- Route handlers ----

async function handleLogin(body: Record<string, unknown>): Promise<Response> {
  const user = body.user as Record<string, unknown> | undefined;
  const isDemo = (body.isDemo as boolean) ?? false;

  let telegramId: number;
  let firstName: string;
  let lastName: string | null;
  let username: string | null;
  let photoUrl: string | null;

  if (user && typeof user.id === "number") {
    telegramId = user.id;
    firstName = (user.first_name as string) ?? "Miner";
    lastName = (user.last_name as string) ?? null;
    username = (user.username as string) ?? null;
    photoUrl = (user.photo_url as string) ?? null;
  } else if (isDemo) {
    telegramId = 99999999;
    firstName = "Demo";
    lastName = "Miner";
    username = "demo_miner";
    photoUrl = null;
  } else {
    return err("Missing user data", 400);
  }

  // Upsert user
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  let dbUser: Record<string, unknown>;
  let isNewUser = false;

  if (!existing) {
    isNewUser = true;
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        telegram_id: telegramId,
        first_name: firstName,
        last_name: lastName,
        username,
        photo_url: photoUrl,
        language: "uk",
        total_play_time_seconds: 0,
        current_session_start: new Date().toISOString(),
        last_login: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError || !newUser) return err("Failed to create user: " + insertError?.message, 500);
    dbUser = newUser;
  } else {
    const { data: updated } = await supabase
      .from("users")
      .update({ last_login: new Date().toISOString(), current_session_start: new Date().toISOString() })
      .eq("telegram_id", telegramId)
      .select()
      .single();
    dbUser = updated ?? existing;
  }

  const userId = dbUser.id as string;

  // Upsert game_progress
  const { data: gp } = await supabase
    .from("game_progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  let gameProgress = gp;
  if (!gp) {
    const { data: newGP } = await supabase
      .from("game_progress")
      .insert({ user_id: userId })
      .select()
      .single();
    gameProgress = newGP;
  }

  // Upsert story_progress
  const { data: sp } = await supabase
    .from("story_progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  let storyProgress = sp;
  if (!sp) {
    const { data: newSP } = await supabase
      .from("story_progress")
      .insert({ user_id: userId, act_reached: 1 })
      .select()
      .single();
    storyProgress = newSP;
  }

  // Resources
  const { data: resources } = await supabase
    .from("resources_inventory")
    .select("*")
    .eq("user_id", userId);

  // Create play session
  const { data: session } = await supabase
    .from("play_sessions")
    .insert({ user_id: userId, digs_performed: 0, carbonance_earned: 0 })
    .select()
    .single();

  return json({
    user: dbUser,
    gameProgress,
    storyProgress,
    resources: resources ?? [],
    sessionId: session?.id ?? null,
    isNewUser,
  });
}

async function handleSetLanguage(body: Record<string, unknown>): Promise<Response> {
  const { userId, language } = body as { userId: string; language: string };
  if (!userId || !["uk", "en"].includes(language)) return err("Invalid payload");
  await supabase.from("users").update({ language }).eq("id", userId);
  return json({ success: true });
}

async function handleDig(body: Record<string, unknown>): Promise<Response> {
  const { userId, sessionId } = body as { userId: string; sessionId: string };
  if (!userId) return err("Missing userId");

  const { data: gp } = await supabase
    .from("game_progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!gp) return err("Game progress not found");

  const layer = (gp.current_layer as number) ?? 1;
  const layerDef = getLayerDef(layer);
  const toolLevel = (gp.tool_level as number) ?? 1;
  const toolIdx = Math.min(toolLevel - 1, 3);
  const multiplier = TOOL_MULTIPLIERS[toolIdx];
  const critBonus = TOOL_CRIT_BONUS[toolIdx];
  const totalDigs = ((gp.total_digs as number) ?? 0) + 1;
  const balance = (gp.carbonance_balance as number) ?? 0;

  // Roll
  const isCritical = Math.random() < (0.15 + critBonus);
  const isBonusFind = Math.random() < (0.05 + critBonus);
  let carbonAmount = Math.round(layerDef.baseCarbon * multiplier);
  if (isBonusFind) carbonAmount += Math.round(layerDef.baseCarbon);
  if (isCritical) carbonAmount = Math.round(carbonAmount * 3);

  // Resource drop (25% chance)
  let resourceFound: string | null = null;
  let resourceQuantity = 0;
  if (Math.random() < 0.25) {
    const pool = getResourcesForLayer(layer);
    resourceFound = pool[Math.floor(Math.random() * pool.length)];
    resourceQuantity = isCritical ? 2 : 1;
  }

  // Check layer advance
  const digsInLayer = totalDigs % layerDef.digsRequired;
  const layerAdvanced = digsInLayer === 0 && totalDigs > 0;
  let newLayer = layer;
  let newActUnlocked: number | null = null;
  if (layerAdvanced && layer < 100) {
    newLayer = layer + 1;
    const prevAct = getActForLayer(layer);
    const nextAct = getActForLayer(newLayer);
    if (nextAct > prevAct) newActUnlocked = nextAct;
  }

  const newBalance = balance + carbonAmount;

  // Update game_progress
  await supabase.from("game_progress").update({
    total_digs: totalDigs,
    carbonance_balance: newBalance,
    current_layer: newLayer,
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId);

  // Update resource inventory
  if (resourceFound) {
    const { data: existing } = await supabase
      .from("resources_inventory")
      .select("quantity")
      .eq("user_id", userId)
      .eq("resource_type", resourceFound)
      .maybeSingle();

    if (existing) {
      await supabase.from("resources_inventory").update({
        quantity: (existing.quantity as number) + resourceQuantity,
      }).eq("user_id", userId).eq("resource_type", resourceFound);
    } else {
      await supabase.from("resources_inventory").insert({
        user_id: userId,
        resource_type: resourceFound,
        quantity: resourceQuantity,
      });
    }
  }

  // Update play session
  if (sessionId) {
    const { data: sess } = await supabase
      .from("play_sessions")
      .select("digs_performed, carbonance_earned")
      .eq("id", sessionId)
      .maybeSingle();
    if (sess) {
      await supabase.from("play_sessions").update({
        digs_performed: (sess.digs_performed as number) + 1,
        carbonance_earned: (sess.carbonance_earned as number) + carbonAmount,
        session_end: new Date().toISOString(),
      }).eq("id", sessionId);
    }
  }

  // Story progress update
  if (newActUnlocked) {
    await supabase.from("story_progress").update({ act_reached: newActUnlocked }).eq("user_id", userId);
  }

  return json({
    carbonanceFound: carbonAmount,
    isCritical,
    resourceFound: resourceFound ?? undefined,
    resourceQuantity: resourceQuantity > 0 ? resourceQuantity : undefined,
    newLayer: newLayer !== layer ? newLayer : undefined,
    layerAdvanced,
    newActUnlocked: newActUnlocked ?? undefined,
    newBalance,
    totalDigs,
  });
}

async function handleHeartbeat(body: Record<string, unknown>): Promise<Response> {
  const { userId, sessionId, secondsActive } = body as {
    userId: string;
    sessionId: string;
    secondsActive: number;
  };
  if (!userId || typeof secondsActive !== "number") return err("Invalid payload");

  const { data: user } = await supabase.from("users").select("total_play_time_seconds").eq("id", userId).maybeSingle();
  if (!user) return err("User not found");

  const newTotal = ((user.total_play_time_seconds as number) ?? 0) + secondsActive;
  await supabase.from("users").update({ total_play_time_seconds: newTotal }).eq("id", userId);

  if (sessionId) {
    const { data: sess } = await supabase.from("play_sessions").select("session_duration_seconds").eq("id", sessionId).maybeSingle();
    if (sess) {
      await supabase.from("play_sessions").update({
        session_duration_seconds: ((sess.session_duration_seconds as number) ?? 0) + secondsActive,
        session_end: new Date().toISOString(),
      }).eq("id", sessionId);
    }
  }

  return json({ totalPlayTimeSeconds: newTotal });
}

async function handleUpgrade(body: Record<string, unknown>): Promise<Response> {
  const { userId, type } = body as { userId: string; type: "tool" | "helper" };
  if (!userId || !["tool", "helper"].includes(type)) return err("Invalid payload");

  const { data: gp } = await supabase.from("game_progress").select("*").eq("user_id", userId).maybeSingle();
  if (!gp) return err("Game progress not found");

  const balance = (gp.carbonance_balance as number) ?? 0;
  let cost = 0;
  let newLevel = 0;

  if (type === "tool") {
    const current = (gp.tool_level as number) ?? 1;
    if (current >= 4) return err("Already at max tool level");
    cost = TOOL_COSTS[current];
    if (balance < cost) return err("Not enough Carbonance");
    newLevel = current + 1;
    await supabase.from("game_progress").update({
      tool_level: newLevel,
      carbonance_balance: balance - cost,
      updated_at: new Date().toISOString(),
    }).eq("user_id", userId);
  } else {
    const current = (gp.helper_count as number) ?? 0;
    if (current >= 3) return err("Max helpers reached");
    cost = HELPER_COSTS[current];
    if (balance < cost) return err("Not enough Carbonance");
    newLevel = current + 1;
    const newIncome = HELPER_INCOME[current];
    await supabase.from("game_progress").update({
      helper_count: newLevel,
      passive_income_rate: newIncome,
      carbonance_balance: balance - cost,
      updated_at: new Date().toISOString(),
    }).eq("user_id", userId);
  }

  return json({ newLevel, newBalance: balance - cost, cost });
}

async function handleClaimDaily(body: Record<string, unknown>): Promise<Response> {
  const { userId } = body as { userId: string };
  if (!userId) return err("Missing userId");

  const { data: gp } = await supabase.from("game_progress").select("*").eq("user_id", userId).maybeSingle();
  if (!gp) return err("Game progress not found");

  const lastClaim = gp.daily_claim_time as string | null;
  const streak = (gp.daily_streak as number) ?? 0;
  const balance = (gp.carbonance_balance as number) ?? 0;

  if (lastClaim) {
    const elapsed = Date.now() - new Date(lastClaim).getTime();
    if (elapsed < 24 * 60 * 60 * 1000) return err("Already claimed today");
    // Reset streak if more than 48h
    if (elapsed > 48 * 60 * 60 * 1000) {
      // Streak reset will be handled below with streak = 0
    }
  }

  const missedDay = lastClaim && Date.now() - new Date(lastClaim).getTime() > 48 * 60 * 60 * 1000;
  const newStreak = missedDay ? 1 : streak + 1;
  const rewardIdx = Math.min(newStreak - 1, DAILY_REWARDS.length - 1);
  const rewardAmount = DAILY_REWARDS[rewardIdx];
  const newBalance = balance + rewardAmount;
  const nextClaimAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await supabase.from("game_progress").update({
    daily_claim_time: new Date().toISOString(),
    daily_streak: newStreak,
    carbonance_balance: newBalance,
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId);

  await supabase.from("transactions").insert({
    user_id: userId,
    type: "daily_reward",
    amount: rewardAmount,
    description: { en: `Daily reward (day ${newStreak})`, uk: `Щоденна нагорода (день ${newStreak})` },
  });

  return json({ rewardAmount, newStreak, newBalance, nextClaimAt });
}

async function handleWatchAd(body: Record<string, unknown>): Promise<Response> {
  const { userId, type } = body as { userId: string; type: string };
  if (!userId || !["boost_dig", "treasure_double", "speed_up"].includes(type)) return err("Invalid payload");

  const durationMap: Record<string, number> = {
    boost_dig: 10 * 60 * 1000,
    treasure_double: 5 * 60 * 1000,
    speed_up: 60 * 1000,
  };

  return json({
    boostType: type,
    durationMs: durationMap[type] ?? 60000,
    multiplier: 3,
  });
}

async function handleReferral(body: Record<string, unknown>): Promise<Response> {
  const { referrerTelegramId, newUserId } = body as { referrerTelegramId: number; newUserId: string };
  if (!referrerTelegramId || !newUserId) return err("Invalid payload");

  const { data: referrer } = await supabase.from("users").select("id").eq("telegram_id", referrerTelegramId).maybeSingle();
  if (!referrer) return err("Referrer not found");

  const { data: existing } = await supabase.from("referrals").select("id").eq("referred_id", newUserId).maybeSingle();
  if (existing) return json({ success: true, alreadyExists: true });

  await supabase.from("referrals").insert({ referrer_id: referrer.id, referred_id: newUserId });

  // Bonus for both
  const REFERRAL_BONUS = 50;
  const { data: refGP } = await supabase.from("game_progress").select("carbonance_balance").eq("user_id", referrer.id).maybeSingle();
  const { data: newGP } = await supabase.from("game_progress").select("carbonance_balance").eq("user_id", newUserId).maybeSingle();
  if (refGP) {
    await supabase.from("game_progress").update({ carbonance_balance: (refGP.carbonance_balance as number) + REFERRAL_BONUS }).eq("user_id", referrer.id);
  }
  if (newGP) {
    await supabase.from("game_progress").update({ carbonance_balance: (newGP.carbonance_balance as number) + REFERRAL_BONUS }).eq("user_id", newUserId);
  }

  return json({ success: true, bonus: REFERRAL_BONUS });
}

async function handleBuyStars(body: Record<string, unknown>): Promise<Response> {
  const { userId, packId } = body as { userId: string; packId: string };
  if (!userId || !packId) return err("Invalid payload");

  const PACKS: Record<string, number> = { small: 100, medium: 500, large: 2000 };
  const amount = PACKS[packId];
  if (!amount) return err("Invalid pack");

  const { data: gp } = await supabase.from("game_progress").select("carbonance_balance").eq("user_id", userId).maybeSingle();
  if (!gp) return err("User not found");

  const newBalance = (gp.carbonance_balance as number) + amount;
  await supabase.from("game_progress").update({ carbonance_balance: newBalance }).eq("user_id", userId);
  await supabase.from("transactions").insert({ user_id: userId, type: "purchase", amount, description: { en: `Stars purchase: ${packId} pack`, uk: `Покупка зірками: пакет ${packId}` } });

  return json({ newBalance, amount });
}

// ---- Router ----

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, "");

  try {
    let body: Record<string, unknown> = {};
    if (req.method === "POST" || req.method === "PUT") {
      body = await req.json().catch(() => ({}));
    }

    if (path === "/auth/login") return await handleLogin(body);
    if (path === "/auth/set-language") return await handleSetLanguage(body);
    if (path === "/dig") return await handleDig(body);
    if (path === "/heartbeat") return await handleHeartbeat(body);
    if (path === "/upgrade") return await handleUpgrade(body);
    if (path === "/claim-daily") return await handleClaimDaily(body);
    if (path === "/watch-ad") return await handleWatchAd(body);
    if (path === "/referral") return await handleReferral(body);
    if (path === "/buy-stars") return await handleBuyStars(body);

    return err("Not found", 404);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ error: msg }, 500);
  }
});

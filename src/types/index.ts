export type Language = 'uk' | 'en';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

export interface User {
  id: string;
  telegram_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language: Language;
  total_play_time_seconds: number;
  current_session_start?: string;
  created_at: string;
  last_login: string;
}

export interface GameProgress {
  id: string;
  user_id: string;
  current_layer: number;
  total_digs: number;
  carbonance_balance: number;
  tool_level: number;
  helper_count: number;
  passive_income_rate: number;
  daily_claim_time?: string;
  daily_streak: number;
  updated_at: string;
}

export interface StoryProgress {
  id: string;
  user_id: string;
  act_reached: number;
  journal_pages_found: number[];
  last_page_viewed?: number;
}

export interface ResourceInventory {
  user_id: string;
  resource_type: ResourceType;
  quantity: number;
}

export type ResourceType = 'iron' | 'glass' | 'fossils' | 'quartz' | 'diamond' | 'obsidian' | 'artifact';

export interface Transaction {
  id: string;
  user_id: string;
  type: 'earn' | 'spend' | 'ad_reward' | 'purchase' | 'referral' | 'daily_reward';
  amount: number;
  description: { en: string; uk: string };
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  reward_claimed: boolean;
  created_at: string;
}

export interface PlaySession {
  id: string;
  user_id: string;
  session_start: string;
  session_end?: string;
  session_duration_seconds?: number;
  digs_performed: number;
  carbonance_earned: number;
}

// ---- Game domain types ----

export type LayerName = 'soil' | 'sand' | 'gravel' | 'clay' | 'limestone' | 'sandstone' | 'granite' | 'diamond_layer' | 'magma' | 'core';

export interface LayerDef {
  id: number;
  name: LayerName;
  nameEn: string;
  nameUk: string;
  minLayer: number;
  maxLayer: number;
  digsRequired: number;
  colorFrom: string;
  colorTo: string;
  resources: ResourceType[];
  baseCarbon: number;
}

export type ToolName = 'shovel' | 'pickaxe' | 'jackhammer' | 'drill';

export interface ToolDef {
  level: number;
  name: ToolName;
  nameEn: string;
  nameUk: string;
  descriptionEn: string;
  descriptionUk: string;
  cost: number;
  digMultiplier: number;
  critBonus: number;
}

export interface HelperDef {
  count: number;
  incomePerHour: number;
  cost: number;
  nameEn: string;
  nameUk: string;
}

export interface DigResult {
  carbonanceFound: number;
  isCritical: boolean;
  resourceFound?: ResourceType;
  resourceQuantity?: number;
  newLayer?: number;
  layerAdvanced: boolean;
  newActUnlocked?: number;
}

export type BoostType = 'boost_dig' | 'treasure_double' | 'speed_up';

export interface ActiveBoost {
  type: BoostType;
  expiresAt: number;
  multiplier: number;
}

export interface JournalPage {
  id: number;
  act: number;
  unlockLayer: number;
  titleEn: string;
  titleUk: string;
  contentEn: string;
  contentUk: string;
}

// ---- API response types ----

export interface LoginResponse {
  user: User;
  gameProgress: GameProgress;
  storyProgress: StoryProgress;
  resources: ResourceInventory[];
  sessionId: string;
  isNewUser: boolean;
}

export interface DigResponse {
  carbonanceFound: number;
  isCritical: boolean;
  resourceFound?: ResourceType;
  resourceQuantity?: number;
  newLayer?: number;
  layerAdvanced: boolean;
  newActUnlocked?: number;
  newBalance: number;
  totalDigs: number;
}

export interface DailyRewardResponse {
  rewardAmount: number;
  newStreak: number;
  newBalance: number;
  nextClaimAt: string;
}

export interface UpgradeResponse {
  newLevel: number;
  newBalance: number;
  cost: number;
}

export interface AdRewardResponse {
  boostType: BoostType;
  durationMs: number;
  multiplier: number;
}

export interface HeartbeatResponse {
  totalPlayTimeSeconds: number;
}

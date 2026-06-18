import type {
  ActiveBoost,
  BoostType,
  HelperDef,
  JournalPage,
  LayerDef,
  ResourceType,
  ToolDef,
} from '../types';

export const LAYERS: LayerDef[] = [
  {
    id: 1, name: 'soil', nameEn: 'Soil', nameUk: 'Ґрунт',
    minLayer: 1, maxLayer: 10, digsRequired: 5,
    colorFrom: '#5d4a35', colorTo: '#6b5238',
    resources: ['glass', 'fossils'], baseCarbon: 1,
  },
  {
    id: 2, name: 'sand', nameEn: 'Sand', nameUk: 'Пісок',
    minLayer: 11, maxLayer: 25, digsRequired: 8,
    colorFrom: '#9c8050', colorTo: '#b89668',
    resources: ['glass', 'quartz'], baseCarbon: 2,
  },
  {
    id: 3, name: 'gravel', nameEn: 'Gravel', nameUk: 'Гравій',
    minLayer: 26, maxLayer: 50, digsRequired: 12,
    colorFrom: '#7a6b58', colorTo: '#8a7a65',
    resources: ['iron', 'quartz'], baseCarbon: 4,
  },
  {
    id: 4, name: 'clay', nameEn: 'Clay', nameUk: 'Глина',
    minLayer: 26, maxLayer: 50, digsRequired: 15,
    colorFrom: '#6e4d3c', colorTo: '#7d5a45',
    resources: ['iron', 'fossils'], baseCarbon: 6,
  },
  {
    id: 5, name: 'limestone', nameEn: 'Limestone', nameUk: 'Вапняк',
    minLayer: 51, maxLayer: 70, digsRequired: 18,
    colorFrom: '#9a9382', colorTo: '#aaa398',
    resources: ['quartz', 'fossils'], baseCarbon: 10,
  },
  {
    id: 6, name: 'sandstone', nameEn: 'Sandstone', nameUk: 'Пісковик',
    minLayer: 51, maxLayer: 70, digsRequired: 20,
    colorFrom: '#a87850', colorTo: '#b88a60',
    resources: ['quartz', 'iron'], baseCarbon: 14,
  },
  {
    id: 7, name: 'granite', nameEn: 'Granite', nameUk: 'Граніт',
    minLayer: 51, maxLayer: 70, digsRequired: 25,
    colorFrom: '#4a4540', colorTo: '#5a544e',
    resources: ['quartz', 'diamond'], baseCarbon: 20,
  },
  {
    id: 8, name: 'diamond_layer', nameEn: 'Diamond Layer', nameUk: 'Алмазний шар',
    minLayer: 71, maxLayer: 100, digsRequired: 30,
    colorFrom: '#2a3a4a', colorTo: '#4a5a7a',
    resources: ['diamond', 'obsidian'], baseCarbon: 35,
  },
  {
    id: 9, name: 'magma', nameEn: 'Magma', nameUk: 'Магма',
    minLayer: 71, maxLayer: 100, digsRequired: 35,
    colorFrom: '#5a1a0a', colorTo: '#7a2a1a',
    resources: ['obsidian', 'diamond'], baseCarbon: 50,
  },
  {
    id: 10, name: 'core', nameEn: 'Core', nameUk: 'Ядро',
    minLayer: 71, maxLayer: 100, digsRequired: 50,
    colorFrom: '#ff7a2a', colorTo: '#ffb050',
    resources: ['artifact'], baseCarbon: 100,
  },
];

export function getLayerForDepth(depth: number): LayerDef {
  // Map a numeric depth (1-100) to its layer def.
  // Act layers by depth ranges: 1-10 soil, 11-25 sand, 26-50 gravel/clay, etc.
  if (depth <= 10) return LAYERS[0];
  if (depth <= 25) return LAYERS[1];
  if (depth <= 50) return LAYERS[2];
  if (depth <= 70) return LAYERS[4];
  if (depth <= 90) return LAYERS[7];
  return LAYERS[9];
}

export function getActForDepth(depth: number): number {
  if (depth <= 10) return 1;
  if (depth <= 25) return 2;
  if (depth <= 50) return 3;
  if (depth <= 70) return 4;
  return 5;
}

export const TOOLS: ToolDef[] = [
  {
    level: 1, name: 'shovel', nameEn: 'Shovel', nameUk: 'Лопата',
    descriptionEn: 'Basic tool. Slow but reliable.',
    descriptionUk: 'Базовий інструмент. Повільно, але надійно.',
    cost: 0, digMultiplier: 1, critBonus: 0,
  },
  {
    level: 2, name: 'pickaxe', nameEn: 'Pickaxe', nameUk: 'Кирка',
    descriptionEn: 'Better for rocks. +50% efficiency.',
    descriptionUk: 'Краще для каменів. +50% ефективності.',
    cost: 100, digMultiplier: 1.5, critBonus: 0.02,
  },
  {
    level: 3, name: 'jackhammer', nameEn: 'Jackhammer', nameUk: 'Відбійний молоток',
    descriptionEn: 'Powerful. +100% dig efficiency.',
    descriptionUk: 'Потужний. +100% ефективності копання.',
    cost: 500, digMultiplier: 2, critBonus: 0.05,
  },
  {
    level: 4, name: 'drill', nameEn: 'Drill', nameUk: 'Бур',
    descriptionEn: 'Best-in-class. +200% efficiency.',
    descriptionUk: 'Найкращий інструмент. +200% ефективності.',
    cost: 2000, digMultiplier: 3, critBonus: 0.08,
  },
];

export function getToolForLevel(level: number): ToolDef {
  return TOOLS[Math.min(level - 1, TOOLS.length - 1)];
}

export const HELPERS: HelperDef[] = [
  { count: 1, incomePerHour: 10, cost: 50, nameEn: 'Apprentice Miner', nameUk: 'Учень шахтар' },
  { count: 2, incomePerHour: 25, cost: 150, nameEn: 'Skilled Miner', nameUk: 'Досвідчений шахтар' },
  { count: 3, incomePerHour: 60, cost: 400, nameEn: 'Expert Miner', nameUk: 'Експерт-шахтар' },
];

export function getHelperForCount(count: number): HelperDef {
  const idx = Math.min(count, HELPERS.length - 1);
  return HELPERS[idx];
}

export function getNextHelperCost(currentCount: number): number {
  const idx = Math.min(currentCount, HELPERS.length - 1);
  return HELPERS[idx].cost;
}

// Resource sale values in Carbonance
export const RESOURCE_VALUES: Record<ResourceType, number> = {
  iron: 8,
  glass: 5,
  fossils: 15,
  quartz: 25,
  diamond: 100,
  obsidian: 80,
  artifact: 500,
};

// ---- Dig mechanics ----

const BASE_FIND_CHANCE = 0.05; // 5% base
const BASE_CRIT_CHANCE = 0.15; // 15% crit (bonus)
const RESOURCE_DROP_CHANCE = 0.25; // 25% chance to drop a resource
const CRIT_MULTIPLIER = 3;

export interface DigRoll {
  carbonanceFound: number;
  isCritical: boolean;
  resourceFound?: ResourceType;
  resourceQuantity?: number;
  boostMultiplier: number;
}

export function rollDig(
  toolLevel: number,
  layerDef: LayerDef,
  activeBoost?: ActiveBoost | null,
): DigRoll {
  const tool = getToolForLevel(toolLevel);

  const baseFind = BASE_FIND_CHANCE + tool.critBonus;
  // Always find *something* — 5% chance is folded into the finding logic on the
  // backend; here we always grant the layer's base carbon but 95% of the time a
  // small amount, 5% time the "bonus find."
  const isBonusFind = Math.random() < baseFind;
  const isCritical = Math.random() < BASE_CRIT_CHANCE;

  let carbonAmount = layerDef.baseCarbon * tool.digMultiplier;
  if (isBonusFind) carbonAmount += layerDef.baseCarbon * 2;
  if (isCritical) carbonAmount *= CRIT_MULTIPLIER;

  let boostMultiplier = 1;
  if (activeBoost && Date.now() < activeBoost.expiresAt) {
    boostMultiplier = activeBoost.multiplier;
  }
  carbonAmount = Math.round(carbonAmount * boostMultiplier);

  let resourceFound: ResourceType | undefined;
  let resourceQuantity: number | undefined;
  if (Math.random() < RESOURCE_DROP_CHANCE) {
    const possibleResources = layerDef.resources;
    resourceFound = possibleResources[Math.floor(Math.random() * possibleResources.length)];
    resourceQuantity = isCritical ? 2 : 1;
  }

  return {
    carbonanceFound: carbonAmount,
    isCritical,
    resourceFound,
    resourceQuantity,
    boostMultiplier,
  };
}

export function calculateDigsInLayer(_currentLayer: number, totalDigs: number, layerDef: LayerDef): number {
  const digsThisLayer = totalDigs % layerDef.digsRequired;
  return Math.max(0, layerDef.digsRequired - digsThisLayer);
}

// ---- Boosts ----

export function makeActiveBoost(
  type: BoostType,
  durationMs = 60_000,
  multiplier = 3,
): ActiveBoost {
  return { type, expiresAt: Date.now() + durationMs, multiplier };
}

export function isBoostActive(boost?: ActiveBoost | null): boolean {
  return !!boost && Date.now() < boost.expiresAt;
}

// ---- Journal pages ----

export const JOURNAL_PAGES: JournalPage[] = [
  {
    id: 1, act: 1, unlockLayer: 1,
    titleEn: 'The First Layer', titleUk: 'Перший шар',
    contentEn: `"The first layer — the easiest, but the most deceptive." So began your grandfather's journal. Old miner artifacts lie just beneath the soil. You hold the shovel he left behind.`,
    contentUk: `«Перший шар — найлегший, але найбільш обманливий.» Так починався щоденник вашого діда. Старі шахтарські артефакти лежать прямо під ґрунтом. Ви тримаєте лопату, яку він залишив.`,
  },
  {
    id: 2, act: 1, unlockLayer: 3,
    titleEn: 'Artifacts of the Past', titleUk: 'Артефакти минулого',
    contentEn: `Beneath the topsoil, you find shards of glass and the bones of ancient creatures. Your grandfather wrote: "What once lived, returns as treasure."`,
    contentUk: `Під верхнім шаром ґрунту ви знаходите уламки скла та кістки стародавніх істот. Ваш дід писав: «Те, що колись жило, повертається як скарб.»`,
  },
  {
    id: 3, act: 1, unlockLayer: 5,
    titleEn: 'The Heir', titleUk: 'Спадкоємець',
    contentEn: `A note falls from the journal: "If you are reading this, the mine is yours now. Find the Carbonance — and remember, some treasures are heavier than gold."`,
    contentUk: `З щоденника випадає записка: «Якщо ти читаєш це, шахта тепер твоя. Знайди Карбонанцій — і пам'ятай, деякі скарби важчі за золото.»`,
  },
  {
    id: 4, act: 1, unlockLayer: 10,
    titleEn: 'Into the Sand', titleUk: 'У пісок',
    contentEn: `The soil gives way to warm sand. Old tools are buried here — a drill bit, a shattered lantern. Something glints deep below.`,
    contentUk: `Ґрунт змінюється теплим піском. Тут поховані старі інструменти — бур, розбита ліхтарня. Щось блищить у глибині.`,
  },
  {
    id: 5, act: 2, unlockLayer: 11,
    titleEn: 'Gravel & Clay', titleUk: 'Гравій та Глина',
    contentEn: `"The earth remembers those who came before." Iron ore veins thread through the gravel — a sign that the deep has history.`,
    contentUk: `«Земля пам'ятає тих, хто прийшов до нас.» Жили залізної руди пронизують гравій — знак того, що глибина має історію.`,
  },
  {
    id: 6, act: 2, unlockLayer: 25,
    titleEn: 'Deep Resources Corporation', titleUk: 'Глибинні ресурси',
    contentEn: `A rival corporation has marked the territory. Your grandfather lost the mine to them — you will not make the same mistake.`,
    contentUk: `Корпорація-конкурент позначила територію. Ваш дід втратив шахту через них — ви не повторите його помилку.`,
  },
];

export function getJournalPagesForLayer(act: number, depth: number): JournalPage[] {
  return JOURNAL_PAGES.filter((p) => p.act <= act && p.unlockLayer <= depth);
}

export function getUnlockedPages(actReached: number): JournalPage[] {
  return JOURNAL_PAGES.filter((p) => p.act <= actReached);
}

// ---- Daily rewards ----

export const DAILY_REWARDS = [10, 15, 20, 30, 40, 50, 100];

export function getDailyReward(streak: number): number {
  const idx = Math.min(streak, DAILY_REWARDS.length - 1);
  return DAILY_REWARDS[idx];
}

// ---- Time formatting ----

export function formatPlayTime(seconds: number, lang: 'uk' | 'en'): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}${lang === 'uk' ? ' год' : ' h'} ${minutes}${lang === 'uk' ? ' хв' : ' m'}`;
  }
  return `${minutes}${lang === 'uk' ? ' хв у шахті' : ' min in the mine'}`;
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [
    h.toString().padStart(2, '0'),
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0'),
  ].join(':');
}

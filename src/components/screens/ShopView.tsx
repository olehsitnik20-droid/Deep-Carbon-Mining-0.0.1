import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Gem, Users } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import UpgradeCard from '../ui/UpgradeCard';
import { TOOLS, HELPERS, RESOURCE_VALUES, getNextHelperCost } from '../../utils/gameLogic';
import type { ResourceType } from '../../types';
import { supabase } from '../../services/supabase';

type ShopTab = 'tools' | 'helpers' | 'sell';

export default function ShopView() {
  const { t } = useTranslation();
  const { gameProgress, resources, performUpgrade, refreshBalance, setResources } = useGame();
  const [activeTab, setActiveTab] = useState<ShopTab>('tools');
  const [toast, setToast] = useState('');

  const balance = gameProgress?.carbonance_balance ?? 0;
  const toolLevel = gameProgress?.tool_level ?? 1;
  const helperCount = gameProgress?.helper_count ?? 0;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleToolUpgrade = async () => {
    const next = TOOLS[toolLevel];
    if (!next) return;
    if (balance < next.cost) {
      showToast(t('shop.not_enough'));
      return;
    }
    const result = await performUpgrade('tool');
    if (result) showToast(t('shop.upgrade') + '!');
  };

  const handleHireHelper = async () => {
    const cost = getNextHelperCost(helperCount);
    if (balance < cost) {
      showToast(t('shop.not_enough'));
      return;
    }
    const result = await performUpgrade('helper');
    if (result) showToast(t('shop.hire') + '!');
  };

  const handleSellAll = async () => {
    if (!gameProgress) return;
    let total = 0;
    const updates: { resource_type: ResourceType; qty: number }[] = [];
    for (const res of resources) {
      if (res.quantity > 0) {
        total += res.quantity * RESOURCE_VALUES[res.resource_type];
        updates.push({ resource_type: res.resource_type, qty: res.quantity });
      }
    }
    if (total === 0) return;
    const newBalance = balance + total;
    await supabase
      .from('game_progress')
      .update({ carbonance_balance: newBalance })
      .eq('user_id', gameProgress.user_id);
    for (const u of updates) {
      await supabase
        .from('resources_inventory')
        .update({ quantity: 0 })
        .eq('user_id', gameProgress.user_id)
        .eq('resource_type', u.resource_type);
    }
    refreshBalance(newBalance);
    setResources(resources.map((r) => ({ ...r, quantity: 0 })));
    showToast(`+${total} ${t('top_bar.balance')}`);
  };

  const TABS: { id: ShopTab; label: string }[] = [
    { id: 'tools', label: t('shop.tools') },
    { id: 'helpers', label: t('shop.helpers') },
    { id: 'sell', label: t('shop.sell_resources') },
  ];

  return (
    <div className="px-4 py-4">
      {/* Tab selector */}
      <div className="flex gap-1 mb-4 bg-stone-900 rounded-xl p-1 border border-stone-800">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-amber-700 text-white shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TOOLS TAB */}
      {activeTab === 'tools' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Gem size={16} className="text-amber-400" />
            <p className="text-stone-300 text-sm font-semibold">{t('shop.tool_level')}: {toolLevel}/4</p>
          </div>
          {TOOLS.map((tool) => {
            const isCurrent = tool.level === toolLevel;
            const isNext = tool.level === toolLevel + 1;
            const isMaxed = toolLevel >= TOOLS.length;
            return (
              <div key={tool.level} className={`relative ${!isCurrent && !isNext ? 'opacity-40' : ''}`}>
                {isCurrent && (
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-full" />
                )}
                <UpgradeCard
                  nameKey={`tools.${tool.name}`}
                  descKey={`tools.${tool.name}_desc`}
                  cost={tool.cost}
                  currentLevel={toolLevel}
                  maxLevel={4}
                  isMaxed={isCurrent && isMaxed}
                  canAfford={isNext && balance >= tool.cost}
                  onBuy={handleToolUpgrade}
                  icon={<span className="text-2xl">{['🪨', '⛏️', '🔨', '🔩'][tool.level - 1]}</span>}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* HELPERS TAB */}
      {activeTab === 'helpers' && (
        <div className="space-y-3">
          <div className="bg-stone-800 border border-stone-700 rounded-xl p-4 mb-2">
            <div className="flex items-center gap-3">
              <Users size={20} className="text-amber-400" />
              <div>
                <p className="text-stone-200 font-semibold text-sm">{t('shop.helpers_title')}</p>
                <p className="text-stone-400 text-xs">{t('shop.helpers_desc')}</p>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-2xl font-black text-amber-400">{helperCount}</span>
              <span className="text-stone-400 text-sm ml-2">{t('profile.referral_count')}</span>
            </div>
          </div>
          {HELPERS.map((helper, idx) => {
            const isAffordable = balance >= helper.cost;
            const isPurchased = helperCount > idx;
            return (
              <div key={idx} className={isPurchased ? 'opacity-50' : ''}>
                <UpgradeCard
                  nameKey=""
                  descKey=""
                  cost={helper.cost}
                  currentLevel={helperCount}
                  isMaxed={isPurchased}
                  canAfford={isAffordable && !isPurchased}
                  onBuy={handleHireHelper}
                  icon={<span className="text-2xl">👷</span>}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* SELL TAB */}
      {activeTab === 'sell' && (
        <div className="space-y-3">
          <div className="bg-stone-900 rounded-xl border border-stone-800 overflow-hidden">
            {resources.filter((r) => r.quantity > 0).length === 0 ? (
              <div className="p-8 text-center text-stone-500">
                <p className="text-3xl mb-2">🪣</p>
                <p className="text-sm">{t('shop.inventory')} {t('errors.generic').split('.')[0]}...</p>
              </div>
            ) : (
              resources
                .filter((r) => r.quantity > 0)
                .map((res) => (
                  <div
                    key={res.resource_type}
                    className="flex items-center justify-between px-4 py-3 border-b border-stone-800 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {{ iron: '🪨', glass: '🪟', fossils: '🦕', quartz: '💎', diamond: '💎', obsidian: '⚫', artifact: '🏺' }[res.resource_type]}
                      </span>
                      <div>
                        <p className="text-stone-200 text-sm font-medium">
                          {t(`resources.${res.resource_type}`)}
                        </p>
                        <p className="text-stone-500 text-xs">x{res.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Gem size={12} className="text-amber-400" />
                      <span className="text-amber-400 text-sm font-bold">
                        {(res.quantity * RESOURCE_VALUES[res.resource_type as ResourceType]).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>

          {resources.some((r) => r.quantity > 0) && (
            <button
              onClick={handleSellAll}
              className="w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
            >
              {t('shop.sell_all')} (+{resources.reduce(
                (s, r) => s + r.quantity * RESOURCE_VALUES[r.resource_type as ResourceType],
                0,
              ).toLocaleString()})
            </button>
          )}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 inset-x-4 bg-stone-800 border border-stone-600 rounded-xl py-3 px-4 text-center text-stone-100 text-sm font-medium shadow-xl z-50 animate-slide-up">
          {toast}
        </div>
      )}
    </div>
  );
}

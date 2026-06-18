import React from 'react';
import { useTranslation } from 'react-i18next';
import { Gem, ArrowUp } from 'lucide-react';

interface UpgradeCardProps {
  nameKey: string;
  descKey: string;
  cost: number;
  currentLevel: number;
  maxLevel?: number;
  isMaxed?: boolean;
  canAfford: boolean;
  onBuy: () => void;
  icon?: React.ReactNode;
}

export default function UpgradeCard({
  nameKey,
  descKey,
  cost,
  currentLevel,
  maxLevel,
  isMaxed = false,
  canAfford,
  onBuy,
  icon,
}: UpgradeCardProps) {
  const { t } = useTranslation();

  return (
    <div className={`bg-stone-800 border rounded-xl p-4 flex items-center gap-3 transition-all ${
      isMaxed ? 'border-amber-500/60 opacity-75' : 'border-stone-700 hover:border-stone-600'
    }`}>
      <div className="w-12 h-12 rounded-lg bg-stone-700 flex items-center justify-center flex-shrink-0 text-2xl">
        {icon ?? '⛏️'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-stone-100 text-sm">{t(nameKey)}</p>
          {maxLevel && (
            <span className="text-xs bg-stone-700 text-stone-400 rounded px-1.5 py-0.5">
              {currentLevel}/{maxLevel}
            </span>
          )}
        </div>
        <p className="text-stone-400 text-xs mt-0.5 leading-snug">{t(descKey)}</p>
        {!isMaxed && (
          <div className="flex items-center gap-1 mt-1">
            <Gem size={11} className="text-amber-400" />
            <span className="text-amber-400 text-xs font-bold">{cost.toLocaleString()}</span>
          </div>
        )}
      </div>

      {isMaxed ? (
        <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-lg px-3 py-2 font-medium flex-shrink-0">
          {t('shop.max_level')}
        </span>
      ) : (
        <button
          onClick={onBuy}
          disabled={!canAfford}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold flex-shrink-0 transition-all active:scale-95 ${
            canAfford
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-stone-700 text-stone-500 cursor-not-allowed'
          }`}
        >
          <ArrowUp size={12} />
          {t('shop.buy')}
        </button>
      )}
    </div>
  );
}

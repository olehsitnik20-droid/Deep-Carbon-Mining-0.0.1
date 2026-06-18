
import { useTranslation } from 'react-i18next';
import { Gem } from 'lucide-react';
import { useGame } from '../../context/GameContext';

export default function TopBar() {
  const { t } = useTranslation();
  const { gameProgress } = useGame();
  const balance = gameProgress?.carbonance_balance ?? 0;
  const layer = gameProgress?.current_layer ?? 1;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-sm border-b border-stone-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{layer}</span>
          </div>
          <div>
            <p className="text-stone-400 text-xs leading-none">{t('top_bar.layer')}</p>
            <p className="text-stone-100 text-sm font-semibold leading-tight">{layer}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-900/40 border border-amber-700/40 rounded-full px-3 py-1.5">
          <Gem size={16} className="text-amber-400" />
          <span className="text-amber-300 font-bold text-sm tabular-nums">
            {balance.toLocaleString()}
          </span>
        </div>
      </div>
    </header>
  );
}

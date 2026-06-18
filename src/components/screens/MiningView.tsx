import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import DigButton from '../ui/DigButton';
import ProgressBar from '../ui/ProgressBar';
import LayerVisualization from '../ui/LayerVisualization';
import CoinAnimation from '../ui/CoinAnimation';
import CriticalHit from '../ui/CriticalHit';
import AdModal from '../ui/AdModal';
import { getLayerForDepth, isBoostActive } from '../../utils/gameLogic';
import type { BoostType } from '../../types';

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
}

export default function MiningView() {
  const { t } = useTranslation();
  const { gameProgress, performDig, performWatchAd, activeBoost } = useGame();

  const [showCoin, setShowCoin] = useState(false);
  const [coinAmount, setCoinAmount] = useState(0);
  const [showCrit, setShowCrit] = useState(false);
  const [critAmount, setCritAmount] = useState(0);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adBoostType, setAdBoostType] = useState<BoostType>('boost_dig');
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [layerUpMessage, setLayerUpMessage] = useState('');
  const floatingIdRef = useRef(0);

  const layer = gameProgress?.current_layer ?? 1;
  const totalDigs = gameProgress?.total_digs ?? 0;
  const layerDef = getLayerForDepth(layer);
  const digsInLayer = totalDigs % layerDef.digsRequired;
  const digsLeft = layerDef.digsRequired - digsInLayer;
  const boostActive = isBoostActive(activeBoost);

  const addFloating = useCallback((text: string) => {
    const id = floatingIdRef.current++;
    const x = 40 + Math.random() * 20;
    const y = 30 + Math.random() * 20;
    setFloatingTexts((prev) => [...prev, { id, text, x, y }]);
    setTimeout(() => setFloatingTexts((prev) => prev.filter((f) => f.id !== id)), 1200);
  }, []);

  const handleDig = useCallback(async () => {
    const result = await performDig();
    if (!result) return;

    if (result.carbonanceFound > 0) {
      setCoinAmount(result.carbonanceFound);
      setShowCoin(true);
      setTimeout(() => setShowCoin(false), 900);
      addFloating(`+${result.carbonanceFound}`);
    }

    if (result.isCritical) {
      setCritAmount(result.carbonanceFound);
      setShowCrit(true);
      setTimeout(() => setShowCrit(false), 1600);
    }

    if (result.resourceFound) {
      addFloating(`${t(`resources.${result.resourceFound}`)} x${result.resourceQuantity ?? 1}`);
    }

    if (result.layerAdvanced) {
      setLayerUpMessage(t('mining.layer_up'));
      setTimeout(() => setLayerUpMessage(''), 2000);
    }
  }, [performDig, addFloating, t]);

  const openAd = (type: BoostType) => {
    setAdBoostType(type);
    setShowAdModal(true);
  };

  const handleAdReward = async (type: BoostType) => {
    setShowAdModal(false);
    await performWatchAd(type);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Layer visualization */}
      <div className="bg-stone-900 rounded-2xl p-4 border border-stone-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-stone-400 text-xs">{t('mining.current_layer')}</p>
            <p className="text-stone-100 font-bold text-lg">
              {t(`layers.${layerDef.name}`)} <span className="text-amber-400">#{layer}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-stone-400 text-xs">{t('mining.total_digs')}</p>
            <p className="text-stone-100 font-bold tabular-nums">{totalDigs.toLocaleString()}</p>
          </div>
        </div>
        <LayerVisualization currentLayer={layer} className="mb-5" />
        <div className="mt-6 space-y-1">
          <ProgressBar
            value={digsInLayer}
            max={layerDef.digsRequired}
            showLabel
            label={`${digsLeft} ${t('mining.digs_to_next')}`}
            colorClass="bg-amber-500"
          />
        </div>
      </div>

      {/* Boost status */}
      {boostActive && (
        <div className="bg-amber-900/30 border border-amber-600/40 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <Zap size={16} className="text-amber-400" />
          <p className="text-amber-300 text-sm font-medium">{t('mining.boost_active')}</p>
          <span className="ml-auto text-amber-400 text-xs">x{activeBoost?.multiplier}</span>
        </div>
      )}

      {/* Layer up banner */}
      {layerUpMessage && (
        <div className="bg-amber-500/20 border border-amber-500/60 rounded-xl px-4 py-3 text-center">
          <p className="text-amber-300 font-bold text-base animate-bounce">{layerUpMessage}</p>
        </div>
      )}

      {/* Main dig area */}
      <div className="bg-stone-900 rounded-2xl border border-stone-800 py-8 flex flex-col items-center gap-6">
        <div
          className="relative w-48 h-32 rounded-xl overflow-hidden border-2 border-stone-700"
          style={{
            background: `linear-gradient(180deg, ${layerDef.colorFrom} 0%, ${layerDef.colorTo} 100%)`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-6 gap-1 opacity-30">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-stone-300"
                  style={{ opacity: Math.random() * 0.7 + 0.3 }}
                />
              ))}
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        <DigButton
          onDig={handleDig}
          toolLevel={gameProgress?.tool_level ?? 1}
        />
      </div>

      {/* Ad boosts */}
      <div className="grid grid-cols-3 gap-2">
        {(['boost_dig', 'speed_up', 'treasure_double'] as BoostType[]).map((type) => (
          <button
            key={type}
            onClick={() => openAd(type)}
            disabled={boostActive && activeBoost?.type === type}
            className="bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl p-3 text-center transition-all active:scale-95 disabled:opacity-40"
          >
            <span className="text-xl block mb-1">
              {type === 'boost_dig' ? '🎯' : type === 'speed_up' ? '⚡' : '💰'}
            </span>
            <span className="text-stone-300 text-xs leading-tight">
              {t(`mining.${type}`)}
            </span>
          </button>
        ))}
      </div>

      {/* Floating texts */}
      {floatingTexts.map((f) => (
        <div
          key={f.id}
          className="fixed pointer-events-none z-30 font-bold text-amber-300 text-lg animate-float-up"
          style={{ left: `${f.x}%`, top: `${f.y}%` }}
        >
          {f.text}
        </div>
      ))}

      {/* Animations */}
      <CoinAnimation active={showCoin} amount={coinAmount} isCritical={showCrit} />
      <CriticalHit active={showCrit} amount={critAmount} />

      {showAdModal && (
        <AdModal
          boostType={adBoostType}
          onClose={() => setShowAdModal(false)}
          onReward={handleAdReward}
        />
      )}
    </div>
  );
}

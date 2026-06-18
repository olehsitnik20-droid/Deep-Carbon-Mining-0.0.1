import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Play, Check } from 'lucide-react';
import type { BoostType } from '../../types';

interface AdModalProps {
  boostType: BoostType;
  onClose: () => void;
  onReward: (type: BoostType) => void;
}

const BOOST_DURATION_FAKE_MS = 3000; // Simulated ad watch time

export default function AdModal({ boostType, onClose, onReward }: AdModalProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'watching' | 'rewarded'>('watching');
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / BOOST_DURATION_FAKE_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(intervalRef.current);
        setPhase('rewarded');
      }
    }, 50);
    return () => clearInterval(intervalRef.current);
  }, []);

  const titleKey = `ads.${boostType}_title`;
  const descKey = `ads.${boostType}_desc`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70">
      <div className="bg-stone-900 border border-stone-700 rounded-t-3xl w-full max-w-md p-6 pb-10 animate-slide-up">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-stone-100 font-bold text-lg">{t(titleKey)}</p>
            <p className="text-stone-400 text-sm mt-0.5">{t(descKey)}</p>
          </div>
          {phase === 'watching' && (
            <button onClick={onClose} className="text-stone-500 hover:text-stone-300 p-1">
              <X size={20} />
            </button>
          )}
        </div>

        {phase === 'watching' ? (
          <>
            {/* Simulated ad area */}
            <div className="bg-stone-800 rounded-xl h-32 flex items-center justify-center mb-4 border border-stone-700">
              <div className="text-center">
                <Play size={32} className="text-stone-500 mx-auto mb-2" />
                <p className="text-stone-400 text-sm">{t('ads.watching')}</p>
              </div>
            </div>
            <div className="w-full h-2 bg-stone-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-stone-500 text-xs text-center mt-2">
              {Math.ceil(((100 - progress) / 100) * (BOOST_DURATION_FAKE_MS / 1000))}s
            </p>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-amber-400" />
            </div>
            <p className="text-amber-300 font-bold text-xl mb-1">{t('ads.reward_granted')}</p>
            <p className="text-stone-400 text-sm mb-6">{t(descKey)}</p>
            <button
              onClick={() => onReward(boostType)}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
            >
              {t('mining.dig_button')}!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

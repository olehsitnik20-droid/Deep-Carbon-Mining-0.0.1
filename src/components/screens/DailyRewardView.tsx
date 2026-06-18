import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { claimDaily } from '../../services/api';
import { getDailyReward, formatCountdown } from '../../utils/gameLogic';

const DAILY_REWARDS = [10, 15, 20, 30, 40, 50, 100];

export default function DailyRewardView() {
  const { t } = useTranslation();
  const { user, gameProgress, refreshBalance } = useGame();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const streak = gameProgress?.daily_streak ?? 0;
  const lastClaim = gameProgress?.daily_claim_time;
  const canClaim = !lastClaim || Date.now() - new Date(lastClaim).getTime() >= 24 * 60 * 60 * 1000;
  const nextClaimAt = lastClaim ? new Date(lastClaim).getTime() + 24 * 60 * 60 * 1000 : null;

  useEffect(() => {
    if (!nextClaimAt || canClaim) return;
    const tick = () => setCountdown(formatCountdown(nextClaimAt - Date.now()));
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [nextClaimAt, canClaim]);

  const handleClaim = async () => {
    if (!user || !canClaim) return;
    setLoading(true);
    setError('');
    try {
      const result = await claimDaily(user.id);
      refreshBalance(result.newBalance);
      setSuccess(`+${result.rewardAmount} ${t('top_bar.balance')}! ${t('daily.streak')}: ${result.newStreak}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.daily_failed'));
    } finally {
      setLoading(false);
    }
  };

  const todayDay = (streak % 7) + 1;

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 text-center">
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <Flame size={32} className="text-amber-400" />
        </div>
        <h2 className="text-stone-100 font-black text-xl mb-1">{t('daily.title')}</h2>
        <div className="flex items-center justify-center gap-2">
          <span className="text-amber-400 font-bold text-3xl">{streak}</span>
          <span className="text-stone-400 text-sm">{t('daily.streak')}</span>
        </div>
      </div>

      {/* 7-day grid */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
        <p className="text-stone-300 text-sm font-semibold mb-3">{t('daily.reward')}</p>
        <div className="grid grid-cols-7 gap-1.5">
          {DAILY_REWARDS.map((reward, idx) => {
            const day = idx + 1;
            const isCurrent = day === todayDay;
            const isPast = day < todayDay;
            const isLast = idx === 6;
            return (
              <div
                key={idx}
                className={`rounded-lg p-2 text-center border transition-all ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-500/20'
                    : isPast
                    ? 'border-stone-700 bg-stone-800/50 opacity-50'
                    : 'border-stone-700 bg-stone-800'
                } ${isLast ? 'ring-1 ring-amber-400/40' : ''}`}
              >
                <p className={`text-xs font-bold ${isCurrent ? 'text-amber-400' : 'text-stone-500'}`}>
                  {t('daily.day')} {day}
                </p>
                <p className={`text-xs mt-0.5 font-bold ${isCurrent ? 'text-amber-300' : 'text-stone-400'}`}>
                  {reward}
                </p>
                {isLast && <p className="text-amber-400 text-xs">⭐</p>}
              </div>
            );
          })}
        </div>
        {streak >= 7 && (
          <p className="text-amber-400 text-xs text-center mt-2 font-medium">{t('daily.streak_7_desc')}</p>
        )}
      </div>

      {/* Claim button */}
      {success && (
        <div className="bg-green-900/30 border border-green-700/40 rounded-xl p-3 text-center">
          <p className="text-green-400 font-bold">{success}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-900/30 border border-red-700/40 rounded-xl p-3 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {canClaim ? (
        <button
          onClick={handleClaim}
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black text-lg py-4 rounded-2xl transition-all active:scale-95 shadow-[0_4px_16px_rgba(217,119,6,0.3)] disabled:opacity-50"
        >
          {loading ? '...' : `${t('daily.claim')} (+${getDailyReward(streak)})`}
        </button>
      ) : (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 text-center">
          <p className="text-stone-400 text-sm">{t('daily.next_in')}</p>
          <p className="text-amber-400 font-black text-3xl tabular-nums mt-1">{countdown}</p>
        </div>
      )}
    </div>
  );
}

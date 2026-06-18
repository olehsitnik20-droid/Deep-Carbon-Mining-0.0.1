import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Settings } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { formatPlayTime } from '../../utils/gameLogic';

export default function ProfileView() {
  const { t, i18n } = useTranslation();
  const { user, gameProgress } = useGame();
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const lang = i18n.language as 'uk' | 'en';
  const balance = gameProgress?.carbonance_balance ?? 0;
  const layer = gameProgress?.current_layer ?? 1;
  const totalDigs = gameProgress?.total_digs ?? 0;
  const playTime = user?.total_play_time_seconds ?? 0;
  const telegramId = user?.telegram_id ?? 0;
  const playTimeFormatted = formatPlayTime(playTime, lang);

  const referralLink = `https://t.me/DeepCarbonBot?start=ref_${telegramId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (showSettings) {
    return (
      <SettingsPanel onBack={() => setShowSettings(false)} />
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      {/* User card */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
        <div className="flex items-center gap-4">
          {user?.photo_url ? (
            <img src={user.photo_url} alt="avatar" className="w-14 h-14 rounded-full border-2 border-amber-600" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-amber-700 flex items-center justify-center text-2xl font-bold text-white">
              {(user?.first_name?.[0] ?? 'M').toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-stone-100 font-bold text-lg">
              {user?.first_name} {user?.last_name ?? ''}
            </p>
            {user?.username && (
              <p className="text-stone-400 text-sm">@{user.username}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-amber-900/40 border border-amber-700/40 text-amber-400 rounded px-2 py-0.5">
                {t('mining.current_layer')} {layer}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 text-right">
          <p className="text-stone-500 text-xs">{t('profile.play_time')}</p>
          <p className="text-amber-400 font-bold text-sm">{playTimeFormatted}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: t('profile.balance_stat'), value: balance.toLocaleString(), icon: '💎' },
          { key: t('profile.total_digs_stat'), value: totalDigs.toLocaleString(), icon: '⛏️' },
          { key: t('profile.layer_reached'), value: layer, icon: '📍' },
          { key: t('profile.play_time'), value: playTimeFormatted, icon: '⏱️' },
        ].map(({ key, value, icon }) => (
          <div key={key} className="bg-stone-900 border border-stone-800 rounded-xl p-3">
            <span className="text-xl">{icon}</span>
            <p className="text-stone-400 text-xs mt-1">{key}</p>
            <p className="text-stone-100 font-bold text-base tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Referral */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
        <p className="text-stone-200 font-semibold text-sm mb-1">{t('profile.referrals')}</p>
        <p className="text-stone-400 text-xs mb-3">{t('profile.referral_info')}</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 overflow-hidden">
            <p className="text-stone-300 text-xs truncate font-mono">{referralLink}</p>
          </div>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${
              copied ? 'bg-green-700 text-white' : 'bg-amber-700 text-white hover:bg-amber-600'
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t('profile.link_copied') : t('profile.copy_link')}
          </button>
        </div>
      </div>

      {/* Settings button */}
      <button
        onClick={() => setShowSettings(true)}
        className="w-full flex items-center justify-between bg-stone-900 border border-stone-800 rounded-2xl px-4 py-4 hover:border-stone-700 transition-all active:scale-[0.99]"
      >
        <div className="flex items-center gap-3">
          <Settings size={20} className="text-stone-400" />
          <span className="text-stone-200 font-medium">{t('profile.settings')}</span>
        </div>
        <span className="text-stone-500">›</span>
      </button>
    </div>
  );
}

// ---- Inline settings panel ----
import SettingsPanel from './SettingsView';

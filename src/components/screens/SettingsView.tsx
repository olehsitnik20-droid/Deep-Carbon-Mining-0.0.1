import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Globe, Vibrate } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import type { Language } from '../../types';

interface SettingsViewProps {
  onBack: () => void;
}

export default function SettingsView({ onBack }: SettingsViewProps) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [haptic, setHaptic] = useState(true);
  const [toast, setToast] = useState('');

  const handleLanguageToggle = async (lang: Language) => {
    await setLanguage(lang);
    setToast(t('settings.language_saved'));
    setTimeout(() => setToast(''), 2000);
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-stone-400 hover:text-stone-200 transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="text-sm">{t('nav.profile')}</span>
      </button>

      <h1 className="text-stone-100 font-bold text-xl">{t('settings.title')}</h1>

      {/* Language setting */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <Globe size={18} className="text-amber-400" />
          <p className="text-stone-200 font-semibold">{t('settings.language')}</p>
        </div>
        <div className="flex gap-2">
          {(['uk', 'en'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageToggle(lang)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
                language === lang
                  ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                  : 'border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600'
              }`}
            >
              <span>{lang === 'uk' ? '🇺🇦' : '🇬🇧'}</span>
              <span>{lang === 'uk' ? 'UA' : 'EN'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Haptic toggle */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Vibrate size={18} className="text-amber-400" />
            <div>
              <p className="text-stone-200 font-semibold text-sm">{t('settings.haptic')}</p>
              <p className="text-stone-500 text-xs">{t('settings.haptic_desc')}</p>
            </div>
          </div>
          <button
            onClick={() => setHaptic((v) => !v)}
            className={`relative w-12 h-6 rounded-full transition-all ${haptic ? 'bg-amber-600' : 'bg-stone-700'}`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                haptic ? 'left-6' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4">
        <p className="text-stone-300 font-semibold text-sm mb-1">{t('settings.about')}</p>
        <p className="text-stone-500 text-xs">Deep Carbon / Глибини Карбонації</p>
        <p className="text-stone-600 text-xs">{t('settings.version')}: 1.0.0</p>
      </div>

      {toast && (
        <div className="fixed bottom-24 inset-x-4 bg-stone-800 border border-stone-600 rounded-xl py-3 px-4 text-center text-stone-100 text-sm font-medium shadow-xl z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

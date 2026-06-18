import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import type { Language } from '../../types';

interface LanguageSelectScreenProps {
  onConfirm: (lang: Language) => void;
}

export default function LanguageSelectScreen({ onConfirm }: LanguageSelectScreenProps) {
  const { t } = useTranslation();
  const { setLanguage } = useLanguage();
  const [selected, setSelected] = useState<Language>('uk');

  const handleSelect = async (lang: Language) => {
    setSelected(lang);
    await setLanguage(lang);
  };

  const handleConfirm = () => {
    onConfirm(selected);
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-800 via-stone-900 to-stone-950" />
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-full bg-stone-600"
            style={{ left: `${(i / 20) * 100}%`, opacity: 0.3 }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-7xl mb-4">⛏️</div>
          <h1 className="text-3xl font-black text-amber-400 tracking-tight mb-1">
            {t('loading.title')}
          </h1>
          <p className="text-stone-400 text-sm">Глибини Карбонації</p>
        </div>

        {/* Language cards */}
        <p className="text-center text-stone-300 font-semibold text-lg mb-2">
          {t('language.select_title')}
        </p>
        <p className="text-center text-stone-500 text-sm mb-6">
          {t('language.select_subtitle')}
        </p>

        <div className="space-y-3 mb-8">
          {(['uk', 'en'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => handleSelect(lang)}
              className={`w-full flex items-center gap-4 rounded-2xl border-2 p-4 transition-all active:scale-98 ${
                selected === lang
                  ? 'border-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  : 'border-stone-700 bg-stone-800 hover:border-stone-600'
              }`}
            >
              <span className="text-3xl">{lang === 'uk' ? '🇺🇦' : '🇬🇧'}</span>
              <div className="text-left">
                <p className={`font-bold text-base ${selected === lang ? 'text-amber-300' : 'text-stone-200'}`}>
                  {lang === 'uk' ? 'Українська' : 'English'}
                </p>
                <p className="text-stone-500 text-xs">
                  {lang === 'uk' ? 'Default' : 'Alternative'}
                </p>
              </div>
              {selected === lang && (
                <div className="ml-auto w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-black text-lg py-4 rounded-2xl transition-all active:scale-95 shadow-[0_4px_16px_rgba(217,119,6,0.4)]"
        >
          {t('language.confirm')} →
        </button>
      </div>
    </div>
  );
}

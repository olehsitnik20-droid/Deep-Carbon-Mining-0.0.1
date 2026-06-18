import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { setLanguage as apiSetLanguage } from '../services/api';
import type { Language } from '../types';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'uk',
  setLanguage: async () => {},
});

export function LanguageProvider({
  children,
  userId,
  initialLanguage,
}: {
  children: React.ReactNode;
  userId?: string;
  initialLanguage?: Language;
}) {
  const { i18n } = useTranslation();
  const [language, setLang] = useState<Language>(initialLanguage ?? 'uk');

  useEffect(() => {
    if (initialLanguage) {
      i18n.changeLanguage(initialLanguage);
      setLang(initialLanguage);
    }
  }, [initialLanguage, i18n]);

  const setLanguage = useCallback(
    async (lang: Language) => {
      setLang(lang);
      await i18n.changeLanguage(lang);
      if (userId) {
        await apiSetLanguage(userId, lang).catch(console.error);
      }
    },
    [userId, i18n],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

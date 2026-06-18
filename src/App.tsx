import { useEffect, useRef, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { GameProvider, useGame } from './context/GameContext';
import { LanguageProvider } from './context/LanguageContext';
import { useTelegramAuth } from './hooks/useTelegramAuth';
import { recordReferral } from './services/api';
import LanguageSelectScreen from './components/screens/LanguageSelectScreen';
import GameScreen from './components/screens/GameScreen';
import type { Language, LoginResponse } from './types';

// ---- Loading screen ----
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <div className="text-7xl mb-6 animate-bounce">⛏️</div>
        <h1 className="text-2xl font-black text-amber-400 mb-2">{i18n.t('loading.title')}</h1>
        <p className="text-stone-500 text-sm mb-1">Глибини Карбонації</p>
        <p className="text-stone-400 text-sm">{i18n.t('loading.subtitle')}</p>
        <div className="mt-8 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-amber-600 animate-bounce"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Error screen ----
function ErrorScreen({ error, isDemoMode }: { error: string | null; isDemoMode: boolean }) {
  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-stone-100 font-bold text-lg mb-2">{i18n.t('errors.login_failed')}</h2>
      <p className="text-stone-500 text-sm mb-2">{error ?? i18n.t('errors.generic')}</p>
      {isDemoMode && (
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-amber-600 text-white font-bold px-6 py-3 rounded-xl"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ---- Inner app that can access GameContext ----
function GameInitializer({
  loginResponse,
  showLanguageSelect,
  setShowLanguageSelect,
  gameReady,
  setGameReady,
}: {
  loginResponse: LoginResponse;
  showLanguageSelect: boolean;
  setShowLanguageSelect: (v: boolean) => void;
  gameReady: boolean;
  setGameReady: (v: boolean) => void;
}) {
  const { initFromLogin } = useGame();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initFromLogin(loginResponse);
    }
  }, [loginResponse, initFromLogin]);

  const handleLanguageConfirm = (_lang: Language) => {
    setShowLanguageSelect(false);
    setGameReady(true);
  };

  if (showLanguageSelect) {
    return <LanguageSelectScreen onConfirm={handleLanguageConfirm} />;
  }

  if (gameReady) {
    return <GameScreen />;
  }

  return <LoadingScreen />;
}

// ---- Root: handles auth, then hands off ----
function AppContent() {
  const { loginResponse, referrerTelegramId, status, error, isDemoMode } = useTelegramAuth();
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [gameReady, setGameReady] = useState(false);

  useEffect(() => {
    if (status === 'success' && loginResponse) {
      if (loginResponse.isNewUser) {
        setShowLanguageSelect(true);
      } else {
        setGameReady(true);
      }
      if (referrerTelegramId && loginResponse.isNewUser) {
        recordReferral(referrerTelegramId, loginResponse.user.id).catch(console.error);
      }
    }
  }, [status, loginResponse, referrerTelegramId]);

  if (status === 'idle' || status === 'loading') return <LoadingScreen />;
  if (status === 'error') return <ErrorScreen error={error} isDemoMode={isDemoMode} />;
  if (!loginResponse) return <LoadingScreen />;

  return (
    <LanguageProvider
      userId={loginResponse.user.id}
      initialLanguage={loginResponse.user.language as Language}
    >
      <GameProvider>
        <GameInitializer
          loginResponse={loginResponse}
          showLanguageSelect={showLanguageSelect}
          setShowLanguageSelect={setShowLanguageSelect}
          gameReady={gameReady}
          setGameReady={setGameReady}
        />
      </GameProvider>
    </LanguageProvider>
  );
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AppContent />
    </I18nextProvider>
  );
}

import { useEffect, useRef, useState } from 'react';
import { login as apiLogin } from '../services/api';
import type { Language, LoginResponse, TelegramUser } from '../types';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: TelegramUser;
          start_param?: string;
        };
        ready: () => void;
        expand: () => void;
        enableClosingConfirmation: () => void;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
        };
        close: () => void;
        colorScheme: 'light' | 'dark';
      };
    };
  }
}

type Status = 'idle' | 'loading' | 'success' | 'error';

interface UseTelegramAuthResult {
  loginResponse: LoginResponse | null;
  referrerTelegramId: number | null;
  status: Status;
  error: string | null;
  telegramUser: TelegramUser | null;
  isDemoMode: boolean;
}

export function useTelegramAuth(): UseTelegramAuthResult {
  const [loginResponse, setLoginResponse] = useState<LoginResponse | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [referrerTelegramId, setReferrerTelegramId] = useState<number | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    const tg = window.Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();

      const startParam = tg.initDataUnsafe?.start_param;
      if (startParam && startParam.startsWith('ref_')) {
        const refId = parseInt(startParam.replace('ref_', ''), 10);
        if (!isNaN(refId)) setReferrerTelegramId(refId);
      }

      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser) {
        setTelegramUser(tgUser);
      }

      const payload = {
        initData: tg.initData,
        user: tgUser,
        startParam: startParam ?? null,
      };

      setStatus('loading');
      apiLogin(payload as Record<string, unknown>)
        .then((res) => {
          setLoginResponse(res);
          setStatus('success');
        })
        .catch((err: Error) => {
          setError(err.message);
          setStatus('error');
        });
    } else {
      // Demo mode: outside Telegram (browser preview)
      setIsDemoMode(true);
      const demoUser: TelegramUser = {
        id: 99999999,
        first_name: 'Demo',
        last_name: 'Miner',
        username: 'demo_miner',
      };
      setTelegramUser(demoUser);

      const demoPayload = {
        initData: '',
        user: demoUser,
        startParam: null,
        isDemo: true,
      };

      setStatus('loading');
      apiLogin(demoPayload as Record<string, unknown>)
        .then((res) => {
          setLoginResponse(res);
          setStatus('success');
        })
        .catch((err: Error) => {
          setError(err.message);
          setStatus('error');
        });
    }
  }, []);

  return { loginResponse, referrerTelegramId, status, error, telegramUser, isDemoMode };
}

export function haptic(
  type: 'impact' | 'success' | 'warning' | 'error' | 'select' = 'impact',
  style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium',
) {
  const hf = window.Telegram?.WebApp?.HapticFeedback;
  if (!hf) return;
  if (type === 'impact') hf.impactOccurred(style);
  else if (type === 'select') hf.selectionChanged();
  else hf.notificationOccurred(type);
}

export function getTelegramLanguage(): Language {
  const lang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
  return lang?.startsWith('uk') ? 'uk' : 'en';
}

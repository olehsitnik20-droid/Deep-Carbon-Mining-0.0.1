import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { dig as apiDig, upgrade as apiUpgrade, watchAd as apiWatchAd } from '../services/api';
import type {
  ActiveBoost,
  BoostType,
  DigResponse,
  GameProgress,
  LoginResponse,
  ResourceInventory,
  StoryProgress,
  UpgradeResponse,
  User,
} from '../types';
import { makeActiveBoost } from '../utils/gameLogic';

interface GameContextValue {
  user: User | null;
  gameProgress: GameProgress | null;
  storyProgress: StoryProgress | null;
  resources: ResourceInventory[];
  sessionId: string | null;
  activeBoost: ActiveBoost | null;
  isLoading: boolean;
  error: string | null;
  initFromLogin: (loginRes: LoginResponse) => void;
  performDig: () => Promise<DigResponse | null>;
  performUpgrade: (type: 'tool' | 'helper') => Promise<UpgradeResponse | null>;
  performWatchAd: (type: BoostType) => Promise<void>;
  setResources: (r: ResourceInventory[]) => void;
  refreshBalance: (newBalance: number) => void;
  updatePlayTime: (extraSeconds: number) => void;
}

const GameContext = createContext<GameContextValue>({
  user: null,
  gameProgress: null,
  storyProgress: null,
  resources: [],
  sessionId: null,
  activeBoost: null,
  isLoading: false,
  error: null,
  initFromLogin: () => {},
  performDig: async () => null,
  performUpgrade: async () => null,
  performWatchAd: async () => {},
  setResources: () => {},
  refreshBalance: () => {},
  updatePlayTime: () => {},
});

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [storyProgress, setStoryProgress] = useState<StoryProgress | null>(null);
  const [resources, setResources] = useState<ResourceInventory[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeBoost, setActiveBoost] = useState<ActiveBoost | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const boostTimer = useRef<ReturnType<typeof setTimeout>>();

  // Clear expired boost
  useEffect(() => {
    if (!activeBoost) return;
    const remaining = activeBoost.expiresAt - Date.now();
    if (remaining <= 0) {
      setActiveBoost(null);
      return;
    }
    boostTimer.current = setTimeout(() => setActiveBoost(null), remaining);
    return () => clearTimeout(boostTimer.current);
  }, [activeBoost]);

  const initFromLogin = useCallback((loginRes: LoginResponse) => {
    setUser(loginRes.user);
    setGameProgress(loginRes.gameProgress);
    setStoryProgress(loginRes.storyProgress);
    setResources(loginRes.resources);
    setSessionId(loginRes.sessionId);
  }, []);

  const performDig = useCallback(async (): Promise<DigResponse | null> => {
    if (!user || !gameProgress || !sessionId) return null;
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiDig(user.id, sessionId, activeBoost?.type);
      setGameProgress((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          carbonance_balance: result.newBalance,
          total_digs: result.totalDigs,
          current_layer: result.newLayer ?? prev.current_layer,
        };
        return updated;
      });
      if (result.resourceFound && result.resourceQuantity) {
        setResources((prev) => {
          const existing = prev.find((r) => r.resource_type === result.resourceFound);
          if (existing) {
            return prev.map((r) =>
              r.resource_type === result.resourceFound
                ? { ...r, quantity: r.quantity + (result.resourceQuantity ?? 0) }
                : r,
            );
          }
          return [
            ...prev,
            {
              user_id: user.id,
              resource_type: result.resourceFound!,
              quantity: result.resourceQuantity ?? 0,
            },
          ];
        });
      }
      if (result.newActUnlocked && storyProgress) {
        setStoryProgress((prev) =>
          prev ? { ...prev, act_reached: result.newActUnlocked! } : prev,
        );
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Dig failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, gameProgress, sessionId, activeBoost, storyProgress]);

  const performUpgrade = useCallback(async (type: 'tool' | 'helper'): Promise<UpgradeResponse | null> => {
    if (!user) return null;
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiUpgrade(user.id, type);
      setGameProgress((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          carbonance_balance: result.newBalance,
          tool_level: type === 'tool' ? result.newLevel : prev.tool_level,
          helper_count: type === 'helper' ? result.newLevel : prev.helper_count,
        };
      });
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upgrade failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const performWatchAd = useCallback(async (type: BoostType): Promise<void> => {
    if (!user) return;
    try {
      const result = await apiWatchAd(user.id, type);
      const boost = makeActiveBoost(result.boostType, result.durationMs, result.multiplier);
      setActiveBoost(boost);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ad reward failed');
    }
  }, [user]);

  const refreshBalance = useCallback((newBalance: number) => {
    setGameProgress((prev) => prev ? { ...prev, carbonance_balance: newBalance } : prev);
  }, []);

  const updatePlayTime = useCallback((extraSeconds: number) => {
    setUser((prev) =>
      prev ? { ...prev, total_play_time_seconds: prev.total_play_time_seconds + extraSeconds } : prev,
    );
  }, []);

  return (
    <GameContext.Provider
      value={{
        user,
        gameProgress,
        storyProgress,
        resources,
        sessionId,
        activeBoost,
        isLoading,
        error,
        initFromLogin,
        performDig,
        performUpgrade,
        performWatchAd,
        setResources,
        refreshBalance,
        updatePlayTime,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}

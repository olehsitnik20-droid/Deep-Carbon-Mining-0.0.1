import type {
  AdRewardResponse,
  BoostType,
  DailyRewardResponse,
  DigResponse,
  HeartbeatResponse,
  Language,
  LoginResponse,
  UpgradeResponse,
} from '../types';
import { SUPABASE_FUNCTION_URL } from './supabase';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

async function callApi<T>(path: string, body?: unknown): Promise<T> {
  try {
    const res = await fetch(`${SUPABASE_FUNCTION_URL}/api${path}`, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API ${path} failed: ${res.status} ${errText}`);
    }
    const data = await res.json();
    return data as T;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    throw new Error(msg);
  }
}

export async function login(telegramData: Record<string, unknown>): Promise<LoginResponse> {
  return callApi<LoginResponse>('/auth/login', telegramData);
}

export async function setLanguage(userId: string, language: Language): Promise<void> {
  await callApi('/auth/set-language', { userId, language });
}

export async function dig(
  userId: string,
  sessionId: string,
  boostType?: BoostType,
): Promise<DigResponse> {
  return callApi<DigResponse>('/dig', { userId, sessionId, boostType });
}

export async function heartbeat(userId: string, sessionId: string, secondsActive: number): Promise<HeartbeatResponse> {
  return callApi<HeartbeatResponse>('/heartbeat', { userId, sessionId, secondsActive });
}

export async function upgrade(userId: string, type: 'tool' | 'helper'): Promise<UpgradeResponse> {
  return callApi<UpgradeResponse>('/upgrade', { userId, type });
}

export async function claimDaily(userId: string): Promise<DailyRewardResponse> {
  return callApi<DailyRewardResponse>('/claim-daily', { userId });
}

export async function watchAd(userId: string, type: BoostType): Promise<AdRewardResponse> {
  return callApi<AdRewardResponse>('/watch-ad', { userId, type });
}

export async function recordReferral(referrerTelegramId: number, newUserId: string): Promise<void> {
  await callApi('/referral', { referrerTelegramId, newUserId });
}

export async function buyStars(userId: string, packId: 'small' | 'medium' | 'large'): Promise<{ newBalance: number; amount: number }> {
  return callApi('/buy-stars', { userId, packId });
}

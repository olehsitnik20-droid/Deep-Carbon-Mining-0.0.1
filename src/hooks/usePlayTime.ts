import { useCallback, useEffect, useRef } from 'react';
import { heartbeat as apiHeartbeat } from '../services/api';
import { useGame } from '../context/GameContext';

const HEARTBEAT_INTERVAL_MS = 60_000;

export function usePlayTime() {
  const { user, sessionId, updatePlayTime } = useGame();
  const lastHeartbeatRef = useRef<number>(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const sendHeartbeat = useCallback(async () => {
    if (!user || !sessionId) return;
    const now = Date.now();
    const secondsActive = Math.floor((now - lastHeartbeatRef.current) / 1000);
    lastHeartbeatRef.current = now;
    if (secondsActive <= 0) return;
    try {
      await apiHeartbeat(user.id, sessionId, secondsActive);
      updatePlayTime(secondsActive);
    } catch {
      // Silently fail heartbeats
    }
  }, [user, sessionId, updatePlayTime]);

  useEffect(() => {
    if (!user || !sessionId) return;
    lastHeartbeatRef.current = Date.now();
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendHeartbeat();
        clearInterval(intervalRef.current);
      } else {
        lastHeartbeatRef.current = Date.now();
        intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sendHeartbeat();
    };
  }, [user, sessionId, sendHeartbeat]);
}

import { useCallback } from 'react';
import * as api from '../services/api';
import { useHealthStore } from '../store';

export function useHealth() {
  const { setHealth, setLoading, setLastChecked } = useHealthStore();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.fetchHealth();
      setHealth(data);
      setLastChecked(new Date().toISOString());
    } catch {
      // ignore - will keep previous state
    } finally {
      setLoading(false);
    }
  }, [setHealth, setLastChecked, setLoading]);

  return { refresh };
}

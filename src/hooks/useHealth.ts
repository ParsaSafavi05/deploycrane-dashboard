import { useCallback, useEffect } from 'react';
import * as api from '../services/api';
import { useHealthStore, useSettingsStore } from '../store';

export function useHealth() {
  const { setHealth, setLoading, setLastChecked } = useHealthStore();
  const { autoRefresh, refreshInterval } = useSettingsStore();

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

  useEffect(() => {
    refresh();
    if (!autoRefresh) return;
    const id = setInterval(refresh, refreshInterval * 1000);
    return () => clearInterval(id);
  }, [refresh, autoRefresh, refreshInterval]);

  return { refresh };
}

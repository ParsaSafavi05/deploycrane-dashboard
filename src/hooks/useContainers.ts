import { useCallback } from 'react';
import * as api from '../services/api';
import { useContainersStore, useNotificationStore } from '../store';

export function useContainers() {
  const { containers, loading, error, showAll, setContainers, setLoading, setError, setShowAll } =
    useContainersStore();
  const { push: notify } = useNotificationStore();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listContainers(showAll);
      setContainers(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load containers';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [showAll, setContainers, setError, setLoading]);

  const stopContainer = useCallback(
    async (id: string) => {
      try {
        await api.stopContainer(id);
        notify({ type: 'success', title: 'Container stopped' });
        await load();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to stop container';
        notify({ type: 'error', title: 'Stop failed', message: msg });
      }
    },
    [load, notify]
  );

  const startContainer = useCallback(
    async (image: string) => {
      try {
        const result = await api.startContainer(image);
        notify({ type: 'success', title: 'Container started', message: `ID: ${result.container_id.slice(0, 12)}` });
        await load();
        return result;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to start container';
        notify({ type: 'error', title: 'Start failed', message: msg });
      }
    },
    [load, notify]
  );

  return {
    containers,
    loading,
    error,
    showAll,
    setShowAll,
    load,
    stopContainer,
    startContainer,
  };
}

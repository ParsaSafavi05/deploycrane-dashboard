import { useCallback, useEffect } from 'react';
import * as api from '../services/api';
import { useAppsStore, useOperationsStore, useNotificationStore, useSettingsStore } from '../store';
import { saveBaseUrl } from '../config/api';
import type { CreateAppInput, OperationType, SSELogLine } from '../types';

export function useApps() {
  const { apps, loading, error, setApps, setLoading, setError, upsertApp, removeApp } =
    useAppsStore();
  const { startOperation, addLog, finishOperation } = useOperationsStore();
  const { push: notify } = useNotificationStore();
  const { autoRefresh, refreshInterval } = useSettingsStore();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listApps();
      setApps(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load apps';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [setApps, setError, setLoading]);

  // Auto-refresh
  useEffect(() => {
    load();
    if (!autoRefresh) return;
    const id = setInterval(load, refreshInterval * 1000);
    return () => clearInterval(id);
  }, [load, autoRefresh, refreshInterval]);

  function runStreamOp(
    appId: string,
    type: OperationType,
    streamFn: (
      onLog: (log: SSELogLine) => void,
      onDone: (ok: boolean) => void,
      signal: AbortSignal
    ) => void
  ) {
    const ctrl = new AbortController();
    startOperation(appId, type);

    const opName = type.charAt(0).toUpperCase() + type.slice(1);

    streamFn(
      (log: SSELogLine) => addLog(appId, log),
      async (ok: boolean) => {
        finishOperation(appId, ok);
        try {
          const updated = await api.getApp(appId);
          upsertApp(updated);
        } catch {
          await load();
        }
        if (ok) {
          notify({ type: 'success', title: `${opName} complete`, message: `App ${opName.toLowerCase()} finished successfully.` });
        } else {
          notify({ type: 'error', title: `${opName} failed`, message: `Check logs for details.` });
        }
      },
      ctrl.signal
    );
    return ctrl;
  }

  const create = useCallback(
    (input: CreateAppInput) => {
      const tempId = 'creating-' + Date.now();
      startOperation(tempId, 'create');

      const ctrl = new AbortController();
      api.createApp(
        input,
        (log: SSELogLine) => {
          addLog(tempId, log);
          if (log.event === 'app') {
            try {
              const app = JSON.parse(log.data);
              upsertApp(app);
            } catch {
              // ignore
            }
          }
        },
        async (ok: boolean) => {
          finishOperation(tempId, ok);
          await load();
          if (ok) {
            notify({ type: 'success', title: 'App created', message: `"${input.name}" was created successfully.` });
          } else {
            notify({ type: 'error', title: 'Create failed', message: 'Failed to create app.' });
          }
        },
        ctrl.signal
      );
      return { ctrl, tempId };
    },
    [addLog, finishOperation, load, notify, startOperation, upsertApp]
  );

  const clone = useCallback(
    (appId: string) =>
      runStreamOp(appId, 'clone', (onLog, onDone, signal) =>
        api.cloneApp(appId, onLog, onDone, signal)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const build = useCallback(
    (appId: string) =>
      runStreamOp(appId, 'build', (onLog, onDone, signal) =>
        api.buildApp(appId, onLog, onDone, signal)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const start = useCallback(
    (appId: string) =>
      runStreamOp(appId, 'start', (onLog, onDone, signal) =>
        api.startApp(appId, onLog, onDone, signal)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const deploy = useCallback(
    (appId: string) =>
      runStreamOp(appId, 'deploy', (onLog, onDone, signal) =>
        api.deployApp(appId, onLog, onDone, signal)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const stop = useCallback(
    async (appId: string) => {
      try {
        const updated = await api.stopApp(appId);
        upsertApp(updated);
        notify({ type: 'success', title: 'App stopped' });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to stop app';
        notify({ type: 'error', title: 'Stop failed', message: msg });
      }
    },
    [notify, upsertApp]
  );

  const remove = useCallback(
    async (appId: string) => {
      try {
        await api.deleteApp(appId);
        removeApp(appId);
        notify({ type: 'success', title: 'App deleted' });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to delete app';
        notify({ type: 'error', title: 'Delete failed', message: msg });
      }
    },
    [notify, removeApp]
  );

  const updateBaseUrl = useCallback(
    (url: string) => {
      saveBaseUrl(url);
      useSettingsStore.getState().setApiBaseUrl(url);
      load();
    },
    [load]
  );

  return { apps, loading, error, load, create, clone, build, start, deploy, stop, remove, updateBaseUrl };
}

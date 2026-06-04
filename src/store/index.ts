import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  App,
  Container,
  HealthResponse,
  Notification,
  ActiveOperation,
  OperationType,
  SSELogLine,
} from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** True when the viewport is narrower than the md breakpoint (768 px). */
const isMobile = () =>
  typeof window !== 'undefined' && window.innerWidth < 768;

// ─── Theme Store ──────────────────────────────────────────────────────────────
interface ThemeState {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (t: 'dark' | 'light') => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (t) => set({ theme: t }),
    }),
    { name: 'dc-theme' }
  )
);

// ─── Apps Store ───────────────────────────────────────────────────────────────
interface AppsState {
  apps: App[];
  loading: boolean;
  error: string | null;
  selectedAppId: string | null;
  setApps: (apps: App[]) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setSelectedAppId: (id: string | null) => void;
  upsertApp: (app: App) => void;
  removeApp: (id: string) => void;
}

export const useAppsStore = create<AppsState>()((set) => ({
  apps: [],
  loading: false,
  error: null,
  selectedAppId: null,
  setApps: (apps) => set({ apps }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedAppId: (selectedAppId) => set({ selectedAppId }),
  upsertApp: (app) =>
    set((s) => {
      const idx = s.apps.findIndex((a) => a.id === app.id);
      if (idx >= 0) {
        const next = [...s.apps];
        next[idx] = app;
        return { apps: next };
      }
      return { apps: [app, ...s.apps] };
    }),
  removeApp: (id) =>
    set((s) => ({ apps: s.apps.filter((a) => a.id !== id) })),
}));

// ─── Containers Store ─────────────────────────────────────────────────────────
interface ContainersState {
  containers: Container[];
  showAll: boolean;
  loading: boolean;
  error: string | null;
  setContainers: (c: Container[]) => void;
  setShowAll: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
}

export const useContainersStore = create<ContainersState>()((set) => ({
  containers: [],
  showAll: false,
  loading: false,
  error: null,
  setContainers: (containers) => set({ containers }),
  setShowAll: (showAll) => set({ showAll }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// ─── Health Store ─────────────────────────────────────────────────────────────
interface HealthState {
  health: HealthResponse | null;
  loading: boolean;
  lastChecked: string | null;
  setHealth: (h: HealthResponse) => void;
  setLoading: (v: boolean) => void;
  setLastChecked: (t: string) => void;
}

export const useHealthStore = create<HealthState>()((set) => ({
  health: null,
  loading: false,
  lastChecked: null,
  setHealth: (health) => set({ health }),
  setLoading: (loading) => set({ loading }),
  setLastChecked: (lastChecked) => set({ lastChecked }),
}));

// ─── Operations Store ─────────────────────────────────────────────────────────
interface OperationsState {
  operations: Record<string, ActiveOperation>;
  addLog: (appId: string, log: SSELogLine) => void;
  startOperation: (appId: string, type: OperationType) => void;
  finishOperation: (appId: string, success: boolean) => void;
  clearOperation: (appId: string) => void;
  clearAll: () => void;
}

export const useOperationsStore = create<OperationsState>()((set) => ({
  operations: {},
  startOperation: (appId, type) =>
    set((s) => ({
      operations: {
        ...s.operations,
        [appId]: {
          appId,
          type,
          logs: [],
          status: 'running',
          startedAt: new Date().toISOString(),
        },
      },
    })),
  addLog: (appId, log) =>
    set((s) => {
      const op = s.operations[appId];
      if (!op) return s;
      return {
        operations: {
          ...s.operations,
          [appId]: { ...op, logs: [...op.logs, log] },
        },
      };
    }),
  finishOperation: (appId, success) =>
    set((s) => {
      const op = s.operations[appId];
      if (!op) return s;
      return {
        operations: {
          ...s.operations,
          [appId]: { ...op, status: success ? 'complete' : 'error' },
        },
      };
    }),
  clearOperation: (appId) =>
    set((s) => {
      const next = { ...s.operations };
      delete next[appId];
      return { operations: next };
    }),
  clearAll: () => set({ operations: {} }),
}));

// ─── Notification Store ───────────────────────────────────────────────────────
interface NotificationState {
  notifications: Notification[];
  push: (n: Omit<Notification, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  notifications: [],
  push: (n) =>
    set((s) => ({
      notifications: [
        ...s.notifications,
        { ...n, id: crypto.randomUUID() },
      ],
    })),
  dismiss: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),
}));

// ─── UI Store ─────────────────────────────────────────────────────────────────
interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
  openModal: (name: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  // Open by default on desktop, closed by default on mobile
  sidebarOpen: !isMobile(),
  activeModal: null,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openModal: (activeModal) => set({ activeModal }),
  closeModal: () => set({ activeModal: null }),
}));

// ─── Settings Store ───────────────────────────────────────────────────────────
interface SettingsState {
  autoRefresh: boolean;
  refreshInterval: number; // seconds
  setAutoRefresh: (v: boolean) => void;
  setRefreshInterval: (s: number) => void;
}

import { getCurrentBaseUrl } from '../config/api';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiBaseUrl: getCurrentBaseUrl(), // ← reads localStorage then falls back to dynamic default
      autoRefresh: true,
      refreshInterval: 10,
      setAutoRefresh: (autoRefresh) => set({ autoRefresh }),
      setRefreshInterval: (refreshInterval) => set({ refreshInterval }),
    }),
    { name: 'dc-settings' }
  )
);
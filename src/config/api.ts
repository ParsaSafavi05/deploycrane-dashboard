// ─────────────────────────────────────────────────────────────────
// DeployCrane API Configuration
// ─────────────────────────────────────────────────────────────────
// This file is the single source of truth for all API endpoint
// configuration. Change BASE_URL or individual paths here to adapt
// the dashboard to any deployment environment.
// ─────────────────────────────────────────────────────────────────

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  endpoints: {
    health: string;
    apps: string;
    app: (id: string) => string;
    createApp: string;
    cloneApp: (id: string) => string;
    buildApp: (id: string) => string;
    startApp: (id: string) => string;
    stopApp: (id: string) => string;
    deployApp: (id: string) => string;
    deleteApp: (id: string) => string;
    containers: string;
    container: (id: string) => string;
    startContainer: string;
    stopContainer: (id: string) => string;
  };
}

// ─── Primary configuration ───────────────────────────────────────
// Override via VITE_API_BASE_URL environment variable at build time
// or dynamically via the Settings panel in the UI.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DEFAULT_BASE_URL: string =
  ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined) ||
  'http://localhost:8080';

function buildConfig(baseUrl: string): ApiConfig {
  const base = baseUrl.replace(/\/$/, ''); // strip trailing slash
  return {
    baseUrl: base,
    timeout: 30000,
    endpoints: {
      // ── Health ──────────────────────────────────────────────
      health: `${base}/health`,

      // ── Apps ────────────────────────────────────────────────
      apps: `${base}/apps`,
      app: (id) => `${base}/apps/${id}`,
      createApp: `${base}/apps`,
      cloneApp: (id) => `${base}/apps/${id}/clone`,
      buildApp: (id) => `${base}/apps/${id}/build`,
      startApp: (id) => `${base}/apps/${id}/start`,
      stopApp: (id) => `${base}/apps/${id}/stop`,
      deployApp: (id) => `${base}/apps/${id}/deploy`,
      deleteApp: (id) => `${base}/apps/${id}`,

      // ── Containers ──────────────────────────────────────────
      containers: `${base}/containers`,
      container: (id) => `${base}/containers/${id}`,
      startContainer: `${base}/containers/start`,
      stopContainer: (id) => `${base}/containers/${id}/stop`,
    },
  };
}

// ─── Runtime-configurable singleton ─────────────────────────────
// Users can update the base URL from Settings without a page reload.
const STORAGE_KEY = 'deploycrane_api_base_url';

function getStoredBaseUrl(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_BASE_URL;
  } catch {
    return DEFAULT_BASE_URL;
  }
}

export function saveBaseUrl(url: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, url);
  } catch {
    // ignore
  }
}

export function resetBaseUrl(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getApiConfig(): ApiConfig {
  return buildConfig(getStoredBaseUrl());
}

export function getCurrentBaseUrl(): string {
  return getStoredBaseUrl();
}

export const apiConfig = buildConfig(getStoredBaseUrl());

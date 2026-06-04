// ─────────────────────────────────────────────────────────────────
// DeployCrane API Configuration
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

// ─── Resolve the default base URL ────────────────────────────────
/**
 * Priority:
 *  1. VITE_API_BASE_URL build-time env var  (set in .env.local or CI)
 *  2. Dynamic same-host resolution          (works for any IP/domain)
 *  3. localhost:8080 fallback               (file:// or SSR)
 *
 * How dynamic resolution works:
 *  - Dev   (port 5173/4173) → same hostname but port 8080
 *  - Prod  (Go serves UI and API on same port e.g. 8080) → same origin
 */
function resolveDefaultBaseUrl(): string {
  // 1. Build-time override always wins
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  if (envUrl) return envUrl;

  // 2. No window (SSR/test) or file:// → localhost fallback
  if (typeof window === 'undefined' || window.location.protocol === 'file:') {
    return 'http://localhost:8080';
  }

  const { protocol, hostname, port } = window.location;

  // Dev server ports → backend is always on 8080
  if (port === '5173' || port === '4173') {
    return `${protocol}//${hostname}:8080`;
  }

  // Production: Go serves both UI and API on the same port
  // so we use the exact same origin the browser used to load the page
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
}

const DEFAULT_BASE_URL: string = resolveDefaultBaseUrl();

// ─── Config builder ───────────────────────────────────────────────
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

// ─── localStorage persistence ─────────────────────────────────────
// Users can override the URL from the Settings panel without rebuild.
// The stored value takes priority over the dynamic default at runtime.
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
    // ignore — private browsing mode etc.
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

// ─── Static singleton (used at module load time) ──────────────────
// Services that import apiConfig directly get the value at startup.
// For dynamic updates use getApiConfig() which re-reads localStorage.
export const apiConfig = buildConfig(getStoredBaseUrl());
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

function resolveBaseUrl(): string {
  if (typeof window === 'undefined' || window.location.protocol === 'file:') {
    return 'http://localhost:8080';
  }

  const { protocol, hostname, port, origin } = window.location;

  // Vite dev / preview
  if (port === '5173' || port === '4173') {
    return `${protocol}//${hostname}:8080`;
  }

  // Production behind nginx
  return `${origin}/api`;
}

function buildConfig(baseUrl: string): ApiConfig {
  const base = baseUrl.replace(/\/$/, '');

  return {
    baseUrl: base,
    timeout: 30000,
    endpoints: {
      health: `${base}/health`,
      apps: `${base}/apps`,
      app: (id) => `${base}/apps/${id}`,
      createApp: `${base}/apps`,
      cloneApp: (id) => `${base}/apps/${id}/clone`,
      buildApp: (id) => `${base}/apps/${id}/build`,
      startApp: (id) => `${base}/apps/${id}/start`,
      stopApp: (id) => `${base}/apps/${id}/stop`,
      deployApp: (id) => `${base}/apps/${id}/deploy`,
      deleteApp: (id) => `${base}/apps/${id}`,
      containers: `${base}/containers`,
      container: (id) => `${base}/containers/${id}`,
      startContainer: `${base}/containers/start`,
      stopContainer: (id) => `${base}/containers/${id}/stop`,
    },
  };
}

export const apiConfig = buildConfig(resolveBaseUrl());

export function getApiConfig(): ApiConfig {
  return apiConfig;
}

export function getCurrentBaseUrl(): string {
  return apiConfig.baseUrl;
}
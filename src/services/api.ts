import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getApiConfig, getCurrentBaseUrl } from '../config/api';
import type {
  App,
  CreateAppInput,
  Container,
  ContainerDetail,
  HealthResponse,
  SSELogLine,
  SSEEventType,
} from '../types';

// ─── Axios instance (lazy, recreated when base URL changes) ──────
let _client: AxiosInstance | null = null;
let _lastBaseUrl: string = '';

function getClient(): AxiosInstance {
  const cfg = getApiConfig();
  if (!_client || _lastBaseUrl !== cfg.baseUrl) {
    _lastBaseUrl = cfg.baseUrl;
    _client = axios.create({
      baseURL: cfg.baseUrl,
      timeout: cfg.timeout,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return _client;
}

// ─── Health ──────────────────────────────────────────────────────
export async function fetchHealth(): Promise<HealthResponse> {
  const cfg = getApiConfig();
  const res: AxiosResponse<HealthResponse> = await getClient().get(
    cfg.endpoints.health
  );
  return res.data;
}

// ─── Apps ────────────────────────────────────────────────────────
export async function listApps(): Promise<App[]> {
  const cfg = getApiConfig();
  const res: AxiosResponse<App[]> = await getClient().get(cfg.endpoints.apps);
  return res.data;
}

export async function getApp(id: string): Promise<App> {
  const cfg = getApiConfig();
  const res: AxiosResponse<App> = await getClient().get(cfg.endpoints.app(id));
  return res.data;
}

export async function stopApp(id: string): Promise<App> {
  const cfg = getApiConfig();
  const res: AxiosResponse<App> = await getClient().post(
    cfg.endpoints.stopApp(id)
  );
  return res.data;
}

export async function deleteApp(id: string): Promise<{ message: string }> {
  const cfg = getApiConfig();
  const res: AxiosResponse<{ message: string }> = await getClient().delete(
    cfg.endpoints.deleteApp(id)
  );
  return res.data;
}

// ─── SSE Streaming operations ────────────────────────────────────
// All streaming ops (create, clone, build, start, deploy) return via
// SSE. We use the native EventSource API + fetch for POST requests.

type SSECallback = (line: SSELogLine) => void;
type SSEDoneCallback = (success: boolean) => void;

function makeLogLine(event: string, data: string): SSELogLine {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    event: event as SSEEventType,
    data,
  };
}

/**
 * Streams an SSE response from a POST endpoint.
 * The backend sends `text/event-stream` in response to POST requests.
 */
async function streamPost(
  url: string,
  body: Record<string, unknown>,
  onLog: SSECallback,
  onDone: SSEDoneCallback,
  signal?: AbortSignal
): Promise<void> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      let errMsg = `HTTP ${response.status}`;
      try {
        const err = await response.json();
        errMsg = err.error || err.message || errMsg;
      } catch {
        // ignore
      }
      onLog(makeLogLine('error', errMsg));
      onDone(false);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onLog(makeLogLine('error', 'No response body'));
      onDone(false);
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let currentEvent = 'message';
    let isDone = false;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE lines
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          const data = line.slice(5).trim();
          onLog(makeLogLine(currentEvent, data));

          if (currentEvent === 'complete') {
            isDone = true;
          } else if (currentEvent === 'error') {
            isDone = true;
          }
          // Reset event type
          currentEvent = 'message';
        } else if (line === '') {
          // end of SSE block
          currentEvent = 'message';
        }
      }
    }

    onDone(isDone && !buffer.includes('error'));
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      onLog(makeLogLine('error', 'Operation cancelled'));
      onDone(false);
      return;
    }
    const message = err instanceof Error ? err.message : String(err);
    onLog(makeLogLine('error', message));
    onDone(false);
  }
}

// ─── Create App (SSE) ────────────────────────────────────────────
export function createApp(
  input: CreateAppInput,
  onLog: SSECallback,
  onDone: SSEDoneCallback,
  signal?: AbortSignal
): void {
  const cfg = getApiConfig();
  streamPost(
    cfg.endpoints.createApp,
    input as unknown as Record<string, unknown>,
    onLog,
    onDone,
    signal
  );
}

// ─── Clone App (SSE) ─────────────────────────────────────────────
export function cloneApp(
  id: string,
  onLog: SSECallback,
  onDone: SSEDoneCallback,
  signal?: AbortSignal
): void {
  const cfg = getApiConfig();
  streamPost(cfg.endpoints.cloneApp(id), {}, onLog, onDone, signal);
}

// ─── Build App (SSE) ─────────────────────────────────────────────
export function buildApp(
  id: string,
  onLog: SSECallback,
  onDone: SSEDoneCallback,
  signal?: AbortSignal
): void {
  const cfg = getApiConfig();
  streamPost(cfg.endpoints.buildApp(id), {}, onLog, onDone, signal);
}

// ─── Start App (SSE) ─────────────────────────────────────────────
export function startApp(
  id: string,
  onLog: SSECallback,
  onDone: SSEDoneCallback,
  signal?: AbortSignal
): void {
  const cfg = getApiConfig();
  streamPost(cfg.endpoints.startApp(id), {}, onLog, onDone, signal);
}

// ─── Deploy App (SSE) ────────────────────────────────────────────
export function deployApp(
  id: string,
  onLog: SSECallback,
  onDone: SSEDoneCallback,
  signal?: AbortSignal
): void {
  const cfg = getApiConfig();
  streamPost(cfg.endpoints.deployApp(id), {}, onLog, onDone, signal);
}

// ─── Containers ──────────────────────────────────────────────────
export async function listContainers(all = false): Promise<Container[]> {
  const cfg = getApiConfig();

  const res = await getClient().get(cfg.endpoints.containers, {
    params: { all },
  });

  return (res.data as any[]).map((c) => ({
    Id: c.id,
    Names: c.names,
    Image: c.image,
    ImageID: c.image_id ?? '',
    Command: c.command ?? '',
    State: c.state,
    Status: c.status,
    Created: c.created ?? 0,
    Ports: c.ports ?? [],
    Labels: c.labels ?? {},
  }));
}

export async function getContainer(id: string): Promise<ContainerDetail> {
  const cfg = getApiConfig();
  const res: AxiosResponse<ContainerDetail> = await getClient().get(
    cfg.endpoints.container(id)
  );
  return res.data;
}

export async function startContainer(
  image: string
): Promise<{ container_id: string }> {
  const cfg = getApiConfig();
  const res: AxiosResponse<{ container_id: string }> = await getClient().post(
    cfg.endpoints.startContainer,
    { image }
  );
  return res.data;
}

export async function stopContainer(
  id: string
): Promise<Record<string, unknown>> {
  const cfg = getApiConfig();
  const res: AxiosResponse<Record<string, unknown>> = await getClient().post(
    cfg.endpoints.stopContainer(id)
  );
  return res.data;
}

// ─── Utility ─────────────────────────────────────────────────────
export function getBaseUrl(): string {
  return getCurrentBaseUrl();
}

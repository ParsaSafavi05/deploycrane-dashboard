// ─────────────────────────────────────────────────────────────────
// DeployCrane Type Definitions
// ─────────────────────────────────────────────────────────────────

// ── App Status ──────────────────────────────────────────────────
export type AppStatus =
  | 'created'
  | 'cloning'
  | 'cloned'
  | 'building'
  | 'built'
  | 'starting'
  | 'running'
  | 'stopped'
  | 'failed';

// ── App Model ───────────────────────────────────────────────────
export interface App {
  id: string;
  name: string;
  repo_url: string;
  clone_path?: string;
  status: AppStatus;
  container_id?: string;
  container_port: number;
  host_port: number;
  created_at: string;
}

// ── Create App Input ────────────────────────────────────────────
export interface CreateAppInput {
  name: string;
  repo_url: string;
  deploy: boolean;
  container_port: number;
  host_port: number;
}

// ── Container ───────────────────────────────────────────────────
export interface ContainerPort {
  IP: string;
  PrivatePort: number;
  PublicPort: number;
  Type: string;
}

export interface Container {
  Id: string;
  Names: string[];
  Image: string;
  ImageID: string;
  Command: string;
  Created: number;
  Status: string;
  State: string;
  Ports: ContainerPort[];
  Labels: Record<string, string>;
}

export interface ContainerDetail {
  Id: string;
  Name: string;
  Image: string;
  State: {
    Status: string;
    Running: boolean;
    Paused: boolean;
    Restarting: boolean;
    Dead: boolean;
    Pid: number;
    ExitCode: number;
    Error: string;
    StartedAt: string;
    FinishedAt: string;
  };
  Config: {
    Image: string;
    Cmd: string[];
    Env: string[];
    Labels: Record<string, string>;
  };
  NetworkSettings: {
    Ports: Record<string, Array<{ HostIp: string; HostPort: string }> | null>;
  };
  Created: string;
}

// ── Health Check ────────────────────────────────────────────────
export interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'unhealthy';
  error?: string;
  duration: number;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  checks: HealthCheckResult[];
}

// ── SSE Events ──────────────────────────────────────────────────
export type SSEEventType =
  | 'endpoint'
  | 'progress'
  | 'complete'
  | 'error'
  | 'build'
  | 'app'
  | 'message';

export interface SSELogLine {
  id: string;
  timestamp: string;
  event: SSEEventType;
  data: string;
}

// ── Notification ────────────────────────────────────────────────
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

// ── API Error ───────────────────────────────────────────────────
export interface ApiError {
  error: string;
  message?: string;
}

// ── Operation State ─────────────────────────────────────────────
export type OperationType =
  | 'clone'
  | 'build'
  | 'start'
  | 'stop'
  | 'deploy'
  | 'create'
  | 'delete';

export interface ActiveOperation {
  appId: string;
  type: OperationType;
  logs: SSELogLine[];
  status: 'running' | 'complete' | 'error';
  startedAt: string;
}

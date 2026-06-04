import { motion } from 'framer-motion';
import {
  Settings, Server, RefreshCw, Sun, Moon,
  Clock, Sliders, Info, ExternalLink
} from 'lucide-react';
import Header from '../components/layout/Header';
import { useSettingsStore, useThemeStore } from '../store';
import { getCurrentBaseUrl } from '../config/api';

function SettingSection({ title, icon: Icon, children }: {
  title: string;
  icon: typeof Settings;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] space-y-5"
    >
      <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
        <Icon size={14} className="text-cyan-400" />
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

function SettingRow({ label, description, children }: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
      <div className="flex-1">
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        {description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { autoRefresh, setAutoRefresh, refreshInterval, setRefreshInterval } = useSettingsStore();
  const { theme, setTheme } = useThemeStore();

  const apiBaseUrl = getCurrentBaseUrl();

  const REFRESH_OPTIONS = [5, 10, 15, 30, 60];

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Settings"
        subtitle="Configure the dashboard behavior and API connection"
      />

      <div className="p-6 space-y-5 max-w-2xl mx-auto">
        {/* API Configuration (Read-Only) */}
        <SettingSection title="API Configuration" icon={Server}>
          <SettingRow
            label="API Base URL"
            description="Read-only. Set VITE_API_BASE_URL and rebuild to change."
          >
            <code className="px-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-secondary)] break-all">
              {apiBaseUrl}
            </code>
          </SettingRow>

          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
            <Info size={10} />
            Configured via <code className="font-mono bg-[var(--bg-secondary)] px-1 rounded">VITE_API_BASE_URL</code>
          </p>

          {/* API Endpoints Reference */}
          <div className="mt-4 p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
            <p className="text-xs font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">API Endpoints</p>
            <div className="space-y-1.5 font-mono text-[10px] overflow-x-auto">
              {[
                { method: 'GET', path: '/health', desc: 'Health status' },
                { method: 'GET', path: '/apps', desc: 'List all apps' },
                { method: 'POST', path: '/apps', desc: 'Create app (SSE)' },
                { method: 'GET', path: '/apps/{id}', desc: 'Get app' },
                { method: 'POST', path: '/apps/{id}/clone', desc: 'Clone (SSE)' },
                { method: 'POST', path: '/apps/{id}/build', desc: 'Build (SSE)' },
                { method: 'POST', path: '/apps/{id}/start', desc: 'Start (SSE)' },
                { method: 'POST', path: '/apps/{id}/stop', desc: 'Stop app' },
                { method: 'POST', path: '/apps/{id}/deploy', desc: 'Full deploy (SSE)' },
                { method: 'DELETE', path: '/apps/{id}', desc: 'Delete app' },
                { method: 'GET', path: '/containers', desc: 'List containers' },
                { method: 'GET', path: '/containers/{id}', desc: 'Inspect container' },
                { method: 'POST', path: '/containers/start', desc: 'Start container' },
                { method: 'POST', path: '/containers/{id}/stop', desc: 'Stop container' },
              ].map(({ method, path, desc }) => (
                <div key={path + method} className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    method === 'GET' ? 'bg-cyan-950 text-cyan-400' :
                    method === 'POST' ? 'bg-emerald-950 text-emerald-400' :
                    'bg-red-950 text-red-400'
                  }`}>
                    {method}
                  </span>
                  <span className="text-[var(--text-secondary)]">{path}</span>
                  <span className="text-[var(--text-muted)] ml-auto">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </SettingSection>

        {/* Auto-refresh */}
        <SettingSection title="Data Refresh" icon={RefreshCw}>
          <SettingRow
            label="Auto Refresh"
            description="Automatically poll the API for updates"
          >
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${autoRefresh ? 'bg-cyan-500' : 'bg-slate-700'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${autoRefresh ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </SettingRow>

          {autoRefresh && (
            <SettingRow
              label="Refresh Interval"
              description="How often to poll the API"
            >
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-[var(--text-muted)]" />
                <div className="flex gap-1 flex-wrap">
                  {REFRESH_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setRefreshInterval(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        refreshInterval === s
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] border border-transparent hover:border-[var(--border-color)]'
                      }`}
                    >
                      {s}s
                    </button>
                  ))}
                </div>
              </div>
            </SettingRow>
          )}
        </SettingSection>

        {/* Appearance */}
        <SettingSection title="Appearance" icon={Sliders}>
          <SettingRow
            label="Color Theme"
            description="Toggle between dark and light mode"
          >
            <div className="flex items-center gap-1 p-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  theme === 'dark' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow' : 'text-[var(--text-muted)]'
                }`}
              >
                <Moon size={13} />
                Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  theme === 'light' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow' : 'text-[var(--text-muted)]'
                }`}
              >
                <Sun size={13} />
                Light
              </button>
            </div>
          </SettingRow>
        </SettingSection>

        {/* About */}
        <SettingSection title="About" icon={Info}>
          <div className="space-y-3 text-sm text-[var(--text-secondary)]">
            <div className="flex items-center justify-between">
              <span>DeployCrane Dashboard</span>
              <span className="text-xs text-[var(--text-muted)] font-mono">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Backend API</span>
              <a
                href="https://github.com/ParsaSafavi05/deploycrane"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                GitHub <ExternalLink size={10} />
              </a>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-2">
              A production-grade dashboard for DeployCrane — a lightweight Go-based PaaS that
              dockerizes and deploys applications from Git repositories.
            </p>
          </div>
        </SettingSection>
      </div>
    </div>
  );
}
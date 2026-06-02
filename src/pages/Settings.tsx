import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Server, RefreshCw, Sun, Moon, Check, RotateCcw,
  Globe, Clock, Sliders, Info, ExternalLink
} from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import { useSettingsStore, useThemeStore } from '../store';
import { saveBaseUrl, resetBaseUrl } from '../config/api';
import { useApps } from '../hooks/useApps';

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
    <div className="flex items-center justify-between gap-6">
      <div className="flex-1">
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        {description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { apiBaseUrl, setApiBaseUrl, autoRefresh, setAutoRefresh, refreshInterval, setRefreshInterval } = useSettingsStore();
  const { theme, setTheme } = useThemeStore();
  const { load } = useApps();

  const [url, setUrl] = useState(apiBaseUrl);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'pass' | 'fail' | null>(null);

  const handleSaveUrl = () => {
    saveBaseUrl(url.trim());
    setApiBaseUrl(url.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    load();
  };

  const handleReset = () => {
    resetBaseUrl();
    const def = 'http://localhost:8080';
    setUrl(def);
    setApiBaseUrl(def);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${url.trim()}/health`, { signal: AbortSignal.timeout(5000) });
      setTestResult(res.ok ? 'pass' : 'fail');
    } catch {
      setTestResult('fail');
    } finally {
      setTesting(false);
    }
  };

  const REFRESH_OPTIONS = [5, 10, 15, 30, 60];

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Settings"
        subtitle="Configure the dashboard behavior and API connection"
      />

      <div className="p-6 space-y-5 max-w-2xl mx-auto">
        {/* API Configuration */}
        <SettingSection title="API Configuration" icon={Server}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                API Base URL
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveUrl()}
                    placeholder="http://localhost:8080"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-cyan-500/50 transition-all font-mono"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<RotateCcw size={13} />}
                  onClick={handleReset}
                  title="Reset to default"
                />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1.5 flex items-center gap-1">
                <Info size={10} />
                Can also be set via <code className="font-mono bg-[var(--bg-secondary)] px-1 rounded">VITE_API_BASE_URL</code> env variable
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={saved ? <Check size={13} /> : undefined}
                onClick={handleSaveUrl}
              >
                {saved ? 'Saved!' : 'Save URL'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                loading={testing}
                onClick={handleTest}
              >
                Test Connection
              </Button>
              {testResult && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-sm font-medium flex items-center gap-1.5 ${
                    testResult === 'pass' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {testResult === 'pass' ? <Check size={14} /> : '✕'}
                  {testResult === 'pass' ? 'Connected!' : 'Connection failed'}
                </motion.span>
              )}
            </div>
          </div>

          {/* API Endpoints Reference */}
          <div className="mt-4 p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
            <p className="text-xs font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">API Endpoints</p>
            <div className="space-y-1.5 font-mono text-[10px]">
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
                <div className="flex gap-1">
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

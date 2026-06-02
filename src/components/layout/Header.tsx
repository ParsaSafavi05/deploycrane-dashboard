import { Sun, Moon, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useThemeStore, useHealthStore, useAppsStore } from '../../store';
import { useHealth } from '../../hooks/useHealth';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { theme, toggleTheme } = useThemeStore();
  const { health, loading: healthLoading } = useHealthStore();
  const { loading: appsLoading } = useAppsStore();
  const { refresh: refreshHealth } = useHealth();

  const isOnline = health?.status === 'healthy';
  const isLoading = healthLoading || appsLoading;

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 backdrop-blur sticky top-0 z-10">
      <div className="animate-slide-left">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <RefreshCw size={12} className="animate-spin text-cyan-400" />
            <span>Syncing</span>
          </div>
        )}

        {/* Connection status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            !health ? 'border-slate-700 text-slate-500 bg-slate-900' :
            isOnline
              ? 'border-emerald-800 text-emerald-400 bg-emerald-950'
              : 'border-red-800 text-red-400 bg-red-950'
          }`}
          onClick={refreshHealth}
          title="Click to refresh health"
          style={{ cursor: 'pointer' }}
        >
          {isOnline ? (
            <Wifi size={12} className="animate-pulse" />
          ) : (
            <WifiOff size={12} />
          )}
          <span>{!health ? 'Connecting' : isOnline ? 'Online' : 'Degraded'}</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-all"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}

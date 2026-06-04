// src/components/layout/Header.tsx
import { Sun, Moon, RefreshCw, Wifi, WifiOff, Menu } from 'lucide-react';
import { useThemeStore, useHealthStore, useAppsStore, useUIStore } from '../../store';
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
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const isOnline = health?.status === 'healthy';
  const isLoading = healthLoading || appsLoading;

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50 backdrop-blur sticky top-0 z-10">

      {/* ── Left: hamburger + title ──────────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">

        {/* Hamburger – mobile only */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden flex-shrink-0 p-2 rounded-lg
                     border border-[var(--border-color)]
                     text-[var(--text-muted)] hover:text-[var(--text-secondary)]
                     hover:bg-[var(--bg-card-hover)] transition-all"
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>

        {/* Title */}
        <div className="animate-slide-left min-w-0">
          <h1 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ── Right: loading + status + theme ─────────────────────── */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">

        {/* Loading spinner */}
        {isLoading && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <RefreshCw size={12} className="animate-spin text-cyan-400" />
            <span className="hidden sm:inline">Syncing</span>
          </div>
        )}

        {/* Connection status */}
        <button
          onClick={refreshHealth}
          title="Click to refresh health"
          className={`flex items-center gap-1.5 px-2 md:px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            !health
              ? 'border-slate-700 text-slate-500 bg-slate-900'
              : isOnline
                ? 'border-emerald-800 text-emerald-400 bg-emerald-950'
                : 'border-red-800 text-red-400 bg-red-950'
          }`}
        >
          {isOnline ? (
            <Wifi size={12} className="animate-pulse" />
          ) : (
            <WifiOff size={12} />
          )}
          <span className="hidden sm:inline">
            {!health ? 'Connecting' : isOnline ? 'Online' : 'Degraded'}
          </span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-[var(--border-color)]
                     text-[var(--text-muted)] hover:text-[var(--text-secondary)]
                     hover:bg-[var(--bg-card-hover)] transition-all"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
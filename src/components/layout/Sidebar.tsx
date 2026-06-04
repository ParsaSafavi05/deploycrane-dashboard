// src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Box,
  Container,
  HeartPulse,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  X,
} from 'lucide-react';
import DCLogo from '../ui/DCLogo';
import { useUIStore, useHealthStore } from '../../store';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/apps', label: 'Apps', icon: Box },
  { to: '/containers', label: 'Containers', icon: Container },
  { to: '/health', label: 'Health', icon: HeartPulse },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const { health } = useHealthStore();

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      {/* ── Mobile backdrop ─────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            // z-30: above content (z-1) but below sidebar (z-40)
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 220 : 60 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={[
          // Base layout
          'flex-shrink-0 h-screen flex flex-col',
          'border-r border-[var(--border-color)] bg-[var(--bg-secondary)]',
          'overflow-hidden',
          // Mobile: fixed drawer, slides in/out, always full width (220px handled by framer)
          // sits above backdrop (z-40)
          'fixed top-0 left-0 z-40',
          // Slide transform on mobile only
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'transition-transform duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
          // Desktop: undo fixed, undo translate, let framer-motion handle width
          'md:relative md:translate-x-0 md:transition-none',
        ].join(' ')}
      >
        {/* ── Logo ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-[var(--border-color)] min-h-[65px]">
          <div className="flex items-center gap-3">
            <DCLogo size={32} animated />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <span className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                    Deploy
                  </span>
                  <span className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400 tracking-tight">
                    Crane
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile-only close button */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeSidebar}
                className="md:hidden flex-shrink-0 p-1.5 rounded-lg
                           text-[var(--text-muted)] hover:text-[var(--text-secondary)]
                           hover:bg-[var(--bg-card-hover)] transition-colors"
                aria-label="Close menu"
              >
                <X size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── Nav ───────────────────────────────────────────────── */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              // Close drawer on mobile after navigating
              onClick={() => {
                if (window.innerWidth < 768) closeSidebar();
              }}
              className={({ isActive }) =>
                `nav-item flex items-center gap-3 px-2 py-2.5 rounded-lg
                 text-sm font-medium transition-all cursor-pointer
                 ${isActive ? 'nav-active' : 'text-[var(--text-secondary)]'}`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* ── Health dot ────────────────────────────────────────── */}
        <div className="px-3 py-3 border-t border-[var(--border-color)] flex items-center gap-2 overflow-hidden">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              !health
                ? 'bg-slate-500'
                : health.status === 'healthy'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-red-400'
            }`}
          />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-[var(--text-muted)] whitespace-nowrap"
              >
                {!health
                  ? 'Checking...'
                  : health.status === 'healthy'
                    ? 'All systems OK'
                    : 'Issues detected'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ── Collapse toggle (desktop only) ────────────────────── */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex items-center justify-center py-3
                     border-t border-[var(--border-color)]
                     text-[var(--text-muted)] hover:text-[var(--text-secondary)]
                     hover:bg-[var(--bg-card-hover)] transition-colors"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </motion.aside>
    </>
  );
}
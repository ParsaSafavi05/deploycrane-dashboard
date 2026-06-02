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

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 220 : 60 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="flex-shrink-0 h-screen sticky top-0 flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-secondary)] z-20 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center px-3 py-4 border-b border-[var(--border-color)] min-h-[65px]">
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
                <span className="text-base font-bold text-[var(--text-primary)] tracking-tight">Deploy</span>
                <span className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400 tracking-tight">Crane</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `nav-item flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer
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

      {/* Health indicator */}
      <div className={`px-3 py-3 border-t border-[var(--border-color)] flex items-center gap-2 overflow-hidden`}>
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            !health ? 'bg-slate-500' :
            health.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
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
              {!health ? 'Checking...' : health.status === 'healthy' ? 'All systems OK' : 'Issues detected'}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="flex items-center justify-center py-3 border-t border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors"
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </motion.aside>
  );
}

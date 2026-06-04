import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Apps from './pages/Apps';
import Containers from './pages/Containers';
import Health from './pages/Health';
import ActivityPage from './pages/Activity';
import SettingsPage from './pages/Settings';
import Notifications from './components/ui/Notifications';
import { useThemeStore } from './store';
import { useHealth } from './hooks/useHealth';
import AppDetails from './pages/AppDetails';
import { useApps } from './hooks/useApps';
import { useContainers } from './hooks/useContainers';
import { useSettingsStore } from './store';

// Add this hook at the top of your file
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check on mount
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// ─── Background particles ────────────────────────────────────────────────────

function Particles() {
  const isMobile = useIsMobile();
  
  const particles = useMemo(() => {
    // Render only 2 particles on mobile, 6 on desktop
    const count = isMobile ? 2 : 6; 
    return [...Array(count)].map((_, i) => ({
      id: i,
      size: Math.random() * 400 + 200,
      left: Math.random() * 100,
      top: Math.random() * 100,
      color: i % 2 === 0 ? '#06b6d4' : '#0ea5e9',
      animationDelay: i * 1.5,
      animationDuration: 8 + i * 2,
    }));
  }, [isMobile]); // Re-calculate when device type changes

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle absolute rounded-full opacity-[0.03]"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            background: `radial-gradient(circle, ${p.color}, transparent)`,
            animationDelay: `${p.animationDelay}s`,
            animationDuration: `${p.animationDuration}s`,
            willChange: 'transform', // Forces GPU acceleration
          }}
        />
      ))}
    </div>
  );
}

function AmbientBubbles() {
  const isMobile = useIsMobile();

  const bubbles = useMemo(() => {
    const palette = [
      ['rgba(6,182,212,0.55)', 'rgba(6,182,212,0.14)'],
      ['rgba(14,165,233,0.55)', 'rgba(14,165,233,0.12)'],
      ['rgba(99,102,241,0.50)', 'rgba(99,102,241,0.12)'],
      ['rgba(168,85,247,0.45)', 'rgba(168,85,247,0.10)'],
    ];

    // Render only 3 bubbles on mobile, 10 on desktop
    const count = isMobile ? 3 : 10;

    return Array.from({ length: count }).map((_, index) => {
      const depth = Math.pow(Math.random(), 1.7);
      const [a, b] = palette[Math.floor(Math.random() * palette.length)];

      return {
        id: `bubble-${index}`,
        size: 240 + Math.random() * 320,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        opacity: 0.12 + (1 - depth) * 0.25,
        // Disable expensive blur entirely on mobile
        blur: isMobile ? 0 : 18 + depth * 30, 
        duration: 18 + Math.random() * 18,
        bg: `radial-gradient(circle at 30% 30%, ${a}, ${b} 45%, transparent 80%)`,
      };
    });
  }, [isMobile]); // Re-calculate when device type changes

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {bubbles.map((b) => (
        <div
          key={b.id}
          className="absolute rounded-full"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: b.left,
            top: b.top,
            opacity: b.opacity,
            filter: b.blur > 0 ? `blur(${b.blur}px)` : 'none', // Apply conditionally
            background: b.bg,
            animation: `ambientDrift ${b.duration}s ease-in-out infinite`,
            willChange: 'transform', // Forces GPU acceleration
          }}
        />
      ))}
    </div>
  );
}

// ─── App layout ──────────────────────────────────────────────────────────────

function AppLayout() {
  const { autoRefresh, refreshInterval } = useSettingsStore();
  const { refresh: refreshHealth } = useHealth();
  const { load: loadApps } = useApps();
  const { load: loadContainers } = useContainers();

  useEffect(() => {
    loadApps();
    loadContainers();
    refreshHealth();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      loadApps();
      loadContainers();
      refreshHealth();
    }, refreshInterval * 1000);
    return () => clearInterval(id);
  }, [autoRefresh, refreshInterval]);

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] grid-bg bg-radial-cyan overflow-hidden">
      <AmbientBubbles />
      <Particles />

      {/* Sidebar handles its own mobile/desktop rendering */}
      <Sidebar />

      {/*
        Main column:
        - flex-1 so it takes remaining width next to sidebar on desktop
        - min-w-0 prevents flex children from overflowing
      */}
      <main className="flex-1 min-w-0 flex flex-col overflow-hidden relative z-[1]">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/apps" element={<Apps />} />
          <Route path="/apps/:appId" element={<AppDetails />} />
          <Route path="/containers" element={<Containers />} />
          <Route path="/health" element={<Health />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────

export default function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <AppLayout />
      <Notifications />
    </BrowserRouter>
  );
}
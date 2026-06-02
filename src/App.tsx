import { useEffect } from 'react';
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

// Background particle component
function Particles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="particle absolute rounded-full opacity-[0.03]"
          style={{
            width: `${Math.random() * 400 + 200}px`,
            height: `${Math.random() * 400 + 200}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, ${i % 2 === 0 ? '#06b6d4' : '#0ea5e9'}, transparent)`,
            animationDelay: `${i * 1.5}s`,
            animationDuration: `${8 + i * 2}s`,
          }}
        />
      ))}
    </div>
  );
}

function AppLayout() {
  // Initialize health polling
  useHealth();

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] grid-bg bg-radial-cyan overflow-hidden">
      <Particles />
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative z-[1]">
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

export default function App() {
  const { theme } = useThemeStore();

  // Apply theme class to root
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

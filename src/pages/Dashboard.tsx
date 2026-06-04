import { motion } from 'framer-motion';
import {
  Box, Container, HeartPulse, Activity, TrendingUp, Zap,
  AlertTriangle, Rocket, GitBranch, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { useAppsStore, useContainersStore, useHealthStore, useOperationsStore } from '../store';
import StatusBadge from '../components/ui/StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import type { AppStatus } from '../types';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: typeof Box;
  color: string;
  bgColor: string;
  borderColor: string;
  linkTo?: string;
  sub?: string;
  delay?: number;
}

function StatCard({ label, value, icon: Icon, color, bgColor, borderColor, linkTo, sub, delay = 0 }: StatCardProps) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, y: -3 }}
      className={`relative p-5 rounded-2xl border ${borderColor} bg-[var(--bg-card)] overflow-hidden cursor-pointer group transition-shadow hover:shadow-xl`}
    >
      <div className={`absolute inset-0 opacity-[0.04] ${bgColor} transition-opacity group-hover:opacity-[0.07]`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl border ${borderColor} ${bgColor} bg-opacity-20`}>
            <Icon size={20} className={color} />
          </div>
          <ArrowRight size={14} className={`${color} opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 duration-200`} />
        </div>
        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        {sub && <p className="text-xs text-[var(--text-muted)] mt-1">{sub}</p>}
      </div>
    </motion.div>
  );

  return linkTo ? <Link to={linkTo}>{inner}</Link> : inner;
}

export default function Dashboard() {
  const { apps } = useAppsStore();
  const { containers } = useContainersStore();
  const { health } = useHealthStore();
  const { operations } = useOperationsStore();

  const runningApps = apps.filter(a => a.status === 'running').length;
  const runningContainers = containers.filter(c => c.State === 'running').length;
  const activeOps = Object.values(operations).filter(o => o.status === 'running').length;
  const failedApps = apps.filter(a => a.status === 'failed').length;

  const recentApps = [...apps]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const statusCounts = apps.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Dashboard"
        subtitle={`${apps.length} app${apps.length !== 1 ? 's' : ''} · ${runningApps} running`}
      />

      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Welcome banner if no apps */}
        {apps.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-900 p-8"
          >
            <div className="absolute inset-0 bg-radial-cyan opacity-50" />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <Rocket size={32} className="text-cyan-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">Welcome to DeployCrane</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
                  Deploy containerized applications from Git repositories. Start by creating your first app.
                </p>
              </div>
              <Link
                to="/apps"
                className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-white text-sm font-semibold hover:from-cyan-400 hover:to-sky-400 transition-all shadow-lg shadow-cyan-500/25 w-full sm:w-auto justify-center sm:justify-star"
              >
                <Box size={16} />
                Deploy First App
              </Link>
            </div>
          </motion.div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Apps"
            value={apps.length}
            icon={Box}
            color="text-cyan-400"
            bgColor="bg-cyan-500"
            borderColor="border-cyan-500/20"
            linkTo="/apps"
            sub={`${runningApps} running`}
            delay={0.05}
          />
          <StatCard
            label="Containers"
            value={containers.length}
            icon={Container}
            color="text-sky-400"
            bgColor="bg-sky-500"
            borderColor="border-sky-500/20"
            linkTo="/containers"
            sub={`${runningContainers} active`}
            delay={0.1}
          />
          <StatCard
            label="System Health"
            value={!health ? '—' : health.status === 'healthy' ? '100%' : 'Degraded'}
            icon={HeartPulse}
            color={!health ? 'text-slate-400' : health.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}
            bgColor={!health ? 'bg-slate-500' : health.status === 'healthy' ? 'bg-emerald-500' : 'bg-red-500'}
            borderColor={!health ? 'border-slate-700' : health.status === 'healthy' ? 'border-emerald-500/20' : 'border-red-500/20'}
            linkTo="/health"
            delay={0.15}
          />
          <StatCard
            label="Active Ops"
            value={activeOps}
            icon={Activity}
            color={activeOps > 0 ? 'text-amber-400' : 'text-slate-400'}
            bgColor={activeOps > 0 ? 'bg-amber-500' : 'bg-slate-500'}
            borderColor={activeOps > 0 ? 'border-amber-500/20' : 'border-slate-700'}
            linkTo="/activity"
            sub={activeOps > 0 ? 'In progress' : 'Idle'}
            delay={0.2}
          />
        </div>

        {/* Alerts */}
        {failedApps > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300"
          >
            <AlertTriangle size={16} className="flex-shrink-0 text-red-400 animate-pulse" />
            <p className="text-sm">
              <strong>{failedApps}</strong> app{failedApps > 1 ? 's' : ''} in failed state.{' '}
              <Link to="/apps" className="underline hover:text-red-200 transition-colors">View apps →</Link>
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Apps */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                <TrendingUp size={14} className="text-cyan-400" />
                Recent Apps
              </h2>
              <Link to="/apps" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {recentApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-[var(--border-color)] text-[var(--text-muted)]">
                <Box size={32} className="mb-3 opacity-20" />
                <p className="text-sm">No apps yet</p>
                <Link to="/apps" className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  Deploy your first app →
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentApps.map((app, i) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.06 }}
                  >
                    <Link to="/apps">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:border-cyan-500/30 hover:bg-[var(--bg-card-hover)] transition-all group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            app.status === 'running' ? 'bg-emerald-400 animate-pulse' :
                            app.status === 'failed' ? 'bg-red-400' :
                            ['building', 'cloning', 'starting'].includes(app.status) ? 'bg-amber-400 animate-ping' :
                            'bg-slate-500'
                          }`} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-cyan-400 transition-colors">
                              {app.name}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <GitBranch size={9} className="text-[var(--text-muted)]" />
                              <p className="text-xs text-[var(--text-muted)] truncate max-w-[200px]">
                                {app.repo_url.replace(/^https?:\/\//, '')}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <StatusBadge status={app.status} size="sm" />
                          <span className="text-xs text-[var(--text-muted)] hidden sm:block">
                            {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                          </span>
                          <ArrowRight size={12} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {/* Status breakdown */}
            <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 mb-4">
                <Zap size={14} className="text-cyan-400" />
                Status Overview
              </h3>
              {Object.keys(statusCounts).length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] text-center py-4">No apps yet</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-3">
                      <div className="w-24 flex-shrink-0">
                        <StatusBadge status={status as AppStatus} size="sm" />
                      </div>
                      <div className="flex-1 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / apps.length) * 100}%` }}
                          transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-xs text-[var(--text-muted)] w-4 text-right flex-shrink-0">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Health checks */}
            <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 mb-4">
                <HeartPulse size={14} className="text-cyan-400" />
                Health Checks
              </h3>
              {!health ? (
                <div className="flex items-center justify-center py-6 text-[var(--text-muted)]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-[var(--border-color)] border-t-cyan-400 rounded-full animate-spin" />
                    <span className="text-xs">Connecting...</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {health.checks.map((check) => (
                    <div key={check.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${check.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                        <span className="text-sm text-[var(--text-primary)] capitalize">{check.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-semibold ${check.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {check.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] font-mono">{check.duration.toFixed(1)}ms</span>
                      </div>
                    </div>
                  ))}
                  <Link
                    to="/health"
                    className="block mt-2 text-xs text-center text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Full report →
                  </Link>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 mb-4">
                <Rocket size={14} className="text-cyan-400" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  to="/apps"
                  className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-color)] hover:border-cyan-500/30 hover:bg-[var(--bg-card-hover)] transition-all group text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <span className="flex items-center gap-2">
                    <Box size={14} className="text-cyan-400" />
                    Deploy new app
                  </span>
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                </Link>
                <Link
                  to="/containers"
                  className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-color)] hover:border-cyan-500/30 hover:bg-[var(--bg-card-hover)] transition-all group text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <span className="flex items-center gap-2">
                    <Container size={14} className="text-sky-400" />
                    Manage containers
                  </span>
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-color)] hover:border-cyan-500/30 hover:bg-[var(--bg-card-hover)] transition-all group text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <span className="flex items-center gap-2">
                    <HeartPulse size={14} className="text-emerald-400" />
                    Configure API endpoint
                  </span>
                  <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

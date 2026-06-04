import { motion } from 'framer-motion';
import { HeartPulse, RefreshCw, CheckCircle2, XCircle, Clock, Activity } from 'lucide-react';
import { format } from 'date-fns';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import { useHealthStore } from '../store';
import { useHealth } from '../hooks/useHealth';

export default function Health() {
  const { health, loading, lastChecked } = useHealthStore();
  const { refresh } = useHealth();

  const isHealthy = health?.status === 'healthy';

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="System Health"
        subtitle="Real-time health status of all system components"
      />

      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        {/* Overall status banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden p-6 rounded-2xl border ${
            !health ? 'border-slate-700 bg-slate-900' :
            isHealthy
              ? 'border-emerald-700/50 bg-emerald-950/50'
              : 'border-red-700/50 bg-red-950/50'
          }`}
        >
          {/* Background glow */}
          {health && (
            <div className={`absolute inset-0 opacity-5 ${isHealthy ? 'bg-emerald-400' : 'bg-red-400'}`} />
          )}

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                animate={isHealthy ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`p-4 rounded-2xl border ${
                  !health ? 'border-slate-700 bg-slate-800' :
                  isHealthy
                    ? 'border-emerald-600/50 bg-emerald-900/50'
                    : 'border-red-600/50 bg-red-900/50'
                }`}
              >
                {!health ? (
                  <HeartPulse size={28} className="text-slate-500" />
                ) : isHealthy ? (
                  <CheckCircle2 size={28} className="text-emerald-400" />
                ) : (
                  <XCircle size={28} className="text-red-400" />
                )}
              </motion.div>
              <div>
                <h2 className={`text-2xl font-bold ${
                  !health ? 'text-slate-400' :
                  isHealthy ? 'text-emerald-300' : 'text-red-300'
                }`}>
                  {!health ? 'Connecting...' : isHealthy ? 'All Systems Operational' : 'System Degraded'}
                </h2>
                <p className={`text-sm mt-0.5 ${
                  !health ? 'text-slate-500' :
                  isHealthy ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {!health ? 'Checking system status...' :
                   isHealthy
                    ? `All ${health.checks.length} checks passing`
                    : `${health.checks.filter(c => c.status === 'unhealthy').length} check(s) failing`
                  }
                </p>
                {lastChecked && (
                  <p className="text-xs text-[var(--text-muted)] mt-1.5 flex items-center gap-1">
                    <Clock size={11} />
                    Last checked {format(new Date(lastChecked), 'HH:mm:ss')}
                  </p>
                )}
              </div>
            </div>

            <div className="self-start sm:self-auto">
            <Button
              variant="secondary"
              icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
              loading={loading}
              onClick={refresh}
            >
              Refresh
            </Button>
            </div>
          </div>
        </motion.div>

        {/* Individual checks */}
        {health && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
              <Activity size={14} className="text-cyan-400" />
              Health Checks
            </h3>
            {health.checks.map((check, i) => (
              <motion.div
                key={check.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`p-5 rounded-2xl border bg-[var(--bg-card)] ${
                  check.status === 'healthy'
                    ? 'border-emerald-800/40'
                    : 'border-red-800/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      check.status === 'healthy'
                        ? 'bg-emerald-950 border-emerald-800 text-emerald-400'
                        : 'bg-red-950 border-red-800 text-red-400'
                    }`}>
                      {check.status === 'healthy'
                        ? <CheckCircle2 size={18} />
                        : <XCircle size={18} />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)] capitalize">{check.name}</p>
                      {check.error && (
                        <p className="text-xs text-red-400 mt-0.5">{check.error}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                      check.status === 'healthy'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}>
                      {check.status}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <Clock size={10} />
                      <span>{check.duration.toFixed(2)}ms</span>
                    </div>
                  </div>
                </div>

                {/* Duration bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mb-1">
                    <span>Response time</span>
                    <span>{check.duration.toFixed(2)}ms</span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${check.status === 'healthy' ? 'bg-emerald-400' : 'bg-red-400'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((check.duration / 100) * 100, 100)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 + 0.3 }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!health && !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
            <HeartPulse size={40} className="mb-4 opacity-20" />
            <p className="text-sm">Could not connect to the API server</p>
            <p className="text-xs mt-1">Check your API configuration in Settings</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={refresh} icon={<RefreshCw size={13} />}>
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

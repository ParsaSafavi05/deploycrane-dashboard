import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Terminal, CheckCircle2, XCircle, Loader2, Trash2, Clock } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import LogTerminal from '../components/ui/LogTerminal';
import { useOperationsStore, useAppsStore } from '../store';
import { useState } from 'react';
import type { ActiveOperation } from '../types';

function OperationCard({ op }: { op: ActiveOperation }) {
  const { apps } = useAppsStore();
  const { clearOperation } = useOperationsStore();
  const [showLogs, setShowLogs] = useState(op.status === 'running');

  const app = apps.find(a => a.id === op.appId);
  const appName = app?.name ?? op.appId.slice(0, 8);

  const iconColor = op.status === 'running' ? 'text-cyan-400' :
                    op.status === 'complete' ? 'text-emerald-400' : 'text-red-400';

  const borderColor = op.status === 'running' ? 'border-cyan-500/30' :
                      op.status === 'complete' ? 'border-emerald-500/20' : 'border-red-500/20';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className={`rounded-2xl border bg-[var(--bg-card)] overflow-hidden ${borderColor}`}
    >
      {op.status === 'running' && (
        <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 progress-shimmer" />
      )}

      <div className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              op.status === 'running' ? 'bg-cyan-500/10 border-cyan-500/30' :
              op.status === 'complete' ? 'bg-emerald-500/10 border-emerald-500/30' :
              'bg-red-500/10 border-red-500/30'
            }`}>
              {op.status === 'running' ? (
                <Loader2 size={18} className={`${iconColor} animate-spin`} />
              ) : op.status === 'complete' ? (
                <CheckCircle2 size={18} className={iconColor} />
              ) : (
                <XCircle size={18} className={iconColor} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                  op.status === 'running' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' :
                  op.status === 'complete' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  'bg-red-500/10 border-red-500/30 text-red-400'
                }`}>
                  {op.type}
                </span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{appName}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  op.status === 'running' ? 'bg-cyan-950 text-cyan-400' :
                  op.status === 'complete' ? 'bg-emerald-950 text-emerald-400' :
                  'bg-red-950 text-red-400'
                }`}>
                  {op.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--text-muted)]">
                <Clock size={10} />
                <span>{formatDistanceToNow(new Date(op.startedAt), { addSuffix: true })}</span>
                <span>·</span>
                <span>{format(new Date(op.startedAt), 'HH:mm:ss')}</span>
                <span>·</span>
                <span>{op.logs.length} log line{op.logs.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setShowLogs(s => !s)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors border border-transparent hover:border-[var(--border-color)]"
            >
              <Terminal size={12} />
              {showLogs ? 'Hide' : 'Logs'}
            </button>
            {op.status !== 'running' && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                icon={<Trash2 size={12} />}
                onClick={() => clearOperation(op.appId)}
                className="text-[var(--text-muted)]"
              />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showLogs && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t border-[var(--border-color)] px-5 pb-5 pt-4">
              <LogTerminal
                logs={op.logs}
                status={op.status === 'running' ? 'running' : op.status === 'complete' ? 'complete' : 'error'}
                title={`${op.type}:${appName}`}
                height="h-56"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ActivityPage() {
  const { operations, clearAll } = useOperationsStore();
  const ops = Object.values(operations);
  const running = ops.filter(o => o.status === 'running');
  const finished = ops.filter(o => o.status !== 'running');

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Activity"
        subtitle={`${running.length} active · ${finished.length} completed`}
      />

      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {ops.length > 0 && (
          <div className="flex justify-end animate-fade-in">
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 size={12} />}
              onClick={clearAll}
              className="text-[var(--text-muted)]"
            >
              Clear all
            </Button>
          </div>
        )}

        {ops.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-[var(--text-muted)]"
          >
            <Activity size={48} className="mb-4 opacity-10" />
            <p className="text-base font-medium">No activity yet</p>
            <p className="text-sm mt-1">Operation logs will appear here when you deploy, build, or clone apps</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Active operations */}
            {running.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Active Operations ({running.length})
                </h3>
                <AnimatePresence mode="popLayout">
                  {running.map(op => <OperationCard key={`${op.appId}-${op.type}`} op={op} />)}
                </AnimatePresence>
              </div>
            )}

            {/* Finished operations */}
            {finished.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  Recent Operations ({finished.length})
                </h3>
                <AnimatePresence mode="popLayout">
                  {finished.map(op => <OperationCard key={`${op.appId}-${op.type}`} op={op} />)}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

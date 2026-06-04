import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, RefreshCw, Play, Square, Trash2, Hammer, Copy,
  ExternalLink, Cpu, GitBranch, Terminal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import LogTerminal from '../components/ui/LogTerminal';
import { useApps } from '../hooks/useApps';
import { useOperationsStore } from '../store';

const PIPELINE_STEPS = [
  { label: 'Created', status: 'created' },
  { label: 'Clone', status: 'cloned' },
  { label: 'Build', status: 'built' },
  { label: 'Running', status: 'running' },
];

function pipelineProgress(status: string): number {
  const map: Record<string, number> = {
    created: 0, cloning: 1, cloned: 1, building: 2, built: 2,
    starting: 3, running: 3, stopped: 2, failed: 0,
  };
  return map[status] ?? 0;
}

export default function AppDetails() {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { apps, loading, load, clone, build, start, deploy, stop, remove } = useApps();
  const operations = useOperationsStore(state => state.operations);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const app = useMemo(() => apps.find(a => a.id === appId), [apps, appId]);
  const op = appId ? operations[appId] : undefined;
  const hasActiveOp = !!op && op.status === 'running';
  const isActive = app && (['cloning', 'building', 'starting'].includes(app.status) || hasActiveOp);
  const progress = app ? pipelineProgress(app.status) : 0;

  const canClone = app && ['created', 'cloned', 'built', 'stopped', 'failed'].includes(app.status) && !hasActiveOp;
  const canBuild = app && ['cloned', 'built', 'stopped', 'failed'].includes(app.status) && !hasActiveOp;
  const canStart = app && ['built', 'stopped', 'failed'].includes(app.status) && !hasActiveOp;
  const canStop = app && app.status === 'running' && !hasActiveOp;
  const canDeploy = app && !['running', 'starting', 'building', 'cloning'].includes(app.status) && !hasActiveOp;

  if (loading && !app) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
            <RefreshCw size={24} className="animate-spin text-cyan-400" />
            <span className="text-sm">Loading app...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex-1 overflow-auto">
        <Header title="App not found" />
        <div className="p-6 max-w-5xl mx-auto">
          <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
            <p className="text-base font-medium mb-2">This app does not exist or was deleted</p>
            <Link to="/apps" className="text-sm text-cyan-400 hover:text-cyan-300">
              ← Back to all apps
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {isActive && (
        <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 progress-shimmer" />
      )}

      <Header
        title={app.name}
        subtitle={`Created ${formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}`}
      />

      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={14} />}
            onClick={() => navigate('/apps')}
          >
            Back to apps
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw size={13} className={loading ? 'animate-spin' : ''} />}
              onClick={load}
            >
              Refresh
            </Button>

            {canDeploy && (
              <Button
                variant="primary"
                size="sm"
                icon={<Play size={14} />}
                loading={hasActiveOp && op?.type === 'deploy'}
                onClick={() => deploy(app.id)}
              >
                Full Deploy
              </Button>
            )}

            {canStop && (
              <Button
                variant="danger"
                size="sm"
                icon={<Square size={14} />}
                onClick={() => stop(app.id)}
              >
                Stop
              </Button>
            )}

            {canStart && (
              <Button
                variant="outline"
                size="sm"
                icon={<Play size={14} />}
                loading={hasActiveOp && op?.type === 'start'}
                onClick={() => start(app.id)}
              >
                Start
              </Button>
            )}
          </div>
        </div>

        {/* Status header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-2xl border bg-[var(--bg-card)] flex items-center gap-4
            ${isActive ? 'border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.08)]' : 'border-[var(--border-color)]'}`}
        >
          <div className={`mt-0.5 p-3.5 rounded-xl flex-shrink-0 ${
            app.status === 'running' ? 'bg-emerald-500/15 border border-emerald-500/25' :
            app.status === 'failed' ? 'bg-red-500/15 border border-red-500/25' :
            'bg-cyan-500/10 border border-cyan-500/20'
          }`}>
            <Cpu size={20} className={
              app.status === 'running' ? 'text-emerald-400' :
              app.status === 'failed' ? 'text-red-400' :
              'text-cyan-400'
            } />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="font-semibold text-xl text-[var(--text-primary)]">{app.name}</h2>
              <StatusBadge status={app.status} size="md" />
            </div>
            <a
              href={app.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 mt-1 text-sm text-[var(--text-muted)] hover:text-cyan-400 transition-colors"
            >
              <GitBranch size={12} />
              {app.repo_url.replace(/^https?:\/\//, '')}
              <ExternalLink size={10} />
            </a>
          </div>
        </motion.div>

        {/* Deployment Pipeline */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">Deployment Progress</h3>
        <div className="flex items-center gap-0 overflow-x-auto pb-2 scrollbar-none">
            {PIPELINE_STEPS.map((step, i) => {
              const active = progress === i;
              const complete = progress > i;
              return (
                <div key={step.status} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all
                      ${complete ? 'bg-cyan-500 border-cyan-400 text-white' :
                        active ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 animate-pulse' :
                        'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)]'}`}
                    >
                      {complete ? '✓' : i + 1}
                    </div>
                    <span className={`text-[11px] mt-1 font-medium whitespace-nowrap ${
                      complete || active ? 'text-cyan-400' : 'text-[var(--text-muted)]'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 mb-4 rounded transition-all
                      ${complete ? 'bg-cyan-500' : 'bg-[var(--border-color)]'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions toolbar */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Copy size={12} />}
            loading={hasActiveOp && op?.type === 'clone'}
            onClick={() => clone(app.id)}
            disabled={!canClone}
          >
            Clone
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Hammer size={12} />}
            loading={hasActiveOp && op?.type === 'build'}
            onClick={() => build(app.id)}
            disabled={!canBuild}
          >
            Build
          </Button>

          {app.host_port > 0 && app.status === 'running' && (
            <Button
              variant="secondary"
              size="sm"
              icon={<ExternalLink size={12} />}
              onClick={() => window.open(`http://localhost:${app.host_port}`, '_blank')}
            >
              Open App
            </Button>
          )}

          <div className="ml-auto">
            {!confirmDelete ? (
              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 size={12} />}
                className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                onClick={() => setConfirmDelete(true)}
              >
                Delete App
              </Button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-red-400">Confirm delete?</span>
                <Button variant="danger" size="sm" onClick={() => remove(app.id)}>Yes</Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>No</Button>
              </div>
            )}
          </div>
        </div>

        {/* App Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-medium text-[var(--text-secondary)]">App Information</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">App ID</span>
                <span className="font-mono text-[var(--text-secondary)]">{app.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Created</span>
                <span className="text-[var(--text-secondary)]">{formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Clone Path</span>
                <span className="font-mono text-[var(--text-secondary)]">{app.clone_path || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-medium text-[var(--text-secondary)]">Network</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Container Port</span>
                <span className="font-mono text-[var(--text-secondary)]">{app.container_port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Host Port</span>
                <span className="font-mono text-[var(--text-secondary)]">{app.host_port || 'Auto'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Container ID</span>
                <span className="font-mono text-[var(--text-secondary)]">{app.container_id ? app.container_id.slice(0, 16) : 'Not created'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Operation Logs */}
        <AnimatePresence mode="popLayout">
          {op && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 10 }}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Terminal size={12} className="text-cyan-400" />
                  <span className="text-xs font-medium text-[var(--text-secondary)] capitalize">{op.type} operation logs</span>
                </div>
                <LogTerminal
                  logs={op.logs}
                  status={op.status}
                  title={`${op.type}:${app.name}`}
                  height="h-64"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
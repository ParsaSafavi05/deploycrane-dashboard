import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch, Server, Play, Square, Trash2, Hammer,
  Copy, ChevronDown, ExternalLink, Cpu, Clock, Terminal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import LogTerminal from '../ui/LogTerminal';
import type { App } from '../../types';
import { useApps } from '../../hooks/useApps';
import { useOperationsStore } from '../../store';
import { Link } from "react-router-dom";

interface AppCardProps {
  app: App;
  onSelect?: (id: string) => void;
}

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

export default function AppCard({ app, onSelect }: AppCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { clone, build, start, deploy, stop, remove } = useApps();
  const { operations } = useOperationsStore();
  const op = operations[app.id];

  const progress = pipelineProgress(app.status);
  const isActive = ['cloning', 'building', 'starting'].includes(app.status);
  const hasOp = !!op && op.status === 'running';

  const copyId = () => {
    navigator.clipboard.writeText(app.id);
  };

  const canClone = ['created', 'cloned', 'built', 'stopped', 'failed'].includes(app.status);
  const canBuild = ['cloned', 'built', 'stopped', 'failed'].includes(app.status);
  const canStart = ['built', 'stopped', 'failed'].includes(app.status);
  const canStop = app.status === 'running';
  const canDeploy = !['running', 'starting', 'building', 'cloning'].includes(app.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border bg-[var(--bg-card)] overflow-hidden card-hover transition-all
        ${isActive || hasOp ? 'border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.08)]' : 'border-[var(--border-color)]'}`}
    >
      {/* Top strip - active indicator */}
      {(isActive || hasOp) && (
        <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 progress-shimmer" />
      )}

      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`mt-0.5 p-2.5 rounded-xl flex-shrink-0 ${
              app.status === 'running' ? 'bg-emerald-500/15 border border-emerald-500/25' :
              app.status === 'failed' ? 'bg-red-500/15 border border-red-500/25' :
              'bg-cyan-500/10 border border-cyan-500/20'
            }`}>
              <Cpu size={16} className={
                app.status === 'running' ? 'text-emerald-400' :
                app.status === 'failed' ? 'text-red-400' :
                'text-cyan-400'
              } />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to={`/apps/${app.id}`}
                  className="font-semibold text-[var(--text-primary)] truncate max-w-[200px] cursor-pointer hover:text-cyan-400 transition-colors"
                  title={app.name}
                >
                  {app.name}
                </Link>
                <StatusBadge status={app.status} />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <GitBranch size={11} className="text-[var(--text-muted)] flex-shrink-0" />
                <a
                  href={app.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--text-muted)] hover:text-cyan-400 truncate max-w-[220px] transition-colors"
                  title={app.repo_url}
                >
                  {app.repo_url.replace(/^https?:\/\//, '')}
                </a>
                <ExternalLink size={10} className="text-[var(--text-muted)] flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {canDeploy && (
              <Button
                variant="primary"
                size="sm"
                icon={<Play size={12} />}
                loading={hasOp && op?.type === 'deploy'}
                onClick={() => deploy(app.id)}
                title="Full deploy (clone → build → start)"
              >
                Deploy
              </Button>
            )}
            {canStop && (
              <Button variant="danger" size="sm" icon={<Square size={12} />} onClick={() => stop(app.id)}>
                Stop
              </Button>
            )}
            {canStart && !canStop && (
              <Button
                variant="outline"
                size="sm"
                icon={<Play size={12} />}
                loading={hasOp && op?.type === 'start'}
                onClick={() => start(app.id)}
              >
                Start
              </Button>
            )}
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors"
            >
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={16} />
              </motion.div>
            </button>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-4 mt-3 text-xs text-[var(--text-muted)]">
          {app.host_port > 0 && (
            <div className="flex items-center gap-1.5">
              <Server size={11} />
              <span>:{app.host_port} → :{app.container_port}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock size={11} />
            <span>{formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}</span>
          </div>
          <button
            onClick={copyId}
            className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
            title="Copy App ID"
          >
            <Copy size={11} />
            <span className="font-mono">{app.id.slice(0, 8)}…</span>
          </button>
        </div>

        {/* Pipeline progress */}
        <div className="mt-4">
          <div className="flex items-center gap-0">
            {PIPELINE_STEPS.map((step, i) => {
              const active = progress === i;
              const complete = progress > i;
              return (
                <div key={step.status} className="flex items-center flex-1 last:flex-none">
                  <div className={`flex flex-col items-center`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all
                      ${complete ? 'bg-cyan-500 border-cyan-400 text-white' :
                        active ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 animate-pulse' :
                        'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)]'}`}
                    >
                      {complete ? '✓' : i + 1}
                    </div>
                    <span className={`text-[9px] mt-0.5 font-medium whitespace-nowrap ${
                      complete || active ? 'text-cyan-400' : 'text-[var(--text-muted)]'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-3.5 rounded transition-all
                      ${complete ? 'bg-cyan-500' : 'bg-[var(--border-color)]'}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Expanded section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="border-t border-[var(--border-color)] p-5 space-y-4">
              {/* More actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Copy size={12} />}
                  loading={hasOp && op?.type === 'clone'}
                  onClick={() => clone(app.id)}
                  disabled={!canClone}
                >
                  Clone
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Hammer size={12} />}
                  loading={hasOp && op?.type === 'build'}
                  onClick={() => build(app.id)}
                  disabled={!canBuild}
                >
                  Build
                </Button>
                {app.container_id && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] font-mono">
                    <Terminal size={11} />
                    <span>{app.container_id.slice(0, 12)}</span>
                  </div>
                )}
                <div className="ml-auto">
                  {!confirmDelete ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={12} />}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950"
                      onClick={() => setConfirmDelete(true)}
                    >
                      Delete
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-400">Confirm delete?</span>
                      <Button variant="danger" size="sm" onClick={() => remove(app.id)}>Yes</Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>No</Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <p className="text-[var(--text-muted)]">App ID</p>
                  <p className="font-mono text-[var(--text-secondary)] truncate" title={app.id}>{app.id}</p>
                </div>
                {app.clone_path && (
                  <div className="space-y-1">
                    <p className="text-[var(--text-muted)]">Clone Path</p>
                    <p className="font-mono text-[var(--text-secondary)] truncate" title={app.clone_path}>{app.clone_path}</p>
                  </div>
                )}
              </div>

              {/* Operation logs */}
              {op && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal size={12} className="text-cyan-400" />
                    <span className="text-xs font-medium text-[var(--text-secondary)] capitalize">{op.type} logs</span>
                  </div>
                  <LogTerminal
                    logs={op.logs}
                    status={op.status === 'running' ? 'running' : op.status === 'complete' ? 'complete' : 'error'}
                    title={`${op.type}:${app.name}`}
                    height="h-48"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

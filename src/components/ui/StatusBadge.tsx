import type { AppStatus } from '../../types';

interface StatusBadgeProps {
  status: AppStatus | string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dotColor: string; glow?: boolean; spin?: boolean }> = {
  created:  { label: 'Created',  color: 'bg-slate-800 text-slate-300 border-slate-700',   dotColor: 'bg-slate-400' },
  cloning:  { label: 'Cloning',  color: 'bg-blue-950 text-blue-300 border-blue-800',       dotColor: 'bg-blue-400',  spin: true },
  cloned:   { label: 'Cloned',   color: 'bg-sky-950 text-sky-300 border-sky-800',         dotColor: 'bg-sky-400' },
  building: { label: 'Building', color: 'bg-amber-950 text-amber-300 border-amber-800',    dotColor: 'bg-amber-400', spin: true },
  built:    { label: 'Built',    color: 'bg-violet-950 text-violet-300 border-violet-800', dotColor: 'bg-violet-400' },
  starting: { label: 'Starting', color: 'bg-cyan-950 text-cyan-300 border-cyan-800',       dotColor: 'bg-cyan-400',  spin: true },
  running:  { label: 'Running',  color: 'bg-emerald-950 text-emerald-300 border-emerald-800', dotColor: 'bg-emerald-400', glow: true },
  stopped:  { label: 'Stopped',  color: 'bg-zinc-900 text-zinc-400 border-zinc-700',       dotColor: 'bg-zinc-500' },
  failed:   { label: 'Failed',   color: 'bg-red-950 text-red-300 border-red-800',          dotColor: 'bg-red-500' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'bg-slate-800 text-slate-300 border-slate-700', dotColor: 'bg-slate-400' };
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5 gap-1' : 'text-xs px-2 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold uppercase tracking-wide ${sizeClass} ${cfg.color}`}
    >
      <span
        className={`${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full flex-shrink-0 ${cfg.dotColor} ${
          cfg.glow ? 'animate-pulse-running shadow-[0_0_6px_currentColor]' : ''
        } ${cfg.spin ? 'animate-ping' : ''}`}
      />
      {cfg.label}
    </span>
  );
}

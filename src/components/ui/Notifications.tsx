import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useNotificationStore } from '../../store';
import type { NotificationType } from '../../types';

const ICONS: Record<NotificationType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS: Record<NotificationType, { border: string; icon: string; bg: string }> = {
  success: { border: 'border-emerald-500/40', icon: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  error: { border: 'border-red-500/40', icon: 'text-red-400', bg: 'bg-red-500/10' },
  info: { border: 'border-cyan-500/40', icon: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  warning: { border: 'border-amber-500/40', icon: 'text-amber-400', bg: 'bg-amber-500/10' },
};

function NotifItem({ id, type, title, message, duration = 4000 }: {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}) {
  const { dismiss } = useNotificationStore();
  const Icon = ICONS[type];
  const colors = COLORS[type];

  useEffect(() => {
    const timer = setTimeout(() => dismiss(id), duration);
    return () => clearTimeout(timer);
  }, [id, dismiss, duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`relative flex items-start gap-3 p-4 rounded-xl border ${colors.border} ${colors.bg} 
        bg-[var(--bg-card)] backdrop-blur-md shadow-xl min-w-[280px] max-w-[360px]`}
    >
      <Icon size={18} className={`flex-shrink-0 mt-0.5 ${colors.icon}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">{title}</p>
        {message && (
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">{message}</p>
        )}
      </div>
      <button
        onClick={() => dismiss(id)}
        className="flex-shrink-0 p-0.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
      >
        <X size={14} />
      </button>

      {/* Progress bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-0.5 ${colors.icon.replace('text-', 'bg-')} rounded-b-xl`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}

export default function Notifications() {
  const { notifications } = useNotificationStore();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto">
            <NotifItem {...n} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

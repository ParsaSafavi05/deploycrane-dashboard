import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Copy, Check, Terminal, Wifi, WifiOff } from 'lucide-react';
import type { SSELogLine } from '../../types';

interface LogTerminalProps {
  logs: SSELogLine[];
  status?: 'running' | 'complete' | 'error' | 'idle';
  title?: string;
  height?: string;
  autoScroll?: boolean;
}

function classForEvent(event: string): string {
  switch (event) {
    case 'endpoint': return 'log-event-endpoint';
    case 'progress': return 'log-event-progress';
    case 'complete': return 'log-event-complete';
    case 'error': return 'log-event-error';
    case 'build': return 'log-event-build';
    case 'app': return 'log-event-app';
    default: return 'log-event-default';
  }
}

function prefixForEvent(event: string): string {
  switch (event) {
    case 'endpoint': return '◆ ';
    case 'progress': return '▸ ';
    case 'complete': return '✔ ';
    case 'error': return '✖ ';
    case 'build': return '⚙ ';
    case 'app': return '◉ ';
    default: return '  ';
  }
}

export default function LogTerminal({
  logs,
  status = 'idle',
  title = 'Logs',
  height = 'h-80',
  autoScroll = true,
}: LogTerminalProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  useEffect(() => {
    if (autoScroll && isAtBottom && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, isAtBottom]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setIsAtBottom(atBottom);
  };

  const handleCopy = () => {
    const text = logs.map(l => `[${format(new Date(l.timestamp), 'HH:mm:ss')}] [${l.event}] ${l.data}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`flex flex-col rounded-xl border border-[var(--border-color)] overflow-hidden ${height === 'full' ? 'h-full' : ''}`}>
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          {/* macOS-style dots */}
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-amber-500/70" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <Terminal size={12} className="text-[var(--accent-cyan)]" />
            <span className="text-xs font-mono text-[var(--text-secondary)]">{title}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="flex items-center gap-1.5">
            {status === 'running' ? (
              <>
                <Wifi size={11} className="text-cyan-400 animate-pulse" />
                <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">streaming</span>
              </>
            ) : status === 'complete' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">complete</span>
              </>
            ) : status === 'error' ? (
              <>
                <WifiOff size={11} className="text-red-400" />
                <span className="text-[10px] text-red-400 font-mono uppercase tracking-wider">error</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">idle</span>
              </>
            )}
          </div>
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card)] transition-colors text-xs"
          >
            {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Log content */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={`log-terminal flex-1 overflow-y-auto p-4 ${height !== 'full' ? height : 'flex-1'}`}
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-xs font-mono">
            <span>Waiting for output</span>
            <span className="cursor-blink ml-0.5" />
          </div>
        ) : (
          logs.map((line, i) => (
            <div
              key={line.id}
              className="log-line animate-fade-in"
              style={{ animationDelay: `${Math.min(i * 0.02, 0.3)}s` }}
            >
              <span className="log-timestamp text-[10px] select-none">
                {format(new Date(line.timestamp), 'HH:mm:ss.SSS')}
              </span>
              <span className={`text-[10px] font-mono uppercase tracking-widest opacity-60 ${classForEvent(line.event)} select-none min-w-[60px]`}>
                [{line.event}]
              </span>
              <span className={`text-xs font-mono ${classForEvent(line.event)} break-all whitespace-pre-wrap`}>
                {prefixForEvent(line.event)}{line.data}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Jump to bottom button */}
      {!isAtBottom && logs.length > 0 && (
        <button
          onClick={() => {
            setIsAtBottom(true);
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs hover:bg-cyan-500/30 transition-colors"
        >
          ↓ Latest
        </button>
      )}
    </div>
  );
}

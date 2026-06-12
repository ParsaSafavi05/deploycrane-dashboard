"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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

const BOTTOM_THRESHOLD_PX = 32;

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
  height = 'full',
  autoScroll = true,
}: LogTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [followLogs, setFollowLogs] = useState(autoScroll);

  useEffect(() => {
    setFollowLogs(autoScroll);
  }, [autoScroll]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const el = containerRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior,
    });
  }, []);

  useLayoutEffect(() => {
    if (!followLogs) return;
    scrollToBottom('auto');
  }, [logs, followLogs, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setFollowLogs(distanceFromBottom <= BOTTOM_THRESHOLD_PX);
  }, []);

  const handleCopy = useCallback(async () => {
    const text = logs
      .map((l) => `[${format(new Date(l.timestamp), 'HH:mm:ss')}] [${l.event}] ${l.data}`)
      .join('\n');

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [logs]);

  const outerHeightClass = height === 'full' ? 'h-[600px] max-h-[80vh]' : height;

  return (
    <div className={`relative flex flex-col rounded-xl border border-[var(--border-color)] overflow-hidden ${outerHeightClass}`}>
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
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
        className="log-terminal flex-1 min-h-0 overflow-y-auto p-4"
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
              <span
                className={`text-[10px] font-mono uppercase tracking-widest opacity-60 ${classForEvent(line.event)} select-none min-w-[60px]`}
              >
                [{line.event}]
              </span>
              <span className={`text-xs font-mono ${classForEvent(line.event)} break-all whitespace-pre-wrap`}>
                {prefixForEvent(line.event)}
                {line.data}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Jump to bottom button */}
      {!followLogs && logs.length > 0 && (
        <button
          onClick={() => {
            setFollowLogs(true);
            requestAnimationFrame(() => scrollToBottom('smooth'));
          }}
          className="absolute bottom-4 right-4 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs hover:bg-cyan-500/30 transition-colors"
        >
          ↓ Latest
        </button>
      )}
    </div>
  );
}
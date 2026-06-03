import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, Square, Play, RefreshCw, Search, Plus, ChevronDown, Copy, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useContainers } from '../hooks/useContainers';

function ContainerStateTag({ state }: { state: string }) {
  const colors: Record<string, string> = {
    running: 'text-emerald-400 bg-emerald-950 border-emerald-800',
    exited: 'text-slate-400 bg-slate-900 border-slate-700',
    paused: 'text-amber-400 bg-amber-950 border-amber-800',
    created: 'text-cyan-400 bg-cyan-950 border-cyan-800',
    restarting: 'text-blue-400 bg-blue-950 border-blue-800',
    dead: 'text-red-400 bg-red-950 border-red-800',
  };
  const cls = colors[state?.toLowerCase()] ?? 'text-slate-400 bg-slate-900 border-slate-700';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${state === 'running' ? 'bg-emerald-400 animate-pulse' : 'bg-current opacity-60'}`} />
      {state}
    </span>
  );
}

export default function Containers() {
  const { containers, loading, showAll, setShowAll, load, stopContainer, startContainer } = useContainers();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [startImage, setStartImage] = useState('');
  const [starting, setStarting] = useState(false);

  // NEW: make filtering safe even when a container is missing Id/Names/Image
  const filtered = containers.filter((c) => {
    const q = search.toLowerCase();

    const id = typeof c?.Id === 'string' ? c.Id : '';
    const image = typeof c?.Image === 'string' ? c.Image : '';
    const names = Array.isArray(c?.Names) ? c.Names : [];

    return (
      !q ||
      names.some(n => typeof n === 'string' && n.toLowerCase().includes(q)) ||
      image.toLowerCase().includes(q) ||
      id.toLowerCase().includes(q)
    );
  });

  const handleStart = async () => {
    if (!startImage.trim()) return;
    setStarting(true);
    await startContainer(startImage.trim());
    setStarting(false);
    setShowStartModal(false);
    setStartImage('');
  };

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Containers"
        subtitle={`${containers.length} total · ${containers.filter(c => c.State === 'running').length} running`}
      />

      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap animate-slide-up">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search containers..."
              className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-cyan-500/50 transition-all"
            />
          </div>

          {/* Show all toggle */}
          <button
            onClick={() => setShowAll(!showAll)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
              showAll ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400' : 'border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showAll ? 'bg-cyan-400' : 'bg-slate-500'}`} />
            Show all
          </button>

          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={13} className={loading ? 'animate-spin' : ''} />}
            onClick={load}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setShowStartModal(true)}
          >
            Start Container
          </Button>
        </div>

          {/* Container list */}
          {loading && containers.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
                <RefreshCw size={24} className="animate-spin text-cyan-400" />
                <span className="text-sm">Loading containers...</span>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]">
              <Container size={40} className="mb-4 opacity-20" />
              <p className="text-base font-medium">{search ? 'No matching containers' : 'No containers found'}</p>
              <p className="text-sm mt-1">
                {!showAll && <button onClick={() => setShowAll(true)} className="text-cyan-400">Show stopped containers</button>}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((container, i) => {
                  // NEW: normalize fields so missing Id cannot crash the UI
                  const id = typeof container?.Id === 'string' ? container.Id : '';
                  const name =
                    container?.Names?.[0]?.replace(/^\//, '') ||
                    (id ? id.slice(0, 12) : `container-${i}`); // NEW
                  const isOpen = expanded === id; // NEW
                  const isRunning = container?.State === 'running';

                  return (
                    <motion.div
                      key={id || name || i} // NEW
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden card-hover"
                    >
                      {isRunning && <div className="h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500" />}

                      <div className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-xl flex-shrink-0 ${isRunning ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-800 border border-slate-700'}`}>
                              <Container size={16} className={isRunning ? 'text-emerald-400' : 'text-slate-500'} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-[var(--text-primary)] truncate">{name}</span>
                                <ContainerStateTag state={container?.State ?? 'unknown'} /> {/* NEW */}
                              </div>
                              <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{container?.Image ?? 'unknown image'}</p> {/* NEW */}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            {isRunning && id && ( // NEW
                              <Button
                                variant="danger"
                                size="sm"
                                icon={<Square size={12} />}
                                onClick={() => stopContainer(id)} // NEW
                              >
                                Stop
                              </Button>
                            )}
                            <button
                              onClick={() => setExpanded(isOpen ? null : id)} // NEW
                              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                            >
                              <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                <ChevronDown size={14} />
                              </motion.div>
                            </button>
                          </div>
                        </div>

                        {/* Port mappings */}
                        {container?.Ports?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {container.Ports.filter(p => p.PublicPort).map((port, pi) => (
                              <span key={pi} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-muted)]">
                                {port.IP && port.IP !== '0.0.0.0' ? `${port.IP}:` : ''}{port.PublicPort}→{port.PrivatePort}/{port.Type}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="border-t border-[var(--border-color)] p-4 grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <p className="text-[var(--text-muted)] mb-1">Container ID</p>
                                <button
                                  onClick={() => id && navigator.clipboard.writeText(id)} // NEW
                                  className="flex items-center gap-1.5 font-mono text-[var(--text-secondary)] hover:text-cyan-400 transition-colors"
                                >
                                  <Copy size={10} />
                                  {id ? `${id.slice(0, 20)}…` : 'unknown'} {/* NEW */}
                                </button>
                              </div>
                              <div>
                                <p className="text-[var(--text-muted)] mb-1">Created</p>
                                <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                                  <Clock size={10} />
                                  <span>
                                    {typeof container?.Created === 'number'
                                      ? formatDistanceToNow(new Date(container.Created * 1000), { addSuffix: true })
                                      : 'unknown'} {/* NEW */}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <p className="text-[var(--text-muted)] mb-1">Status</p>
                                <p className="text-[var(--text-secondary)]">{container?.Status ?? 'unknown'}</p> {/* NEW */}
                              </div>
                              <div>
                                <p className="text-[var(--text-muted)] mb-1">Command</p>
                                <p className="font-mono text-[var(--text-secondary)] truncate" title={container?.Command ?? ''}>
                                  {container?.Command ?? '—'} {/* NEW */}
                                </p>
                              </div>
                              {Object.entries(container?.Labels || {}).filter(([k]) => !k.includes('maintainer')).slice(0, 4).map(([k, v]) => (
                                <div key={k}>
                                  <p className="text-[var(--text-muted)] mb-1 truncate">{k}</p>
                                  <p className="text-[var(--text-secondary)] truncate font-mono" title={v}>{v || '—'}</p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
      </div>

      {/* Start container modal */}
      <Modal
        open={showStartModal}
        onClose={() => setShowStartModal(false)}
        title="Start Container"
        subtitle="Specify a Docker image to start"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Docker Image</label>
            <input
              autoFocus
              value={startImage}
              onChange={e => setStartImage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStart()}
              placeholder="e.g. nginx:latest"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-cyan-500/50 transition-all"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowStartModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              icon={<Play size={14} />}
              loading={starting}
              onClick={handleStart}
              disabled={!startImage.trim()}
            >
              Start
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

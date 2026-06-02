import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, RefreshCw, SlidersHorizontal, Box } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import AppCard from '../components/apps/AppCard';
import CreateAppModal from '../components/apps/CreateAppModal';
import { useApps } from '../hooks/useApps';
import type { AppStatus } from '../types';

const STATUS_FILTERS: { label: string; value: AppStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Running', value: 'running' },
  { label: 'Built', value: 'built' },
  { label: 'Stopped', value: 'stopped' },
  { label: 'Failed', value: 'failed' },
  { label: 'Created', value: 'created' },
];

export default function Apps() {
  const { apps, loading, load } = useApps();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppStatus | 'all'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'name'>('newest');

  const filtered = useMemo(() => {
    let list = apps.filter(a => {
      const q = search.toLowerCase();
      return !q || a.name.toLowerCase().includes(q) || a.repo_url.toLowerCase().includes(q);
    });
    if (statusFilter !== 'all') {
      list = list.filter(a => a.status === statusFilter);
    }
    switch (sort) {
      case 'newest': return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest': return [...list].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'name': return [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [apps, search, statusFilter, sort]);

  return (
    <div className="flex-1 overflow-auto">
      <Header
        title="Applications"
        subtitle={`${apps.length} app${apps.length !== 1 ? 's' : ''} · ${filtered.length} shown`}
      />

      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap animate-slide-up">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search apps..."
              className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-cyan-500/50 transition-all"
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5 px-1 py-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
            <SlidersHorizontal size={12} className="text-[var(--text-muted)] ml-2" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as typeof sort)}
              className="bg-transparent text-sm text-[var(--text-secondary)] pr-2 py-1 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name</option>
            </select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={13} className={loading ? 'animate-spin' : ''} />}
            onClick={load}
            loading={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setShowCreate(true)}
          >
            New App
          </Button>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 flex-wrap animate-fade-in">
          {STATUS_FILTERS.map(f => {
            const count = f.value === 'all' ? apps.length : apps.filter(a => a.status === f.value).length;
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5
                  ${statusFilter === f.value
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card)] border border-transparent'
                  }`}
              >
                {f.label}
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    statusFilter === f.value ? 'bg-cyan-500/30 text-cyan-300' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* App list */}
        {loading && apps.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3 text-[var(--text-muted)]">
              <RefreshCw size={24} className="animate-spin text-cyan-400" />
              <span className="text-sm">Loading apps...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)]"
          >
            <Box size={40} className="mb-4 opacity-20" />
            <p className="text-base font-medium mb-1">
              {search || statusFilter !== 'all' ? 'No apps match your filters' : 'No apps yet'}
            </p>
            <p className="text-sm">
              {search || statusFilter !== 'all' ? (
                <button onClick={() => { setSearch(''); setStatusFilter('all'); }} className="text-cyan-400 hover:text-cyan-300">
                  Clear filters
                </button>
              ) : (
                <button onClick={() => setShowCreate(true)} className="text-cyan-400 hover:text-cyan-300">
                  Deploy your first app →
                </button>
              )}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {filtered.map(app => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      <CreateAppModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}

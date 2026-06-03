import { useState } from 'react';
import { Plus, GitBranch, Server, Rocket } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import LogTerminal from '../ui/LogTerminal';
import { useApps } from '../../hooks/useApps';
import { useOperationsStore } from '../../store';

interface CreateAppModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateAppModal({ open, onClose }: CreateAppModalProps) {
  const { create } = useApps();
  const { operations } = useOperationsStore();

  const [form, setForm] = useState({
    name: '',
    repo_url: '',
    container_port: 8080,
    host_port: 0,
    deploy: false,
  });
  const [tempId, setTempId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const op = tempId ? operations[tempId] : null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.repo_url.trim()) errs.repo_url = 'Repository URL is required';
    else if (!form.repo_url.startsWith('http://') && !form.repo_url.startsWith('https://'))
      errs.repo_url = 'URL must start with http:// or https://';
    if (form.container_port <= 0 || form.container_port > 65535)
      errs.container_port = 'Port must be between 1 and 65535';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const { tempId: tid } = create({
      name: form.name.trim(),
      repo_url: form.repo_url.trim(),
      container_port: form.container_port,
      host_port: form.host_port,
      deploy: form.deploy,
    });

    setTempId(tid);

    // Watch for completion
    const poll = setInterval(() => {
      const currentOp = useOperationsStore.getState().operations[tid];
      if (currentOp?.status === 'complete' || currentOp?.status === 'error') {
        setSubmitting(false);
        setDone(true);
        clearInterval(poll);
      }
    }, 300);
  };

  const handleClose = () => {
    setForm({ name: '', repo_url: '', container_port: 8080, host_port: 0, deploy: false });
    setTempId(null);
    setSubmitting(false);
    setDone(false);
    setErrors({});
    onClose();
  };

  const field = (key: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      <input
        {...props}
        className={`w-full bg-[var(--bg-primary)] border rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all
          ${errors[key] ? 'border-red-500/50' : 'border-[var(--border-color)] focus:border-cyan-500/50'}`}
      />
      {errors[key] && <p className="mt-1 text-xs text-red-400">{errors[key]}</p>}
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Deploy New App"
      subtitle="Connect a Git repository and configure your application"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {!tempId ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {field('name', 'App Name', {
              placeholder: 'my-awesome-app',
              value: form.name,
              onChange: (e) => setForm(f => ({ ...f, name: e.target.value })),
              autoFocus: true,
            })}

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <GitBranch size={12} />
                  Repository URL
                </span>
              </label>
              <input
                value={form.repo_url}
                onChange={(e) => setForm(f => ({ ...f, repo_url: e.target.value }))}
                placeholder="https://github.com/user/repo.git"
                className={`w-full bg-[var(--bg-primary)] border rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all
                  ${errors.repo_url ? 'border-red-500/50' : 'border-[var(--border-color)] focus:border-cyan-500/50'}`}
              />
              {errors.repo_url && <p className="mt-1 text-xs text-red-400">{errors.repo_url}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  <span className="flex items-center gap-1.5"><Server size={12} />Container Port</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.container_port}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      container_port: e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className={`w-full bg-[var(--bg-primary)] border rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] transition-all
                    ${errors.container_port ? 'border-red-500/50' : 'border-[var(--border-color)] focus:border-cyan-500/50'}`}
                />
                {errors.container_port && <p className="mt-1 text-xs text-red-400">{errors.container_port}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  <span className="flex items-center gap-1.5"><Server size={12} />Host Port <span className="text-[var(--text-muted)]">(0 = auto)</span></span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.host_port}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      host_port: e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] transition-all focus:border-cyan-500/50"
                />
              </div>
            </div>

            {/* Deploy toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${form.deploy ? 'bg-cyan-500/20' : 'bg-slate-800'}`}>
                  <Rocket size={16} className={form.deploy ? 'text-cyan-400' : 'text-slate-500'} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Auto Deploy</p>
                  <p className="text-xs text-[var(--text-muted)]">Clone, build and start automatically</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, deploy: !f.deploy }))}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                  form.deploy ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    form.deploy ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={handleClose} type="button">Cancel</Button>
              <Button
                variant="primary"
                type="submit"
                loading={submitting}
                icon={<Plus size={14} />}
              >
                {form.deploy ? 'Create & Deploy' : 'Create App'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {done && op?.status === 'complete' ? '✅ App created successfully' :
                   done && op?.status === 'error' ? '❌ Creation failed' :
                   `Creating "${form.name}"...`}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {op?.type === 'create' ? (form.deploy ? 'Cloning → Building → Starting' : 'Registering app') : ''}
                </p>
              </div>
              {done && (
                <Button variant="primary" onClick={handleClose} size="sm">
                  {op?.status === 'complete' ? 'Done' : 'Close'}
                </Button>
              )}
            </div>
            <LogTerminal
              logs={op?.logs ?? []}
              status={op?.status === 'running' ? 'running' : op?.status === 'complete' ? 'complete' : op?.status === 'error' ? 'error' : 'idle'}
              title={`create:${form.name}`}
              height="h-80"
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

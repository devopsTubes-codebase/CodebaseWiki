'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/ui/AppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { GradientButton } from '@/components/ui/GradientButton';
import { cn } from '@/components/ui/cn';
import {
  generationProgress,
  importMethods,
  type DashboardProject,
  type GenerationProgress,
  type ImportMethod,
  type ProjectStatus,
} from './dashboardData';
import { classifyProjectsResponse } from './dashboardAuthView';
import { deriveGenerationView, type UiJobLog } from './jobLogView';

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="9" cy="9" r="5.5" />
      <path d="m13.5 13.5 3 3" strokeLinecap="round" />
    </svg>
  );
}

type ImportSource = ImportMethod['id'];

function deriveProjectNameFromRepositoryUrl(repositoryUrl: string): string {
  const trimmed = repositoryUrl.trim().replace(/\/+$/, '').replace(/\.git$/, '');
  return trimmed.split('/').filter(Boolean).at(-1) || 'GitHub Project';
}

function ImportProjectDashboard({ source }: { source: ImportSource }) {
  const router = useRouter();
  const selectedMethod = importMethods.find((method) => method.id === source) ?? importMethods[1];
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [providedPAT, setProvidedPAT] = useState('');
  const [zipFileName, setZipFileName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const isZip = source === 'zip-file';
  const isGitHubActions = source === 'github-actions';

  async function submitImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    setError('');

    if (isZip) {
      setError('ZIP upload UI is visible, but the production ZIP upload endpoint is not wired yet. Use Git URL for this deploy smoke test.');
      return;
    }

    const sourceInput = repositoryUrl.trim();
    if (!sourceInput) {
      setError('Paste a repository URL first.');
      return;
    }
    const derivedName = deriveProjectNameFromRepositoryUrl(sourceInput);

    submittingRef.current = true;
    setSubmitting(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: derivedName,
          sourceType: 'github',
          sourceInput,
        }),
      });

      if (response.status === 401) {
        router.push('/auth/sign-in?callbackUrl=/dashboard');
        return;
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
        const code = payload?.error?.code ?? `HTTP_${response.status}`;
        const message = payload?.error?.message ?? 'Could not create project from this repository.';
        throw new Error(`${code}: ${message}`);
      }

      const payload = (await response.json()) as { data: { id: string } };
      const trimmedPAT = providedPAT.trim();
      if (trimmedPAT) {
        window.sessionStorage.setItem(`codebase-wiki:providedPAT:${payload.data.id}`, trimmedPAT);
      }
      router.push(`/dashboard/generating?projectId=${encodeURIComponent(payload.data.id)}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not start import.');
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <section className="min-h-[calc(100vh-64px)] px-6 py-24">
        <GlassCard className="mx-auto max-w-3xl p-8 md:p-12" insetGlow>
          <button type="button" onClick={() => router.push('/dashboard')} className="text-sm font-semibold text-slate-400 transition hover:text-white">
            ← Choose another method
          </button>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-violet-200">{selectedMethod.title}</p>
          <h1 className="mt-3 text-[40px] font-bold tracking-[-0.04em] text-white">Import project</h1>
          <p className="mt-3 text-base leading-7 text-[#a1a1aa]">
            {isGitHubActions
              ? 'Start with a repository URL now; GitHub Actions automation can be connected after the project exists.'
              : selectedMethod.description}
          </p>

          <form onSubmit={submitImport} className="mt-8 space-y-5">
            {isZip ? (
              <label className="block">
                <span className="text-sm font-semibold text-slate-200">ZIP file</span>
                <input
                  type="file"
                  accept=".zip,application/zip"
                  onChange={(event) => setZipFileName(event.target.files?.[0]?.name ?? '')}
                  className="mt-2 block w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-500/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-100"
                />
                {zipFileName ? <p className="mt-2 text-xs text-slate-500">Selected: {zipFileName}</p> : null}
              </label>
            ) : (
              <>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-200">Repository URL</span>
                  <input
                    value={repositoryUrl}
                    onChange={(event) => setRepositoryUrl(event.target.value)}
                    placeholder="https://github.com/owner/repository"
                    className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 font-mono text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-300/60"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Project name will be inferred as: {repositoryUrl.trim() ? deriveProjectNameFromRepositoryUrl(repositoryUrl) : 'repository-name'}
                  </p>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-200">GitHub Personal Access Token</span>
                  <input
                    value={providedPAT}
                    onChange={(event) => setProvidedPAT(event.target.value)}
                    type="text"
                    name="github-access-token"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Optional for private repositories"
                    className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 font-mono text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-300/60"
                  />
                  <p className="mt-2 text-xs text-slate-500">Stored only in this browser session long enough to start the clone job.</p>
                </label>
              </>
            )}

            {error ? <p className="rounded-xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

            <GradientButton type="submit" disabled={submitting} className="w-full justify-center py-3 font-bold">
              {submitting ? 'Starting import...' : isZip ? 'Check ZIP upload' : 'Start import'}
            </GradientButton>
          </form>
        </GlassCard>
      </section>
    </AppShell>
  );
}

function ProjectStatusBadge({ status }: { status: DashboardProject['status'] }) {
  return (
    <span
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-semibold capitalize',
        status === 'ready'
          ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200'
          : 'border-cyan-300/20 bg-cyan-400/10 text-cyan-200'
      )}
    >
      {status}
    </span>
  );
}

function ProjectCard({ project }: { project: DashboardProject }) {
  return (
    <GlassCard className="flex min-h-[337px] flex-col p-6">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#d8dbff]">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M6 3.5h8l4 4v13H6z" />
            <path d="M14 3.5v4h4M8.5 12h7M8.5 15.5h5" strokeLinecap="round" />
          </svg>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>
      <h3 className="mt-8 text-2xl font-semibold tracking-[-0.03em] text-white">{project.name}</h3>
      <p className="mt-4 min-h-[72px] text-base leading-6 text-[#a1a1aa]">{project.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-5">
        <span className="text-sm text-slate-400">{project.updatedAt}</span>
        <a href={project.docsHref} className="text-sm font-semibold text-[#b8bcff] transition hover:text-white">
          View Docs →
        </a>
      </div>
    </GlassCard>
  );
}

function AddProjectCard() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push('/dashboard?source=git-url')}
      className="group min-h-[337px] rounded-2xl border border-dashed border-violet-300/35 bg-[radial-gradient(circle_at_center,rgba(123,130,255,0.16),rgba(24,24,27,0.28)_62%)] p-6 text-center transition hover:-translate-y-1 hover:border-violet-200/60"
    >
      <span className="mx-auto mt-14 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-3xl text-[#d8dbff] transition group-hover:bg-white/10">
        +
      </span>
      <span className="mt-8 block text-2xl font-semibold tracking-[-0.03em] text-white">Add New Project</span>
      <span className="mx-auto mt-4 block max-w-[220px] text-base leading-6 text-[#a1a1aa]">
        Import another repository and generate new docs
      </span>
    </button>
  );
}

function mapApiProjectToDashboard(project: { id: string; name: string; sourceInput: string; sourceType?: string; status: string; updatedAt: string }): DashboardProject {
  const statusMap: Record<string, ProjectStatus> = {
    completed: 'ready',
    queued: 'syncing',
    uploading: 'syncing',
    cloning: 'syncing',
    extracting: 'syncing',
    scanning: 'syncing',
    generating: 'syncing',
    failed: 'ready',
  };
  const derivedTags = project.sourceType === 'github' || project.sourceInput.toLowerCase().includes('github.com') ? ['GitHub'] : ['Upload'];
  const relativeTime = formatRelativeTime(project.updatedAt);

  return {
    id: project.id,
    name: project.name,
    description: project.sourceInput,
    status: statusMap[project.status] ?? 'ready',
    tags: derivedTags,
    updatedAt: relativeTime,
    docsHref: `/docs/${encodeURIComponent(project.id)}`,
  };
}

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function ProjectListDashboard() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    let disposed = false;
    async function load() {
      try {
        const response = await fetch('/api/projects', { cache: 'no-store' });
        const handling = classifyProjectsResponse(response.status);
        if (handling.kind === 'redirect') {
          router.push(handling.target);
          return;
        }
        if (handling.kind === 'error') {
          throw new Error(handling.message);
        }
        const payload = (await response.json()) as { data: Array<{ id: string; name: string; sourceInput: string; sourceType?: string; status: string; updatedAt: string }> };
        if (!disposed) setProjects(payload.data.map(mapApiProjectToDashboard));
      } catch {
        if (!disposed) setFetchError('Could not load projects.');
      } finally {
        if (!disposed) setLoading(false);
      }
    }
    void load();
    return () => { disposed = true; };
  }, [router]);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return projects;
    return projects.filter((project) =>
      [project.name, project.description, ...project.tags].some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [projects, query]);

  return (
    <AppShell>
      <section className="min-h-[calc(100vh-64px)] px-6 py-24">
        <GlassCard className="mx-auto max-w-5xl p-8 md:p-12" insetGlow>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-[40px] font-bold tracking-[-0.04em] text-white">Active Projects</h1>
              <p className="mt-2 max-w-xl text-lg leading-7 text-[#a1a1aa]">
                Browse generated documentation workspaces and continue where analysis left off.
              </p>
            </div>
            <label className="relative block w-full md:w-64">
              <span className="sr-only">Search projects</span>
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search projects..."
                className="h-10 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-300/60 focus:ring-2 focus:ring-violet-300/20"
              />
            </label>
          </div>

          {loading ? (
            <div className="mt-12 flex flex-col items-center gap-4 py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-300/30 border-t-violet-300" />
              <p className="text-sm text-slate-400">Loading projects...</p>
            </div>
          ) : fetchError ? (
            <div className="mt-12 py-16 text-center">
              <p className="text-sm text-red-400">{fetchError}</p>
            </div>
          ) : filteredProjects.length === 0 && !query ? (
            <div className="mt-12 flex flex-col items-center gap-4 py-16">
              <p className="text-lg text-slate-400">No projects yet</p>
              <p className="text-sm text-slate-500">Import a repository to get started</p>
            </div>
          ) : null}

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            <AddProjectCard />
          </div>
        </GlassCard>
      </section>
    </AppShell>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-48 w-48">
      <div className="absolute inset-0 rounded-full bg-[#6366f1]/10 blur-xl" />
      <svg viewBox="0 0 100 100" className="relative h-full w-full -rotate-90">
        <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="url(#progressGradient)"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#7b82ff" />
            <stop offset="1" stopColor="#6618d8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{percent}%</span>
        <span className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">Complete</span>
      </div>
    </div>
  );
}

function useProjectJobLogs(projectId?: string) {
  const [logs, setLogs] = useState<UiJobLog[]>([]);
  const [connectionState, setConnectionState] = useState<'demo' | 'connecting' | 'live' | 'polling' | 'complete' | 'error'>(
    projectId ? 'connecting' : 'demo',
  );
  const startedProjectIdRef = useRef<string | null>(null);
  const latestIdRef = useRef('0');

  useEffect(() => {
    if (!projectId || startedProjectIdRef.current === projectId) return;
    startedProjectIdRef.current = projectId;
    latestIdRef.current = '0';
    setLogs([]);
    setConnectionState('connecting');
    let disposed = false;
    let regenerationInFlight = true;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    function appendLogs(nextLogs: UiJobLog[]) {
      if (!nextLogs.length) return;
      setLogs((current) => {
        const byId = new Map(current.map((log) => [log.id, log]));
        for (const log of nextLogs) {
          byId.set(log.id, log);
          latestIdRef.current = log.id;
        }
        return Array.from(byId.values()).sort((a, b) => Number(a.id) - Number(b.id));
      });
    }

    async function pollOnce() {
      const response = await fetch(`/api/projects/${projectId}/logs?afterId=${encodeURIComponent(latestIdRef.current)}`, {
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Failed to fetch project logs');
      const payload = (await response.json()) as { data: { logs: UiJobLog[] } };
      appendLogs(payload.data.logs);
      const terminalLog = payload.data.logs.find((log) => log.phase === 'completed' || log.phase === 'failed');
      if (terminalLog && !regenerationInFlight) {
        setConnectionState('complete');
        if (pollTimer) clearInterval(pollTimer);
      }
    }

    function startPolling() {
      setConnectionState('polling');
      void pollOnce().catch(() => setConnectionState('error'));
      pollTimer = setInterval(() => {
        void pollOnce().catch(() => setConnectionState('error'));
      }, 1500);
    }

    startPolling();

    const source = new EventSource(`/api/projects/${projectId}/logs/stream`);
    source.addEventListener('job-log', (event) => {
      setConnectionState('live');
      appendLogs([JSON.parse((event as MessageEvent).data) as UiJobLog]);
    });
    source.addEventListener('terminal', () => {
      setConnectionState('complete');
      source.close();
      if (!regenerationInFlight && pollTimer) clearInterval(pollTimer);
    });
    source.onerror = () => {
      source.close();
      if (!disposed && !pollTimer) startPolling();
    };

    const providedPAT = typeof window === 'undefined' ? '' : window.sessionStorage.getItem(`codebase-wiki:providedPAT:${projectId}`) ?? '';
    if (providedPAT) {
      window.sessionStorage.removeItem(`codebase-wiki:providedPAT:${projectId}`);
    }

    void fetch(`/api/projects/${projectId}/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(providedPAT ? { providedPAT } : {}),
    })
      .catch(() => setConnectionState('error'))
      .finally(() => {
        regenerationInFlight = false;
        void pollOnce().catch(() => setConnectionState('error'));
      });

    return () => {
      disposed = true;
      source.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [projectId]);

  return { logs, connectionState };
}

export function GeneratingDashboard({ progress = generationProgress, projectId }: { progress?: GenerationProgress; projectId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const effectiveProjectId = projectId ?? searchParams.get('projectId') ?? undefined;
  const { logs, connectionState } = useProjectJobLogs(effectiveProjectId);
  const liveView = useMemo(() => deriveGenerationView(logs), [logs]);
  const terminalState = liveView.statusLabel === 'Completed' ? 'complete' : liveView.statusLabel === 'Failed' ? 'failed' : connectionState;
  const displayed = effectiveProjectId
    ? {
      projectName: effectiveProjectId.slice(0, 8),
      percent: liveView.percent,
      currentStage: liveView.currentStage,
      stages: liveView.stages,
      logs: liveView.terminalLines,
      filesScanned: liveView.filesScanned,
      elapsed: liveView.elapsed,
      statusLabel: liveView.statusLabel,
    }
    : { ...progress, statusLabel: 'Running analysis' };

  useEffect(() => {
    if (!effectiveProjectId || liveView.statusLabel !== 'Completed') return;
    const redirectTimer = window.setTimeout(() => {
      router.push(`/docs/${encodeURIComponent(effectiveProjectId)}`);
    }, 900);
    return () => window.clearTimeout(redirectTimer);
  }, [effectiveProjectId, liveView.statusLabel, router]);

  return (
    <AppShell>
      <section className="min-h-[calc(100vh-64px)] px-6 py-16 lg:px-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100">
                Clone → Scan → Enrich → Generate → Index
              </span>
              <h1 className="mt-5 text-[44px] font-bold leading-tight tracking-[-0.055em] text-white md:text-[58px]">
                Analyzing repository
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-[#a1a1aa]">
                {displayed.currentStage}. {effectiveProjectId ? `Terminal logs are ${terminalState}.` : 'This preview uses demo progress until a project is connected.'}
              </p>
            </div>
            <GlassCard className="flex min-w-[300px] items-center gap-5 p-5">
              <ProgressRing percent={displayed.percent} />
              <div>
                <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Project</p>
                <p className="mt-1 font-mono text-lg font-semibold text-white">{displayed.projectName}</p>
                <p className="mt-3 text-sm text-slate-400">{displayed.filesScanned} files · {displayed.elapsed}</p>
                {effectiveProjectId && displayed.statusLabel === 'Completed' ? (
                  <button
                    type="button"
                    onClick={() => router.push(`/docs/${encodeURIComponent(effectiveProjectId)}`)}
                    className="mt-4 rounded-lg bg-gradient-to-r from-[#7b82ff] to-[#6618d8] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    Open generated docs
                  </button>
                ) : null}
              </div>
            </GlassCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
            <div className="space-y-6">
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">Workflow stages</h2>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">{displayed.statusLabel}</span>
                </div>
                <div className="mt-6 space-y-4">
                  {displayed.stages.map((stage, index) => (
                    <div key={stage.id} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-bold',
                          stage.status === 'complete' && 'border-emerald-300/30 bg-emerald-400/15 text-emerald-200',
                          stage.status === 'active' && 'border-cyan-300/40 bg-cyan-400/15 text-cyan-100',
                          stage.status === 'pending' && 'border-slate-600 bg-slate-900 text-slate-500'
                        )}
                      >
                        {stage.status === 'complete' ? '✓' : index + 1}
                      </span>
                      <div>
                        <p className="font-semibold text-white">{stage.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-400">{stage.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-200">Output preview</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">Generated docs will appear next</h2>
                <div className="mt-5 space-y-3">
                  {['Overview', 'Architecture', 'API Reference', 'Security'].map((item) => (
                    <div key={item} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
                      {item}
                    </div>
                  ))}
                  <div className="rounded-xl border border-violet-300/20 bg-violet-400/10 px-4 py-3 text-sm text-violet-100">
                    Features
                  </div>
                  <div className="ml-5 border-l border-white/15 pl-4 text-sm text-slate-400">
                    <p className="py-1.5">Generated feature pages</p>
                    <p className="py-1.5">Module guides</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            <GlassCard className="overflow-hidden bg-black/40">
              <div className="flex h-12 items-center justify-between border-b border-white/10 px-4">
                <div className="flex gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400/70" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
                </div>
                <span className="font-mono text-xs text-slate-400">codebase-wiki/live-analysis</span>
              </div>
              <div className="h-[620px] overflow-y-auto px-6 py-5 font-mono text-sm leading-6 text-[#a5b4fc]/90">
                {displayed.logs.map((log, index) => (
                  <p key={`${log}-${index}`}>{log}</p>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 text-xs text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', displayed.statusLabel === 'Failed' ? 'bg-red-400' : displayed.statusLabel === 'Completed' ? 'bg-emerald-400' : 'bg-cyan-400')} />
                  {displayed.statusLabel}
                </span>
                <span>
                  {displayed.filesScanned} files · {displayed.elapsed} elapsed
                </span>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export function DashboardClient({ source }: { mode?: 'empty' | 'projects'; source?: ImportSource }) {
  if (source) {
    return <ImportProjectDashboard source={source} />;
  }

  return <ProjectListDashboard />;
}

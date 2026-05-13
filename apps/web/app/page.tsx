import { LogoMark } from '@/components/ui/LogoMark';
import { LandingImportForm } from '@/components/landing/LandingImportForm';

function Header() {
  return (
    <header className="absolute left-0 right-0 top-0 z-40">
      <div className="mx-auto flex h-[118px] w-full max-w-[2560px] items-center justify-between px-10 sm:px-12 lg:px-16">
        <a href="#" className="flex items-center gap-4" aria-label="Codebase Wiki home">
          <LogoMark />
          <span className="text-base font-bold tracking-[-0.04em] text-white">Codebase Wiki</span>
        </a>
        <nav className="hidden items-center gap-8 text-base text-[#a1a1aa] md:flex">
          <a className="transition hover:text-white" href="#workflow">Workflow</a>
          <a className="transition hover:text-white" href="#documentation">Docs Preview</a>
          <a className="transition hover:text-white" href="#features">Features</a>
        </nav>
        <div className="flex items-center gap-4 text-base">
          <a className="hidden px-3 text-[#a1a1aa] transition hover:text-white sm:block" href="/auth/sign-in">Log in</a>
          <a className="rounded-lg bg-gradient-to-br from-[#7667ff] to-[#a855f7] px-5 py-3 font-medium text-white shadow-[0_10px_24px_rgba(124,92,255,0.32)] transition hover:brightness-110" href="#connect">Start Import</a>
        </div>
      </div>
    </header>
  );
}

function WorkflowPreview() {
  return (
    <div className="relative rounded-[28px] border border-white/10 bg-[#080b14]/80 p-5 shadow-[0_28px_70px_rgba(79,70,229,0.12)] backdrop-blur-xl">
      <div className="absolute -inset-1 rounded-[30px] bg-gradient-to-br from-violet-500/10 via-cyan-400/5 to-transparent blur-xl" />
      <div className="relative rounded-2xl border border-white/10 bg-black/35 p-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-violet-200">Active run</p>
            <p className="mt-1 font-mono text-sm text-white">github.com/your-team/your-repo</p>
          </div>
          <span className="rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">streaming logs</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ['Import', 'GitHub clone', 'complete'],
            ['Analyze', 'files and configs scanned', 'running'],
            ['Publish', 'wiki pages generated', 'queued'],
          ].map(([title, detail, status]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-2 text-xs text-slate-400">{detail}</p>
              <div className="mt-4 h-1.5 rounded-full bg-white/10">
                <div className={`h-full rounded-full ${status === 'queued' ? 'w-1/4 bg-slate-500' : status === 'running' ? 'w-2/3 bg-cyan-300' : 'w-full bg-emerald-300'}`} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-white/10 bg-[#050816] p-4 font-mono text-xs leading-6 text-cyan-100/85">
          <p>[15:55:31] INFO queued: Project processing queued</p>
          <p>[15:55:32] INFO cloning: GitHub repository cloned</p>
          <p>[15:55:32] INFO scanning: Scanned codebase files {'{"fileCount":"detected"}'}</p>
          <p className="text-violet-200">[15:55:32] INFO generating: Generated documentation pages {'{"pageCount":"planned"}'}</p>
          <p className="text-emerald-200">[15:55:33] INFO completed: Project processing completed</p>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="workflow" className="relative min-h-[900px] w-full overflow-hidden px-6 pb-24 pt-[150px]">
      <div className="pointer-events-none absolute left-[0px] top-[-180px] h-[520px] w-[520px] rounded-full bg-[#2630ff]/10 blur-[115px]" />
      <div className="pointer-events-none absolute right-[0px] top-[360px] h-[560px] w-[560px] rounded-full bg-[#2630ff]/10 blur-[120px]" />
      <div className="relative z-10 mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <span className="inline-flex rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-100">
            GitHub repo → live logs → living docs
          </span>
          <h1 className="mt-8 max-w-[640px] text-[44px] font-bold leading-[1.08] tracking-[-0.055em] text-white sm:text-[64px]">
            Turn any codebase into a living wiki.
          </h1>
          <p className="mt-7 max-w-[620px] text-lg leading-8 text-[#a1a1aa]">
            Paste a GitHub repository, watch the backend clone and analyze it in real time, then publish a GitBook-like documentation site with Overview, Architecture, API Reference, Security, and feature pages.
          </p>
          <LandingImportForm />
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
            {['PostgreSQL persistence', 'pgvector indexing', 'OpenAI-compatible AI', 'SSE terminal logs'].map((label) => (
              <span key={label} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">{label}</span>
            ))}
          </div>
        </div>
        <WorkflowPreview />
      </div>
    </section>
  );
}

function DocsPreview() {
  const primary = ['Overview', 'Architecture', 'API Reference', 'Security'];
  const features = ['Feature Pages', 'Module Guides'];
  return (
    <section id="documentation" className="relative bg-[#03001d] px-6 py-24">
      <div className="mx-auto grid max-w-[1280px] gap-8 lg:grid-cols-[0.78fr_1.22fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-200">Generated output</p>
          <h2 className="mt-4 text-[42px] font-bold leading-tight tracking-[-0.045em] text-white">A GitBook-like wiki, grounded in real files.</h2>
          <p className="mt-5 text-lg leading-8 text-[#a1a1aa]">
            The backend generates canonical docs with feature pages nested as submenu items so small repos stay readable and larger codebases remain navigable.
          </p>
        </div>
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#080f17] shadow-[0_32px_90px_rgba(0,0,0,0.35)]">
          <div className="flex h-12 items-center justify-between border-b border-white/10 px-5">
            <span className="text-sm font-semibold text-white">Generated project docs</span>
            <span className="text-xs text-slate-400">current version · multi-page wiki</span>
          </div>
          <div className="grid min-h-[430px] md:grid-cols-[230px_1fr]">
            <aside className="border-r border-white/10 bg-black/20 p-4">
              <p className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Primary</p>
              <div className="space-y-1">
                {primary.map((item, index) => (
                  <div key={item} className={`rounded-xl px-3 py-2 text-sm ${index === 0 ? 'bg-white/10 text-white' : 'text-slate-400'}`}>{item}</div>
                ))}
              </div>
              <div className="space-y-1">
                <div className="mt-5 rounded-xl bg-[#7b82ff] px-3 py-2 text-sm font-medium text-[#111827]">Features</div>
                <div className="ml-4 border-l border-white/15 pl-4">
                  {features.map((item) => (
                    <div key={item} className="py-2 text-sm text-slate-400">{item}</div>
                  ))}
                </div>
              </div>
            </aside>
            <article className="p-8">
              <div className="mb-4 flex flex-wrap gap-2">
                {['src/app.ts', 'src/api/routes.ts', 'package.json'].map((file) => (
                  <span key={file} className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 font-mono text-xs text-cyan-100">{file}</span>
                ))}
              </div>
              <h3 className="text-3xl font-bold tracking-[-0.04em] text-white">Overview</h3>
              <p className="mt-4 text-base leading-8 text-[#a1a1aa]">
                This page summarizes what the repository does, which modules matter, and where the generated explanation is grounded in the scanned source files.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {['Architecture map', 'Security notes', 'API behavior', 'Feature pages'].map((label) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">{label}</div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function Capabilities() {
  const cards = [
    ['GitHub import', 'Create a project from a public or private GitHub repository and keep the source in temporary storage only.'],
    ['AI codebase analysis', 'Run deterministic scans, dependency extraction, and OpenAI-compatible enrichment before docs generation.'],
    ['Live job logs', 'Stream queued, cloning, scanning, enriching, generating, indexing, cleanup, and completion phases.'],
    ['Living documentation', 'Generate Overview, Architecture, API Reference, Security, and feature pages grounded in scanned file paths.'],
    ['pgvector semantic index', 'Persist generated docs and vector chunks so future chat/search can stay grounded.'],
    ['Regenerate flow', 'Refresh docs from a GitHub-backed project while retaining previous documentation history.'],
  ];

  return (
    <section id="features" className="relative min-h-[760px] overflow-hidden bg-[#03001d] px-6 pb-24 pt-12">
      <div className="absolute left-1/2 top-0 h-[1280px] w-[170vw] min-w-[1600px] -translate-x-1/2 rounded-[50%] bg-[#03001d]" />
      <div className="absolute left-0 right-0 top-[1px] h-[2px] bg-gradient-to-r from-transparent via-[#2c2368]/60 to-transparent" />
      <div className="relative z-10 mx-auto w-full max-w-[1280px]">
        <h2 className="text-center text-[44px] font-semibold leading-tight tracking-[-0.035em] text-white sm:text-[54px]">
          Built for the actual <span className="text-[#d0bcff]">docs pipeline</span>
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-lg leading-8 text-[#a1a1aa]">
          Every card below maps to product capabilities: ingestion, analysis, logs, docs persistence, semantic indexing, and regeneration.
        </p>
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cards.map(([title, body], index) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-[#18181b]/40 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-400/10 text-sm font-bold text-violet-100">{index + 1}</span>
              <h3 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-white">{title}</h3>
              <p className="mt-3 text-base leading-7 text-[#a1a1aa]">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#050507] px-6 py-10">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 text-sm text-[#a1a1aa] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <LogoMark size="h-6 w-6" />
          <span className="text-base font-semibold tracking-[-0.04em] text-white">Codebase Wiki</span>
        </div>
        <nav className="flex flex-wrap gap-8">
          <a className="transition hover:text-white" href="#documentation">Documentation</a>
          <a className="transition hover:text-white" href="#workflow">Workflow</a>
          <a className="transition hover:text-white" href="#features">Features</a>
          <a className="transition hover:text-white" href="#connect">Import Repo</a>
        </nav>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#080f17] font-sans text-white">
      <Header />
      <main>
        <Hero />
        <DocsPreview />
        <Capabilities />
      </main>
      <Footer />
    </div>
  );
}

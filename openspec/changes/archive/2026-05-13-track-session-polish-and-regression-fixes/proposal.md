## Why

The current repository has accumulated a set of related session-level fixes and polish changes across docs generation, docs rendering, project management, and architecture/product docs. The work is already implemented, but it is not yet represented as a single OpenSpec change with a checked task trail, which makes it harder to audit what was completed and why.

This tracking change captures those completed improvements so OpenSpec reflects the real state of the codebase and the finished work can be reviewed or archived coherently.

## What Changes

- Track the docs and product copy alignment work that switched sign-in messaging and architecture references to email-only auth.
- Track docs reader UX polish for profile dropdown behavior and project navigation actions from the generated docs surface.
- Track multi-project dashboard behavior, including project listing from real API data and backend reuse/cleanup for duplicate GitHub repository imports.
- Track generated docs rendering improvements for ordered lists, bold inline formatting, and cleaner developer-facing markdown presentation.
- Track documentation generation quality improvements, including a more project-aware prompt builder and richer compact context construction.
- Track the source evidence/source file preview regression fix so generated pages correctly surface file evidence in both enriched and in-memory retrieval paths.

## Capabilities

- **New Capabilities**
  - `generated-docs-quality`
- **Modified Capabilities**
  - None.

## Impact

- Affected code: `docs/prd/prd.md`, `docs/architecture/c4/codebase-wiki-c4.md`, `apps/web/components/docs/DocsReader.tsx`, `apps/web/components/docs/docsViewModel.ts`, `apps/web/components/dashboard/DashboardClient.tsx`, `apps/web/app/dashboard/page.tsx`, `apps/api/services/project-intake/index.ts`, `apps/api/services/postgres/index.ts`, `apps/api/services/ai-doc-generation/prompt-builder.ts`, `apps/api/services/codebase-analysis/context-builder/index.ts`, `apps/api/services/codebase-analysis/enrichment-boundary.ts`, `apps/api/services/storage/documentation-store.ts`.
- Affected systems: generated docs UX, AI doc generation context/prompting, docs storage/retrieval, dashboard project lifecycle, GitHub project reuse.
- Scope note: this is a tracking/synchronization change for work already completed in-session; it does not introduce new planned implementation beyond recording the delivered state.

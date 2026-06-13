## Why

Generated documentation output changed from a separate secondary sidebar to a GitBook-like primary sidebar with feature pages nested as submenu items. The backend also needs to use Gemini specifically for semantic embeddings while retaining the configured OpenAI-compatible provider for docs generation. The docs reader should render real persisted output so the tested generated hierarchy is visible after analysis completes.

## What Changes

- Use Gemini embedding configuration and model for semantic index generation.
- Keep AI documentation generation on the configured OpenAI-compatible provider.
- Replace `secondarySidebar` output with a `Features` submenu in the primary sidebar.
- Update job logs to describe the actual output hierarchy and Gemini embedding provider.
- Render persisted docs in `/docs/[projectId]/[[...slug]]` with sidebar submenu children.
- Polish terminal status copy so completed/failed jobs do not read as still polling.

## Impact

- Affected code: `apps/api/config.ts`, `apps/api/services/semantic-search`, `apps/api/services/ai-doc-generation`, `apps/web/app/api/projects/[projectId]/regenerate`, `apps/web/app/docs/[projectId]/[[...slug]]`, docs/dashboard UI components.
- Configuration: adds Gemini embedding env keys alongside existing AI generation env keys.
- Verification: focused API tests, web build, real repo analysis run, and docs reader smoke test.

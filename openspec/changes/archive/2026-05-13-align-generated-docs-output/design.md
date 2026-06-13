## Design

### Embedding provider split

Documentation generation remains OpenAI-compatible and uses `OPENAI_BASE_URL`, `OPENAI_API_KEY`, and `AI_MODEL`. Semantic indexing uses Gemini-specific config:

- `GEMINI_API_KEY`
- `GEMINI_BASE_URL`
- `GEMINI_EMBEDDING_MODEL`

The regenerate flow logs Gemini model/provider metadata during indexing.

### Sidebar hierarchy

Canonical pages remain first-level sidebar entries:

- Overview
- Architecture
- API Reference
- Security

Feature pages are grouped under a first-level `Features` item with children. The backend no longer emits feature pages through `secondarySidebar` for new generations.

### Real docs reader

`/docs/[projectId]/[[...slug]]` should load persisted docs for the authenticated project owner, select the requested slug (or the first sidebar page), and render:

- project/version metadata
- breadcrumbs
- generated sidebar hierarchy, including children
- generated markdown-ish content split into sections
- previous/next navigation based on flattened sidebar order

### Terminal status copy

The generating page should display a terminal connection label that matches derived job state. Once terminal logs include a completed or failed phase, the UI should say `complete` or `failed`, not `polling`.

## Context

Codebase Wiki now supports backend project creation, live terminal-style job logs, generated docs, secondary feature sidebar, PostgreSQL persistence, and pgvector indexing. The landing page should teach that flow immediately instead of presenting generic AST/API extraction messaging.

## Visual Direction

Use a **product workflow** layout:

- dark Codebase Wiki visual system
- GitHub URL import as the primary action
- three-step product story: Import → Analyze → Publish Wiki
- terminal-log preview to show backend transparency
- generated docs preview to show the final artifact

## Page Structure

### 1. Header

- Keep logo and navigation.
- Point primary CTA to the GitHub import form.
- Keep auth links.

### 2. Hero: All-in-one workflow

Hero content:

- headline about turning a GitHub repo into living docs
- short copy explaining scan, terminal logs, and generated wiki output
- GitHub repo form from UI wiring change
- workflow preview card showing:
  - repository URL
  - active analysis status
  - generated page count

### 3. Live analysis preview

Terminal-style card with representative phases:

- queued
- cloning
- scanning
- enriching
- generating
- indexing
- completed

This preview is static marketing content, not a backend stream.

### 4. Generated docs preview

GitBook-like preview with:

- primary sidebar: Overview, Architecture, API Reference, Security
- Features rendered as a submenu inside the primary sidebar
- content panel showing grounded docs snippets and source file references

### 5. Capability grid

Use project-specific cards:

- GitHub import
- AI codebase analysis
- live job logs
- living documentation
- pgvector semantic index
- regenerate flow

## Data Flow

Landing import behavior remains from `wire-ui-job-terminal-logs`:

```text
GitHub URL form → POST /api/projects → /dashboard/generating?projectId=...
```

The redesign does not change API contracts.

## Testing

- Keep existing landing import behavior intact.
- Run `npm run build --workspace=apps/web`.
- Browser smoke-check landing at desktop width.
- Confirm import form remains visible above fold.

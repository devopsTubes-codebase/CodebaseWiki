## Why

The current landing page looks polished but still reads like a generic code-analysis product. It should directly reference the actual Codebase Wiki workflow: paste a GitHub repo, watch backend terminal logs, generate living documentation, and browse a GitBook-like wiki with canonical docs plus feature pages.

## What Changes

- Redesign the landing page around an all-in-one product workflow.
- Keep the GitHub repository import form as the primary CTA.
- Add an above-the-fold workflow preview: repository input, live analysis logs, generated docs.
- Add a product-specific terminal log preview using real backend phases.
- Add a generated docs preview showing:
  - Overview
  - Architecture
  - API Reference
  - Security
  - Features
- Replace generic capability copy with project-specific capabilities: GitHub import, AI codebase analysis, pgvector semantic index, job logs, living docs.

## Non-Goals

- Changing backend behavior.
- Changing auth/session flow.
- Implementing a new docs reader.
- Adding ZIP/PAT UI.

## Impact

- Affected file: landing page and optionally small landing-only components.
- UX: clearer product positioning and better continuity into the generating terminal-log screen.
- Validation: web build plus visual browser smoke-check.

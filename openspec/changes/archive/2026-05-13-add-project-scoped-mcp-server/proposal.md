## Why

Generated Codebase Wiki pages now provide source-grounded docs, Search Docs, Ask Wiki, and browser QA. Developers still need a way to bring that project-specific knowledge into coding agents without manually copying docs or prompts.

This change adds a project-scoped, read-only MCP integration so a developer can connect a generated wiki to a coding agent in a Context7-like workflow. The MCP surface should expose docs search, stateless grounded Q&A, full page retrieval, and source evidence retrieval while preserving project ownership boundaries.

## What Changes

- Add a project-scoped MCP endpoint for coding agents.
- Add project-scoped read-only MCP tokens that can be created and revoked from the docs UI.
- Add MCP tools:
  - `search_docs`
  - `ask_wiki`
  - `get_page`
  - `get_source_evidence`
- Keep MCP `ask_wiki` stateless by default so coding agent calls do not pollute web chat history.
- Add a `Connect MCP` modal in the docs reader:
  - create token;
  - copy config;
  - test connection;
  - revoke token.
- Add tests for token hashing, project scoping, read-only tool behavior, and browser config/test/revoke flow.

## Impact

- Affected code: API types, Postgres schema/store, MCP service/route, docs retrieval/search/wiki service adapters, docs reader UI, and browser QA.
- Security: tokens are hashed at rest, scoped to one project, read-only, revocable, and never logged in plaintext.
- UX: developers can connect the current generated wiki to their coding agent from the docs page.
- Non-goal: API Playground remains a separate future feature for the web API Reference page.

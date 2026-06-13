## Why

Generated docs now persist source-grounded pages and vector chunks, but the docs reader still treats Search Docs and Ask Wiki as disabled affordances. Users need to find specific docs quickly and ask project-specific questions with answers grounded in generated docs and indexed source evidence.

The backend already has project-scoped vector retrieval primitives. This change wires those primitives into a complete product flow: header search results, right-side Ask Wiki chat, grounded AI answers, citations, and per-project chat history.

## What Changes

- Activate the docs header search field as a project-scoped quick search modal.
- Return UI-ready search results with excerpt, source type, score, and docs page links.
- Replace the disabled right-side Ask Wiki panel with an active chat panel.
- Add grounded Ask Wiki answer generation: retrieve context, answer only from retrieved sources, and attach citations.
- Persist chat sessions and messages per project/user in Postgres.
- Add APIs for session list, session creation, message retrieval, sending a message, and clearing/deleting sessions.
- Preserve owner-only access for all search and chat endpoints.
- Add empty/loading/error states for missing index, AI provider failure, unauthorized access, and no relevant results.

## Impact

- Affected code: API types, semantic search/retrieval services, new Ask Wiki service, Postgres schema/store, docs API routes, docs reader UI components, and web utility tests.
- Data: adds `wiki_chat_sessions` and `wiki_chat_messages` tables scoped by `project_id` and `user_id`.
- Security: uses existing project ownership checks; does not log raw prompts, retrieved context, or AI answers beyond persisted chat messages.
- UX: Search Docs opens as a modal from the centered header search field; Ask Wiki is an always-available right-side chat panel on wide screens.

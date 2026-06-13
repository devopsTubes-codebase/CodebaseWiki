## 1. Backend contracts and persistence

- [x] 1.1 Add chat session/message/source types to `apps/api/types/index.ts`.
- [x] 1.2 Extend Postgres schema with `wiki_chat_sessions` and `wiki_chat_messages`.
- [x] 1.3 Implement Postgres chat store methods for list/create/get/append/delete.
- [x] 1.4 Add tests for chat persistence and project/user scoping.

## 2. Search Docs

- [x] 2.1 Update retrieval/search response types to include UI-ready title, excerpt, source, score, and docs href/page slug.
- [x] 2.2 Update `POST /api/projects/[projectId]/search` to return UI-ready search results.
- [x] 2.3 Add tests for search response mapping and empty index behavior.

## 3. Ask Wiki grounded answer service

- [x] 3.1 Add grounded Ask Wiki prompt builder.
- [x] 3.2 Implement service that persists user message, retrieves context, generates grounded answer, persists assistant message, and returns citations.
- [x] 3.3 Handle empty context with a non-AI fallback answer.
- [x] 3.4 Handle AI provider failure without losing the user message.
- [x] 3.5 Add service tests for success, empty context, AI failure, and citation mapping.

## 4. Ask Wiki API routes

- [x] 4.1 Add project-owned session list/create routes.
- [x] 4.2 Add project-owned session messages get/send routes.
- [x] 4.3 Add project-owned session delete route.
- [x] 4.4 Ensure all routes reject unauthenticated/non-owner access.

## 5. Docs reader UI

- [x] 5.1 Implement Search Docs modal/overlay from the header search field.
- [x] 5.2 Render search loading, empty, error, and results states.
- [x] 5.3 Replace disabled right-side Ask Wiki panel with active chat UI.
- [x] 5.4 Add session selector/list, new chat, and delete/clear session affordances.
- [x] 5.5 Add sticky chat input with Enter submit and Shift+Enter newline.
- [x] 5.6 Render assistant answer citations/source chips.
- [x] 5.7 Validate search and chat view states through browser smoke coverage.
- [x] 5.8 Format Ask Wiki answers as short summary plus bullets.
- [x] 5.9 Render citations as a subtle source row instead of prominent chips.

## 6. Verification

- [x] 6.1 Run focused API tests for semantic search and Ask Wiki.
- [x] 6.2 Run web lint/build validation.
- [x] 6.3 Run full workspace tests, lint, and build.
- [x] 6.4 Run OpenSpec validation for `wire-docs-search-and-ask-wiki`.
- [x] 6.5 Browser smoke test search result click, Ask Wiki answer with citations, and history restore.
- [x] 6.6 Browser screenshot verifies formatted Ask Wiki answer and subtle source row.

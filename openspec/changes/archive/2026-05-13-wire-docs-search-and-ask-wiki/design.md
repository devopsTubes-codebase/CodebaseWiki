## Context

The current docs reader already renders persisted generated docs and a right-side Ask Wiki placeholder. The backend has:

- `PostgresVectorIndexStore.retrieveContext(...)`
- `/api/projects/[projectId]/search`
- vector chunks generated during regeneration
- OpenAI-compatible AI client plumbing for docs generation

Missing pieces are chat persistence, grounded answer generation, UI search results, active chat UI, and route/service contracts for those flows.

## Goals / Non-Goals

**Goals:**

- Make Search Docs usable from the docs header.
- Make Ask Wiki usable as a right-side chat panel.
- Persist chat history per project and user.
- Generate grounded answers from retrieved docs context with citations.
- Clearly handle empty index, no relevant results, AI failure, and unauthorized users.

**Non-Goals:**

- No multi-user shared chat sessions.
- No streaming response requirement for MVP.
- No cross-project search.
- No external web search; answers must come from indexed project docs/context only.
- No mobile redesign beyond graceful fallback.

## Design

### 1. Search Docs

Header Search Docs opens a modal or command-palette style overlay. A query calls project-scoped search and returns:

```ts
{
  query: string;
  results: Array<{
    title: string;
    pageSlug?: string;
    excerpt: string;
    source: 'vector-index' | 'codebase-summary';
    relevanceScore: number;
    href?: string;
  }>;
}
```

The UI shows loading, empty, and error states. Results link to generated docs pages when a `pageSlug` is known.

### 2. Ask Wiki chat panel

The existing right-side panel becomes an active chat interface:

- header with `Ask Wiki`, `New chat`, and session selector/list;
- empty state with suggested prompts;
- scrollable user/assistant message bubbles;
- assistant messages show citation chips for retrieved sources;
- sticky textarea input;
- Enter submits and Shift+Enter inserts a newline.

The panel restores the latest chat session for the current project/user. A new session starts empty.

### 3. Chat persistence

Add Postgres tables:

```sql
wiki_chat_sessions(
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  user_id text not null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
)

wiki_chat_messages(
  id text primary key,
  session_id text not null references wiki_chat_sessions(id) on delete cascade,
  project_id text not null references projects(id) on delete cascade,
  user_id text not null,
  role text not null check (role in ('user','assistant')),
  content text not null,
  sources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
)
```

Stores expose list/create/get/append/delete session operations.

### 4. Grounded answer generation

Ask Wiki send-message flow:

1. Verify user owns the project.
2. Ensure/create chat session.
3. Persist user message.
4. Retrieve top context from vector index.
5. If context is empty, persist assistant fallback: “I couldn't find enough indexed docs to answer that.”
6. If context exists, call AI with a strict grounded prompt:
   - answer only from retrieved context;
   - cite sources;
   - if context does not answer, say so;
   - do not invent files, endpoints, or behavior.
7. Persist assistant message and source citations.
8. Return updated messages/session.

### 5. API routes

Use project-scoped routes:

- `GET /api/projects/[projectId]/wiki-chat/sessions`
- `POST /api/projects/[projectId]/wiki-chat/sessions`
- `GET /api/projects/[projectId]/wiki-chat/sessions/[sessionId]/messages`
- `POST /api/projects/[projectId]/wiki-chat/sessions/[sessionId]/messages`
- `DELETE /api/projects/[projectId]/wiki-chat/sessions/[sessionId]`

Search stays at `POST /api/projects/[projectId]/search`, but response shape should be UI-friendly.

### 6. Security and logging

- All routes require `getRequiredSessionIdentity()`.
- Project ownership is checked before retrieval/chat access.
- Raw retrieved context and raw prompts are not written to logs.
- AI answers and citations are persisted as chat messages because they are user-facing product data.

## Risks / Trade-offs

- **AI hallucination risk** → strict grounded prompt plus citations and “I don’t know” fallback.
- **Index missing after old projects** → show empty-index state and suggest regeneration.
- **Cost/latency** → single-turn retrieval with bounded context and non-streamed answer for MVP.
- **Schema growth** → chat tables are scoped and cascade on project deletion.

## Verification Plan

- Unit test chat store/session/message behavior.
- Unit test grounded Ask Wiki service for context success, empty context, AI failure, and citations.
- Test search response mapping to UI-ready results.
- Test UI view models for search and chat states.
- Run full tests, lint, build, and OpenSpec validation.
- Browser smoke: search query, click result, ask a question, see answer with citations, refresh and see history restored.

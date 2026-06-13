## Context

The product currently has generated docs, source evidence, Search Docs, Ask Wiki, and browser QA. These capabilities are useful in the web app, but coding agents cannot yet consume them directly.

The desired direction is:

- MCP is for coding agents.
- API Playground is a later web feature under API Reference.
- The MCP MVP should be read-only, project-scoped, and similar in spirit to Context7 for generated project docs.

## Goals / Non-Goals

**Goals:**

- Expose a project-scoped MCP endpoint for coding agents.
- Provide read-only tools backed by generated docs, search, Ask Wiki, and source evidence.
- Let project owners create/revoke MCP tokens from the docs UI.
- Provide copyable MCP client config and a lightweight test connection flow.
- Keep MCP calls isolated from web chat history by default.

**Non-Goals:**

- No write/mutate tools.
- No API request playground in this change.
- No full MCP playground page.
- No cross-project personal tokens for MVP.
- No local exportable/offline MCP package.

## Architecture

### MCP endpoint

Add a single HTTP MCP endpoint, for example:

```text
/api/mcp
```

Clients authenticate with:

```text
Authorization: Bearer cw_mcp_<token>
```

Every tool call includes `projectId`. The endpoint validates that:

- the token exists and is not revoked;
- the token belongs to the requesting user/project scope;
- the requested `projectId` equals the token’s scoped project;
- the tool is read-only and known.

### Token storage

Add project-scoped MCP token persistence:

```sql
mcp_tokens(
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  user_id text not null,
  name text not null,
  token_hash text not null,
  token_prefix text not null,
  scopes jsonb not null default '["read:docs"]'::jsonb,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
)
```

Token plaintext is shown once at creation time. Only hash and prefix are stored.

### MCP tools

#### `search_docs`

Input:

```ts
{
  projectId: string;
  query: string;
  maxResults?: number;
}
```

Output:

- ranked page/snippet results;
- title;
- page slug;
- excerpt;
- source;
- relevance score.

Backed by the existing docs/search retrieval stack.

#### `ask_wiki`

Input:

```ts
{
  projectId: string;
  question: string;
}
```

Output:

- concise grounded answer;
- citations;
- source excerpts.

This is stateless by default and does not create `wiki_chat_sessions` or `wiki_chat_messages`.

#### `get_page`

Input:

```ts
{
  projectId: string;
  slug: string;
}
```

Output:

- generated docs page title;
- slug;
- markdown content;
- generated version/timestamp metadata.

#### `get_source_evidence`

Input:

```ts
{
  projectId: string;
  pageSlug?: string;
}
```

Output:

- selected source file paths;
- language;
- bounded content/excerpts;
- purpose metadata when available.

## Docs UI

Add a `Connect MCP` affordance to the docs reader. It opens a modal with:

- explanation: “Use this project wiki in your coding agent.”
- active token list with prefix, created date, last used date, and revoke action;
- `Create MCP token` action;
- one-time plaintext token display after creation;
- copyable MCP config containing endpoint URL, token, and `projectId`;
- tool list;
- `Test connection` action.

The test connection calls a lightweight backend endpoint or MCP adapter path that executes `search_docs` with a default query such as `overview`.

## Error Handling

- Missing/invalid token: auth error.
- Revoked token: auth error with safe message.
- Project mismatch: forbidden/not found without project data.
- Unknown tool: MCP tool error.
- Empty docs/index: return helpful “no indexed docs available” content.
- AI provider failure in `ask_wiki`: return fallback text with retrieved sources where possible.

## Testing

### Unit/service tests

- Token creation returns plaintext once and stores only hash/prefix.
- Token verification accepts valid tokens and rejects invalid/revoked tokens.
- Project-scoped token cannot access another project.
- MCP `ask_wiki` is stateless and does not create web chat history.
- Each MCP tool maps to the expected underlying docs/search/source behavior.

### Route tests

- MCP endpoint rejects missing/invalid token.
- MCP endpoint returns tool result for valid token/project scope.
- Token management endpoints enforce project ownership.

### Browser QA

- Open docs page.
- Open `Connect MCP` modal.
- Create token.
- Verify copyable config includes endpoint, token, and projectId.
- Run test connection successfully.
- Revoke token.
- Verify old token/test fails after revoke.
- Capture screenshots for token-created/config-visible and revoked/failure states.

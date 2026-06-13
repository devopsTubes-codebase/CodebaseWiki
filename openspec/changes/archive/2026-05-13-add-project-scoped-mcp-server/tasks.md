## 1. Token model and storage

- [x] 1.1 Add MCP token types and contracts.
- [x] 1.2 Extend Postgres schema with project-scoped `mcp_tokens`.
- [x] 1.3 Implement token creation with plaintext returned once and hashed storage.
- [x] 1.4 Implement token verification, last-used update, listing, and revoke.
- [x] 1.5 Add tests for valid, invalid, revoked, and project-mismatch token behavior.

## 2. MCP tool service

- [x] 2.1 Add a read-only MCP tool registry/service.
- [x] 2.2 Implement `search_docs` using existing search/retrieval logic.
- [x] 2.3 Implement stateless `ask_wiki` without creating web chat history.
- [x] 2.4 Implement `get_page` from persisted generated docs.
- [x] 2.5 Implement `get_source_evidence` from persisted generated source files.
- [x] 2.6 Add service tests for all tools and error states.

## 3. MCP and token API routes

- [x] 3.1 Add MCP HTTP endpoint.
- [x] 3.2 Add project-scoped token list/create/revoke routes.
- [x] 3.3 Add test-connection route or adapter path for the docs UI.
- [x] 3.4 Ensure all routes enforce project ownership and token scope.
- [x] 3.5 Add route-level tests where existing tooling supports them.

## 4. Connect MCP UI

- [x] 4.1 Add `Connect MCP` entry point in the docs reader.
- [x] 4.2 Build modal with explanation, tool list, and active token list.
- [x] 4.3 Add create-token flow with one-time plaintext display.
- [x] 4.4 Add copyable MCP config with endpoint, token, and projectId.
- [x] 4.5 Add test connection action and result states.
- [x] 4.6 Add revoke action and revoked-token state handling.

## 5. Browser QA and validation

- [x] 5.1 Add browser QA for opening Connect MCP modal.
- [x] 5.2 Verify token creation and config rendering.
- [x] 5.3 Verify test connection success.
- [x] 5.4 Verify revoke causes old token/test to fail.
- [x] 5.5 Capture screenshots for config-visible and revoked/failure states.
- [x] 5.6 Run full tests, lint, build, and OpenSpec validation.

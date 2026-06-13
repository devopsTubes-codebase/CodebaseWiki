## 1. Backend output alignment

- [x] 1.1 Add Gemini embedding configuration helpers
- [x] 1.2 Implement Gemini embedding generator
- [x] 1.3 Wire regenerate indexing to Gemini embeddings
- [x] 1.4 Emit hierarchy and Gemini indexing metadata in job logs
- [x] 1.5 Emit feature docs as `Features` submenu in primary sidebar

## 2. Frontend output alignment

- [x] 2.1 Render persisted docs in the docs reader page
- [x] 2.2 Preserve generated sidebar hierarchy including submenu children
- [x] 2.3 Update generating page output preview to show `Features` as submenu
- [x] 2.4 Polish terminal status copy for completed/failed jobs

## 3. Verification

- [x] 3.1 Run focused API tests for docs hierarchy, Gemini embeddings, and config
- [x] 3.2 Run web build after backend/UI alignment
- [x] 3.3 Run real repository analysis and confirm Gemini indexing log succeeds
- [x] 3.4 Smoke test real docs reader output
- [x] 3.5 Run OpenSpec validation

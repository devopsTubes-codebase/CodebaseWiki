## 1. Job log data model and storage

- [x] 1.1 Add `job_logs` PostgreSQL schema bootstrap with project foreign key and `(project_id, id)` index
- [x] 1.2 Define job log types for level, phase, metadata, and retrieval response
- [x] 1.3 Implement PostgreSQL job log store with append and list-after-id operations
- [x] 1.4 Ensure log messages and metadata are sanitized before persistence

## 2. Backend log writer service

- [x] 2.1 Add `JobLogger` service with `info`, `warn`, `error`, and `debug` helpers
- [x] 2.2 Add phase-specific helpers for cloning, extracting, scanning, enriching, generating, indexing, cleanup, completed, and failed
- [x] 2.3 Make log writes non-blocking where safe, but deterministic in tests
- [x] 2.4 Add failure logging that records safe error code/category without secrets

## 3. Emit logs from backend processing flow

- [x] 3.1 Emit logs when project processing is accepted/queued
- [x] 3.2 Emit logs during GitHub clone or ZIP extraction
- [x] 3.3 Emit logs after deterministic scan with file/config/dependency counts
- [x] 3.4 Emit logs for enrichment start, success, invalid response fallback, timeout fallback, and failure fallback
- [x] 3.5 Emit logs for docs generation start and completed page/sidebar counts
- [x] 3.6 Emit logs for vector indexing start and completed chunk count
- [x] 3.7 Emit logs for cleanup start/completion
- [x] 3.8 Emit terminal completed/failed logs

## 4. HTTP API routes

- [x] 4.1 Add `GET /api/projects/[projectId]/logs` with ownership checks
- [x] 4.2 Support `afterId` and `limit` query parameters
- [x] 4.3 Add `GET /api/projects/[projectId]/logs/stream` SSE endpoint if feasible
- [x] 4.4 Ensure unauthorized users cannot retrieve or stream logs for projects they do not own

## 5. Frontend contract readiness

- [x] 5.1 Define terminal log response shape for UI consumption
- [x] 5.2 Ensure logs are ordered and can be appended incrementally in UI
- [x] 5.3 Include enough phase metadata for terminal colors/icons later without requiring UI changes

## 6. Verification

- [x] 6.1 Add unit tests for job log storage and sanitization
- [x] 6.2 Add service-layer E2E assertions for emitted phases in successful GitHub processing
- [x] 6.3 Add failure-path E2E assertions for safe failed logs
- [x] 6.4 Run `npm test --workspace=apps/api`
- [x] 6.5 Run `npm run typecheck --workspace=apps/api`
- [x] 6.6 Run `npm run lint --workspace=apps/api`
- [x] 6.7 Run `npm run build --workspace=apps/web`
- [x] 6.8 Run `npx openspec validate add-backend-job-terminal-logs --strict`

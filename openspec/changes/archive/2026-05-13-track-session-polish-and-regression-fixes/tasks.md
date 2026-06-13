## 1. Product and architecture docs alignment

- [x] 1.1 Update PRD auth language to email-only auth instead of Google/GitHub OAuth.
- [x] 1.2 Update C4 architecture/auth references to match email-only auth behavior.
- [x] 1.3 Regenerate and repair the draw.io C4 output until it loads cleanly and uses correct relation labeling.

## 2. Docs reader UX polish

- [x] 2.1 Change the docs reader profile control into an upward-opening dropdown.
- [x] 2.2 Add in-doc project actions for Switch Project and New Analysis from the docs reader sidebar.
- [x] 2.3 Improve generated markdown rendering so ordered lists and inline bold formatting display cleanly.

## 3. Multi-project dashboard and project lifecycle fixes

- [x] 3.1 Switch the dashboard project list from mock data to real `GET /api/projects` data.
- [x] 3.2 Make repeated imports of the same GitHub repository reuse/regenerate the canonical project instead of creating a new one.
- [x] 3.3 Clean historical duplicate GitHub projects during backend listing so only one project remains visible.

## 4. AI documentation generation quality improvements

- [x] 4.1 Update the prompt builder to emphasize project context, operational reality, and developer onboarding while keeping code-level guidance strong.
- [x] 4.2 Update compact context generation to include project signals, operational signals, and developer onboarding signals.
- [x] 4.3 Keep the generation strategy docs-aware but code-verified rather than docs-only or code-only.

## 5. Source evidence and retrieval regression fixes

- [x] 5.1 Preserve structured `[SOURCE_EVIDENCE]` during agent-enriched compact context grounding.
- [x] 5.2 Return `sourceFiles` from in-memory docs retrieval so no-DB/stub flows preserve previews.
- [x] 5.3 Verify generated docs source preview regression coverage with focused API tests and diagnostics.

## 6. Verification and tracking sync

- [x] 6.1 Run focused API tests for prompt builder, compact context, docs storage, and source evidence pipeline changes.
- [x] 6.2 Run focused web tests/diagnostics for docs markdown rendering and dashboard/project UI updates.
- [x] 6.3 Record this session bundle in OpenSpec with all completed tasks checked.

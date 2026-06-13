# docs-interaction Specification

## Purpose
TBD - created by archiving change wire-docs-search-and-ask-wiki. Update Purpose after archive.
## Requirements
### Requirement: Search Docs returns UI-ready grounded results
The system SHALL allow project owners to search indexed generated docs from the docs reader header.

#### Scenario: Owner searches indexed docs
- **WHEN** an authenticated project owner submits a search query
- **THEN** the system retrieves project-scoped indexed docs context
- **AND** returns ranked results with title, excerpt, source type, relevance score, and docs page link when available
- **AND** results never include data from another project

#### Scenario: Search has no indexed context
- **WHEN** no indexed chunks are available for the project
- **THEN** the system returns an empty result state that the UI can explain as requiring regeneration/indexing

### Requirement: Ask Wiki answers from retrieved project context
The system SHALL provide a right-side Ask Wiki chat panel that answers questions using only retrieved project documentation context.

#### Scenario: Ask Wiki answers with citations
- **WHEN** a project owner asks a question and relevant indexed context exists
- **THEN** the system persists the user message
- **AND** retrieves bounded context from the project vector index
- **AND** generates an assistant answer grounded only in that context
- **AND** persists the assistant answer with citations to retrieved sources
- **AND** returns messages and citations to the UI

#### Scenario: Ask Wiki formats answers for scanning
- **WHEN** Ask Wiki generates an assistant answer
- **THEN** the answer starts with a short direct summary
- **AND** supporting details are formatted as concise bullet points when multiple facts are present
- **AND** endpoints, file paths, symbols, and commands use inline code formatting
- **AND** citations render as a subtle source row rather than prominent action buttons

#### Scenario: Ask Wiki cannot find enough context
- **WHEN** retrieved context is empty or irrelevant
- **THEN** the assistant answer states that there is not enough indexed documentation to answer
- **AND** the answer does not invent unsupported files, APIs, or behavior

### Requirement: Ask Wiki persists project chat history
The system SHALL persist Ask Wiki chat sessions and messages per project and user.

#### Scenario: User returns to a project docs page
- **WHEN** an authenticated project owner opens docs for a project with previous Ask Wiki sessions
- **THEN** the system can list that user's chat sessions for the project
- **AND** the UI can restore the latest session messages

#### Scenario: User starts a new chat
- **WHEN** the user selects New chat
- **THEN** the system creates an empty session scoped to that project and user

#### Scenario: User deletes a chat session
- **WHEN** the user deletes a session they own
- **THEN** the session and its messages are removed
- **AND** other users' sessions are unaffected

### Requirement: Search and Ask Wiki enforce access boundaries
The system SHALL enforce project ownership and authentication on all search and Ask Wiki endpoints.

#### Scenario: Non-owner requests search or chat
- **WHEN** a user who does not own the project requests search, sessions, messages, or Ask Wiki answers
- **THEN** the system rejects the request without returning project data

#### Scenario: Request is unauthenticated
- **WHEN** a request has no valid session
- **THEN** the system returns an authentication error

### Requirement: Search Docs presents scan-friendly results
The system SHALL render Search Docs results in a concise, readable modal optimized for scanning.

#### Scenario: Result excerpt highlights query context
- **WHEN** a project owner searches docs with a non-empty query
- **THEN** each result shows a short excerpt centered near a matching query term when possible
- **AND** matching terms are visually highlighted without disrupting readability
- **AND** endpoints, file paths, or symbols remain legible in the excerpt

#### Scenario: Results contain duplicate pages
- **WHEN** retrieval returns multiple results for the same docs page
- **THEN** the Search Docs UI shows a single primary result for that page
- **AND** the result title and link prefer the docs page title over raw vector references

#### Scenario: Search returns no matches
- **WHEN** no indexed docs match the query
- **THEN** the modal shows an empty state explaining that no indexed docs matched
- **AND** suggests regenerating docs or trying a file/path/API term

### Requirement: Docs lifecycle has repeatable E2E QA
The system SHALL provide a repeatable browser QA flow covering generated docs, Search Docs, Ask Wiki, and history restore.

#### Scenario: QA verifies docs reader and Search Docs
- **WHEN** the QA workflow signs in as a project owner and opens a generated docs project
- **THEN** it verifies canonical docs navigation is visible
- **AND** opens Search Docs
- **AND** searches for endpoint-related terms
- **AND** verifies a polished search result is visible
- **AND** clicks a result to navigate to a docs page

#### Scenario: QA verifies Ask Wiki and history restore
- **WHEN** the QA workflow asks Ask Wiki what endpoints the project exposes
- **THEN** it verifies the answer contains endpoint facts in a structured format
- **AND** verifies a subtle `Sources` row is present
- **AND** refreshes or reopens the docs page
- **AND** verifies the latest chat session/history is restored

#### Scenario: QA captures visual evidence
- **WHEN** the browser QA workflow runs
- **THEN** it saves screenshots for Search Docs and Ask Wiki states
- **AND** the screenshot paths are reported in the validation output


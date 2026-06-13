## ADDED Requirements

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

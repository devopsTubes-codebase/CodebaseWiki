## ADDED Requirements

### Requirement: Project owners can create scoped MCP tokens
The system SHALL let a project owner create and revoke read-only MCP tokens scoped to a single project.

#### Scenario: Owner creates token
- **WHEN** an authenticated project owner creates an MCP token for a project
- **THEN** the system returns the plaintext token exactly once
- **AND** stores only a hash and display prefix
- **AND** scopes the token to that project and read-only docs access

#### Scenario: Owner revokes token
- **WHEN** an authenticated project owner revokes an active MCP token
- **THEN** subsequent MCP requests with that token are rejected
- **AND** existing generated docs and chat history are unchanged

#### Scenario: Non-owner manages token
- **WHEN** a user who does not own the project lists, creates, or revokes MCP tokens
- **THEN** the system rejects the request without returning token or project data

### Requirement: MCP endpoint exposes read-only project wiki tools
The system SHALL expose a project-scoped MCP endpoint for coding agents.

#### Scenario: Valid token calls search docs
- **WHEN** a coding agent calls `search_docs` with a valid project-scoped token and matching `projectId`
- **THEN** the system returns ranked generated docs snippets for the query
- **AND** includes page title, slug, excerpt, source, and relevance metadata

#### Scenario: Valid token calls ask wiki
- **WHEN** a coding agent calls `ask_wiki` with a valid project-scoped token and matching `projectId`
- **THEN** the system returns a grounded answer with citations
- **AND** does not create or modify web chat sessions or messages by default

#### Scenario: Valid token calls get page
- **WHEN** a coding agent calls `get_page` with a valid project-scoped token, matching `projectId`, and existing page slug
- **THEN** the system returns the generated docs page markdown and metadata

#### Scenario: Valid token calls get source evidence
- **WHEN** a coding agent calls `get_source_evidence` with a valid project-scoped token and matching `projectId`
- **THEN** the system returns bounded source evidence for the project or requested page
- **AND** the output does not include detected secrets or unbounded raw repository data

#### Scenario: Token project mismatch
- **WHEN** a coding agent uses a valid token for one project to request another project
- **THEN** the system rejects the request without returning data from either project

### Requirement: Docs UI provides Connect MCP flow
The system SHALL provide a Connect MCP modal in the docs reader.

#### Scenario: Owner opens Connect MCP
- **WHEN** a project owner opens the docs reader and selects Connect MCP
- **THEN** the modal explains how to use the project wiki in coding agents
- **AND** lists available read-only MCP tools
- **AND** shows active token prefixes and revoke actions

#### Scenario: Owner copies MCP config
- **WHEN** a project owner creates a token
- **THEN** the modal displays copyable MCP config containing endpoint URL, projectId, and the one-time plaintext token
- **AND** warns that the token should be treated like a password

#### Scenario: Owner tests connection
- **WHEN** a project owner runs Test connection from the modal
- **THEN** the system verifies the token can call a read-only docs tool for the scoped project
- **AND** shows success or failure state in the modal

#### Scenario: Browser QA captures MCP flow
- **WHEN** the browser QA workflow runs
- **THEN** it creates a token, verifies config rendering, tests connection, revokes the token, verifies failure for the revoked token, and saves screenshots

## ADDED Requirements

### Requirement: Generated docs use a primary sidebar with feature submenu
The system SHALL represent generated feature pages as children of a `Features` item in the primary sidebar.

#### Scenario: Canonical docs and features are generated
- **WHEN** documentation generation produces Overview, Architecture, API Reference, Security, and feature pages
- **THEN** the sidebar includes Overview, Architecture, API Reference, Security, and Features
- **AND** feature pages appear as children of Features
- **AND** `secondarySidebar` is not required for new generations

### Requirement: Semantic indexing uses Gemini embeddings
The system SHALL use Gemini for semantic embeddings while retaining the configured AI provider for documentation generation.

#### Scenario: Project indexing runs after docs generation
- **WHEN** generated docs are indexed
- **THEN** embedding requests use the Gemini embedding model and API key
- **AND** job logs identify Gemini as the embedding provider
- **AND** the index log includes the generated vector chunk count

### Requirement: Docs reader renders persisted generated docs
The system SHALL render persisted generated documentation for the authenticated project owner.

#### Scenario: Owner opens a generated docs page
- **WHEN** the project owner opens `/docs/{projectId}/{slug}`
- **THEN** the reader renders the generated page content
- **AND** the reader renders the generated sidebar hierarchy including submenu children
- **AND** previous and next navigation follow the flattened sidebar order

### Requirement: Terminal state copy matches job terminal state
The system SHALL derive terminal connection copy from completed or failed job logs.

#### Scenario: Job has completed
- **WHEN** completed logs are visible in the generating page
- **THEN** the page indicates terminal logs are complete
- **AND** the page does not say the terminal is still polling

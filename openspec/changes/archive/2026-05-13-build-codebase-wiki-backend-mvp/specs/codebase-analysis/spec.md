## ADDED Requirements

### Requirement: Codebase analysis uses hybrid approach
The system SHALL use a two-phase analysis approach: deterministic scanning for baseline data, followed by agent enrichment for intelligent inference.

#### Scenario: Two-phase analysis execution
- **WHEN** source code is available in temporary storage
- **THEN** the system executes deterministic scan first, then spawns agent enrichment for intelligent analysis

### Requirement: Deterministic scan provides baseline data
The system SHALL perform fast, deterministic scanning to extract file tree, config files, and dependencies without AI inference.

#### Scenario: Deterministic baseline scan
- **WHEN** deterministic scan runs
- **THEN** the system returns:
  - File tree structure (with excluded paths filtered)
  - Detected config files (package.json, tsconfig.json, requirements.txt, go.mod, etc.)
  - Extracted dependencies from config files
  - File count and folder structure metadata

### Requirement: Codebase analysis applies standard excludes
The system SHALL ignore standard non-essential folders and artifacts during analysis, including large build/cache directories where appropriate.

#### Scenario: Skip excluded folders during analysis
- **WHEN** the analyzer encounters excluded directories such as `node_modules`, `.git`, `.next`, `dist`, `build`, or `coverage`
- **THEN** the system omits them from analysis input

### Requirement: Agent enrichment provides intelligent inference
The system SHALL spawn an enrichment agent to interpret raw scan data and generate intelligent analysis for documentation generation.

#### Scenario: Agent enrichment from raw scan
- **WHEN** deterministic scan completes
- **THEN** the system spawns enrichment agent with raw scan data
- **AND** agent returns:
  - Inferred tech stack from config files and file extensions
  - Prioritized important files for documentation focus
  - Compact context summary (max 2000 tokens for AI doc generation)
  - Suggested documentation structure based on project type

### Requirement: Agent enrichment uses structured prompt
The system SHALL provide enrichment agent with structured prompt following [CONTEXT] + [GOAL] + [DOWNSTREAM] + [REQUEST] pattern.

#### Scenario: Structured agent prompt
- **WHEN** spawning enrichment agent
- **THEN** the prompt includes:
  - [CONTEXT]: Raw scan results and project metadata
  - [GOAL]: Enrich raw scan with intelligent analysis
  - [DOWNSTREAM]: Results feed into AI doc generation
  - [REQUEST]: Specific inference tasks (tech stack, prioritization, compact context, doc structure)

### Requirement: Analysis provides fallback on agent failure
The system SHALL return raw scan data if agent enrichment fails, ensuring analysis always completes.

#### Scenario: Agent enrichment failure fallback
- **WHEN** agent enrichment fails or times out
- **THEN** the system returns raw scan data with default tech stack inference
- **AND** logs agent failure for monitoring

### Requirement: Analysis builds compact AI context
The system SHALL transform analyzed codebase data into a compact context suitable for AI generation without requiring the full raw source to be sent.

#### Scenario: Build summarized context for AI
- **WHEN** analysis is complete (deterministic + agent enrichment)
- **THEN** the system produces a summarized context payload containing only relevant structure, dependency, and file insights

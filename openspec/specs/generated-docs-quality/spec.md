# generated-docs-quality Specification

## Purpose
TBD - created by archiving change track-session-polish-and-regression-fixes. Update Purpose after archive.
## Requirements
### Requirement: Generated docs preserve source evidence previews

Generated documentation retrieval MUST preserve the selected source file previews that were extracted during generation so the docs reader can show source evidence for cited files.

#### Scenario: Retrieved docs include persisted source files

- **WHEN** generated docs are saved with `sourceFiles`
- **AND** the docs are retrieved through the active storage/retrieval path
- **THEN** the returned documentation includes those `sourceFiles`
- **AND** the docs reader can build a non-empty source preview when cited files are present in page content

### Requirement: Generated docs context captures project and operational signals

The compact generation context MUST include project-level, operational, onboarding, and source-grounded evidence signals so downstream docs generation can explain the system beyond raw file inventory.

#### Scenario: Compact context includes richer project framing

- **WHEN** codebase analysis produces compact context for a scanned repository
- **THEN** the context includes project signals
- **AND** operational signals
- **AND** developer onboarding signals
- **AND** structured source evidence for downstream grounding

### Requirement: Generated docs prompts are docs-aware but code-verified

The AI documentation prompt MUST use repository docs as intent signals while requiring technical and operational claims to be verified against code, configuration, scripts, dependencies, or runtime evidence.

#### Scenario: Prompt emphasizes project context without losing developer utility

- **WHEN** the documentation generator builds prompts for Overview, Architecture, API Reference, and Security pages
- **THEN** the prompt asks for project purpose, user/operator workflows, and runtime reality
- **AND** it remains useful for developers by calling out entrypoints, key modules, change surfaces, setup commands, and debugging touchpoints


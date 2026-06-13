# project-intake Specification

## Purpose
TBD - created by archiving change build-codebase-wiki-backend-mvp. Update Purpose after archive.
## Requirements
### Requirement: Project can be created before source ingestion
The system SHALL allow an authenticated user to create a project record before or alongside source ingestion.

#### Scenario: Create project for documentation generation
- **WHEN** an authenticated user submits project metadata
- **THEN** the system creates a project record that can later receive ZIP or GitHub-based source input

### Requirement: Source input supports ZIP and GitHub URL
The system SHALL accept project source input through ZIP upload or GitHub repository URL.

#### Scenario: ZIP upload source input
- **WHEN** a user uploads a valid ZIP file up to the configured size limit
- **THEN** the system accepts the ZIP as a source ingestion job input

#### Scenario: GitHub repository source input
- **WHEN** a user submits a valid GitHub repository URL
- **THEN** the system accepts the repository URL as a source ingestion job input


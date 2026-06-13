# source-ingestion Specification

## Purpose
TBD - created by archiving change build-codebase-wiki-backend-mvp. Update Purpose after archive.
## Requirements
### Requirement: Source ingestion supports extract or clone flow
The system SHALL ingest source code by extracting ZIP uploads or cloning GitHub repositories into temporary source storage.

#### Scenario: Extract uploaded ZIP
- **WHEN** a valid ZIP upload is accepted
- **THEN** the system extracts it into temporary source storage for analysis

#### Scenario: Clone GitHub repository
- **WHEN** a valid GitHub repository URL is accepted
- **THEN** the system clones the repository into temporary source storage for analysis

### Requirement: Temporary source storage is ephemeral
The system SHALL store ingested source code only in temporary storage and must clean it up after processing or fallback TTL expiry.

#### Scenario: Cleanup after successful job
- **WHEN** a source ingestion and documentation job completes successfully
- **THEN** the system removes temporary source artifacts from temporary storage

#### Scenario: Cleanup after failed job
- **WHEN** a source ingestion or analysis job fails
- **THEN** the system schedules or performs cleanup of temporary source artifacts


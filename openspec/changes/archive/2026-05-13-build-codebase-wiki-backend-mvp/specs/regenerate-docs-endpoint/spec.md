## ADDED Requirements

### Requirement: Backend regenerate endpoint
The system SHALL provide a backend endpoint that triggers documentation regeneration for an existing project.

#### Scenario: Regenerate docs for an existing project
- **WHEN** a valid regenerate request is sent for an existing project
- **THEN** the system starts a new ingestion/analysis/generation job for that project

### Requirement: GitHub Actions compatible trigger flow
The system SHALL support a regenerate request flow that can be invoked from a GitHub Actions workflow.

#### Scenario: GitHub Actions calls regenerate endpoint
- **WHEN** a configured GitHub Actions workflow invokes the regenerate endpoint
- **THEN** the system accepts the request and starts a backend regeneration job if authorization and project configuration are valid

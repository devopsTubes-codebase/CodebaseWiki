## ADDED Requirements

### Requirement: Backend authentication session ownership
The system SHALL provide backend authentication and session handling so that projects, PAT credentials, generated documentation, and regenerate actions are always associated with an authenticated user.

#### Scenario: Authenticated user creates a project
- **WHEN** an authenticated user calls the create project backend flow
- **THEN** the system records the new project as owned by that user

### Requirement: Session-aware backend access
The system SHALL reject protected backend operations when the user session is missing or invalid.

#### Scenario: Unauthenticated user accesses protected backend flow
- **WHEN** a request without a valid session is sent to a protected backend endpoint
- **THEN** the system returns an authorization error and does not process the request

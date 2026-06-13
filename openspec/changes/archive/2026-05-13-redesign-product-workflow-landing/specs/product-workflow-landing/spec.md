## ADDED Requirements

### Requirement: Landing page communicates the real Codebase Wiki workflow
The system SHALL present the landing page around the actual product workflow from GitHub repository to generated documentation.

#### Scenario: Visitor opens landing page
- **WHEN** a visitor opens the landing page
- **THEN** the hero explains that Codebase Wiki turns a GitHub repository into living documentation
- **AND** the page shows the workflow from import to analysis to generated wiki

### Requirement: Landing page keeps GitHub import as primary CTA
The system SHALL keep GitHub repository import visible as the primary landing page action.

#### Scenario: Visitor wants to start a project
- **WHEN** the visitor views the hero section
- **THEN** the GitHub repository URL input and submit button are visible above the fold

### Requirement: Landing page previews terminal job logs
The system SHALL show a product-specific terminal preview using backend job log phases.

#### Scenario: Visitor reviews analysis transparency
- **WHEN** the visitor views the workflow preview
- **THEN** they see terminal-style phases such as queued, cloning, scanning, enriching, generating, indexing, and completed

### Requirement: Landing page previews generated docs structure
The system SHALL preview the generated documentation structure used by the product.

#### Scenario: Visitor reviews generated output
- **WHEN** the visitor views the docs preview section
- **THEN** the preview includes Overview, Architecture, API Reference, Security, and Features
- **AND** Features appears as a submenu group instead of a separate secondary sidebar
- **AND** the preview implies a GitBook-like documentation reader

### Requirement: Landing copy matches implemented capabilities
The system SHALL only advertise capabilities currently implemented or wired in the product.

#### Scenario: Visitor reads capability cards
- **WHEN** the visitor reads the capability grid
- **THEN** the cards reference implemented capabilities such as GitHub import, AI analysis, live job logs, docs generation, semantic indexing, and regeneration

# ui-components Specification

## Purpose
TBD - created by archiving change implement-landing-page. Update Purpose after archive.
## Requirements
### Requirement: Button component
The system SHALL provide a Button component with:
- Primary variant with gradient background (#6366f1 → #a855f7)
- Secondary variant with border and transparent background
- Proper padding and border-radius (12px)
- Shadow effect for primary variant

#### Scenario: Primary button renders
- **WHEN** Button component renders with variant="primary"
- **THEN** button displays with gradient background and shadow

#### Scenario: Secondary button renders
- **WHEN** Button component renders with variant="secondary"
- **THEN** button displays with border and transparent background

### Requirement: Card component
The system SHALL provide a Card component with:
- Semi-transparent background (rgba(24,24,27,0.4))
- Border with opacity (rgba(255,255,255,0.1))
- Border-radius (16px)
- Padding (24-33px)

#### Scenario: Card renders correctly
- **WHEN** Card component renders with children
- **THEN** card displays with proper background, border, and padding

### Requirement: Header component
The system SHALL provide a Header component with:
- Logo with icon and "Codebase Wiki" text
- Navigation links: "Features", "Documentation"
- Auth buttons: "Log in", "Get Started"

#### Scenario: Header renders with navigation
- **WHEN** Header component renders
- **THEN** header displays logo, navigation links, and auth buttons

### Requirement: Footer component
The system SHALL provide a Footer component with:
- Logo and "Codebase Wiki" text
- Links: "Documentation", "API", "GitHub", "Terms"
- Dark background (#050507)

#### Scenario: Footer renders with links
- **WHEN** Footer component renders
- **THEN** footer displays logo and all navigation links


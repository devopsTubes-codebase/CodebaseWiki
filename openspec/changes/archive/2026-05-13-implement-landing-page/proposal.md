## Why

Codebase Wiki needs a public-facing landing page to serve as the entry point for users. The current `apps/web` only has a placeholder homepage. A polished landing page is essential for:
- First impression for hackathon judges and demo
- Clear communication of value proposition
- Call-to-action for user sign-up and project creation
- Professional appearance matching the design system

## What Changes

- Implement responsive landing page in `apps/web/app/page.tsx`
- Add header component with logo, navigation, and auth buttons
- Add hero section with gradient text and CTA buttons
- Add system capabilities section with bento grid layout
- Add feature cards (AST-Driven Analysis, Dependency Graphs, API Extraction, Zero Config Output)
- Add footer with links and branding
- Dark theme with purple/indigo gradient accents
- Inter font family for typography

## Capabilities

### New Capabilities

- `landing-page`: Full landing page implementation with header, hero, features, and footer sections
- `ui-components`: Reusable UI components (Button, Card, Header, Footer) for the landing page

### Modified Capabilities

- None (this is a new frontend implementation)

## Impact

- Affected code: `apps/web/app/page.tsx`, `apps/web/components/` (new components)
- Affected APIs: None (static page)
- Dependencies: None new (uses existing Tailwind CSS)
- Systems: Frontend only, no backend changes

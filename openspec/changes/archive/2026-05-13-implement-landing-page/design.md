## Context

Codebase Wiki is a hackathon project that needs a polished landing page for demo and user onboarding. The current `apps/web` has only a placeholder homepage. A Figma design has been created with:
- Dark theme (#080f17 background)
- Purple/indigo gradient accents (#6366f1 → #a855f7)
- Inter font family
- Bento grid layout for features
- Responsive design for 1280px width

## Goals / Non-Goals

**Goals:**
- Implement pixel-perfect landing page matching Figma design
- Create reusable UI components (Button, Card, Header, Footer)
- Ensure responsive layout for desktop (1280px)
- Dark theme with gradient accents
- Professional appearance for hackathon demo

**Non-Goals:**
- Mobile responsiveness (not in Figma)
- Animations or interactions (static page)
- Backend integration (landing page is static)
- Authentication flow (separate task)

## Decisions

### 1. Component Structure
**Decision**: Create separate components for Header, Hero, Features, Footer
**Rationale**: Better maintainability, reusability, and testing

### 2. Styling Approach
**Decision**: Use Tailwind CSS with custom gradient utilities
**Rationale**: Already configured in project, matches Figma design system

### 3. Font Loading
**Decision**: Use Next.js font optimization with Inter
**Rationale**: Better performance, no layout shift

### 4. Image Assets
**Decision**: Use placeholder gradients for 3D illustrations
**Rationale**: Figma assets not available as production files

## Risks / Trade-offs

**Risk**: Figma design uses absolute positioning for complex layouts
**Mitigation**: Use CSS Grid/Flexbox for responsive bento grid

**Risk**: Gradient text may not render consistently across browsers
**Proposed mitigation**: Use background-clip: text with fallback

**Risk**: 3D illustrations from Figma not available as assets
**Proposed mitigation**: Use gradient placeholders or simple SVG icons

## Migration Plan

1. Create component structure in `apps/web/components/`
2. Implement Header with logo, nav, and auth buttons
3. Implement Hero section with gradient text and CTAs
4. Implement Features section with bento grid
5. Implement Footer with links
6. Assemble in `apps/web/app/page.tsx`
7. Test responsive layout

## Open Questions

- Should we use the white logo generated earlier for the header?
- Are there specific 3D illustration assets available?
- Should "Log in" button trigger NextAuth flow?

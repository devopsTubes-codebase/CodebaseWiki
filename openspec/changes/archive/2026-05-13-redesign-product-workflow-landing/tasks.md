## 1. Landing hero redesign

- [x] 1.1 Rewrite hero headline/copy to describe GitHub repo to living docs workflow
- [x] 1.2 Keep GitHub repository import form as primary CTA above the fold
- [x] 1.3 Add all-in-one workflow preview card for Import → Analyze → Publish Wiki
- [x] 1.4 Preserve responsive layout and dark visual system

## 2. Product workflow sections

- [x] 2.1 Add live analysis terminal preview with backend job log phases
- [x] 2.2 Add generated docs preview with canonical primary pages and Features submenu
- [x] 2.3 Replace generic capability cards with Codebase Wiki-specific capabilities
- [x] 2.4 Ensure copy references actual implemented capabilities only

## 3. Interaction and accessibility

- [x] 3.1 Ensure landing import form remains keyboard accessible
- [x] 3.2 Ensure headings and landmarks remain semantic
- [x] 3.3 Ensure CTA labels clearly describe GitHub import behavior

## 4. Verification

- [x] 4.1 Run UI log view utility test if affected
- [x] 4.2 Run `npm run build --workspace=apps/web`
- [x] 4.3 Browser smoke-check redesigned landing page
- [x] 4.4 Run `npx openspec validate redesign-product-workflow-landing --strict`

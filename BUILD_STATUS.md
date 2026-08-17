# Build Status

## Current phase

`Blocked after Phase 3 — landing page complete; authenticated shell context unavailable`

## Repository

- Framework: Next.js App Router under `frontend/`
- Language: TypeScript
- Package manager: npm
- Styling: Tailwind CSS plus CSS variables
- Existing app preserved: Not applicable; repository began as a handoff-only repository
- Branch: `codex/figma-production-ui`

## Figma discovery

- Root accessible: Yes
- Inventory created: Yes
- Production route count: 28 responsive routes
- Responsive variants discovered: 1728 desktop, 1024 tablet, 390 mobile plus intermediate responsive requirements
- Canonical landing node: `2280:14926`

## Routes

- Completed: `/`
- In progress: None
- Not started: 27 routes (see `FIGMA_INVENTORY.md`)

## Shared components

- Global Figma tokens and responsive container
- Exact Manrope, Public Sans and Sue Ellen Francisco font configuration
- Brand primitive and shared button/focus treatments
- Responsive public header and native mobile navigation
- Public footer, outcomes, category and mentor-card sections

## Known visual mismatches

- Landing rendering still needs the real-browser width matrix because no browser backend is connected in this session.
- Remaining production screens cannot be implemented faithfully until Figma MCP access resumes; the connected Starter plan has reached its tool-call limit.

## Missing/unavailable assets or fonts

- Landing assets are complete and stored locally; no temporary Figma URLs are used.
- Exact Figma fonts are configured through Next.js font loading.

## Deferred external integrations

- Payment processing and server-side verification
- Authentication and persistent account creation
- Live chat/community transport
- Video meeting provider
- Email/referral delivery and analytics

## Quality gates

- Browser console: Pending; browser backend unavailable
- Accessibility pass: Semantic/keyboard code review complete; rendered pass pending
- Responsive pass: CSS implemented at 1440, 1280, 1024, 768, 390 and 360 anchors; rendered pass pending
- Lint: Pass
- Typecheck: Pass
- Tests: Not run / not present
- Production build: Pass

## Next action

Restore/upgrade Figma MCP access, then retrieve `741:6834`, `741:6263` and `741:6129` and implement the shared student/mentor shell without guessing.

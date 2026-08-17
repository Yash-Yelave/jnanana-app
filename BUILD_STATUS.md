# Build Status

## Current phase

`Phase 4 — exported Figma boards available; authenticated shell and student home complete`

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

- Completed: `/`, `/dashboard/home`
- In progress: None
- Not started: 26 routes (see `FIGMA_INVENTORY.md`)

## Shared components

- Global Figma tokens and responsive container
- Exact Manrope, Public Sans and Sue Ellen Francisco font configuration
- Brand primitive and shared button/focus treatments
- Responsive public header and native mobile navigation
- Public footer, outcomes, category and mentor-card sections
- Responsive authenticated sidebar, top bar and mobile navigation
- Shared course, mentor, schedule and content-panel patterns

## Known visual mismatches

- Landing rendering still needs the real-browser width matrix because no browser backend is connected in this session.
- Real-browser visual/console inspection remains unavailable in this session; exported references are being used for implementation and static comparison.

## Missing/unavailable assets or fonts

- Landing assets are complete and stored locally; no temporary Figma URLs are used.
- Exact Figma fonts are configured through Next.js font loading.
- Remaining application assets will be extracted from the user-provided full-resolution board exports as each route is implemented.

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

Implement login, student onboarding, mentor onboarding and waiting routes from the extracted full-resolution references.

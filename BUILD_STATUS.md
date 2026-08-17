# Build Status

## Current phase

`Phase 2 — project foundation complete; landing-page implementation in progress`

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

See `FIGMA_INVENTORY.md`. All routes are currently not started.

## Shared components

- Global Figma tokens and responsive container
- Exact Manrope, Public Sans and Sue Ellen Francisco font configuration
- Brand primitive and shared button/focus treatments

## Known visual mismatches

- None recorded yet; implementation has not started.

## Missing/unavailable assets or fonts

- Landing image extraction is in progress; 14 exact image/composite assets are local.
- Exact Figma fonts are configured through Next.js font loading.

## Deferred external integrations

- Payment processing and server-side verification
- Authentication and persistent account creation
- Live chat/community transport
- Video meeting provider
- Email/referral delivery and analytics

## Quality gates

- Browser console: Not checked
- Accessibility pass: Not started
- Responsive pass: Not started
- Lint: Not run
- Typecheck: Not run
- Tests: Not run / not present
- Production build: Not run

## Next action

Implement and visually validate the responsive public landing page.

# Master Prompt — Build the Entire Figma Website

You are responsible for implementing the complete production website represented by this Figma design:

https://www.figma.com/design/57IVmUa7w3XC0qaO4rjvDw/Production-UI?node-id=0-1&t=eEpFCmbFhnLBULXZ-1

Figma file key:

```text
57IVmUa7w3XC0qaO4rjvDw
```

Entry/root node:

```text
0:1
```

The Figma integration is already installed and available in this Codex environment.

## Read project instructions first

Before making changes, read these files in the repository root:

- `AGENTS.md`
- `DESIGN_SOURCE.md`
- `BUILD_WORKFLOW.md`
- `QA_ACCEPTANCE.md`
- `FIGMA_INVENTORY_TEMPLATE.md`
- `BUILD_STATUS_TEMPLATE.md`

Treat `AGENTS.md` as the standing implementation rules for the entire task.

## Mission

Build the **entire production website** represented in the Figma file, not just one screenshot or the homepage.

Work autonomously from discovery through implementation and final QA.

Do not stop after creating a plan.

Do not ask me for individual Figma frame links unless the installed Figma integration genuinely cannot discover or access the relevant nodes.

Do not ask for approval after each page. Continue through the full site.

## Step 1 — Inspect the repository

First inspect the repository and determine:

- whether an application already exists
- framework
- package manager
- routing
- styling approach
- components
- assets
- fonts
- dependencies
- existing scripts

If there is an existing application, preserve useful architecture and conventions.

If the repository is effectively empty, initialize a production application using Next.js App Router, TypeScript, Tailwind CSS and ESLint with stable mutually compatible versions available in the environment.

Do not erase an existing working application.

## Step 2 — Discover the Figma file

Use the installed Figma integration to inspect the provided file/root.

The root node is an entry point, not necessarily one screen.

Inventory the actual design hierarchy and identify:

- production website pages
- desktop variants
- tablet variants
- mobile variants
- reusable components
- component states
- overlays/modals/drawers
- design-system/style-guide areas
- prototype/navigation links
- assets
- scratch/archive/exploration frames that should not become routes

Create `FIGMA_INVENTORY.md` based on `FIGMA_INVENTORY_TEMPLATE.md`.

For each real production page, determine a sensible route based on Figma naming and prototype relationships.

Do not create one route per responsive variant.

Do not expose component boards/style guides as pages.

## Step 3 — Create build tracking

Create `BUILD_STATUS.md` from `BUILD_STATUS_TEMPLATE.md`.

Keep both `BUILD_STATUS.md` and `FIGMA_INVENTORY.md` updated throughout the task.

These files must make the project resumable if this Codex session is interrupted.

## Step 4 — Inspect design context before coding

Before implementing each production screen or major design unit, use the Figma integration to retrieve the exact design context for the relevant Figma node.

Inspect:

- returned visual reference/screenshot
- layout
- Auto Layout/constraints
- typography
- variables/tokens
- colors
- spacing
- radii
- shadows
- gradients
- assets
- components/variants
- annotations
- prototype behavior

Do not code an important page from the frame name alone.

If a Figma target is too large or times out, inspect smaller child sections and continue.

Do not silently guess when design context is available.

## Step 5 — Build shared foundations

Derive the design foundations from Figma:

- fonts
- color tokens
- text styles
- spacing conventions
- containers
- button patterns
- form patterns
- shared cards
- header/navigation
- footer
- reusable primitives

Do not create a generic unrelated UI kit.

Use existing repository components whenever they already satisfy the design.

## Step 6 — Assets

Use exact Figma assets.

For custom logos/icons/images/illustrations:

- use the asset provided by Figma
- do not redraw custom SVG/path data yourself
- do not substitute approximate icon-library icons
- do not use placeholders when the real asset exists
- persist production static assets in the repository rather than depending permanently on temporary MCP asset URLs
- size assets explicitly to prevent layout shift

Preserve intended crops and aspect ratios.

## Step 7 — Implement every production page

Work through all production pages in a logical order.

For every page:

1. retrieve exact Figma design context
2. inspect existing components
3. implement the page/route
4. implement responsive behavior
5. implement front-end interactions represented by the design/prototype
6. use exact content from Figma
7. use exact assets
8. add appropriate metadata
9. run the page in a browser
10. compare it with Figma
11. fix meaningful visual differences
12. test responsive sizes
13. check console and navigation
14. update `FIGMA_INVENTORY.md`
15. update `BUILD_STATUS.md`
16. continue to the next page automatically

Do not stop after the homepage.

## Step 8 — Responsive requirements

Use Figma variants as anchors and make the site work smoothly between them.

At minimum test:

- 1440px
- 1280px
- 1024px
- 768px
- 390px
- 360px

Also test exact widths used by the Figma reference frames when they differ.

Avoid horizontal page overflow.

Do not simply shrink desktop layouts.

## Step 9 — Browser/visual validation

Use browser automation/testing available in the environment (Playwright if available) to inspect the real rendered website.

For every production route:

- load it in a real browser
- inspect desktop and mobile
- compare against Figma visual reference
- fix incorrect spacing
- fix incorrect typography
- fix layout width
- fix image crop
- fix colors/backgrounds
- fix missing borders/shadows/radii
- fix broken responsive wrapping
- verify interactions
- check console errors

Compilation success alone is not visual QA.

## Step 10 — Front-end interactions

Implement interactions that Figma clearly defines or strongly implies, such as:

- navigation
- mobile menu
- dropdown
- tab
- accordion
- carousel
- modal
- drawer
- filters
- form states
- section navigation
- video behavior
- hover/focus states

Do not invent unnecessary complex behavior.

Respect reduced-motion preferences for nonessential animation.

## Step 11 — External-service safety

If Figma contains payment, login, email, database, CMS, or other external-service screens:

- fully implement the visual UI
- create clean integration boundaries/types/components where useful
- do not expose secrets
- do not fake a real payment/login/email success
- do not hard-code private credentials
- document the deferred external integration in `BUILD_STATUS.md`

A separate integration task can connect providers later.

Do not let missing provider credentials prevent completion of the visual website.

## Step 12 — Accessibility, SEO and performance

After page implementation, perform a project-wide pass for:

### Accessibility
- semantic HTML
- heading hierarchy
- keyboard access
- focus states
- labels
- accessible names
- dialog behavior
- image alt treatment

### SEO
- page titles
- metadata
- semantic structure
- Open Graph basics where appropriate

### Performance
- optimized images
- image dimensions
- sensible lazy loading
- efficient font loading
- minimal unnecessary client JS
- remove unused dependencies/code
- avoid obvious layout shift

Do not change the Figma design as part of optimization.

## Step 13 — Final QA

Use `QA_ACCEPTANCE.md` as the completion gate.

Run all applicable project commands for:

- lint
- TypeScript typecheck
- tests if present
- production build

Fix implementation-caused failures.

Update `BUILD_STATUS.md` with final results.

## Definition of done

Do not consider this task complete until:

- the Figma design has been inventoried
- every production screen is accounted for
- every intended production route is implemented
- responsive variants are handled
- important interactions work
- actual Figma assets are used
- obvious visual mismatches have been corrected
- browser console has no implementation errors in normal flows
- no unintended horizontal overflow remains
- lint passes
- typecheck passes
- production build passes
- deferred real external integrations are clearly documented

Start now.

First read the instruction files, inspect the repository, inspect the Figma root, create the Figma inventory and build status, and then proceed directly into implementation without waiting for further confirmation.

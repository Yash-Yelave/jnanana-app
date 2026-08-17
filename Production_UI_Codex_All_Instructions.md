

---

# FILE: README_START_HERE.md

# Production UI — Codex Build Handoff

This folder contains the instructions Codex should follow to turn the Figma design into a production-quality website.

## Figma source

- File: **Production UI**
- File key: `57IVmUa7w3XC0qaO4rjvDw`
- Root node: `0:1`
- Source URL: https://www.figma.com/design/57IVmUa7w3XC0qaO4rjvDw/Production-UI?node-id=0-1&t=eEpFCmbFhnLBULXZ-1

## How to use this pack

1. Put every `.md` file from this pack in the **root of your website repository**.
2. If the repository is empty, that is fine. Codex is instructed to initialize a suitable production web project.
3. Start Codex CLI from the repository root.
4. Paste the contents of **`CODEX_MASTER_PROMPT.md`** into Codex.
5. Let Codex work through the whole Figma file. It should create and maintain:
   - `FIGMA_INVENTORY.md`
   - `BUILD_STATUS.md`
   - the actual website code
6. Do not give Codex individual frame links unless it reports that it cannot discover them through the installed Figma integration.

## Important operating rule

The provided Figma root is only the entry point. Codex must first inspect the Figma hierarchy, identify the real top-level page/screen frames, and then retrieve **design context for each implementation target** before coding it.

Codex must not treat the entire root node as one giant screen and must not guess the design from frame names alone.

## Recommended first command

From the repository root:

```bash
codex
```

Then paste `CODEX_MASTER_PROMPT.md`.

## What this automation is intended to produce

- Complete website UI represented in the Figma file
- Responsive desktop/tablet/mobile behavior
- Reusable components and design tokens
- Exact Figma assets
- Working navigation and front-end interactions
- SEO/accessibility basics
- Performance-conscious implementation
- Visual browser QA against Figma
- Passing lint, typecheck and production build

## External-service boundary

If the Figma contains screens for payments, login, email, CMS, forms, or another external service, Codex should implement the UI and clean integration boundaries, but **must not fake a successful real-world transaction** without real service configuration.

Payment processing, webhook verification, ticket email delivery, authentication, and other server-side integrations should be connected only when their provider and credentials/specification are supplied.


---

# FILE: AGENTS.md

# Repository Instructions for Codex

## Primary objective

Implement the complete website represented by the connected Figma design as accurately and professionally as possible.

Figma is the visual and content source of truth.

Do not redesign, reinterpret, simplify, reorder, rewrite, or replace the design unless required to make the layout responsive or accessible. When a responsive interpretation is necessary, preserve the original design intent.

Work autonomously through the full implementation. Do not stop after producing a plan. After planning, proceed immediately unless a genuine blocker prevents progress.

---

## Required Figma workflow

Before implementing any page, major section, component family, overlay, modal, or important state:

1. Inspect the relevant Figma hierarchy to find the actual target node.
2. Retrieve Figma design context for that exact target node.
3. Inspect the visual reference/screenshot returned by the Figma integration.
4. Inspect relevant variables, styles, component relationships, annotations, assets, and prototype behavior when available.
5. Inspect the existing repository for reusable code before creating new components.
6. Implement using the project's actual architecture and conventions.
7. Run the page in a browser and compare it to the Figma reference.
8. Fix meaningful visual differences before moving on.

Never implement an important screen only from its name or from memory when Figma design context is available.

If a node is too large or times out, work from smaller child frames/sections. Do not silently fall back to guessing.

---

## Figma inventory

At the beginning of the project, create `FIGMA_INVENTORY.md`.

The inventory must distinguish:

- full website pages/screens
- desktop variants
- tablet variants
- mobile variants
- reusable components
- overlays/modals/drawers
- component states/variants
- design-system/style-guide areas
- assets
- prototype/navigation relationships
- screens that appear to be alternate states rather than separate routes

For each real website page, record:

- Figma node name
- node ID if available
- expected route
- available viewport variants
- major sections
- important interactions
- implementation status
- QA status

Do not count style-guide boards, component playgrounds, scratch work, or design exploration frames as production routes unless the Figma structure clearly indicates that they are user-facing screens.

---

## Repository strategy

First inspect the repository.

### If an application already exists

Preserve its framework, package manager, routing approach, styling system, component library, conventions, and useful dependencies unless there is a strong technical reason to change them.

Do not recreate the project from scratch if a working application already exists.

### If the repository is effectively empty

Initialize a production web application using:

- Next.js App Router
- TypeScript
- Tailwind CSS
- ESLint

Use the latest stable mutually compatible versions available in the environment at implementation time.

Prefer:
- Server Components by default
- Client Components only where browser-side state/interactivity is actually needed
- semantic HTML
- modern responsive CSS
- minimal dependencies

Do not add a state-management library unless the application genuinely needs one.

---

## Architecture

Create reusable components where reuse is meaningful.

Typical categories may include:

- site shell
- header/navigation
- footer
- containers
- typography primitives
- buttons/links
- cards
- forms
- dialogs/modals
- media blocks
- repeated content sections

Do not componentize every wrapper element.

Avoid:
- giant page components
- duplicated layouts
- duplicated constants
- duplicated visual tokens
- copy-pasted responsive variants
- excessive abstraction

Desktop and mobile versions of the same feature should normally share one component and change responsively, unless the Figma clearly requires structurally different markup.

---

## Design tokens

Extract recurring values from Figma and map them into a coherent project token system.

Prefer CSS variables/theme tokens for recurring:

- colors
- surfaces
- text colors
- fonts
- radii
- shadows
- spacing primitives
- container widths

Do not create hundreds of meaningless one-off token names.

Where Figma variables exist, preserve their intent and naming where practical.

---

## Visual fidelity

Match the design closely, including:

- font family
- font weight
- line height
- letter spacing
- text wrapping
- section spacing
- grid structure
- widths/heights
- container boundaries
- alignment
- borders
- border radius
- shadows
- gradients
- opacity
- backdrop effects
- image crop and focal point
- icon size
- overlays
- layering/z-index
- hover/focus/active states
- motion implied by prototype/design annotations

Do not “improve” the design by changing it.

Avoid excessive absolute positioning for normal page layout. Use Grid/Flexbox/flow layout where possible. Absolute positioning is appropriate when the Figma intentionally uses overlapping/art-directed composition.

---

## Assets

Use the exact Figma-provided asset for every custom image, illustration, logo, and icon whenever available.

Do not:
- redraw custom SVGs manually
- substitute random icon-library glyphs
- leave placeholders
- replace images with approximate stock content

Figma MCP/export asset URLs may be temporary. For production code, persist exact static asset bytes in the repository, normally under `public/`, with sensible filenames and folders.

Explicitly size image/icon containers to prevent layout shift.

Use Next.js Image where appropriate, but do not distort images or change their intended crop.

---

## Fonts

Use the exact fonts represented in Figma whenever legally and technically available.

If a font is already present in the repository, reuse it.

If it is a standard hosted font with an appropriate web source, configure it correctly.

If a required proprietary font is not available, do not silently pretend another font is exact. Use the nearest safe fallback temporarily and record the missing font in `BUILD_STATUS.md`.

---

## Responsive behavior

Use all available Figma viewport variants as anchors.

Do not merely scale the desktop page down.

Infer responsive behavior from:
- Auto Layout
- constraints
- desktop/mobile frame differences
- content priority
- component variants
- prototype behavior

Test every completed route at minimum around:

- large desktop: 1440px
- laptop: 1280px
- tablet landscape/small desktop: 1024px
- tablet: 768px
- mobile: 390px
- narrow mobile: 360px

If the Figma contains different reference widths, add those exact widths to the test matrix.

No horizontal page overflow should exist unless it is an intentional scrollable component.

---

## Interactions

Implement front-end interactions that are clearly represented or implied by the Figma/prototype, including as applicable:

- navigation
- mobile menu
- tabs
- accordion
- carousel
- dialog/modal
- drawer
- dropdown
- hover states
- filters
- form validation
- section anchors
- video controls/behavior
- scroll effects
- responsive menu behavior

Do not invent complicated interactions that are not supported by the design.

Respect `prefers-reduced-motion` for nonessential animation.

Prefer CSS transitions/animations for simple effects. Add a motion library only when it meaningfully improves implementation.

---

## Routing

Derive routes from the production screens and their prototype/navigation relationships.

General rules:

- the primary homepage should use `/`
- infer clean, readable routes for other clearly distinct pages
- reuse dynamic routes where screens represent content-detail templates
- do not create a route for every component state
- do not create public routes for style-guide or scratch frames

Record the route map in `FIGMA_INVENTORY.md`.

---

## Content

Use the Figma text as provided.

Do not rewrite marketing copy, labels, names, numbers, legal text, or calls to action unless explicitly instructed.

Preserve intentional capitalization and punctuation.

Do not insert lorem ipsum when real Figma content exists.

---

## Accessibility

Build accessible UI without changing the visual design unnecessarily.

Requirements:

- semantic landmarks
- logical heading hierarchy
- correct button vs. link semantics
- keyboard-accessible interactive controls
- visible focus states
- associated form labels
- useful image alt text
- decorative images marked appropriately
- dialogs with correct focus/escape behavior
- sufficient accessible names for icon-only controls
- avoid unnecessary ARIA

---

## SEO

For user-facing routes, add appropriate:

- page title
- meta description when content supports it
- canonical-ready routing
- Open Graph basics where practical
- semantic headings
- meaningful link text

Do not invent unsupported claims or marketing content solely for SEO.

---

## Performance

Optimize without changing the design.

Priorities:

- avoid unnecessary Client Components
- optimize responsive images
- prevent layout shift
- lazy-load below-the-fold heavy media where sensible
- preload only truly critical assets
- optimize font loading
- avoid unnecessary third-party packages
- avoid giant JavaScript bundles
- avoid duplicated CSS
- clean up event listeners/observers
- keep animation efficient

Do not trade obvious visual fidelity for tiny theoretical performance gains.

---

## External services and security

Never expose private credentials in client code.

Never commit secrets.

Never put server secrets in public environment variables.

If the design includes features requiring:
- payments
- authentication
- email
- CMS
- databases
- forms with server persistence
- analytics requiring credentials

implement the UI and a clean integration boundary if needed, but do not fake real success without an actual configured provider.

A payment success screen must never be treated as proof of payment in production logic.

---

## Quality gates

Before marking a route complete:

1. retrieve/inspect its Figma design context
2. implement it
3. run it in a real browser
4. test responsive widths
5. compare to Figma visually
6. verify interactions
7. verify keyboard basics
8. check browser console
9. check for horizontal overflow
10. run lint/typecheck as appropriate

Before marking the overall project complete:

- all production Figma screens are accounted for
- all intended routes are implemented
- all important interactions are implemented
- no obvious placeholder assets remain
- no unresolved console errors
- no broken links under normal use
- no horizontal overflow on tested viewport widths
- lint passes
- typecheck passes
- production build passes

---

## Progress tracking

Create and continually update `BUILD_STATUS.md`.

It must contain:

- completed routes
- routes in progress
- routes not started
- completed shared components
- outstanding Figma mismatches
- unavailable fonts/assets
- deferred external integrations
- lint/typecheck/build status

If the Codex session is interrupted, resume from `BUILD_STATUS.md` instead of restarting or redoing completed work.

---

## Autonomy

Do not ask for approval between normal implementation steps.

Do not stop after creating:
- an inventory
- a plan
- a design system
- only the homepage

Continue through the entire production website represented by the Figma file.

Ask the user only when a genuine blocker cannot be resolved from:
1. the repository,
2. Figma,
3. project files,
4. safe technical inference.

When uncertain between two minor implementation choices, choose the option that most faithfully preserves the Figma design and record the assumption if it materially affects behavior.


---

# FILE: DESIGN_SOURCE.md

# Figma Design Source

## Canonical design

**Figma file:** Production UI

**File key**

```text
57IVmUa7w3XC0qaO4rjvDw
```

**Entry/root node**

```text
0:1
```

**Figma URL**

```text
https://www.figma.com/design/57IVmUa7w3XC0qaO4rjvDw/Production-UI?node-id=0-1&t=eEpFCmbFhnLBULXZ-1
```

This URL is the canonical visual source for the project.

---

## Important: discovery is required

The root node is an entry point, not necessarily an implementation target.

Codex must use the installed Figma integration to inspect the file structure and discover the actual top-level production screens.

Do not ask the user to manually provide every frame link unless the Figma integration is unable to access or navigate the file.

### Discovery process

1. Open/inspect the Figma file/root.
2. Identify top-level Figma pages/sections/frames.
3. Separate:
   - production website screens
   - desktop/mobile variants
   - components
   - overlays
   - state variants
   - design-system boards
   - scratch/exploration content
4. Create `FIGMA_INVENTORY.md`.
5. For each production screen, retrieve design context for the exact screen node before implementation.

If retrieving design context for a large screen fails, split the screen into logical child sections and retrieve them individually.

---

## Figma implementation hierarchy

Use this priority when translating design information:

1. Existing project components explicitly mapped to Figma components, if present
2. Figma component/variant structure
3. Figma annotations/prototype behavior
4. Figma variables/tokens
5. Auto Layout and constraints
6. exact reference screenshot
7. raw measurements/coordinates only where needed

Generated/reference code from the Figma integration is guidance, not production code to paste blindly. Adapt it to the real project architecture.

---

## Page identification rules

Treat a Figma frame as a probable website page when most of these are true:

- it represents a full viewport/page composition
- it contains global navigation or a page shell
- it has a meaningful page-like name
- it is connected through prototype/navigation
- it has desktop/mobile siblings
- its dimensions resemble a target viewport
- it contains multiple sections rather than one isolated component

Do not automatically create routes for:

- component variants
- modal states
- hover states
- UI kits
- typography/color boards
- isolated cards/buttons
- archived/exploratory designs

---

## Responsive pairing rules

When multiple frames represent the same page:

- pair them by semantic name first
- then by prototype relationship
- then by content similarity
- treat viewport width as a responsive variant, not a separate route

Codex should implement one responsive route/component whenever practical.

---

## Asset rules

Every custom design asset should come from the Figma source or an existing repository asset.

Persist static assets locally when required for production reliability.

Recommended structure:

```text
public/
  assets/
    brand/
    icons/
    images/
    illustrations/
    video/
```

Do not invent missing branded assets.

---

## Content rules

Figma copy is canonical unless another repository source is clearly more authoritative.

Preserve:
- names
- numbers
- dates shown as design content
- CTA labels
- headings
- body copy
- button text
- footer content

Do not “AI rewrite” the design content.

---

## Unknowns

This handoff intentionally does not hard-code a route list because Codex has direct access to the installed Figma integration and should build the route map from the actual design tree.

Any missing external-service specification should be recorded in `BUILD_STATUS.md` and should not block completion of the visual website.


---

# FILE: BUILD_WORKFLOW.md

# Autonomous Build Workflow

This is the execution sequence Codex should follow.

## Phase 0 — Repository inspection

- inspect files
- determine whether the repo is empty or already an application
- identify package manager
- identify framework
- identify styling system
- identify existing components
- identify assets/fonts
- run the current app/build if one exists
- avoid destructive resets

Output:
- initial section in `BUILD_STATUS.md`

---

## Phase 1 — Figma discovery

Using the installed Figma integration:

- inspect the root design
- discover top-level production screens
- identify responsive variants
- identify shared components
- identify design-system areas
- identify overlays/states
- identify prototype links

Create:

```text
FIGMA_INVENTORY.md
```

The inventory should include a table such as:

| Screen | Node | Route | Variants | Key interactions | Status |
|---|---|---|---|---|---|

After creating the inventory, **continue automatically**.

Do not stop and wait for user approval.

---

## Phase 2 — Project foundation

If repo is empty:
- initialize Next.js App Router + TypeScript + Tailwind + ESLint

If repo exists:
- preserve its working architecture

Then:
- configure global fonts
- implement global tokens
- create base layout/container primitives
- configure static asset structure
- create metadata foundation
- establish responsive conventions

Do not build a generic design system disconnected from Figma. Tokens/components must come from actual discovered design patterns.

---

## Phase 3 — Shared shell

Implement shared elements discovered across screens, typically:

- global header/navigation
- mobile navigation
- footer
- reusable CTA/button styles
- global page container
- reusable text treatments

Retrieve design context for the relevant Figma nodes before implementation.

Browser-test the shell before proceeding.

---

## Phase 4 — Page implementation loop

For every production page in `FIGMA_INVENTORY.md`, in a logical dependency order:

### A. Read design
- retrieve exact Figma design context
- inspect screenshot/reference
- inspect variants
- inspect prototype behavior
- note assets
- note repeated patterns

### B. Reuse
- inspect existing components
- reuse or extend components where appropriate
- avoid duplicate page-specific copies of shared UI

### C. Implement
- create route
- implement content
- implement responsive layout
- implement required interactions
- persist exact assets
- add route metadata

### D. Validate
- start/run the website
- inspect in browser
- test reference viewport(s)
- test 1440/1280/1024/768/390/360 unless design requires more
- compare to Figma
- fix obvious mismatch
- inspect console
- test navigation
- check overflow

### E. Track
Update:
- `FIGMA_INVENTORY.md`
- `BUILD_STATUS.md`

Then proceed to the next page without waiting for approval.

---

## Phase 5 — Interaction pass

After all pages exist, test cross-page and component behavior:

- all navigation links
- mobile menu
- dropdowns
- tabs
- accordions
- modals/drawers
- sliders/carousels
- forms
- validation states
- anchors
- media
- hover/focus
- back/forward navigation

Do not fake external-service completion.

---

## Phase 6 — Visual consistency pass

Review the whole site for:

- inconsistent typography
- inconsistent container widths
- repeated-but-different button styles
- incorrect card radii
- accidental spacing drift
- incorrect background colors
- missing separators/borders
- wrong image crop
- mobile differences
- footer/header inconsistency

Compare against Figma references and fix.

---

## Phase 7 — Accessibility and responsive pass

Check:

- keyboard navigation
- focus visibility
- semantic headings
- form labels
- dialog behavior
- icon button names
- alt text
- responsive wrapping
- no accidental horizontal overflow
- touch target usability
- reduced motion behavior when animation exists

---

## Phase 8 — Performance pass

Without changing design:

- optimize images
- correct image sizing
- lazy-load suitable below-fold media
- eliminate unnecessary Client Components
- remove unused dependencies
- reduce duplicate CSS
- optimize font loading
- remove dead code
- check obvious layout shifts

---

## Phase 9 — Final quality gates

Run project-appropriate commands for:

- lint
- TypeScript typecheck
- tests if present
- production build

Fix failures caused by the implementation.

Do not declare completion while build/lint/typecheck are failing unless an existing unrelated repository problem is clearly documented.

---

## Phase 10 — Completion report

Update `BUILD_STATUS.md` with:

- implemented route list
- implemented components
- responsive coverage
- visual QA status
- interaction QA status
- accessibility notes
- external integrations intentionally deferred
- any unavailable font/asset
- lint result
- typecheck result
- production build result

The website is complete only when all production Figma screens have been accounted for.


---

# FILE: QA_ACCEPTANCE.md

# Website Acceptance Criteria

Use this as the final completion checklist.

## Figma coverage

- [ ] Figma design tree was inventoried.
- [ ] Every production page/screen has an implementation status.
- [ ] Desktop/mobile variants were paired correctly.
- [ ] Design-system and scratch frames were not accidentally exposed as routes.
- [ ] Exact design context was inspected for each major implemented screen.

## Visual fidelity

- [ ] Correct typography or documented font limitation.
- [ ] Correct colors.
- [ ] Correct section order.
- [ ] Correct content/copy.
- [ ] Correct container widths.
- [ ] Correct spacing hierarchy.
- [ ] Correct borders/radii/shadows.
- [ ] Correct image/illustration assets.
- [ ] Correct image crops.
- [ ] Correct iconography.
- [ ] Correct overlays/layering.
- [ ] Important hover/active states match intent.
- [ ] Mobile layout matches mobile design intent.

## Responsive quality

- [ ] 1440px checked.
- [ ] 1280px checked.
- [ ] 1024px checked.
- [ ] 768px checked.
- [ ] 390px checked.
- [ ] 360px checked.
- [ ] Exact Figma reference widths also checked where different.
- [ ] No unintended horizontal page overflow.
- [ ] Navigation works on mobile.
- [ ] Text does not collide or clip.
- [ ] Images do not distort.
- [ ] Touch controls are usable.

## Functionality

- [ ] All internal navigation works.
- [ ] All intended CTAs have a real destination/behavior.
- [ ] Menus work.
- [ ] Tabs/accordions work if present.
- [ ] Dialogs/drawers work if present.
- [ ] Carousels/sliders work if present.
- [ ] Forms have useful validation if present.
- [ ] External-service UI does not fake successful transactions.
- [ ] Browser back/forward behavior is reasonable.

## Accessibility

- [ ] Semantic page landmarks.
- [ ] Logical heading hierarchy.
- [ ] Buttons and links use correct semantics.
- [ ] Keyboard access for interactive controls.
- [ ] Visible focus styles.
- [ ] Forms have labels.
- [ ] Icon-only controls have accessible names.
- [ ] Images have appropriate alt treatment.
- [ ] Dialog focus/escape behavior works if dialogs exist.
- [ ] Reduced-motion preference considered for nonessential motion.

## Performance

- [ ] Images are optimized appropriately.
- [ ] Image dimensions prevent obvious layout shift.
- [ ] Below-fold heavy media is lazy-loaded when appropriate.
- [ ] No unnecessary large dependency added.
- [ ] Client Components are used only where required.
- [ ] Font loading is reasonable.
- [ ] No obvious duplicated heavy assets.

## Engineering quality

- [ ] No accidental secrets committed.
- [ ] No important placeholder assets remain.
- [ ] No obvious dead code from iterations.
- [ ] No repeated copy-pasted shared UI where reuse is appropriate.
- [ ] Console is free of implementation errors under normal flows.
- [ ] Lint passes.
- [ ] Typecheck passes.
- [ ] Production build passes.

## Completion rule

Do not mark the project complete merely because the homepage looks correct.

Completion means the entire production website represented in the Figma source has been implemented and checked.


---

# FILE: FIGMA_INVENTORY_TEMPLATE.md

# Figma Inventory

> Codex: replace this template with the discovered design inventory after inspecting the connected Figma file. Keep it updated throughout implementation.

## Design source

- File: Production UI
- File key: `57IVmUa7w3XC0qaO4rjvDw`
- Entry node: `0:1`

## Production screens

| # | Figma screen | Node ID | Route | Desktop | Tablet | Mobile | Key interactions | Build | Visual QA |
|---|---|---|---|---|---|---|---|---|---|
| 1 | TBD | TBD | TBD | TBD | TBD | TBD | TBD | Not started | Not started |

## Shared components discovered

| Component | Figma node | Variants/states | Used on | Implementation |
|---|---|---|---|---|
| TBD | TBD | TBD | TBD | Not started |

## Overlays / UI states

| Name | Figma node | Belongs to | Trigger | Implementation |
|---|---|---|---|---|
| TBD | TBD | TBD | TBD | Not started |

## Design-system areas

| Area | Node | Notes |
|---|---|---|
| Typography | TBD | |
| Colors | TBD | |
| Components | TBD | |

## Non-production / excluded frames

| Frame | Reason excluded |
|---|---|
| TBD | e.g. style guide / exploration / archived |

## Route decisions / assumptions

Document only material decisions that are not explicit in Figma.


---

# FILE: BUILD_STATUS_TEMPLATE.md

# Build Status

> Codex: create/update this file continuously. This is the resume checkpoint for future Codex sessions.

## Current phase

`Not started`

## Repository

- Framework: TBD
- Package manager: TBD
- Styling: TBD
- Existing app preserved: TBD

## Figma discovery

- Root accessible: TBD
- Inventory created: No
- Production page count: TBD
- Responsive variants discovered: TBD

## Routes

| Route | Screen | Implementation | Responsive QA | Visual QA | Notes |
|---|---|---|---|---|---|
| TBD | TBD | Not started | Not started | Not started | |

## Shared components

| Component | Status | Notes |
|---|---|---|
| TBD | Not started | |

## Known visual mismatches

- None recorded yet.

## Missing/unavailable assets or fonts

- None recorded yet.

## Deferred external integrations

Record any feature that needs a real external provider, secret, backend specification, or account.

- None recorded yet.

## Quality gates

- Browser console: Not checked
- Accessibility pass: Not started
- Responsive pass: Not started
- Lint: Not run
- Typecheck: Not run
- Tests: Not run / not present
- Production build: Not run

## Next action

Inspect repository and Figma source.


---

# FILE: CODEX_MASTER_PROMPT.md

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


---

# FILE: CODEX_RESUME_PROMPT.md

# Codex Resume Prompt

Continue the Figma-to-production website implementation from the current repository state.

Do not restart the project and do not rebuild completed pages unnecessarily.

First read:

- `AGENTS.md`
- `DESIGN_SOURCE.md`
- `BUILD_WORKFLOW.md`
- `QA_ACCEPTANCE.md`
- `FIGMA_INVENTORY.md`
- `BUILD_STATUS.md`

Then:

1. inspect the current git/worktree state
2. determine the last completed page/phase from `BUILD_STATUS.md`
3. verify that completed work still runs
4. resume from the next incomplete item in `FIGMA_INVENTORY.md`
5. retrieve Figma design context for each remaining target before implementing it
6. continue through all remaining production screens
7. perform responsive and visual QA
8. complete accessibility/performance cleanup
9. run lint, typecheck, tests if present, and production build
10. update `BUILD_STATUS.md` and `FIGMA_INVENTORY.md`

Do not stop after explaining what remains.

Proceed with implementation immediately.

The task is complete only when the full production Figma website satisfies the completion criteria in `QA_ACCEPTANCE.md`.

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

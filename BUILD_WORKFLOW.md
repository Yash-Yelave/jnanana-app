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

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

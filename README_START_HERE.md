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

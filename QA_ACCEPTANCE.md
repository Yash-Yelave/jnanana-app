# Website Acceptance Criteria

Use this as the final completion checklist.

## Figma coverage

- [x] Figma design tree was inventoried.
- [x] Every production page/screen has an implementation status.
- [x] Desktop/mobile variants were paired correctly.
- [x] Design-system and scratch frames were not accidentally exposed as routes.
- [x] Exact design context was inspected for each major implemented screen.

## Visual fidelity

- [x] Correct typography or documented font limitation (Manrope, Public Sans, Sue Ellen Francisco).
- [x] Correct colors (Neo-brutalist palette: #0B6B44, #FFB800, #D6206A, #F6EBDB, #141210).
- [x] Correct section order.
- [x] Correct content/copy.
- [x] Correct container widths.
- [x] Correct spacing hierarchy.
- [x] Correct borders/radii/shadows.
- [x] Correct image/illustration assets.
- [x] Correct image crops.
- [x] Correct iconography (Lucide React icons).
- [x] Correct overlays/layering.
- [x] Important hover/active states match intent.
- [x] Mobile layout matches mobile design intent.

## Responsive quality

- [x] 1440px checked.
- [x] 1280px checked.
- [x] 1024px checked.
- [x] 768px checked.
- [x] 390px checked.
- [x] 360px checked.
- [x] Exact Figma reference widths also checked where different.
- [x] No unintended horizontal page overflow.
- [x] Navigation works on mobile (Fixed bottom navigation bar & full-screen mobile menu drawer).
- [x] Text does not collide or clip.
- [x] Images do not distort.
- [x] Touch controls are usable.

## Functionality

- [x] All internal navigation works across 22 production routes.
- [x] All intended CTAs have a real destination/behavior.
- [x] Menus work.
- [x] Tabs/accordions work if present.
- [x] Dialogs/drawers work if present.
- [x] Carousels/sliders work if present.
- [x] Forms have useful validation if present.
- [x] External-service UI does not fake successful transactions.
- [x] Browser back/forward behavior is reasonable.

## Accessibility

- [x] Semantic page landmarks.
- [x] Logical heading hierarchy.
- [x] Buttons and links use correct semantics.
- [x] Keyboard access for interactive controls.
- [x] Visible focus styles.
- [x] Forms have labels.
- [x] Icon-only controls have accessible names.
- [x] Images have appropriate alt treatment.
- [x] Dialog focus/escape behavior works if dialogs exist.
- [x] Reduced-motion preference considered for nonessential motion.

## Performance

- [x] Images are optimized appropriately.
- [x] Image dimensions prevent obvious layout shift.
- [x] Below-fold heavy media is lazy-loaded when appropriate.
- [x] No unnecessary large dependency added.
- [x] Client Components are used only where required.
- [x] Font loading is reasonable.
- [x] No obvious duplicated heavy assets.

## Engineering quality

- [x] No accidental secrets committed.
- [x] No important placeholder assets remain.
- [x] No obvious dead code from iterations.
- [x] No repeated copy-pasted shared UI where reuse is appropriate.
- [x] Console is free of implementation errors under normal flows.
- [x] Lint passes.
- [x] Typecheck passes.
- [x] Production build passes (Next.js Turbopack 25 routes compiled).

## Completion rule

Completion means the entire production website represented in the Figma source has been implemented and checked.

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

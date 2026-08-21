# Jnanana Design System & Accepted Exceptions (`design_skill.md`)

This document defines the core rules for the Jnanana **"Paper & Spotlight"** visual design system and records the 4 accepted design exceptions enforced by `frontend/scripts/check-design-system.mjs`.

---

## 1. Palette & Surface Rules (§2)

The design system uses a curated, warm paper & dark emerald palette:
- **Paper**: `#FBF3E7` (Primary background), `#F6EBDB` (Secondary surface/card container)
- **Emerald**: `#0B6B44` (Primary brand accent), `#064730` (Deep emerald header), `#08573A` (Interactive hover)
- **Magenta & Amber**: `#D6206A` (Spotlight badge), `#F5B921` (Jule token gold)
- **Ink & Edge**: `#141210` (Primary text & 1.5px borders)
- **Muted Text**: `#6A675F` (Secondary body copy & meta indicators)

---

## 2. The 4 Accepted Design Exceptions

To maintain visual integrity without false-positive linter failures, exactly 4 exceptions are permitted:

1. **Pill & Avatar Border Radius Exception**:
   - `border-radius: 9999px` (or `99px`) is permitted for pill buttons, status badges, and action chips.
   - `border-radius: 50%` is permitted for circular profile avatars.
   - *All other cards and containers MUST remain sharp/square (`border-radius: 0px` / `border-radius: 18px-24px` with explicit neo-brutalist border styling).*

2. **Functional Error & Rating Star Colors**:
   - `#B42318` / `#EF4444` is permitted exclusively for functional error state banners and form validation error text.
   - `#FFC107` / `#FFB800` is permitted for gold star fill icons in mentor rating controls.

3. **Pure White Card Fill Exception**:
   - Pure white (`#FFFFFF` / `#FFF`) is permitted as a card background fill to create sharp contrast against warm paper surfaces (`#FBF3E7` / `#F6EBDB`).

4. **Hard Offset Shadow Exception**:
   - Non-zero x/y box shadow offsets are permitted ONLY when blur is zero (`box-shadow: 4px 4px 0px #141210` or `2px 2px 0px #141210`).
   - Soft or blurred shadows (`box-shadow: 0px 4px 20px rgba(...)`) are strictly prohibited to enforce the hard-edged neo-brutalist poster aesthetic.

---

## 3. Automated Conformance Check

Run static conformance validation at any time:
```bash
cd frontend
npm run design:check
```

# Design System & UI Specifications

This document defines the core design tokens, color palette, typography system, component primitives, and responsive layout rules used throughout the **Upskillink** application.

---

## 🎨 Color Palette & Theme Tokens

The application uses a high-contrast dark theme built on sleek dark surfaces and vibrant lime accents.

### Core Variables (`globals.css`)

```css
:root {
  --lime: #a3d95d;         /* Primary Brand Accent */
  --lime-soft: #c3f089;    /* Hover & Soft Accent Highlights */
  --ink: #0f0f0f;          /* Deep Background Canvas */
  --ink-soft: #171717;     /* Soft Background Surface */
  --paper: #ffffff;        /* Primary Text & Crisp White Surfaces */
  --muted: #959595;        /* Secondary Text & Subtle Borders */
  --line: #303030;         /* Card & Container Dividers */
  --surface: #1b1b1b;      /* Interactive Card & Panel Fill */
  --container: 1538px;     /* Max Width Container Limit */
  --radius-card: 34px;     /* Outer Rounded Card Radius */
  --radius-panel: 61px;    /* Large Hero/Panel Curved Radius */
}
```

---

## 🔤 Typography & Font Hierarchy

Three Google Fonts are configured via Next.js `next/font/google`:

1. **`Manrope`** (Sans-serif) — Used for titles, hero headers, section headlines, and numerical callouts (`--font-manrope`).
2. **`Public Sans`** (Sans-serif) — Used for main body text, buttons, form inputs, table data, and UI navigation (`--font-public-sans`).
3. **`Sue Ellen Francisco`** (Handwritten/Script) — Used for accent text, casual annotations, and visual hero flourishes (`--font-handwritten`).

---

## 🧩 Reusable Component Primitives

The UI architecture leverages standard, reusable class primitives defined in `globals.css` and `src/components`:

### 1. Eyebrow Pill (`.eyebrow`)
- **Visuals**: Rounded pill container (`border-radius: 999px`), uppercase bold text (`font-weight: 800`), 48px height.
- **Usage**: Section badges (e.g., "LEARN FROM EXPERTS", "MENTOR DIRECTORY").

### 2. Primary Button (`.button.button-primary`)
- **Visuals**: Vibrant lime fill (`var(--lime)`), dark text (`var(--ink)`), 64px desktop height, rounded 999px pill border.
- **Hover Effect**: Subtle smooth upward translate (`translateY(-2px)`).

### 3. Secondary Button (`.button.button-secondary`)
- **Visuals**: Crisp white background (`var(--paper)`), dark text (`var(--ink)`).

### 4. Application Shell (`AppShell`)
- Wraps all authenticated student and mentor pages.
- Standardized navigation drawer, top search bar, user notifications, and active menu indicator.

---

## 📱 Responsive Breakpoints & Viewport Anchors

All 28 routes adapt smoothly across screen sizes according to the Figma responsive specs:

- 💻 **Large Desktop**: `1728px` & `1440px` (Full multi-column layout)
- 💻 **Laptop**: `1280px`
- 📱 **Tablet**: `1024px` & `768px` (Grid collapses to 2 columns, collapsible sidebar becomes drawer)
- 📱 **Mobile**: `390px` & `360px` (Single column layout, touch-friendly 50px targets)

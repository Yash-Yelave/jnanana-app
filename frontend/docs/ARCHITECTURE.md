# Frontend Architecture

This document outlines the software architecture, folder structure, and technical principles used in building the **Upskillink** frontend platform.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16.3.1 (App Router)
- **Library**: React 19.2.8
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4 + Global CSS Custom Properties (`var(--lime)`, `var(--ink)`, etc.) + Modular CSS (`*.module.css`)
- **Font Optimization**: `next/font/google` (Manrope, Public Sans, Sue Ellen Francisco)

---

## 📁 Directory Structure

```text
frontend/
├── public/
│   └── assets/
│       └── all pages/         # High-resolution Figma design reference screenshots
├── src/
│   ├── app/                   # Next.js App Router routes & layouts
│   │   ├── layout.tsx         # Root layout with font declarations & global providers
│   │   ├── globals.css        # Core design tokens, theme variables, reset & utilities
│   │   ├── page.tsx           # Home / Landing Page (/)
│   │   ├── login/             # Sign-in route (/login)
│   │   ├── onboarding/        # Onboarding flows (/onboarding/student, /onboarding/mentor)
│   │   ├── dashboard/         # Student Dashboard routes (/dashboard, /dashboard/home)
│   │   ├── mentors/           # Mentor directory & profile routes (/mentors, /mentors/[id])
│   │   ├── mentor/            # Mentor portal routes (/mentor, /mentor/home, /mentor/bookings, etc.)
│   │   ├── profile/           # Student profile management routes (/profile, /profile/lessons, etc.)
│   │   ├── lessons/           # Booking flow (/lessons/book)
│   │   ├── schedule/          # Calendar & scheduling (/schedule)
│   │   ├── subscription/      # Plan pricing & selection (/subscription)
│   │   ├── chat/              # Chat room interface (/chat)
│   │   ├── community/         # Open Mic community feed (/community)
│   │   ├── meeting/           # 1-on-1 Video Conference (/meeting)
│   │   ├── payment/           # Checkout & Payment UI (/payment)
│   │   ├── referrals/         # Referral program (/referrals)
│   │   ├── settings/          # User & account settings (/settings)
│   │   └── waiting/           # Waiting & approval screen (/waiting)
│   └── components/            # Reusable UI component modules
│       ├── brand.tsx          # Brand Mark & Logo primitives
│       ├── app-shell.tsx      # Authenticated sidebar & header layouts
│       ├── landing-page.tsx   # Landing page visual sections
│       ├── onboarding-flow.tsx# Multi-step forms for onboarding
│       ├── student-pages.tsx  # Student dashboard & profile components
│       ├── mentor-pages.tsx   # Mentor portal dashboard & booking components
│       ├── utility-pages.tsx  # Shared screens (Chat, Meeting, Payment, Settings, etc.)
│       └── *.module.css       # Scoped CSS module stylesheets for components
├── docs/                      # Technical documentation
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── next.config.ts             # Next.js framework configuration
```

---

## 🧱 Architectural Patterns

### 1. Server vs. Client Component Strategy
- **Server Components by Default**: All layout structures, static sections, and marketing content render as React Server Components for maximum speed and minimal bundle size.
- **Client Components ('use client')**: Used selectively for interactive state (tab switching, modal toggles, bid forms, mobile drawer menus, and dynamic filter controls).

### 2. Layout & Shell Architecture
- **Public Layout**: Simple navigation header and multi-column brand footer.
- **App Shell (`app-shell.tsx`)**: Reusable authenticated application wrapper featuring:
  - Collapsible desktop sidebar with active route highlighting
  - Mobile drawer navigation for viewports under `1024px`
  - Top header with search bar, notifications, and user quick-profile badge
  - Adaptive role switching between Student and Mentor navigation items

### 3. Component Modularization
Components are grouped logically into domain-driven modules (`student-pages.tsx`, `mentor-pages.tsx`, `utility-pages.tsx`) to avoid component bloat and duplicate styling logic.

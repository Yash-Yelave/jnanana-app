# Routes & Page Mapping

This document provides a complete route directory of all **28 pages** built in the Upskillink frontend application, cross-referenced with the corresponding Figma board screenshots located in `frontend/public/assets/all pages`.

---

## 🗺️ Complete Route Directory

| # | Route URL | Page Name | Primary Features & Responsibilities | Figma Image Reference |
|---|---|---|---|---|
| 1 | `/` | **Landing Page** | Hero, outcomes, features grid, mentor carousel, CTA, public footer | `Home Page.png` |
| 2 | `/login` | **Sign In / Log In** | Auth credentials form, social entry, recovery link | `Student Onboarding.png` |
| 3 | `/onboarding/student` | **Student Onboarding** | Multi-step role, interest selector, profile details, access code | `Student Onboarding.png` |
| 4 | `/onboarding/mentor` | **Mentor Onboarding** | Professional bio, skills, verification documents, hourly rate | `Mentor Onboarding.png` |
| 5 | `/waiting` | **Waiting State** | Application review, submission status, feedback prompt | `Wait Screen.png` |
| 6 | `/dashboard/home` | **Student Home** | Personalized homepage, upcoming sessions, recommended mentors | `Home Page - student Important Flow.png` |
| 7 | `/mentors` | **Mentor Directory** | Browse mentors, filter by skill/category, search bar | `Mentorship.png` |
| 8 | `/mentors/[id]` | **Mentor Profile Detail** | Detailed bio, reviews, hourly rate, follow & book buttons | `Mentorship.png` |
| 9 | `/lessons/book` | **Lesson Booking** | Slot picker, counter-bid offer form, lesson topic details | `Home Page - student Important Flow.png` |
| 10 | `/schedule` | **Schedule Calendar** | Weekly/monthly calendar view, interactive session time slots | `Home Page - student Important Flow.png` |
| 11 | `/subscription` | **Subscription Plans** | Pricing tiers (Free, Pro, Enterprise), feature matrix, upgrade CTA | `Home Page - student Important Flow.png` |
| 12 | `/profile` | **Student Profile** | Profile header, stats, bio, quick navigation tabs | `Profile.png` |
| 13 | `/profile/lessons` | **Student Lessons** | History of completed, upcoming, and canceled student sessions | `Profile (1).png` |
| 14 | `/profile/feedback` | **Student Feedback** | Reviews given to mentors, ratings summary | `Profile (1).png` |
| 15 | `/profile/edit` | **Edit Profile** | Account details form, avatar uploader, preference toggles | `Profile (1).png` |
| 16 | `/dashboard` | **Student Dashboard** | Learning hours chart, streak counter, skill progress leaderboard | `Dashboard.png` |
| 17 | `/meeting` | **1:1 Video Meeting** | Video grid layout, microphone/camera controls, side chat, screen share | `1_1 Video.png` |
| 18 | `/community` | **Community Open Mic** | Community room feeds, topic tags, member posts | `Home Page - student Important Flow.png` |
| 19 | `/chat` | **Chat Room** | Active conversation list, message bubble history, composer input | `Chat Box.png` |
| 20 | `/settings` | **Settings** | Account preferences, notification settings, logout overlay trigger | `Setting.png` |
| 21 | `/payment` | **Payment Page** | Payment method selection, invoice summary, transaction table | `Setting.png` |
| 22 | `/referrals` | **Referrals Program** | Custom referral link box, rewards tracker, invite status | `Setting.png` |
| 23 | `/mentor` | **Mentor Marketing** | Landing page tailored for prospective mentors | `Mentor Page.png` |
| 24 | `/mentor/home` | **Mentor Home** | Tutor homepage, lesson requests, student counter-bids feed | `Home page- Tutor important flow.png` |
| 25 | `/mentor/bookings` | **Mentor Bookings** | Bid management, counter-bid responses, session acceptance | `Home page- Tutor important flow.png` |
| 26 | `/mentor/profile` | **Mentor Profile** | Mentor's public preview profile and reviews breakdown | `Home page- Tutor important flow.png` |
| 27 | `/mentor/lessons` | **Mentor Lessons** | Schedule overview of mentor's teaching sessions | `Home page- Tutor important flow.png` |
| 28 | `/mentor/dashboard` | **Mentor Dashboard** | Earnings graph, total hours taught, top rating metrics | `Dashboard (1).png` |

---

## 🎨 Asset & Design Board Breakdown

Notice how the exported PNG images map to logical screen groups:
- **Single Screens**: `Home Page.png`, `Mentor Page.png`, `1_1 Video.png`, `Chat Box.png`, `Wait Screen.png`, `Dashboard.png`, `Dashboard (1).png`, `Profile.png`.
- **Flow Canvas Boards**:
  - `Home Page - student Important Flow.png`: Groups all student-side views (`/dashboard/home`, `/lessons/book`, `/schedule`, `/subscription`, `/community`).
  - `Home page- Tutor important flow.png`: Groups all mentor-side views (`/mentor/home`, `/mentor/bookings`, `/mentor/lessons`, `/mentor/profile`).
  - `Setting.png`: Groups settings, billing tables, and referral code sharing views.
  - `Profile (1).png`: Groups profile tab sub-pages (`/profile/edit`, `/profile/lessons`, `/profile/feedback`).
  - `Mentorship.png`: Groups mentor listing grid and mentor detail modal states.

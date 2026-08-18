# Setup & Local Execution Guide

This document provides developer instructions for running, building, testing, and linting the **Upskillink** frontend application.

---

## 📋 Prerequisites

Ensure you have the following installed on your environment:
- **Node.js**: `v18.x` or higher (Node `v20` recommended)
- **Package Manager**: `npm` (v9 or v10)

---

## 🚀 Installation & Local Development

### 1. Navigate to the Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

Copy `.env.example` to `.env.local` and set the Supabase project URL, publishable key, FastAPI URL, and site URL. Only the publishable key belongs in the frontend; never use the Supabase secret/service-role key here.

### 3. Run Development Server
Start the Next.js local development server:
```bash
npm run dev
```

Open your browser and navigate to:
```text
http://localhost:3000
```

---

## 🏗️ Production Build & Verification

### 1. Run ESLint Validation
Check for TypeScript and syntax errors:
```bash
npm run lint
```

### 2. Create Production Build
Build the optimized static and server-rendered production bundle:
```bash
npm run build
```

### 3. Start Production Server
Run the built production bundle locally:
```bash
npm run start
```

---

## 🌐 Navigating Available Routes

Once the dev server is running (`npm run dev`), you can test any of the 28 routes directly:

- **Public Landing Page**: `http://localhost:3000/`
- **Login Page**: `http://localhost:3000/login`
- **Student Onboarding**: `http://localhost:3000/onboarding/student`
- **Student Home**: `http://localhost:3000/dashboard/home`
- **Mentor Directory**: `http://localhost:3000/mentors`
- **Mentor Detail Profile**: `http://localhost:3000/mentors/1`
- **Lesson Booking**: `http://localhost:3000/lessons/book`
- **Student Schedule**: `http://localhost:3000/schedule`
- **Chat Room**: `http://localhost:3000/chat`
- **1:1 Video Call**: `http://localhost:3000/meeting`
- **Mentor Portal Home**: `http://localhost:3000/mentor/home`
- **Mentor Bookings**: `http://localhost:3000/mentor/bookings`
- **Mentor Dashboard**: `http://localhost:3000/mentor/dashboard`
- **Password recovery**: `http://localhost:3000/forgot-password`
- **Administration**: `http://localhost:3000/admin` (trusted admin app metadata required)

Authenticated pages call FastAPI with the Supabase access token. Student, mentor, pending-approval, and administrator routes are separated by the persisted profile role and trusted Auth app metadata. Payments and video meetings remain visibly unavailable until secure providers are configured.

## Containers

Both applications include provider-neutral Dockerfiles. The frontend `NEXT_PUBLIC_*` values are frozen at build time; pass them as build arguments. Supply backend database/Auth/CORS settings only at runtime. Deploy FastAPI near the Supabase database region and route public HTTPS traffic to the two services.

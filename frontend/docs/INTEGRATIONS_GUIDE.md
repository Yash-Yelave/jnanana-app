# Backend & External Integrations Roadmap

While all 28 frontend pages and UI workflows are 100% complete, the application currently uses mock front-end state. This guide provides a developer integration roadmap for connecting live backend APIs and external cloud services.

---

## 🔐 1. Authentication & User Sessions

### Routes Involved
- `/login`, `/onboarding/student`, `/onboarding/mentor`, `/settings`

### Recommended Providers
- **NextAuth.js (Auth.js)**, **Supabase Auth**, or **Firebase Auth**

### Implementation Steps
1. Add an Auth provider wrapper in `src/app/layout.tsx`.
2. Replace static form submission in `src/components/onboarding-flow.tsx` with `signIn()` or API POST calls to `/api/auth/register`.
3. Store JWT / session cookie to guard protected routes (e.g. `/dashboard/*`, `/profile/*`, `/mentor/*`) using Next.js Middleware (`middleware.ts`).

---

## 💳 2. Payment Gateway & Subscription Billing

### Routes Involved
- `/payment`, `/subscription`, `/lessons/book`

### Recommended Providers
- **Stripe Elements** or **Razorpay SDK**

### Implementation Steps
1. Add server action / API route `/api/checkout/create-intent` to initialize payment intents.
2. Embed Stripe CardElement / PaymentElement inside `/payment/page.tsx` and `/subscription/page.tsx`.
3. Configure webhook endpoint `/api/webhooks/stripe` to handle successful payment events, session upgrades, and lesson booking confirmations.

---

## 💬 3. Real-Time Chat & Community Messaging

### Routes Involved
- `/chat`, `/community`

### Recommended Providers
- **WebSockets (Socket.io)**, **Stream Chat API**, or **Ably Realtime**

### Implementation Steps
1. Replace mock chat history state in `/chat/page.tsx` with a WebSocket hook (`useSocket`).
2. Subscribe to room channels for 1:1 conversation IDs and open-mic community channels.
3. Persist message logs in PostgreSQL / MongoDB database.

---

## 📹 4. Live 1:1 Video Conference

### Routes Involved
- `/meeting`

### Recommended Providers
- **Daily.co**, **Agora Video SDK**, or **Twilio Video / WebRTC**

### Implementation Steps
1. Integrate room creation API `/api/meeting/create-room`.
2. Embed WebRTC video track elements inside the video grid containers in `/meeting/page.tsx`.
3. Hook up microphone toggle, camera toggle, and screen share controls to WebRTC media stream state.

---

## 📩 5. Referral & Email Notifications

### Routes Involved
- `/referrals`, `/waiting`

### Recommended Providers
- **Resend** / **SendGrid** for transactional email delivery.

### Implementation Steps
1. Implement referral code validation API `/api/referrals/verify`.
2. Send automated welcome & tutor verification approval emails upon account status updates.

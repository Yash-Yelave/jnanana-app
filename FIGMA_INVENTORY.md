# Figma Inventory

## Design source

- File: Production UI
- File key: `57IVmUa7w3XC0qaO4rjvDw`
- Page: Upskillink (`0:1`)
- Entry node: `0:1`
- Production identity: Upskillink learning and mentorship platform

## Production screens

Responsive variants use one route per experience. Duplicate desktop frames in the flow boards are interaction states, not separate routes.

| # | Figma screen / canonical node | Route | Variants | Major sections / interactions | Build | Visual QA |
|---|---|---|---|---|---|---|
| 1 | Landing page `2280:14926` | `/` | 1728, 1024 `2280:27801`, 390 `2280:20928` | Marketing hero, outcomes, process, mentors, features, CTA, footer | Complete | Figma references inspected; rendered browser pass pending |
| 2 | Log in `818:6163` | `/login` | Desktop; responsive auth family | Credentials, recovery/social entry | Complete | Exported auth-family references inspected; browser pass pending |
| 3 | Student onboarding phases `501:12379`, `501:12396`, `501:12452` | `/onboarding/student` | 1728, 1024 `986:18125`/`986:17987`/`986:18042`, 390 `986:18142`/`986:21019`/`986:21081` | Role, interests, account details, access code | Complete | Desktop/mobile export references inspected; browser pass pending |
| 4 | Mentor onboarding `501:62670`, `501:62805`, `501:62726` | `/onboarding/mentor` | 1728, 1024 `501:62875`/`501:62928`/`501:63004` | Mentor profile setup flow | Complete | Desktop export references inspected; browser pass pending |
| 5 | Waiting screens `501:12521`, `501:12783` | `/waiting` | 1728, responsive feedback variants | Loading/feedback state | Complete | Both exported states inspected; browser pass pending |
| 6 | Student home `741:6118` | `/dashboard/home` | 1728, 1024 `986:16101`, 390 `986:16710` | Personalized home, mentors, learning content | Complete | Exported desktop/mobile references inspected; browser pass pending |
| 7 | Mentor directory `501:18532` | `/mentors` | 1728, responsive card/list variants | Browse/filter mentors | Complete | Exported directory reference inspected; browser pass pending |
| 8 | Mentor detail states `741:8362`, `741:8598`, `741:8829` | `/mentors/[id]` | 1728, 1024/390 variants in Responsive UI | Profile, professional/verified states, follow/book | Complete | Exported profile states inspected; browser pass pending |
| 9 | Lesson booking `741:9058` | `/lessons/book` | 1728, 1024 `986:27379`, 390 `986:27993` | Select lesson and booking details | Complete | Exported booking references inspected; browser pass pending |
| 10 | Schedule `741:9308` | `/schedule` | Desktop/tablet/mobile inferred from shared shell | Calendar and time selection | Complete | Exported schedule reference inspected; browser pass pending |
| 11 | Subscription `501:17719` | `/subscription` | Desktop | Plan selection | Complete | Exported reference inspected; browser pass pending |
| 12 | Student profile `897:6163` | `/profile` | 1728, responsive profile variants | Profile summary and navigation | Complete | Exported profile reference inspected; browser pass pending |
| 13 | Student lessons `897:6702` | `/profile/lessons` | 1728 | Lesson history/status | Complete | Exported lessons state inspected; browser pass pending |
| 14 | Student feedback `897:6383` | `/profile/feedback` | 1728 | Feedback cards/forms | Complete | Exported feedback state inspected; browser pass pending |
| 15 | Edit profile `897:8100` | `/profile/edit` | 1728, 1024 `1004:33074`, 390 `1004:33213` | Editable personal details | Complete | Exported responsive references inspected; browser pass pending |
| 16 | Student dashboard `501:25486` | `/dashboard` | 1728 | Analytics, leaderboard and progress | Complete | Exported statistics reference inspected; browser pass pending |
| 17 | 1:1 meeting `501:26647` | `/meeting` | 1728, responsive meeting variants | Video controls and participants | Complete | Exported meeting reference inspected; browser pass pending |
| 18 | Community room `501:21403` | `/community` | 1728, responsive community variants | Community feed and room navigation | Complete | Exported community references inspected; browser pass pending |
| 19 | Chat room `501:19472` | `/chat` | 1728 | Conversation list and composer | Complete | Exported chat reference inspected; browser pass pending |
| 20 | Settings `501:23372` | `/settings` | 1728 | Settings navigation, logout overlay | Complete | Exported settings and overlay states inspected; browser pass pending |
| 21 | Payment `501:24035` | `/payment` | 1728 | Payment UI; provider integration deferred | Complete | Exported payment reference inspected; browser pass pending |
| 22 | Student referrals `501:24448` | `/referrals` | 1728 | Referral code and sharing | Complete | Exported referral reference inspected; browser pass pending |
| 23 | Mentor marketing `501:44889` | `/mentor` | 1706, 1024 `501:56027`, 390 `501:51531` | Mentor-specific landing content | Not started | Not started |
| 24 | Mentor home `741:15901` | `/mentor/home` | 1728, 1024/390 responsive board | Opportunities and lesson requests | Not started | Not started |
| 25 | Mentor bookings states `741:18880`, `741:19187`, `741:17908`, `741:17417` | `/mentor/bookings` | 1728 | Bid, counter-bid, accept and meeting states | Not started | Not started |
| 26 | Mentor profile `741:14433` | `/mentor/profile` | 1728 | Mentor profile summary | Not started | Not started |
| 27 | Mentor lessons `741:14619`, `741:14964`, `985:12310`, `985:12640` | `/mentor/lessons` | 1728 | Upcoming/completed lesson states | Not started | Not started |
| 28 | Mentor dashboard `501:68381` | `/mentor/dashboard` | 1728 | Mentor analytics and earnings | Not started | Not started |

## Shared components discovered

| Component family | Figma source | Variants/states | Used on | Implementation |
|---|---|---|---|---|
| Brand mark / wordmark | Repeated `Group 427318202` | Large, compact, sidebar | Global | Complete |
| Public navigation | Landing header in `2280:14926` | Desktop/mobile | Public pages | Complete |
| Application sidebar/header | Responsive UI and flow boards | Student/mentor, desktop/mobile drawer | Authenticated routes | Complete |
| Buttons / CTAs | Components `827:6165` and repeated frames | Primary, secondary, outline, icon | Global | Landing variants complete |
| Mentor cards | Landing and mentor frames | Default, followed, professional, verified | Landing/mentors | Landing variants complete |
| Lesson cards | Student and mentor flow boards | Requested, bid, counter-bid, accepted | Lesson routes | Student variants complete |
| Form controls | Onboarding/profile/settings | Text, phone, password, access code, select | Forms | Auth/onboarding variants complete |
| Profile tabs | Student and mentor profile frames | Profile, lessons, feedback | Profile routes | Student variants complete |
| Footer | Landing `2280:20806` | Desktop/tablet/mobile | Public pages | Complete |

## Overlays / UI states

| Name | Figma node | Belongs to | Trigger | Implementation |
|---|---|---|---|---|
| Logout confirmation | `501:23697` | Settings | Log out | Complete |
| Lesson bid/counter-bid states | `741:17908`, `741:19187`, `741:17417` | Mentor bookings | Booking actions | Not started |
| Mentor professional/verified states | Responsive variants around `989:29757` | Mentor detail | Profile state | Not started |
| Mobile navigation drawer | `2280:33758` and responsive boards | Shared shell | Menu button | Not started |

## Design-system areas

| Area | Node | Notes |
|---|---|---|
| Components | `827:6164` | Component/reference board; excluded as route |
| Responsive UI | `986:15364` | Tablet/mobile variants and implementation anchors |
| Technical reference | `793:6165` | Non-production technical board |

## Assets

- Exact Figma images, illustrations, logos and custom icons will be persisted under `frontend/public/assets/` as each route is implemented.
- Landing page contains mentor photography, company marks, testimonial avatars, feature imagery and illustrations.
- Onboarding/waiting/meeting flows contain custom illustrations and control icons.

## Prototype / navigation relationships

- Public landing CTAs lead to student sign-up/onboarding or mentor landing/onboarding.
- Student shell links Home, Dashboard, Mentorship, Chat Room, Open Mic/Community and Settings.
- Mentor shell reuses the same navigation model with mentor-specific home, bookings, lessons, dashboard and profile destinations.
- Booking flows lead to schedule/payment/meeting states; no real external transaction is implied by the static UI.

## Non-production / excluded frames

| Frame / area | Reason excluded |
|---|---|
| Components `827:6164` | Component/reference board |
| Tech imp `793:6165` | Technical reference board |
| Duplicate Home Page / important-flow sections | Alternate interaction states and duplicated source compositions |
| Standalone annotations, route labels and detached groups | Canvas documentation, not pages |
| Duplicate Landing_Page `501:27177` | Earlier duplicate of canonical `2730:15030` landing area |

## Route decisions / assumptions

- The newer landing page frame `2280:14926` is canonical for `/`; desktop/mobile/tablet siblings form one responsive route.
- Repeated numbered and duplicate desktop frames are states of one route unless they show a distinct content destination.
- Payment is visual-only until a provider and server verification contract are configured.

-- Phase 1 SRS schema: events, participation, the Jule token ledger, and mentorship requests.
--
-- Mentors are NOT scoped to events: mentors and mentees both self-register and
-- discovery is global, so there is deliberately no event_mentors join table.
--
-- Writes happen through the FastAPI service role. The policies below grant read
-- access only, matching the pattern used by the initial platform schema.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  event_date timestamptz not null,
  location text not null default 'Online / Hybrid',
  image_path text,
  status text not null default 'draft' check (status in ('draft', 'published', 'completed')),
  created_at timestamptz not null default now()
);

create table public.event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  registration_status text not null default 'registered'
    check (registration_status in ('registered', 'cancelled')),
  checkin_status text not null default 'pending'
    check (checkin_status in ('pending', 'checked_in')),
  tokens_allocated boolean not null default false,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table public.jule_wallets (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table public.jule_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid references public.events (id) on delete set null,
  amount integer not null check (amount <> 0),
  transaction_type text not null check (transaction_type in (
    'event_allocation', 'activity_reward', 'mentor_request', 'refund', 'admin_deduction'
  )),
  related_mentor_id uuid references public.mentor_profiles (profile_id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.mentorship_requests (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid not null references public.profiles (id) on delete cascade,
  mentor_id uuid not null references public.mentor_profiles (profile_id) on delete cascade,
  event_id uuid references public.events (id) on delete set null,
  tokens_used integer not null default 10 check (tokens_used > 0),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mentorship_request_not_self check (mentee_id <> mentor_id)
);

create index event_participants_event_idx on public.event_participants (event_id);
create index event_participants_user_idx on public.event_participants (user_id);
create index jule_transactions_user_idx on public.jule_transactions (user_id, created_at desc);
create index mentorship_requests_mentor_idx on public.mentorship_requests (mentor_id, created_at desc);
create index mentorship_requests_mentee_idx on public.mentorship_requests (mentee_id, created_at desc);

-- One pending request per mentee/mentor pair; enforced in the DB, not only in the router.
create unique index mentorship_requests_one_pending
  on public.mentorship_requests (mentee_id, mentor_id)
  where status = 'pending';

alter table public.events enable row level security;
alter table public.event_participants enable row level security;
alter table public.jule_wallets enable row level security;
alter table public.jule_transactions enable row level security;
alter table public.mentorship_requests enable row level security;

create policy "published events read" on public.events for select to anon, authenticated
using (status = 'published');

create policy "participation own read" on public.event_participants for select to authenticated
using ((select auth.uid()) = user_id);

create policy "jule wallet own read" on public.jule_wallets for select to authenticated
using ((select auth.uid()) = user_id);

create policy "jule transactions own read" on public.jule_transactions for select to authenticated
using ((select auth.uid()) = user_id);

create policy "mentorship requests parties read" on public.mentorship_requests for select to authenticated
using ((select auth.uid()) in (mentee_id, mentor_id));

create extension if not exists btree_gist with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student', 'mentor')),
  onboarding_status text not null default 'incomplete' check (onboarding_status in ('incomplete', 'pending', 'complete')),
  first_name text not null check (length(first_name) between 1 and 80),
  last_name text not null check (length(last_name) between 1 and 80),
  username text unique check (username is null or username ~ '^[A-Za-z0-9_]{3,40}$'),
  phone text,
  location text,
  avatar_path text,
  bio text check (bio is null or length(bio) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  notify_activity boolean not null default true,
  weekly_digest boolean not null default true,
  notify_collaborations boolean not null default true,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  updated_at timestamptz not null default now()
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.profile_skills (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  kind text not null check (kind in ('learning', 'teaching')),
  primary key (profile_id, skill_id, kind)
);

create table public.mentor_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  headline text,
  bio text check (bio is null or length(bio) <= 4000),
  hourly_rate_minor integer not null default 0 check (hourly_rate_minor >= 0),
  currency char(3) not null default 'INR',
  languages text[] not null default '{}',
  professions text[] not null default '{}',
  companies text[] not null default '{}',
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mentor_documents (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentor_profiles(profile_id) on delete cascade,
  storage_path text not null unique,
  document_type text not null,
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table public.mentor_availability (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentor_profiles(profile_id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  timezone text not null default 'Asia/Kolkata',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint availability_time_order check (starts_at < ends_at),
  unique (mentor_id, weekday, starts_at, ends_at)
);

create table public.availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentor_profiles(profile_id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  available boolean not null default false,
  reason text,
  constraint availability_exception_order check (starts_at < ends_at)
);

create table public.lesson_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  preferred_mentor_id uuid references public.mentor_profiles(profile_id) on delete set null,
  skill_id uuid references public.skills(id) on delete set null,
  title text not null check (length(title) between 3 and 160),
  description text not null check (length(description) between 10 and 5000),
  requested_start timestamptz not null,
  requested_end timestamptz not null,
  proposed_amount_minor integer not null check (proposed_amount_minor >= 0),
  currency char(3) not null default 'INR',
  status text not null default 'open' check (status in ('open', 'negotiating', 'accepted', 'cancelled', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lesson_request_time_order check (requested_start < requested_end)
);

create table public.lesson_offers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.lesson_requests(id) on delete cascade,
  mentor_id uuid not null references public.mentor_profiles(profile_id) on delete cascade,
  amount_minor integer not null check (amount_minor >= 0),
  currency char(3) not null default 'INR',
  note text check (note is null or length(note) <= 2000),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, mentor_id, status)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.lesson_requests(id) on delete restrict,
  accepted_offer_id uuid unique references public.lesson_offers(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete restrict,
  mentor_id uuid not null references public.mentor_profiles(profile_id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  amount_minor integer not null check (amount_minor >= 0),
  platform_fee_minor integer not null default 0 check (platform_fee_minor >= 0),
  currency char(3) not null default 'INR',
  status text not null default 'pending_payment' check (status in ('pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed')),
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_time_order check (starts_at < ends_at),
  constraint mentor_booking_overlap exclude using gist (
    mentor_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('confirmed', 'in_progress')),
  constraint student_booking_overlap exclude using gist (
    student_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('confirmed', 'in_progress'))
);

create table public.booking_resources (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes between 1 and 26214400),
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete restrict,
  mentor_id uuid not null references public.mentor_profiles(profile_id) on delete restrict,
  rating smallint not null check (rating between 1 and 5),
  comment text check (comment is null or length(comment) <= 3000),
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid references public.mentor_profiles(profile_id) on delete set null,
  skill_id uuid references public.skills(id) on delete set null,
  slug text not null unique,
  title text not null,
  description text not null,
  image_path text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_units (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null check (position >= 0),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  content_url text,
  unique (course_id, position)
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (course_id, student_id)
);

create table public.course_progress (
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  unit_id uuid not null references public.course_units(id) on delete cascade,
  completed_at timestamptz,
  primary key (enrollment_id, unit_id)
);

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  image_path text,
  tags text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.community_members (
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('member', 'moderator')),
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('direct', 'booking', 'community')),
  booking_id uuid unique references public.bookings(id) on delete cascade,
  community_id uuid unique references public.communities(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  constraint conversation_target check (
    (kind = 'booking' and booking_id is not null and community_id is null)
    or (kind = 'community' and community_id is not null and booking_id is null)
    or (kind = 'direct' and booking_id is null and community_id is null)
  )
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete restrict,
  body text not null check (length(body) between 1 and 5000),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  price_minor integer not null check (price_minor >= 0),
  currency char(3) not null default 'INR',
  billing_interval text not null default 'month' check (billing_interval in ('month', 'year')),
  features jsonb not null default '[]'::jsonb,
  active boolean not null default true
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'active', 'past_due', 'cancelled', 'expired')),
  provider text,
  provider_subscription_id text unique,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  booking_id uuid references public.bookings(id) on delete restrict,
  subscription_id uuid references public.subscriptions(id) on delete restrict,
  amount_minor integer not null check (amount_minor >= 0),
  currency char(3) not null default 'INR',
  status text not null default 'created' check (status in ('created', 'pending', 'succeeded', 'failed', 'refunded')),
  provider text,
  provider_order_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_order_target check (num_nonnulls(booking_id, subscription_id) = 1)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.payment_orders(id) on delete restrict,
  provider_payment_id text unique,
  status text not null check (status in ('pending', 'succeeded', 'failed', 'refunded')),
  amount_minor integer not null check (amount_minor >= 0),
  currency char(3) not null default 'INR',
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  payment_id uuid not null unique references public.payments(id) on delete restrict,
  number text not null unique,
  storage_path text,
  issued_at timestamptz not null default now()
);

create table public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z0-9]{6,20}$'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.referral_codes(id) on delete restrict,
  referred_user_id uuid not null unique references public.profiles(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'qualified', 'rewarded', 'cancelled')),
  created_at timestamptz not null default now(),
  qualified_at timestamptz
);

create table public.wallet_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  amount_minor integer not null check (amount_minor <> 0),
  currency char(3) not null default 'INR',
  kind text not null check (kind in ('purchase', 'booking', 'refund', 'referral', 'adjustment')),
  reference_id uuid,
  created_at timestamptz not null default now()
);

create table public.reputation_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  points integer not null check (points <> 0),
  reason text not null,
  reference_id uuid,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table private.idempotency_keys (
  user_id uuid not null references public.profiles(id) on delete cascade,
  key text not null,
  operation text not null,
  resource_id uuid,
  response_status integer,
  response_body jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id, key)
);

create table private.integration_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create table private.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text := case when new.raw_user_meta_data ->> 'role' = 'mentor' then 'mentor' else 'student' end;
begin
  insert into public.profiles (
    id,
    role,
    onboarding_status,
    first_name,
    last_name,
    phone,
    location,
    bio
  ) values (
    new.id,
    requested_role,
    case when requested_role = 'mentor' then 'pending' else 'complete' end,
    coalesce(nullif(new.raw_user_meta_data ->> 'first_name', ''), split_part(new.email, '@', 1)),
    coalesce(nullif(new.raw_user_meta_data ->> 'last_name', ''), 'Member'),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'location', ''),
    nullif(new.raw_user_meta_data ->> 'bio', '')
  ) on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  if requested_role = 'mentor' then
    insert into public.mentor_profiles (
      profile_id,
      headline,
      bio,
      hourly_rate_minor,
      currency,
      languages,
      professions,
      companies
    ) values (
      new.id,
      nullif(new.raw_user_meta_data ->> 'headline', ''),
      nullif(new.raw_user_meta_data ->> 'bio', ''),
      case
        when coalesce(new.raw_user_meta_data ->> 'hourly_rate_minor', '') ~ '^[0-9]{1,9}$'
        then (new.raw_user_meta_data ->> 'hourly_rate_minor')::integer
        else 0
      end,
      'INR',
      coalesce(array(select jsonb_array_elements_text(
        case when jsonb_typeof(new.raw_user_meta_data -> 'languages') = 'array'
          then new.raw_user_meta_data -> 'languages' else '[]'::jsonb end
      )), '{}'),
      coalesce(array(select jsonb_array_elements_text(
        case when jsonb_typeof(new.raw_user_meta_data -> 'professions') = 'array'
          then new.raw_user_meta_data -> 'professions' else '[]'::jsonb end
      )), '{}'),
      coalesce(array(select jsonb_array_elements_text(
        case when jsonb_typeof(new.raw_user_meta_data -> 'companies') = 'array'
          then new.raw_user_meta_data -> 'companies' else '[]'::jsonb end
      )), '{}')
    ) on conflict (profile_id) do nothing;
  end if;

  insert into public.profile_skills (profile_id, skill_id, kind)
  select new.id, id, case when requested_role = 'mentor' then 'teaching' else 'learning' end
  from public.skills
  where slug = new.raw_user_meta_data ->> 'skill_slug'
  on conflict do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_auth_user();

create index profiles_role_idx on public.profiles (role, onboarding_status);
create index profile_skills_skill_idx on public.profile_skills (skill_id, kind);
create index mentor_profiles_approved_idx on public.mentor_profiles (approval_status) where approval_status = 'approved';
create index availability_mentor_weekday_idx on public.mentor_availability (mentor_id, weekday) where active;
create index availability_exceptions_mentor_time_idx on public.availability_exceptions (mentor_id, starts_at, ends_at);
create index lesson_requests_student_status_idx on public.lesson_requests (student_id, status, requested_start desc);
create index lesson_requests_mentor_status_idx on public.lesson_requests (preferred_mentor_id, status, requested_start desc);
create index lesson_offers_request_idx on public.lesson_offers (request_id, status);
create index lesson_offers_mentor_idx on public.lesson_offers (mentor_id, status, created_at desc);
create index bookings_student_time_idx on public.bookings (student_id, starts_at desc);
create index bookings_mentor_time_idx on public.bookings (mentor_id, starts_at desc);
create index reviews_mentor_idx on public.reviews (mentor_id, created_at desc);
create index courses_status_idx on public.courses (status, created_at desc);
create index enrollments_student_idx on public.enrollments (student_id, status);
create index community_members_user_idx on public.community_members (user_id);
create index conversation_members_user_idx on public.conversation_members (user_id, conversation_id);
create index messages_conversation_cursor_idx on public.messages (conversation_id, created_at desc, id desc);
create index subscriptions_user_idx on public.subscriptions (user_id, status);
create index payment_orders_user_idx on public.payment_orders (user_id, created_at desc);
create index wallet_entries_user_idx on public.wallet_entries (user_id, created_at desc);
create index reputation_entries_user_idx on public.reputation_entries (user_id, created_at desc);
create index notifications_user_unread_idx on public.notifications (user_id, created_at desc) where read_at is null;

alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.skills enable row level security;
alter table public.profile_skills enable row level security;
alter table public.mentor_profiles enable row level security;
alter table public.mentor_documents enable row level security;
alter table public.mentor_availability enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.lesson_requests enable row level security;
alter table public.lesson_offers enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_resources enable row level security;
alter table public.reviews enable row level security;
alter table public.courses enable row level security;
alter table public.course_units enable row level security;
alter table public.enrollments enable row level security;
alter table public.course_progress enable row level security;
alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_orders enable row level security;
alter table public.payments enable row level security;
alter table public.invoices enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;
alter table public.wallet_entries enable row level security;
alter table public.reputation_entries enable row level security;
alter table public.notifications enable row level security;

create policy "profiles own read" on public.profiles for select to authenticated
using ((select auth.uid()) = id);
create policy "settings own read" on public.user_settings for select to authenticated
using ((select auth.uid()) = user_id);
create policy "skills active read" on public.skills for select to anon, authenticated
using (active);
create policy "profile skills own read" on public.profile_skills for select to authenticated
using ((select auth.uid()) = profile_id);
create policy "approved mentor read" on public.mentor_profiles for select to anon, authenticated
using (approval_status = 'approved' or (select auth.uid()) = profile_id);
create policy "mentor documents own read" on public.mentor_documents for select to authenticated
using ((select auth.uid()) = mentor_id);
create policy "availability approved read" on public.mentor_availability for select to anon, authenticated
using (exists (select 1 from public.mentor_profiles mp where mp.profile_id = mentor_id and mp.approval_status = 'approved'));
create policy "availability exceptions own read" on public.availability_exceptions for select to authenticated
using ((select auth.uid()) = mentor_id);
create policy "lesson requests parties read" on public.lesson_requests for select to authenticated
using ((select auth.uid()) = student_id or (select auth.uid()) = preferred_mentor_id);
create policy "lesson offers parties read" on public.lesson_offers for select to authenticated
using ((select auth.uid()) = mentor_id or exists (
  select 1 from public.lesson_requests lr where lr.id = request_id and lr.student_id = (select auth.uid())
));
create policy "bookings parties read" on public.bookings for select to authenticated
using ((select auth.uid()) in (student_id, mentor_id));
create policy "booking resources parties read" on public.booking_resources for select to authenticated
using (exists (
  select 1 from public.bookings b where b.id = booking_id and (select auth.uid()) in (b.student_id, b.mentor_id)
));
create policy "reviews public read" on public.reviews for select to anon, authenticated using (true);
create policy "published courses read" on public.courses for select to anon, authenticated using (status = 'published');
create policy "published course units read" on public.course_units for select to anon, authenticated
using (exists (select 1 from public.courses c where c.id = course_id and c.status = 'published'));
create policy "enrollments own read" on public.enrollments for select to authenticated
using ((select auth.uid()) = student_id);
create policy "progress own read" on public.course_progress for select to authenticated
using (exists (select 1 from public.enrollments e where e.id = enrollment_id and e.student_id = (select auth.uid())));
create policy "active communities read" on public.communities for select to anon, authenticated using (active);
create policy "community memberships own read" on public.community_members for select to authenticated
using ((select auth.uid()) = user_id);
create policy "conversation member read" on public.conversations for select to authenticated
using (exists (
  select 1 from public.conversation_members cm where cm.conversation_id = id and cm.user_id = (select auth.uid())
));
create policy "conversation memberships read" on public.conversation_members for select to authenticated
using ((select auth.uid()) = user_id);
create policy "conversation messages read" on public.messages for select to authenticated
using (exists (
  select 1 from public.conversation_members cm where cm.conversation_id = messages.conversation_id and cm.user_id = (select auth.uid())
));
create policy "active plans read" on public.plans for select to anon, authenticated using (active);
create policy "subscriptions own read" on public.subscriptions for select to authenticated
using ((select auth.uid()) = user_id);
create policy "payment orders own read" on public.payment_orders for select to authenticated
using ((select auth.uid()) = user_id);
create policy "payments own read" on public.payments for select to authenticated
using (exists (select 1 from public.payment_orders po where po.id = order_id and po.user_id = (select auth.uid())));
create policy "invoices own read" on public.invoices for select to authenticated
using ((select auth.uid()) = user_id);
create policy "referral codes own read" on public.referral_codes for select to authenticated
using ((select auth.uid()) = owner_id);
create policy "referrals parties read" on public.referrals for select to authenticated
using ((select auth.uid()) = referred_user_id or exists (
  select 1 from public.referral_codes rc where rc.id = code_id and rc.owner_id = (select auth.uid())
));
create policy "wallet own read" on public.wallet_entries for select to authenticated
using ((select auth.uid()) = user_id);
create policy "reputation own read" on public.reputation_entries for select to authenticated
using ((select auth.uid()) = user_id);
create policy "notifications own read" on public.notifications for select to authenticated
using ((select auth.uid()) = user_id);

revoke all on all tables in schema public from anon, authenticated;
grant select on public.skills, public.mentor_profiles, public.mentor_availability, public.reviews,
  public.courses, public.course_units, public.communities, public.plans to anon, authenticated;
grant select on public.profiles, public.profile_skills, public.mentor_documents, public.availability_exceptions,
  public.lesson_requests, public.lesson_offers, public.bookings, public.booking_resources, public.enrollments,
  public.course_progress, public.community_members, public.conversations, public.conversation_members,
  public.messages, public.subscriptions, public.payment_orders, public.payments, public.invoices,
  public.referral_codes, public.referrals, public.wallet_entries, public.reputation_entries,
  public.notifications, public.user_settings to authenticated;

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('avatars', 'avatars', true, 5242880),
  ('mentor-documents', 'mentor-documents', false, 10485760),
  ('lesson-resources', 'lesson-resources', false, 26214400)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;

create policy "avatars public read" on storage.objects for select to anon, authenticated
using (bucket_id = 'avatars');
create policy "avatars owner insert" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars owner update" on storage.objects for update to authenticated
using (bucket_id = 'avatars' and owner_id = (select auth.uid()))
with check (bucket_id = 'avatars' and owner_id = (select auth.uid()));
create policy "avatars owner delete" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and owner_id = (select auth.uid()));

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

insert into public.skills (slug, name) values
  ('business-management', 'Business management'),
  ('design', 'Design'),
  ('development', 'Development'),
  ('marketing', 'Marketing')
on conflict (slug) do nothing;

insert into public.plans (slug, name, price_minor, features) values
  ('basic', 'Basic', 49900, '["Learning tracks", "Community access"]'),
  ('professional', 'Professional', 99900, '["Basic features", "Monthly mentorship"]'),
  ('premium', 'Premium', 149900, '["Unlimited mentorship", "Priority booking"]')
on conflict (slug) do nothing;

insert into public.communities (slug, name, description, image_path, tags) values
  ('blender-guild', 'Blender Guild', 'A supportive community for sharing 3D progress and practical feedback.', '/assets/app/course-design.png', array['3D Modeling', 'Texturing Tips']),
  ('ar-vr-world', 'AR x VR World', 'Explore immersive products, prototypes, and beta testing together.', '/assets/app/course-css.png', array['AR Games', 'Beta Testing']),
  ('startup-strategists', 'Startup Strategists', 'Discuss practical startup growth, positioning, and execution.', '/assets/app/course-data.png', array['Business', 'Growth'])
on conflict (slug) do nothing;

insert into public.courses (slug, title, description, image_path, status) values
  ('front-end-react-basics', 'Front End with React : Basics', 'Build a practical foundation in modern React development.', '/assets/app/course-design.png', 'published'),
  ('nodejs-for-backend', 'Node.js for backend', 'Learn the core patterns used to build Node.js backend services.', '/assets/app/course-css.png', 'published'),
  ('javascript-basics', 'Basics Of JavaScript', 'Learn JavaScript variables, control flow, functions, and loops.', '/assets/app/course-data.png', 'published'),
  ('ui-design-systems', 'UI Design Systems', 'Create coherent interface foundations and reusable components.', '/assets/app/course-design.png', 'published')
on conflict (slug) do nothing;

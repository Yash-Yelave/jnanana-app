-- Migration: Security & Row Level Security (RLS) Policies
-- Date: 2026-08-20
-- Description: Enables RLS on all platform tables and defines user-level access policies.

-- 1. Enable RLS on core SRS tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jule_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.jule_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lesson_requests ENABLE ROW LEVEL SECURITY;

-- 2. Drop legacy EventMentor table if exists
DROP TABLE IF EXISTS public.event_mentors CASCADE;

-- 3. RLS Policies

-- PROFILES
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- MENTOR PROFILES
DROP POLICY IF EXISTS "Approved mentors read" ON public.mentor_profiles;
CREATE POLICY "Approved mentors read" ON public.mentor_profiles
  FOR SELECT USING (approval_status = 'approved' OR auth.uid() = profile_id);

DROP POLICY IF EXISTS "Mentors update own profile" ON public.mentor_profiles;
CREATE POLICY "Mentors update own profile" ON public.mentor_profiles
  FOR UPDATE USING (auth.uid() = profile_id);

-- JULE WALLETS
DROP POLICY IF EXISTS "Users read own wallet" ON public.jule_wallets;
CREATE POLICY "Users read own wallet" ON public.jule_wallets
  FOR SELECT USING (auth.uid() = user_id);

-- JULE TRANSACTIONS
DROP POLICY IF EXISTS "Users read own transactions" ON public.jule_transactions;
CREATE POLICY "Users read own transactions" ON public.jule_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- MENTORSHIP REQUESTS
DROP POLICY IF EXISTS "Users read own mentorship requests" ON public.mentorship_requests;
CREATE POLICY "Users read own mentorship requests" ON public.mentorship_requests
  FOR SELECT USING (auth.uid() = mentee_id OR auth.uid() = mentor_id);

DROP POLICY IF EXISTS "Mentees insert mentorship requests" ON public.mentorship_requests;
CREATE POLICY "Mentees insert mentorship requests" ON public.mentorship_requests
  FOR INSERT WITH CHECK (auth.uid() = mentee_id);

DROP POLICY IF EXISTS "Participants update mentorship requests" ON public.mentorship_requests;
CREATE POLICY "Participants update mentorship requests" ON public.mentorship_requests
  FOR UPDATE USING (auth.uid() = mentee_id OR auth.uid() = mentor_id);

-- EVENTS
DROP POLICY IF EXISTS "Public events read" ON public.events;
CREATE POLICY "Public events read" ON public.events
  FOR SELECT USING (true);

-- EVENT PARTICIPANTS
DROP POLICY IF EXISTS "Users read own event participation" ON public.event_participants;
CREATE POLICY "Users read own event participation" ON public.event_participants
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert event participation" ON public.event_participants;
CREATE POLICY "Users insert event participation" ON public.event_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- BOOKINGS
DROP POLICY IF EXISTS "Users read own bookings" ON public.bookings;
CREATE POLICY "Users read own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = student_id OR auth.uid() = mentor_id);

-- REVIEWS
DROP POLICY IF EXISTS "Public reviews read" ON public.reviews;
CREATE POLICY "Public reviews read" ON public.reviews
  FOR SELECT USING (true);

-- SKILLS
DROP POLICY IF EXISTS "Public skills read" ON public.skills;
CREATE POLICY "Public skills read" ON public.skills
  FOR SELECT USING (true);

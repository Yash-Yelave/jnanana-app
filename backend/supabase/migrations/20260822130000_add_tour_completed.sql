-- Add tour_completed to user_settings
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS tour_completed BOOLEAN DEFAULT FALSE;

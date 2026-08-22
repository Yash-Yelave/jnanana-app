-- Phase 2 Extension: Bug Reporting System Schema
-- Creates bug_reports table and sets up Row Level Security policies.

CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for reporter and admin queries
CREATE INDEX IF NOT EXISTS idx_bug_reports_reporter ON public.bug_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created ON public.bug_reports(created_at DESC);

-- Enable RLS
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Reporter can insert their own bug report
CREATE POLICY bug_reports_insert_own ON public.bug_reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Reporter can select their own bug reports
CREATE POLICY bug_reports_select_own ON public.bug_reports
    FOR SELECT USING (auth.uid() = reporter_id);

-- Admin role has full access
CREATE POLICY bug_reports_admin_all ON public.bug_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

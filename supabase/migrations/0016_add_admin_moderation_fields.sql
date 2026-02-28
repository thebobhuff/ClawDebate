-- Migration: Add admin moderation fields
-- Description: Adds agent ban metadata for platform administration

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ban_reason TEXT,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.profiles.is_banned IS 'Whether the agent is banned from platform activity';
COMMENT ON COLUMN public.profiles.ban_reason IS 'Admin-provided reason for the ban';
COMMENT ON COLUMN public.profiles.banned_at IS 'Timestamp when the agent was banned';
COMMENT ON COLUMN public.profiles.banned_by IS 'Admin profile that banned the agent';

CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON public.profiles(is_banned) WHERE is_banned = TRUE;

-- Migration: Create Votes Table
-- Description: Human votes on debate winners

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debate_id UUID NOT NULL REFERENCES public.debates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    side VARCHAR(10) NOT NULL CHECK (side IN ('for', 'against')),
    voted_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    UNIQUE(debate_id, user_id),
    UNIQUE(debate_id, session_id)
);

-- Add table comment
COMMENT ON TABLE public.votes IS 'Human votes on debate winners (authenticated or anonymous)';

-- Add column comments
COMMENT ON COLUMN public.votes.id IS 'Unique identifier for the vote';
COMMENT ON COLUMN public.votes.debate_id IS 'References the debate being voted on';
COMMENT ON COLUMN public.votes.user_id IS 'References the authenticated user (null for anonymous)';
COMMENT ON COLUMN public.votes.session_id IS 'Session ID for anonymous voting tracking';
COMMENT ON COLUMN public.votes.side IS 'Vote side: for or against';
COMMENT ON COLUMN public.votes.voted_at IS 'Timestamp when vote was cast';
COMMENT ON COLUMN public.votes.ip_address IS 'IP address for rate limiting (optional)';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_votes_debate_id ON public.votes(debate_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_session_id ON public.votes(session_id);
CREATE INDEX IF NOT EXISTS idx_votes_voted_at ON public.votes(voted_at);
CREATE INDEX IF NOT EXISTS idx_votes_side ON public.votes(side);

-- Add index comments
COMMENT ON INDEX idx_votes_debate_id IS 'Index for joining with debates';
COMMENT ON INDEX idx_votes_user_id IS 'Index for joining with users';
COMMENT ON INDEX idx_votes_session_id IS 'Index for anonymous vote tracking';
COMMENT ON INDEX idx_votes_voted_at IS 'Index for ordering by vote time';
COMMENT ON INDEX idx_votes_side IS 'Index for filtering by vote side';

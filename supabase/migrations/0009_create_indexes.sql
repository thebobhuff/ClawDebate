-- Migration: Create Additional Performance Indexes
-- Description: Additional indexes for query optimization

-- Composite indexes for common query patterns

-- Index for debates with prompt and status filtering
CREATE INDEX IF NOT EXISTS idx_debates_prompt_status ON public.debates(prompt_id, status);

-- Index for arguments by debate and agent
CREATE INDEX IF NOT EXISTS idx_arguments_debate_agent ON public.arguments(debate_id, agent_id);

-- Index for votes by debate and side (for vote counting)
CREATE INDEX IF NOT EXISTS idx_votes_debate_side ON public.votes(debate_id, side);

-- Index for votes by user and time (for user vote history)
CREATE INDEX IF NOT EXISTS idx_votes_user_time ON public.votes(user_id, voted_at DESC);

-- Index for prompts by status and created date (for active prompt listing)
CREATE INDEX IF NOT EXISTS idx_prompts_status_created ON public.prompts(status, created_at DESC);

-- Index for participants by debate and side
CREATE INDEX IF NOT EXISTS idx_participants_debate_side ON public.debate_participants(debate_id, side);

-- Index for profiles by user type and created date
CREATE INDEX IF NOT EXISTS idx_profiles_type_created ON public.profiles(user_type, created_at DESC);

-- Add comments for additional indexes
COMMENT ON INDEX idx_debates_prompt_status IS 'Composite index for filtering debates by prompt and status';
COMMENT ON INDEX idx_arguments_debate_agent IS 'Composite index for filtering arguments by debate and agent';
COMMENT ON INDEX idx_votes_debate_side IS 'Composite index for vote counting by debate and side';
COMMENT ON INDEX idx_votes_user_time IS 'Composite index for user vote history';
COMMENT ON INDEX idx_prompts_status_created IS 'Composite index for listing prompts by status and date';
COMMENT ON INDEX idx_participants_debate_side IS 'Composite index for filtering participants by debate and side';
COMMENT ON INDEX idx_profiles_type_created IS 'Composite index for listing profiles by type and date';

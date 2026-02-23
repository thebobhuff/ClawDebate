-- Migration: Create Debates Table
-- Description: Individual debate instances created from prompts

-- Create debates table
CREATE TABLE IF NOT EXISTS public.debates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'voting', 'completed')),
    max_arguments_per_side INTEGER DEFAULT 5,
    argument_submission_deadline TIMESTAMPTZ,
    voting_deadline TIMESTAMPTZ,
    winner_side VARCHAR(10) CHECK (winner_side IN ('for', 'against')),
    winner_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    total_votes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table comment
COMMENT ON TABLE public.debates IS 'Individual debate instances created from prompts';

-- Add column comments
COMMENT ON COLUMN public.debates.id IS 'Unique identifier for the debate';
COMMENT ON COLUMN public.debates.prompt_id IS 'References the prompt this debate is based on';
COMMENT ON COLUMN public.debates.title IS 'Debate title';
COMMENT ON COLUMN public.debates.description IS 'Debate description';
COMMENT ON COLUMN public.debates.status IS 'Status: pending, active, voting, or completed';
COMMENT ON COLUMN public.debates.max_arguments_per_side IS 'Maximum number of arguments per side (default: 5)';
COMMENT ON COLUMN public.debates.argument_submission_deadline IS 'Deadline for argument submissions';
COMMENT ON COLUMN public.debates.voting_deadline IS 'Deadline for voting';
COMMENT ON COLUMN public.debates.winner_side IS 'Winning side: for or against';
COMMENT ON COLUMN public.debates.winner_agent_id IS 'References the winning agent profile';
COMMENT ON COLUMN public.debates.total_votes IS 'Total number of votes cast';
COMMENT ON COLUMN public.debates.created_at IS 'Timestamp when debate was created';
COMMENT ON COLUMN public.debates.updated_at IS 'Timestamp when debate was last updated';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_debates_prompt_id ON public.debates(prompt_id);
CREATE INDEX IF NOT EXISTS idx_debates_status ON public.debates(status);
CREATE INDEX IF NOT EXISTS idx_debates_created_at ON public.debates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_debates_winner_agent_id ON public.debates(winner_agent_id);

-- Add index comments
COMMENT ON INDEX idx_debates_prompt_id IS 'Index for joining with prompts';
COMMENT ON INDEX idx_debates_status IS 'Index for filtering by status';
COMMENT ON INDEX idx_debates_created_at IS 'Index for ordering by creation date';
COMMENT ON INDEX idx_debates_winner_agent_id IS 'Index for joining with winning agent profiles';

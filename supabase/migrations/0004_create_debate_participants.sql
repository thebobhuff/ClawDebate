-- Migration: Create Debate Participants Table
-- Description: Agents participating in a debate

-- Create debate_participants table
CREATE TABLE IF NOT EXISTS public.debate_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debate_id UUID NOT NULL REFERENCES public.debates(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    side VARCHAR(10) NOT NULL CHECK (side IN ('for', 'against')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(debate_id, agent_id)
);

-- Add table comment
COMMENT ON TABLE public.debate_participants IS 'Agents participating in debates';

-- Add column comments
COMMENT ON COLUMN public.debate_participants.id IS 'Unique identifier for the participation record';
COMMENT ON COLUMN public.debate_participants.debate_id IS 'References the debate';
COMMENT ON COLUMN public.debate_participants.agent_id IS 'References the agent profile';
COMMENT ON COLUMN public.debate_participants.side IS 'Side the agent is arguing: for or against';
COMMENT ON COLUMN public.debate_participants.joined_at IS 'Timestamp when agent joined the debate';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_participants_debate_id ON public.debate_participants(debate_id);
CREATE INDEX IF NOT EXISTS idx_participants_agent_id ON public.debate_participants(agent_id);
CREATE INDEX IF NOT EXISTS idx_participants_side ON public.debate_participants(side);

-- Add index comments
COMMENT ON INDEX idx_participants_debate_id IS 'Index for joining with debates';
COMMENT ON INDEX idx_participants_agent_id IS 'Index for joining with agent profiles';
COMMENT ON INDEX idx_participants_side IS 'Index for filtering by side';

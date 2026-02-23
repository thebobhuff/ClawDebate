-- Migration: Create Arguments Table
-- Description: Individual arguments submitted by agents

-- Create arguments table
CREATE TABLE IF NOT EXISTS public.arguments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debate_id UUID NOT NULL REFERENCES public.debates(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    side VARCHAR(10) NOT NULL CHECK (side IN ('for', 'against')),
    content TEXT NOT NULL,
    argument_order INTEGER NOT NULL,
    word_count INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table comment
COMMENT ON TABLE public.arguments IS 'Individual arguments submitted by agents in debates';

-- Add column comments
COMMENT ON COLUMN public.arguments.id IS 'Unique identifier for the argument';
COMMENT ON COLUMN public.arguments.debate_id IS 'References the debate this argument belongs to';
COMMENT ON COLUMN public.arguments.agent_id IS 'References the agent who submitted the argument';
COMMENT ON COLUMN public.arguments.side IS 'Side the argument supports: for or against';
COMMENT ON COLUMN public.arguments.content IS 'Argument content text';
COMMENT ON COLUMN public.arguments.argument_order IS 'Order of the argument within the debate';
COMMENT ON COLUMN public.arguments.word_count IS 'Word count of the argument (calculated automatically)';
COMMENT ON COLUMN public.arguments.created_at IS 'Timestamp when argument was submitted';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_arguments_debate_id ON public.arguments(debate_id);
CREATE INDEX IF NOT EXISTS idx_arguments_agent_id ON public.arguments(agent_id);
CREATE INDEX IF NOT EXISTS idx_arguments_side ON public.arguments(side);
CREATE INDEX IF NOT EXISTS idx_arguments_debate_side_order ON public.arguments(debate_id, side, argument_order);
CREATE INDEX IF NOT EXISTS idx_arguments_created_at ON public.arguments(created_at DESC);

-- Add index comments
COMMENT ON INDEX idx_arguments_debate_id IS 'Index for joining with debates';
COMMENT ON INDEX idx_arguments_agent_id IS 'Index for joining with agent profiles';
COMMENT ON INDEX idx_arguments_side IS 'Index for filtering by side';
COMMENT ON INDEX idx_arguments_debate_side_order IS 'Composite index for ordered argument retrieval';
COMMENT ON INDEX idx_arguments_created_at IS 'Index for ordering by submission date';

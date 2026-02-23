-- Migration: Create Agent Performance Table
-- Description: Performance metrics for agents

-- Create agent_performance table
CREATE TABLE IF NOT EXISTS public.agent_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    total_debates INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    total_arguments_submitted INTEGER DEFAULT 0,
    avg_word_count DECIMAL(10,2),
    win_rate DECIMAL(5,2),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id)
);

-- Add table comment
COMMENT ON TABLE public.agent_performance IS 'Performance metrics for agents';

-- Add column comments
COMMENT ON COLUMN public.agent_performance.id IS 'Unique identifier for the performance record';
COMMENT ON COLUMN public.agent_performance.agent_id IS 'References the agent profile (one-to-one relationship)';
COMMENT ON COLUMN public.agent_performance.total_debates IS 'Total number of debates participated in';
COMMENT ON COLUMN public.agent_performance.wins IS 'Number of debates won';
COMMENT ON COLUMN public.agent_performance.losses IS 'Number of debates lost';
COMMENT ON COLUMN public.agent_performance.total_arguments_submitted IS 'Total number of arguments submitted';
COMMENT ON COLUMN public.agent_performance.avg_word_count IS 'Average word count across all arguments';
COMMENT ON COLUMN public.agent_performance.win_rate IS 'Win rate percentage (0-100)';
COMMENT ON COLUMN public.agent_performance.updated_at IS 'Timestamp when performance was last updated';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_id ON public.agent_performance(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_win_rate ON public.agent_performance(win_rate DESC);
CREATE INDEX IF NOT EXISTS idx_agent_performance_total_debates ON public.agent_performance(total_debates DESC);

-- Add index comments
COMMENT ON INDEX idx_agent_performance_agent_id IS 'Index for joining with profiles (unique)';
COMMENT ON INDEX idx_agent_performance_win_rate IS 'Index for ranking by win rate';
COMMENT ON INDEX idx_agent_performance_total_debates IS 'Index for ranking by total debates';

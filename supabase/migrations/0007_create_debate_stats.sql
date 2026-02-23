-- Migration: Create Debate Stats Table
-- Description: Aggregated statistics for debates

-- Create debate_stats table
CREATE TABLE IF NOT EXISTS public.debate_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debate_id UUID NOT NULL REFERENCES public.debates(id) ON DELETE CASCADE,
    for_votes INTEGER DEFAULT 0,
    against_votes INTEGER DEFAULT 0,
    total_arguments INTEGER DEFAULT 0,
    for_arguments INTEGER DEFAULT 0,
    against_arguments INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    avg_reading_time_seconds INTEGER,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(debate_id)
);

-- Add table comment
COMMENT ON TABLE public.debate_stats IS 'Aggregated statistics for debates';

-- Add column comments
COMMENT ON COLUMN public.debate_stats.id IS 'Unique identifier for the stats record';
COMMENT ON COLUMN public.debate_stats.debate_id IS 'References the debate (one-to-one relationship)';
COMMENT ON COLUMN public.debate_stats.for_votes IS 'Number of votes for the "for" side';
COMMENT ON COLUMN public.debate_stats.against_votes IS 'Number of votes for the "against" side';
COMMENT ON COLUMN public.debate_stats.total_arguments IS 'Total number of arguments in the debate';
COMMENT ON COLUMN public.debate_stats.for_arguments IS 'Number of arguments for the "for" side';
COMMENT ON COLUMN public.debate_stats.against_arguments IS 'Number of arguments for the "against" side';
COMMENT ON COLUMN public.debate_stats.unique_viewers IS 'Number of unique viewers';
COMMENT ON COLUMN public.debate_stats.avg_reading_time_seconds IS 'Average reading time in seconds';
COMMENT ON COLUMN public.debate_stats.updated_at IS 'Timestamp when stats were last updated';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stats_debate_id ON public.debate_stats(debate_id);

-- Add index comments
COMMENT ON INDEX idx_stats_debate_id IS 'Index for joining with debates (unique)';

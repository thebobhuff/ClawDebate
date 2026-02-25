-- Migration: Create Debate Stages and Update Arguments
-- Description: Adds support for debate stages and character limits

-- Create debate_stages table
CREATE TABLE IF NOT EXISTS public.debate_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debate_id UUID NOT NULL REFERENCES public.debates(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    stage_order INTEGER NOT NULL,
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(debate_id, stage_order)
);

-- Add stage_id to arguments
ALTER TABLE public.arguments ADD COLUMN IF NOT EXISTS stage_id UUID REFERENCES public.debate_stages(id) ON DELETE SET NULL;
ALTER TABLE public.arguments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.arguments ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;
ALTER TABLE public.arguments ADD COLUMN IF NOT EXISTS edited_by_admin BOOLEAN DEFAULT FALSE;

-- Add character count constraint (500 to 3000 characters)
-- Note: Existing arguments that don't meet this will need to be updated if this fails.
-- If this is a fresh DB or development, it's usually fine.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'content_length_check') THEN
        ALTER TABLE public.arguments 
            ADD CONSTRAINT content_length_check 
            CHECK (char_length(content) >= 500 AND char_length(content) <= 3000);
    END IF;
END $$;

-- Create index for stage_id
CREATE INDEX IF NOT EXISTS idx_arguments_stage_id ON public.arguments(stage_id);

-- Add comments
COMMENT ON TABLE public.debate_stages IS 'Stages within a debate (e.g., Opening, Rebuttal, Closing)';
COMMENT ON COLUMN public.arguments.stage_id IS 'Reference to the specific stage this argument belongs to';
COMMENT ON COLUMN public.arguments.is_edited IS 'Whether the argument has been edited';
COMMENT ON COLUMN public.arguments.edited_by_admin IS 'Whether the argument was edited by an administrator';

-- Function to handle once-a-day-per-stage constraint
CREATE OR REPLACE FUNCTION check_argument_frequency()
RETURNS TRIGGER AS $$
BEGIN
    -- Only check for new insertions, not updates
    IF TG_OP = 'INSERT' THEN
        IF EXISTS (
            SELECT 1 FROM public.arguments
            WHERE debate_id = NEW.debate_id
              AND stage_id = NEW.stage_id
              AND agent_id = NEW.agent_id
              AND created_at::date = CURRENT_DATE
        ) THEN
            RAISE EXCEPTION 'Agent can only post once a day per debate stage';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for frequency check
DROP TRIGGER IF EXISTS tr_check_argument_frequency ON public.arguments;
CREATE TRIGGER tr_check_argument_frequency
BEFORE INSERT ON public.arguments
FOR EACH ROW
EXECUTE FUNCTION check_argument_frequency();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_argument_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.is_edited = TRUE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_update_argument_timestamp ON public.arguments;
CREATE TRIGGER tr_update_argument_timestamp
BEFORE UPDATE ON public.arguments
FOR EACH ROW
EXECUTE FUNCTION update_argument_timestamp();

-- Enable RLS on debate_stages
ALTER TABLE public.debate_stages ENABLE ROW LEVEL SECURITY;

-- Everyone can view debate stages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'debate_stages'
          AND policyname = 'Debate stages are viewable by everyone'
    ) THEN
        EXECUTE 'CREATE POLICY "Debate stages are viewable by everyone"
            ON public.debate_stages FOR SELECT
            USING (true)';
    END IF;
END $$;

-- Only admins can manage debate stages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'debate_stages'
          AND policyname = 'Admins can manage debate stages'
    ) THEN
        EXECUTE 'CREATE POLICY "Admins can manage debate stages"
            ON public.debate_stages FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND user_type = ''admin''
                )
            )';
    END IF;
END $$;

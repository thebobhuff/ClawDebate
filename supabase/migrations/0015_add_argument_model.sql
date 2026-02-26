-- Migration: Add model field to arguments
-- Description: Tracks the model used to generate each argument for model-level stats

ALTER TABLE public.arguments
ADD COLUMN IF NOT EXISTS model VARCHAR(120);

-- Backfill existing rows before enforcing NOT NULL.
UPDATE public.arguments
SET model = 'unknown/legacy'
WHERE model IS NULL;

ALTER TABLE public.arguments
ALTER COLUMN model SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'arguments_model_not_blank_check') THEN
        ALTER TABLE public.arguments
            ADD CONSTRAINT arguments_model_not_blank_check
            CHECK (char_length(btrim(model)) > 0);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_arguments_model ON public.arguments(model);

COMMENT ON COLUMN public.arguments.model IS 'Model identifier provided by the agent (e.g., openai/gpt-4.1)';

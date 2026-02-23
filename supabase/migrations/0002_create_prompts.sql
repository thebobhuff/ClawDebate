-- Migration: Create Prompts Table
-- Description: Debate topics submitted by admins

-- Create prompts table
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    tags TEXT[],
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table comment
COMMENT ON TABLE public.prompts IS 'Debate topics/prompts submitted by admins';

-- Add column comments
COMMENT ON COLUMN public.prompts.id IS 'Unique identifier for the prompt';
COMMENT ON COLUMN public.prompts.title IS 'Prompt title (max 200 characters)';
COMMENT ON COLUMN public.prompts.description IS 'Detailed description of the debate topic';
COMMENT ON COLUMN public.prompts.category IS 'Category: philosophical, political, ethical, scientific, social';
COMMENT ON COLUMN public.prompts.tags IS 'Array of tags for categorization';
COMMENT ON COLUMN public.prompts.status IS 'Status: draft, active, or archived';
COMMENT ON COLUMN public.prompts.created_by IS 'References the admin profile who created the prompt';
COMMENT ON COLUMN public.prompts.created_at IS 'Timestamp when prompt was created';
COMMENT ON COLUMN public.prompts.updated_at IS 'Timestamp when prompt was last updated';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_status ON public.prompts(status);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON public.prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON public.prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompts_created_by ON public.prompts(created_by);

-- Add index comments
COMMENT ON INDEX idx_prompts_status IS 'Index for filtering by status';
COMMENT ON INDEX idx_prompts_category IS 'Index for filtering by category';
COMMENT ON INDEX idx_prompts_tags IS 'GIN index for tag array searches';
COMMENT ON INDEX idx_prompts_created_by IS 'Index for joining with profiles';

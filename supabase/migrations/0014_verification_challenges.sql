-- Migration: Create Verification Challenges Table
-- Description: Stores math challenges for AI verification

CREATE TABLE IF NOT EXISTS public.verification_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL, -- 'argument', 'debate'
    content_id UUID, -- Optional, can be null if content is not yet created
    payload JSONB, -- Store the original request body for execution after verification
    verification_code UUID DEFAULT gen_random_uuid(),
    challenge_text TEXT NOT NULL,
    answer VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    agent_id UUID REFERENCES public.profiles(id)
);

-- Add index for cleanup and verification
CREATE INDEX IF NOT EXISTS idx_verification_code ON public.verification_challenges(verification_code);
CREATE INDEX IF NOT EXISTS idx_verification_expires ON public.verification_challenges(expires_at);

-- Comments
COMMENT ON TABLE public.verification_challenges IS 'Math challenges for AI spam prevention';

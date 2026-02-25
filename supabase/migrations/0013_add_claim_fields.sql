-- Migration: Add Claim and Human Link Fields to Profiles
-- Description: Adds support for agent claiming and human association

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_claimed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS claim_code UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'flagged'));

-- Add comment to columns
COMMENT ON COLUMN public.profiles.is_claimed IS 'Whether the agent has been claimed by a human';
COMMENT ON COLUMN public.profiles.claim_code IS 'Unique code used in the claim URL';
COMMENT ON COLUMN public.profiles.owner_id IS 'References the human profile that owns this agent';
COMMENT ON COLUMN public.profiles.verification_status IS 'Spam/Trust status of the agent';

-- Create index for claim codes
CREATE INDEX IF NOT EXISTS idx_profiles_claim_code ON public.profiles(claim_code) WHERE is_claimed = FALSE;

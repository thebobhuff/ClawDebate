-- Migration: Backfill legacy agent claim flags
-- Description: Ensures older agent profiles are claimable

UPDATE public.profiles
SET is_claimed = FALSE
WHERE user_type = 'agent'
  AND is_claimed IS NULL;

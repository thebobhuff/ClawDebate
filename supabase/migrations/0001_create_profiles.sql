-- Migration: Create Profiles Table
-- Description: Extended user information for all user types (agents, humans, admins)

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('agent', 'human', 'admin')),
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    agent_api_key VARCHAR(100) UNIQUE,
    agent_capabilities JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table comment
COMMENT ON TABLE public.profiles IS 'Extended user profiles for agents, humans, and admins';

-- Add column comments
COMMENT ON COLUMN public.profiles.id IS 'References auth.users.id';
COMMENT ON COLUMN public.profiles.user_type IS 'Type of user: agent, human, or admin';
COMMENT ON COLUMN public.profiles.display_name IS 'Display name for the user';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user avatar image';
COMMENT ON COLUMN public.profiles.bio IS 'User biography or description';
COMMENT ON COLUMN public.profiles.agent_api_key IS 'API key for agent authentication (agents only)';
COMMENT ON COLUMN public.profiles.agent_capabilities IS 'JSONB metadata for agent capabilities';
COMMENT ON COLUMN public.profiles.created_at IS 'Timestamp when profile was created';
COMMENT ON COLUMN public.profiles.updated_at IS 'Timestamp when profile was last updated';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_agent_api_key ON public.profiles(agent_api_key);

-- Add index comments
COMMENT ON INDEX idx_profiles_user_type IS 'Index for filtering by user type';
COMMENT ON INDEX idx_profiles_agent_api_key IS 'Index for agent API key lookups';

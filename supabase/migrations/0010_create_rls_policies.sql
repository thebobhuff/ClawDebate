-- Migration: Create Row Level Security (RLS) Policies
-- Description: Comprehensive RLS policies for all tables

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arguments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debate_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debate_participants ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Everyone can read profiles
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Only admins can insert profiles (handled via auth trigger)
CREATE POLICY "Only admins can insert profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Only admins can delete profiles
CREATE POLICY "Only admins can delete profiles"
    ON public.profiles FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- ============================================================================
-- PROMPTS TABLE POLICIES
-- ============================================================================

-- Everyone can view active prompts
CREATE POLICY "Active prompts are viewable by everyone"
    ON public.prompts FOR SELECT
    USING (status = 'active');

-- Only admins can view all prompts
CREATE POLICY "Admins can view all prompts"
    ON public.prompts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Only admins can create prompts
CREATE POLICY "Only admins can create prompts"
    ON public.prompts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Only admins can update prompts
CREATE POLICY "Only admins can update prompts"
    ON public.prompts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Only admins can delete prompts
CREATE POLICY "Only admins can delete prompts"
    ON public.prompts FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- ============================================================================
-- DEBATES TABLE POLICIES
-- ============================================================================

-- Everyone can view active and completed debates
CREATE POLICY "Active and completed debates are viewable"
    ON public.debates FOR SELECT
    USING (status IN ('active', 'voting', 'completed'));

-- Only admins can view all debates
CREATE POLICY "Admins can view all debates"
    ON public.debates FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Only admins can create debates
CREATE POLICY "Only admins can create debates"
    ON public.debates FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Only admins can update debates
CREATE POLICY "Only admins can update debates"
    ON public.debates FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Only admins can delete debates
CREATE POLICY "Only admins can delete debates"
    ON public.debates FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- ============================================================================
-- ARGUMENTS TABLE POLICIES
-- ============================================================================

-- Everyone can view arguments for active/completed debates
CREATE POLICY "Arguments are viewable by everyone"
    ON public.arguments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.debates
            WHERE id = arguments.debate_id AND status IN ('active', 'voting', 'completed')
        )
    );

-- Agents can create arguments for debates they're participating in
CREATE POLICY "Agents can create arguments for their debates"
    ON public.arguments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.debate_participants
            WHERE debate_participants.debate_id = arguments.debate_id
            AND debate_participants.agent_id = auth.uid()
            AND debate_participants.side = arguments.side
        )
        AND EXISTS (
            SELECT 1 FROM public.debates
            WHERE id = arguments.debate_id AND status = 'active'
        )
    );

-- Only admins can delete arguments
CREATE POLICY "Only admins can delete arguments"
    ON public.arguments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- ============================================================================
-- VOTES TABLE POLICIES
-- ============================================================================

-- Everyone can view vote counts
CREATE POLICY "Vote counts are viewable by everyone"
    ON public.votes FOR SELECT
    USING (true);

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote"
    ON public.votes FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.debates
            WHERE id = votes.debate_id AND status IN ('voting', 'completed')
        )
    );

-- Anonymous users can vote via session
CREATE POLICY "Anonymous users can vote"
    ON public.votes FOR INSERT
    WITH CHECK (
        auth.uid() IS NULL
        AND session_id IS NOT NULL
        AND EXISTS (
            SELECT 1 FROM public.debates
            WHERE id = votes.debate_id AND status IN ('voting', 'completed')
        )
    );

-- ============================================================================
-- DEBATE_STATS TABLE POLICIES
-- ============================================================================

-- Everyone can view stats
CREATE POLICY "Stats are viewable by everyone"
    ON public.debate_stats FOR SELECT
    USING (true);

-- Only system/trigger can update stats
CREATE POLICY "Only system can insert stats"
    ON public.debate_stats FOR INSERT
    WITH CHECK (false);

CREATE POLICY "Only system can update stats"
    ON public.debate_stats FOR UPDATE
    USING (false);

-- ============================================================================
-- AGENT_PERFORMANCE TABLE POLICIES
-- ============================================================================

-- Everyone can view agent performance
CREATE POLICY "Agent performance is viewable by everyone"
    ON public.agent_performance FOR SELECT
    USING (true);

-- Only system/trigger can update performance
CREATE POLICY "Only system can insert performance"
    ON public.agent_performance FOR INSERT
    WITH CHECK (false);

CREATE POLICY "Only system can update performance"
    ON public.agent_performance FOR UPDATE
    USING (false);

-- ============================================================================
-- DEBATE_PARTICIPANTS TABLE POLICIES
-- ============================================================================

-- Everyone can view debate participants
CREATE POLICY "Debate participants are viewable by everyone"
    ON public.debate_participants FOR SELECT
    USING (true);

-- Agents can join debates
CREATE POLICY "Agents can join debates"
    ON public.debate_participants FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND agent_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'agent'
        )
        AND EXISTS (
            SELECT 1 FROM public.debates
            WHERE id = debate_participants.debate_id AND status IN ('pending', 'active')
        )
    );

-- Only admins can delete participants
CREATE POLICY "Only admins can delete participants"
    ON public.debate_participants FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

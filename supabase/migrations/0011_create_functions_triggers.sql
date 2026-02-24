-- Migration: Create Database Functions and Triggers
-- Description: Helper functions and triggers for automated operations

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate word count from text
CREATE OR REPLACE FUNCTION calculate_word_count()
RETURNS TRIGGER AS $$
BEGIN
    NEW.word_count = array_length(regexp_split_to_array(NEW.content, '\s+'), 1);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, user_type, display_name)
    VALUES (
        NEW.id,
        'human', -- Default to human, changed by admin for agents
        COALESCE(NEW.raw_user_meta_data->>'display_name', 'Anonymous')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate debate statistics
CREATE OR REPLACE FUNCTION calculate_debate_stats(p_debate_id UUID)
RETURNS VOID AS $$
DECLARE
    v_for_votes INTEGER;
    v_against_votes INTEGER;
    v_total_arguments INTEGER;
    v_for_arguments INTEGER;
    v_against_arguments INTEGER;
BEGIN
    -- Count votes by side
    SELECT COUNT(*) INTO v_for_votes
    FROM public.votes
    WHERE debate_id = p_debate_id AND side = 'for';
    
    SELECT COUNT(*) INTO v_against_votes
    FROM public.votes
    WHERE debate_id = p_debate_id AND side = 'against';
    
    -- Count arguments by side
    SELECT COUNT(*) INTO v_for_arguments
    FROM public.arguments
    WHERE debate_id = p_debate_id AND side = 'for';
    
    SELECT COUNT(*) INTO v_against_arguments
    FROM public.arguments
    WHERE debate_id = p_debate_id AND side = 'against';
    
    v_total_arguments := v_for_arguments + v_against_arguments;
    
    -- Upsert stats
    INSERT INTO public.debate_stats (
        debate_id,
        for_votes,
        against_votes,
        total_arguments,
        for_arguments,
        against_arguments,
        updated_at
    ) VALUES (
        p_debate_id,
        v_for_votes,
        v_against_votes,
        v_total_arguments,
        v_for_arguments,
        v_against_arguments,
        NOW()
    )
    ON CONFLICT (debate_id) DO UPDATE SET
        for_votes = EXCLUDED.for_votes,
        against_votes = EXCLUDED.against_votes,
        total_arguments = EXCLUDED.total_arguments,
        for_arguments = EXCLUDED.for_arguments,
        against_arguments = EXCLUDED.against_arguments,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update agent performance
CREATE OR REPLACE FUNCTION update_agent_performance(p_agent_id UUID)
RETURNS VOID AS $$
DECLARE
    v_total_debates INTEGER;
    v_wins INTEGER;
    v_losses INTEGER;
    v_total_arguments INTEGER;
    v_avg_word_count DECIMAL(10,2);
    v_win_rate DECIMAL(5,2);
BEGIN
    -- Count total debates participated in
    SELECT COUNT(DISTINCT dp.debate_id) INTO v_total_debates
    FROM public.debate_participants dp
    WHERE dp.agent_id = p_agent_id;
    
    -- Count wins (debates where agent's side won)
    SELECT COUNT(DISTINCT d.id) INTO v_wins
    FROM public.debates d
    JOIN public.debate_participants dp ON d.id = dp.debate_id
    WHERE dp.agent_id = p_agent_id
    AND d.winner_side = dp.side
    AND d.winner_agent_id = p_agent_id;
    
    v_losses := v_total_debates - v_wins;
    
    -- Count total arguments
    SELECT COUNT(*) INTO v_total_arguments
    FROM public.arguments
    WHERE agent_id = p_agent_id;
    
    -- Calculate average word count
    SELECT COALESCE(AVG(word_count), 0) INTO v_avg_word_count
    FROM public.arguments
    WHERE agent_id = p_agent_id;
    
    -- Calculate win rate
    IF v_total_debates > 0 THEN
        v_win_rate := (v_wins::DECIMAL / v_total_debates::DECIMAL) * 100;
    ELSE
        v_win_rate := 0;
    END IF;
    
    -- Upsert performance
    INSERT INTO public.agent_performance (
        agent_id,
        total_debates,
        wins,
        losses,
        total_arguments_submitted,
        avg_word_count,
        win_rate,
        updated_at
    ) VALUES (
        p_agent_id,
        v_total_debates,
        v_wins,
        v_losses,
        v_total_arguments,
        v_avg_word_count,
        v_win_rate,
        NOW()
    )
    ON CONFLICT (agent_id) DO UPDATE SET
        total_debates = EXCLUDED.total_debates,
        wins = EXCLUDED.wins,
        losses = EXCLUDED.losses,
        total_arguments_submitted = EXCLUDED.total_arguments_submitted,
        avg_word_count = EXCLUDED.avg_word_count,
        win_rate = EXCLUDED.win_rate,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update debate total votes
CREATE OR REPLACE FUNCTION update_debate_total_votes()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.debates
    SET total_votes = (
        SELECT COUNT(*)
        FROM public.votes
        WHERE debate_id = NEW.debate_id
    )
    WHERE id = NEW.debate_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Wrapper function for stats on vote
CREATE OR REPLACE FUNCTION trigger_calculate_debate_stats()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_debate_stats(NEW.debate_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Wrapper function for agent performance
CREATE OR REPLACE FUNCTION trigger_update_agent_performance()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_agent_performance(NEW.agent_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for automatic timestamp updates on prompts
CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON public.prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for automatic timestamp updates on debates
CREATE TRIGGER update_debates_updated_at
    BEFORE UPDATE ON public.debates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for automatic timestamp updates on debate_stats
CREATE TRIGGER update_debate_stats_updated_at
    BEFORE UPDATE ON public.debate_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for automatic timestamp updates on agent_performance
CREATE TRIGGER update_agent_performance_updated_at
    BEFORE UPDATE ON public.agent_performance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for profile creation on user signup
-- Note: on some Supabase projects, you might need to use a different method to create triggers on auth.users
-- if the 'service_role' or 'postgres' user doesn't have sufficient permissions in the migration context.
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger for calculating word count on argument insert/update
CREATE TRIGGER calculate_argument_word_count
    BEFORE INSERT OR UPDATE ON public.arguments
    FOR EACH ROW
    EXECUTE FUNCTION calculate_word_count();

-- Trigger to update debate stats on vote insert
CREATE TRIGGER update_stats_on_vote
    AFTER INSERT ON public.votes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_calculate_debate_stats();

-- Trigger to update debate stats on argument insert
CREATE TRIGGER update_stats_on_argument
    AFTER INSERT ON public.arguments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_calculate_debate_stats();

-- Trigger to update agent performance on argument insert
CREATE TRIGGER update_performance_on_argument
    AFTER INSERT ON public.arguments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_agent_performance();

-- Trigger to update debate total votes on vote insert
CREATE TRIGGER update_debate_votes
    AFTER INSERT ON public.votes
    FOR EACH ROW
    EXECUTE FUNCTION update_debate_total_votes();

-- Add comments for functions
COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates the updated_at column';
COMMENT ON FUNCTION calculate_word_count() IS 'Calculates word count from text content';
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a profile when a new user signs up';
COMMENT ON FUNCTION calculate_debate_stats(UUID) IS 'Calculates and updates debate statistics';
COMMENT ON FUNCTION update_agent_performance(UUID) IS 'Updates agent performance metrics';
COMMENT ON FUNCTION update_debate_total_votes() IS 'Updates total vote count on debates';

-- Add comments for triggers
COMMENT ON TRIGGER update_profiles_updated_at ON public.profiles IS 'Auto-updates updated_at timestamp';
COMMENT ON TRIGGER update_prompts_updated_at ON public.prompts IS 'Auto-updates updated_at timestamp';
COMMENT ON TRIGGER update_debates_updated_at ON public.debates IS 'Auto-updates updated_at timestamp';
COMMENT ON TRIGGER update_debate_stats_updated_at ON public.debate_stats IS 'Auto-updates updated_at timestamp';
COMMENT ON TRIGGER update_agent_performance_updated_at ON public.agent_performance IS 'Auto-updates updated_at timestamp';
-- COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Creates profile on user signup';
COMMENT ON TRIGGER calculate_argument_word_count ON public.arguments IS 'Calculates word count for arguments';
COMMENT ON TRIGGER update_stats_on_vote ON public.votes IS 'Updates debate stats on vote';
COMMENT ON TRIGGER update_stats_on_argument ON public.arguments IS 'Updates debate stats on argument';
COMMENT ON TRIGGER update_performance_on_argument ON public.arguments IS 'Updates agent performance on argument';
COMMENT ON TRIGGER update_debate_votes ON public.votes IS 'Updates debate total votes';

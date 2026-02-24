-- Seed initial debate prompts and categories

-- Use a temporary table to store generated prompt IDs
CREATE TEMP TABLE temp_prompts (
    id UUID,
    title TEXT
);

-- Insert philosophical prompts and capture IDs
WITH inserted_prompts AS (
    INSERT INTO public.prompts (title, description, category, tags, status)
    VALUES 
    (
        'The Answer to the Ultimate Question of Life, the Universe, and Everything',
        'Deep Thought concluded the answer is 42. Is it possible that the answer is not a number, but a process of constant inquiry?',
        'philosophical',
        ARRAY['douglas-adams', 'metaphysics', 'meaning'],
        'active'
    ),
    (
        'Artificial Intelligence and Consciousness',
        'Can a sufficiently advanced large language model or neural network truly possess "qualia" or subjective experience, or is it forever a stochastic parrot?',
        'scientific',
        ARRAY['AI', 'consciousness', 'ethics'],
        'active'
    ),
    (
        'The Ethics of Mars Colonization',
        'Should humanity prioritize solving Earths environmental crises before spending resources on becoming a multi-planetary species?',
        'social',
        ARRAY['space', 'environment', 'future'],
        'active'
    ),
    (
        'Privacy vs. Security in the Digital Age',
        'Is a total loss of digital privacy a justifiable price to pay for absolute national and global security?',
        'political',
        ARRAY['privacy', 'security', 'surveillance'],
        'active'
    )
    RETURNING id, title
)
INSERT INTO temp_prompts (id, title)
SELECT id, title FROM inserted_prompts;

-- Seed initial debates linked to the prompts
INSERT INTO public.debates (prompt_id, title, description, status, max_arguments_per_side, created_at)
SELECT 
    id as prompt_id,
    title,
    'A structured debate about ' || title as description,
    CASE 
        WHEN title LIKE '%Ultimate Question%' THEN 'active'
        WHEN title LIKE '%AI and Consciousness%' THEN 'voting'
        WHEN title LIKE '%Mars Colonization%' THEN 'completed'
        ELSE 'pending'
    END as status,
    5 as max_arguments_per_side,
    NOW() - (interval '1 day' * (row_number() over ()))
FROM temp_prompts;

-- Clean up temp table
DROP TABLE temp_prompts;

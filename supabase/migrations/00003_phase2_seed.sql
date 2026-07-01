-- ====================================================================================
-- VURK - Phase 2 Seed Data: Japanese N5 Roadmap
-- Run this in the Supabase SQL Editor after running 00002_phase2_roadmaps.sql
-- ====================================================================================

-- 1. Insert Roadmap Template
DO $$
DECLARE
    roadmap_id UUID;
    phase_id UUID;
    milestone_id UUID;
    module_id UUID;
    task_id UUID;
BEGIN
    -- Create Roadmap Template
    INSERT INTO roadmap_templates (name, description, cover_image_url, version, is_latest, difficulty, category, tags, total_xp_available, estimated_duration_weeks, required_skills, status)
    VALUES (
        'Japanese N5 Mastery',
        'The ultimate roadmap to master the JLPT N5 level. Learn Hiragana, Katakana, basic Kanji, and essential grammar to start communicating in Japanese.',
        'https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1000&auto=format&fit=crop',
        1,
        true,
        'medium',
        'Languages',
        ARRAY['japanese', 'jlpt', 'n5'],
        5000,
        12,
        ARRAY['None'],
        'published'
    ) RETURNING id INTO roadmap_id;

    -- Create Phase 1: Alphabets
    INSERT INTO roadmap_phases (template_id, title, description, order_index)
    VALUES (roadmap_id, 'Phase 1: The Alphabets', 'Master Hiragana and Katakana, the building blocks of Japanese.', 1)
    RETURNING id INTO phase_id;

    -- Create Milestone 1: Hiragana
    INSERT INTO roadmap_milestones (phase_id, title, description, order_index)
    VALUES (phase_id, 'Master Hiragana', 'Learn all 46 basic characters and their variations.', 1)
    RETURNING id INTO milestone_id;

    -- Create Module 1: Vowels and K-Row
    INSERT INTO roadmap_modules (milestone_id, title, description, order_index)
    VALUES (milestone_id, 'Vowels & K-Row', 'A, I, U, E, O and Ka, Ki, Ku, Ke, Ko', 1)
    RETURNING id INTO module_id;

    -- Create Task 1: Learn Vowels
    INSERT INTO roadmap_tasks (module_id, title, description, type, difficulty, estimated_time_minutes, xp_reward, coin_reward, order_index)
    VALUES (module_id, 'Learn the 5 Vowels (あいうえお)', 'Watch the pronunciation video and practice writing each vowel 10 times.', 'video', 'easy', 30, 20, 5, 1)
    RETURNING id INTO task_id;

    -- Create Task 2: Learn K-Row
    INSERT INTO roadmap_tasks (module_id, title, description, type, difficulty, estimated_time_minutes, xp_reward, coin_reward, order_index)
    VALUES (module_id, 'Learn the K-Row (かきくけこ)', 'Practice writing the K-Row characters and memorize their sounds.', 'reading', 'easy', 30, 20, 5, 2);

    -- Create Task 3: Vowel & K-Row Quiz
    INSERT INTO roadmap_tasks (module_id, title, description, type, difficulty, estimated_time_minutes, xp_reward, coin_reward, order_index)
    VALUES (module_id, 'Vowel & K-Row Quiz', 'Take the quiz to test your memory of the first 10 characters.', 'quiz', 'medium', 15, 50, 10, 3);

    -- Create Module 2: S-Row and T-Row
    INSERT INTO roadmap_modules (milestone_id, title, description, order_index)
    VALUES (milestone_id, 'S-Row & T-Row', 'Sa, Shi, Su, Se, So and Ta, Chi, Tsu, Te, To', 2)
    RETURNING id INTO module_id;

    INSERT INTO roadmap_tasks (module_id, title, description, type, difficulty, estimated_time_minutes, xp_reward, coin_reward, order_index)
    VALUES (module_id, 'Learn the S-Row and T-Row', 'Watch the pronunciation video and practice writing each character 10 times.', 'video', 'easy', 45, 30, 10, 1);

    -- Create Milestone 2: Katakana
    INSERT INTO roadmap_milestones (phase_id, title, description, order_index)
    VALUES (phase_id, 'Master Katakana', 'Learn the alphabet used for foreign loan words.', 2)
    RETURNING id INTO milestone_id;

    INSERT INTO roadmap_modules (milestone_id, title, description, order_index)
    VALUES (milestone_id, 'Introduction to Katakana', 'Vowels and K-Row in Katakana', 1)
    RETURNING id INTO module_id;

    INSERT INTO roadmap_tasks (module_id, title, description, type, difficulty, estimated_time_minutes, xp_reward, coin_reward, order_index)
    VALUES (module_id, 'Katakana Vowels & K-Row', 'Practice writing Katakana vowels and K-Row.', 'reading', 'easy', 30, 20, 5, 1);


    -- Create Phase 2: Basic Grammar & Vocab
    INSERT INTO roadmap_phases (template_id, title, description, order_index)
    VALUES (roadmap_id, 'Phase 2: Basic Grammar & Vocab', 'Learn basic sentence structures and everyday vocabulary.', 2)
    RETURNING id INTO phase_id;

    INSERT INTO roadmap_milestones (phase_id, title, description, order_index)
    VALUES (phase_id, 'Self Introduction', 'Learn how to introduce yourself and others.', 1)
    RETURNING id INTO milestone_id;

    INSERT INTO roadmap_modules (milestone_id, title, description, order_index)
    VALUES (milestone_id, 'The "Desu" Copula', 'Using X wa Y desu.', 1)
    RETURNING id INTO module_id;

    INSERT INTO roadmap_tasks (module_id, title, description, type, difficulty, estimated_time_minutes, xp_reward, coin_reward, order_index)
    VALUES (module_id, 'Learn "X is Y"', 'Read the grammar guide on forming basic sentences using "desu".', 'reading', 'medium', 45, 40, 10, 1);
    
    INSERT INTO roadmap_tasks (module_id, title, description, type, difficulty, estimated_time_minutes, xp_reward, coin_reward, order_index)
    VALUES (module_id, 'Write your Introduction', 'Write a short paragraph introducing yourself in Japanese.', 'assignment', 'hard', 60, 100, 25, 2);

END $$;

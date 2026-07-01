-- ====================================================================================
-- VURK - Phase 2 Final Seed Data: Massive Roadmap Library
-- Run this in the Supabase SQL Editor after running 00004_phase2_final.sql
-- ====================================================================================

DO $$
DECLARE
    roadmap_id UUID;
BEGIN
    -- 1. Japanese N5 Mastery
    INSERT INTO roadmap_templates (name, description, cover_image_url, version, difficulty, category, total_xp_available, estimated_duration_weeks, status, missed_strategy)
    VALUES (
        'Japanese N5 Mastery', 'The ultimate roadmap to master the JLPT N5 level. Learn Hiragana, Katakana, basic Kanji, and essential grammar to start communicating in Japanese.', 'https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1000', 1, 'medium', 'Languages', 5000, 12, 'published', 'carry_forward'
    ) RETURNING id INTO roadmap_id;
    -- (We will add phases/tasks to Japanese N5 in a separate data import if needed, but for now we just seed the templates for the marketplace)

    -- 2. Full Stack Development
    INSERT INTO roadmap_templates (name, description, cover_image_url, version, difficulty, category, total_xp_available, estimated_duration_weeks, status, missed_strategy)
    VALUES (
        'Full Stack Web Development', 'Master Next.js, React, Tailwind, and Supabase to build production-ready SaaS applications.', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000', 1, 'hard', 'Engineering', 12000, 24, 'published', 'carry_forward'
    );

    -- 3. Research Paper Writing
    INSERT INTO roadmap_templates (name, description, cover_image_url, version, difficulty, category, total_xp_available, estimated_duration_weeks, status, missed_strategy)
    VALUES (
        'Research Paper Writing', 'Learn the fundamentals of academic research, literature review, methodology design, and writing high-impact papers for conferences and journals.', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000', 1, 'hard', 'Academics', 8000, 16, 'published', 'carry_forward'
    );

    -- 4. Internship Preparation
    INSERT INTO roadmap_templates (name, description, cover_image_url, version, difficulty, category, total_xp_available, estimated_duration_weeks, status, missed_strategy)
    VALUES (
        'Internship Preparation', 'Prepare your resume, master behavioral interviews, and ace technical screens to land a top-tier tech internship.', 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1000', 1, 'medium', 'Career', 4500, 8, 'published', 'auto_reschedule'
    );

    -- 5. Hackathon Preparation
    INSERT INTO roadmap_templates (name, description, cover_image_url, version, difficulty, category, total_xp_available, estimated_duration_weeks, status, missed_strategy)
    VALUES (
        'Hackathon Preparation', 'Learn how to ideate, prototype, build, and pitch a winning hackathon project in just 48 hours.', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1000', 1, 'medium', 'Engineering', 3000, 4, 'published', 'mark_skipped'
    );

    -- 6. TOEFL Preparation
    INSERT INTO roadmap_templates (name, description, cover_image_url, version, difficulty, category, total_xp_available, estimated_duration_weeks, status, missed_strategy)
    VALUES (
        'TOEFL Preparation', 'Master reading, listening, speaking, and writing sections to score 100+ on the TOEFL iBT exam.', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1000', 1, 'medium', 'Exams', 6000, 10, 'published', 'carry_forward'
    );

    -- 7. MEXT Preparation
    INSERT INTO roadmap_templates (name, description, cover_image_url, version, difficulty, category, total_xp_available, estimated_duration_weeks, status, missed_strategy)
    VALUES (
        'MEXT Preparation', 'Complete guide to the MEXT Scholarship: application documents, research proposal, exams, and interview prep.', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000', 1, 'expert', 'Scholarships', 15000, 20, 'published', 'carry_forward'
    );

    -- 8. Data Structures & Algorithms
    INSERT INTO roadmap_templates (name, description, cover_image_url, version, difficulty, category, total_xp_available, estimated_duration_weeks, status, missed_strategy)
    VALUES (
        'Data Structures & Algorithms', 'Master DSA concepts and crack coding interviews on LeetCode with the blind 75 patterns.', 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=1000', 1, 'hard', 'Computer Science', 10000, 16, 'published', 'carry_forward'
    );

    -- 9. AI/ML Foundations
    INSERT INTO roadmap_templates (name, description, cover_image_url, version, difficulty, category, total_xp_available, estimated_duration_weeks, status, missed_strategy)
    VALUES (
        'AI/ML Foundations', 'Learn Python, Pandas, PyTorch, and the foundational mathematics behind Artificial Intelligence.', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000', 1, 'expert', 'Computer Science', 14000, 24, 'published', 'carry_forward'
    );

    -- 10. Robotics Engineering
    INSERT INTO roadmap_templates (name, description, cover_image_url, version, difficulty, category, total_xp_available, estimated_duration_weeks, status, missed_strategy)
    VALUES (
        'Robotics Engineering', 'Learn ROS, kinematics, control systems, and computer vision to build autonomous robots.', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000', 1, 'expert', 'Engineering', 15000, 24, 'published', 'carry_forward'
    );

    -- 11. Resume & LinkedIn Building
    INSERT INTO roadmap_templates (name, description, cover_image_url, version, difficulty, category, total_xp_available, estimated_duration_weeks, status, missed_strategy)
    VALUES (
        'Resume & LinkedIn Building', 'Craft an ATS-friendly resume and optimize your LinkedIn profile for recruiters.', 'https://images.unsplash.com/photo-1616423641400-353f47e090b8?q=80&w=1000', 1, 'easy', 'Career', 2000, 2, 'published', 'carry_forward'
    );

    -- 12. Final Year Project
    INSERT INTO roadmap_templates (name, description, cover_image_url, version, difficulty, category, total_xp_available, estimated_duration_weeks, status, missed_strategy)
    VALUES (
        'Final Year Project', 'A structured timeline to help you choose a topic, conduct literature review, build, and present your FYP.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000', 1, 'hard', 'Academics', 8000, 26, 'published', 'carry_forward'
    );

END $$;

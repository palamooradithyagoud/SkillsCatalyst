-- ============================================================================
-- SkillsCatalyst Live Production Database Schema
-- Supabase Project Reference: zzjxprhapptjoziwdcro
-- Remote Host: https://zzjxprhapptjoziwdcro.supabase.co
-- Extracted: 2026-09-06
-- Source: Exact remote production database state verified via PostgREST OpenAPI v14.5
-- Notice: READ-ONLY extraction. No production mutations were executed.
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. TABLE DEFINITIONS (28 TABLES)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: public.profiles
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID NOT NULL,
    academic_class TEXT,
    avatar_url TEXT,
    codechef_profile TEXT,
    codeforces_profile TEXT,
    codementor_profile TEXT,
    coding_stats JSONB,
    college TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    current_role TEXT DEFAULT 'Learner',
    department TEXT,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    gfg_profile TEXT,
    github_profile TEXT,
    hackerrank_profile TEXT,
    last_stats_sync TIMESTAMPTZ DEFAULT now(),
    leetcode_profile TEXT,
    preferred_learning_path TEXT,
    skill_level TEXT,
    streak_days INTEGER DEFAULT 0,
    target_companies TEXT[],
    target_role TEXT DEFAULT 'Full Stack Developer',
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    welcome_email_sent BOOLEAN DEFAULT false,
    CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.aptitude_categories
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.aptitude_categories (
    id INTEGER NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    description TEXT,
    icon_name VARCHAR(255) DEFAULT 'Calculator',
    slug VARCHAR(255) NOT NULL,
    CONSTRAINT aptitude_categories_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.aptitude_topics
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.aptitude_topics (
    id INTEGER NOT NULL,
    category_id INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    default_timer_seconds INTEGER DEFAULT 60,
    slug VARCHAR(255) NOT NULL,
    topic_name VARCHAR(255) NOT NULL,
    total_questions INTEGER DEFAULT 0,
    CONSTRAINT aptitude_topics_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.aptitude_questions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.aptitude_questions (
    id INTEGER NOT NULL,
    answer_text VARCHAR(255) NOT NULL,
    correct_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    difficulty VARCHAR(255) DEFAULT 'Medium',
    options JSONB NOT NULL,
    per_question_timer INTEGER DEFAULT 60,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    solution_text TEXT NOT NULL,
    topic_id INTEGER NOT NULL,
    CONSTRAINT aptitude_questions_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.user_academic_profile
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_academic_profile (
    user_id UUID NOT NULL,
    academic_year TEXT DEFAULT '',
    college TEXT DEFAULT '',
    department TEXT DEFAULT '',
    full_name TEXT DEFAULT '',
    target_role TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT user_academic_profile_pkey PRIMARY KEY (user_id)
);

-- ----------------------------------------------------------------------------
-- Table: public.user_coding_profiles
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_coding_profiles (
    user_id UUID NOT NULL,
    codechef_url TEXT DEFAULT '',
    codeforces_url TEXT DEFAULT '',
    geeksforgeeks_url TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    hackerrank_url TEXT DEFAULT '',
    leetcode_url TEXT DEFAULT '',
    stats_json JSONB,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT user_coding_profiles_pkey PRIMARY KEY (user_id)
);

-- ----------------------------------------------------------------------------
-- Table: public.user_progress
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID NOT NULL,
    ai_career_health_score NUMERIC DEFAULT 0.0 NOT NULL,
    last_active_at TIMESTAMPTZ DEFAULT now(),
    last_login_date DATE,
    learning_progress_percent NUMERIC DEFAULT 0.0 NOT NULL,
    level INTEGER DEFAULT 0 NOT NULL,
    problems_solved INTEGER DEFAULT 0 NOT NULL,
    resume_readiness_score NUMERIC DEFAULT 0.0 NOT NULL,
    streak_days INTEGER DEFAULT 0 NOT NULL,
    success_rate NUMERIC DEFAULT 0.0 NOT NULL,
    total_xp INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT user_progress_pkey PRIMARY KEY (user_id)
);

-- ----------------------------------------------------------------------------
-- Table: public.leetcode_progress
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leetcode_progress (
    id BIGINT NOT NULL,
    acceptance TEXT,
    company_slug TEXT NOT NULL,
    difficulty TEXT DEFAULT 'Easy',
    frequency TEXT,
    question_id INTEGER NOT NULL,
    question_title TEXT NOT NULL,
    solved_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    status TEXT DEFAULT 'solved' NOT NULL,
    user_id UUID NOT NULL,
    CONSTRAINT leetcode_progress_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.roadmap_progress
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roadmap_progress (
    id BIGINT NOT NULL,
    category TEXT,
    completed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    node_id TEXT NOT NULL,
    node_title TEXT NOT NULL,
    roadmap_id TEXT NOT NULL,
    status TEXT DEFAULT 'completed' NOT NULL,
    user_id UUID NOT NULL,
    CONSTRAINT roadmap_progress_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.resume_scores
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resume_scores (
    id BIGINT NOT NULL,
    ats_compatibility_score NUMERIC,
    company_type TEXT DEFAULT 'Product-Based',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    experience_score NUMERIC,
    filename TEXT NOT NULL,
    full_review_json JSONB,
    improvements JSONB,
    overall_score NUMERIC NOT NULL,
    skills_match_score NUMERIC,
    strengths JSONB,
    target_role TEXT NOT NULL,
    user_id UUID NOT NULL,
    CONSTRAINT resume_scores_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.saved_playlists
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_playlists (
    id BIGINT NOT NULL,
    channel TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    description TEXT,
    duration TEXT,
    language TEXT,
    level TEXT,
    playlist_id TEXT NOT NULL,
    playlist_url TEXT,
    skill_query TEXT,
    source TEXT DEFAULT 'youtube',
    thumbnail TEXT,
    title TEXT NOT NULL,
    user_id UUID NOT NULL,
    video_count TEXT,
    CONSTRAINT saved_playlists_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.video_progress
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.video_progress (
    id BIGINT NOT NULL,
    completed_at TIMESTAMPTZ,
    last_position INTEGER DEFAULT 0,
    playlist_id TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID NOT NULL,
    video_id TEXT NOT NULL,
    watch_time INTEGER DEFAULT 0,
    watched BOOLEAN DEFAULT false,
    CONSTRAINT video_progress_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.learning_progress
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_progress (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_steps JSONB,
    completion_pct NUMERIC DEFAULT 0,
    playlist_url TEXT,
    session_id TEXT,
    skill_name TEXT,
    started_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID,
    video_id TEXT,
    watched_seconds INTEGER DEFAULT 0,
    CONSTRAINT learning_progress_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.skills_cache
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skills_cache (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    avg_confidence NUMERIC DEFAULT 0,
    certificates_json JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    fallback_certs JSONB,
    fallback_playlists JSONB,
    playlists_json JSONB,
    recommendations JSONB,
    roadmap JSONB,
    roadmap_json JSONB,
    skill_key TEXT NOT NULL,
    skill_name TEXT,
    source_type TEXT,
    tier INTEGER DEFAULT 1,
    total_searches INTEGER DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT skills_cache_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.trust_score_engine
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trust_score_engine (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    channel_name TEXT,
    click_count INTEGER DEFAULT 0,
    completion_rate NUMERIC DEFAULT 0,
    confidence_score NUMERIC DEFAULT 50.0,
    created_at TIMESTAMPTZ DEFAULT now(),
    ignore_count INTEGER DEFAULT 0,
    metric_key TEXT,
    resource_title TEXT,
    resource_url TEXT,
    save_count INTEGER DEFAULT 0,
    score_data JSONB,
    skill_name TEXT,
    trust_score NUMERIC DEFAULT 50.0,
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT trust_score_engine_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.user_feedback
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    action TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    feedback_text TEXT,
    rating INTEGER,
    resource_title TEXT,
    resource_url TEXT,
    session_id TEXT,
    skill_name TEXT,
    user_id UUID,
    CONSTRAINT user_feedback_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.user_aptitude_attempts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_aptitude_attempts (
    id UUID DEFAULT 'extensions.uuid_generate_v4()' NOT NULL,
    attempted_at TIMESTAMPTZ DEFAULT now(),
    is_correct BOOLEAN NOT NULL,
    question_id INTEGER NOT NULL,
    selected_option_index INTEGER NOT NULL,
    time_taken_seconds INTEGER DEFAULT 0,
    topic_id INTEGER NOT NULL,
    user_id UUID NOT NULL,
    CONSTRAINT user_aptitude_attempts_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.user_quiz_results
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_quiz_results (
    id UUID DEFAULT 'extensions.uuid_generate_v4()' NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT now(),
    correct_answers INTEGER NOT NULL,
    score_percentage NUMERIC NOT NULL,
    timer_mode_seconds INTEGER DEFAULT 60,
    topic_id INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    user_id UUID NOT NULL,
    CONSTRAINT user_quiz_results_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.user_todos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_todos (
    id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    deadline TEXT DEFAULT '',
    progress INTEGER DEFAULT 0 NOT NULL,
    scheduled_date DATE DEFAULT CURRENT_DATE,
    scheduled_day INTEGER,
    title TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID NOT NULL,
    CONSTRAINT user_todos_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.user_schedule_notes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_schedule_notes (
    id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    date TEXT NOT NULL,
    day INTEGER NOT NULL,
    text TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID NOT NULL,
    CONSTRAINT user_schedule_notes_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.welcome_email_events
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.welcome_email_events (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    attempts INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    email TEXT NOT NULL,
    last_error TEXT,
    processing_until TIMESTAMPTZ,
    resend_id TEXT,
    sent_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID NOT NULL,
    CONSTRAINT welcome_email_events_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.devpulse_stories
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.devpulse_stories (
    id BIGINT NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(255) DEFAULT 'AI & ML' NOT NULL,
    comments INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    domain VARCHAR(255) NOT NULL,
    entity_tag VARCHAR(255),
    external_story_id BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    published_at TIMESTAMPTZ NOT NULL,
    score INTEGER DEFAULT 0 NOT NULL,
    section VARCHAR(255) DEFAULT 'ai_breakthroughs' NOT NULL,
    source VARCHAR(255) DEFAULT 'hackernews' NOT NULL,
    tech_tags TEXT[],
    title TEXT NOT NULL,
    trending_score INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    url TEXT NOT NULL,
    CONSTRAINT devpulse_stories_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.dsa_progress
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dsa_progress (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    category_counts JSONB,
    daily_streak INTEGER DEFAULT 0,
    easy_solved INTEGER DEFAULT 0,
    hard_solved INTEGER DEFAULT 0,
    last_active_date DATE DEFAULT CURRENT_DATE,
    leetcode_username TEXT,
    medium_solved INTEGER DEFAULT 0,
    solved_problems JSONB,
    total_solved INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID NOT NULL,
    weak_topics TEXT[],
    CONSTRAINT dsa_progress_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.interview_progress
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interview_progress (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    completed_rounds JSONB,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    interview_round_type TEXT,
    mock_interview_score INTEGER,
    overall_score NUMERIC DEFAULT 0,
    preparation_status TEXT,
    role_key TEXT DEFAULT 'general',
    target_company TEXT,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    user_id UUID NOT NULL,
    weak_areas TEXT[],
    CONSTRAINT interview_progress_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.recent_searches
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recent_searches (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    language TEXT,
    level TEXT,
    query TEXT NOT NULL,
    user_id UUID,
    CONSTRAINT recent_searches_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.recommendation_history
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recommendation_history (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    recommendations_json JSONB,
    roadmap_generated BOOLEAN DEFAULT false,
    session_id TEXT,
    skill_name TEXT NOT NULL,
    source_type TEXT,
    tier INTEGER,
    user_id UUID,
    CONSTRAINT recommendation_history_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.resume_analysis
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resume_analysis (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    ai_feedback TEXT,
    analysis_json JSONB,
    ats_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    file_name TEXT,
    improvement_suggestions JSONB,
    resume_file_url TEXT NOT NULL,
    user_id UUID NOT NULL,
    CONSTRAINT resume_analysis_pkey PRIMARY KEY (id)
);

-- ----------------------------------------------------------------------------
-- Table: public.success_metrics
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.success_metrics (
    id UUID DEFAULT gen_random_uuid() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    event_type TEXT,
    metadata JSONB,
    outcome_detail TEXT,
    outcome_type TEXT,
    session_id TEXT,
    skill_name TEXT,
    target_url TEXT,
    user_id UUID,
    CONSTRAINT success_metrics_pkey PRIMARY KEY (id)
);

-- ============================================================================
-- 3. VIEWS (1 VIEW)
-- ============================================================================

-- View: public.user_aptitude_question_analytics
CREATE OR REPLACE VIEW public.user_aptitude_question_analytics AS
SELECT
    ua.user_id,
    ua.topic_id,
    t.name AS topic_name,
    COUNT(ua.id) AS total_questions_attempted,
    COUNT(CASE WHEN ua.is_correct THEN 1 END) AS correct_answers_count,
    COUNT(CASE WHEN NOT ua.is_correct THEN 1 END) AS wrong_answers_count,
    ROUND((COUNT(CASE WHEN ua.is_correct THEN 1 END)::NUMERIC / NULLIF(COUNT(ua.id), 0) * 100), 2) AS accuracy_percent,
    ROUND(AVG(CASE WHEN ua.is_correct THEN ua.time_taken_seconds END)::NUMERIC, 2) AS avg_time_correct_sec,
    ROUND(AVG(CASE WHEN NOT ua.is_correct THEN ua.time_taken_seconds END)::NUMERIC, 2) AS avg_time_wrong_sec,
    SUM(ua.time_taken_seconds) AS total_practice_time_sec,
    MAX(ua.attempted_at) AS last_practiced_at
FROM public.user_aptitude_attempts ua
LEFT JOIN public.aptitude_topics t ON ua.topic_id = t.id
GROUP BY ua.user_id, ua.topic_id, t.name;

-- ============================================================================
-- 4. FOREIGN KEY CONSTRAINTS
-- ============================================================================

ALTER TABLE public.aptitude_topics
    ADD CONSTRAINT fk_aptitude_topics_category_id FOREIGN KEY (category_id)
    REFERENCES public.aptitude_categories(id) ON DELETE CASCADE;
ALTER TABLE public.aptitude_questions
    ADD CONSTRAINT fk_aptitude_questions_topic_id FOREIGN KEY (topic_id)
    REFERENCES public.aptitude_topics(id) ON DELETE CASCADE;
ALTER TABLE public.user_aptitude_attempts
    ADD CONSTRAINT fk_user_aptitude_attempts_topic_id FOREIGN KEY (topic_id)
    REFERENCES public.aptitude_topics(id) ON DELETE CASCADE;
ALTER TABLE public.user_aptitude_attempts
    ADD CONSTRAINT fk_user_aptitude_attempts_question_id FOREIGN KEY (question_id)
    REFERENCES public.aptitude_questions(id) ON DELETE CASCADE;
ALTER TABLE public.user_quiz_results
    ADD CONSTRAINT fk_user_quiz_results_topic_id FOREIGN KEY (topic_id)
    REFERENCES public.aptitude_topics(id) ON DELETE CASCADE;
ALTER TABLE public.dsa_progress
    ADD CONSTRAINT fk_dsa_progress_user_id FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.interview_progress
    ADD CONSTRAINT fk_interview_progress_user_id FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.learning_progress
    ADD CONSTRAINT fk_learning_progress_user_id FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.recent_searches
    ADD CONSTRAINT fk_recent_searches_user_id FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.recommendation_history
    ADD CONSTRAINT fk_recommendation_history_user_id FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.resume_analysis
    ADD CONSTRAINT fk_resume_analysis_user_id FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.success_metrics
    ADD CONSTRAINT fk_success_metrics_user_id FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.user_feedback
    ADD CONSTRAINT fk_user_feedback_user_id FOREIGN KEY (user_id)
    REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ============================================================================
-- 5. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_user_academic_user_id ON public.user_academic_profile (user_id);
CREATE INDEX IF NOT EXISTS idx_user_coding_user_id ON public.user_coding_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_leetcode_user_id ON public.leetcode_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_user_id ON public.roadmap_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_resume_scores_user_id ON public.resume_scores (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_playlists_user_id ON public.saved_playlists (user_id);
CREATE INDEX IF NOT EXISTS idx_video_progress_user_id ON public.video_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON public.learning_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback (user_id);
CREATE INDEX IF NOT EXISTS idx_user_todos_user_id ON public.user_todos (user_id);
CREATE INDEX IF NOT EXISTS idx_user_schedule_notes_user_id ON public.user_schedule_notes (user_id);
CREATE INDEX IF NOT EXISTS idx_welcome_email_user_id ON public.welcome_email_events (user_id);
CREATE INDEX IF NOT EXISTS idx_devpulse_published_at ON public.devpulse_stories (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_devpulse_section ON public.devpulse_stories (section);
CREATE INDEX IF NOT EXISTS idx_skills_cache_skill_key ON public.skills_cache (skill_key);
CREATE INDEX IF NOT EXISTS idx_trust_score_metric_key ON public.trust_score_engine (metric_key);
CREATE INDEX IF NOT EXISTS idx_aptitude_questions_topic ON public.aptitude_questions (topic_id);
CREATE INDEX IF NOT EXISTS idx_aptitude_topics_category ON public.aptitude_topics (category_id);
CREATE INDEX IF NOT EXISTS idx_aptitude_attempts_user ON public.user_aptitude_attempts (user_id);

-- ============================================================================
-- 6. STORED PROCEDURES / RPC FUNCTIONS (4 RPCS)
-- ============================================================================

-- RPC 1: recalculate_user_level
CREATE OR REPLACE FUNCTION public.recalculate_user_level(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_score NUMERIC := 0;
    v_solved_count INT := 0;
    v_accuracy NUMERIC := 0;
    v_learning_pct NUMERIC := 0;
    v_resume_score NUMERIC := 0;
    v_new_level INT := 1;
    v_level_title TEXT := 'Beginner';
    v_result JSONB;
BEGIN
    SELECT COALESCE(COUNT(*), 0) INTO v_solved_count
    FROM public.leetcode_progress
    WHERE user_id = p_user_id::TEXT;

    SELECT COALESCE(ROUND((COUNT(CASE WHEN is_correct THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0) * 100), 2), 0)
    INTO v_accuracy
    FROM public.user_aptitude_attempts
    WHERE user_id = p_user_id;

    SELECT COALESCE(MAX(overall_score), 0) INTO v_resume_score
    FROM public.resume_scores
    WHERE user_id = p_user_id;

    v_total_score := (v_solved_count * 5) + (v_accuracy * 0.5) + (v_resume_score * 0.4);

    IF v_total_score >= 80 THEN
        v_new_level := 5; v_level_title := 'Expert';
    ELSIF v_total_score >= 60 THEN
        v_new_level := 4; v_level_title := 'Advanced';
    ELSIF v_total_score >= 40 THEN
        v_new_level := 3; v_level_title := 'Intermediate';
    ELSIF v_total_score >= 20 THEN
        v_new_level := 2; v_level_title := 'Apprentice';
    ELSE
        v_new_level := 1; v_level_title := 'Beginner';
    END IF;

    UPDATE public.user_progress
    SET level = v_new_level,
        rank_tier = v_level_title,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    v_result := jsonb_build_object(
        'user_id', p_user_id,
        'level', v_new_level,
        'level_title', v_level_title,
        'total_score', v_total_score
    );

    RETURN v_result;
END;
$$;

-- RPC 2: record_daily_login
CREATE OR REPLACE FUNCTION public.record_daily_login(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_last_active DATE;
    v_current_streak INT := 0;
    v_longest_streak INT := 0;
    v_today DATE := CURRENT_DATE;
    v_result JSONB;
BEGIN
    SELECT last_active_date, current_streak, longest_streak
    INTO v_last_active, v_current_streak, v_longest_streak
    FROM public.user_progress
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        INSERT INTO public.user_progress (user_id, current_streak, longest_streak, last_active_date, updated_at)
        VALUES (p_user_id, 1, 1, v_today, NOW());
        v_current_streak := 1;
        v_longest_streak := 1;
    ELSIF v_last_active IS NULL OR v_last_active < v_today - INTERVAL '1 day' THEN
        v_current_streak := 1;
        UPDATE public.user_progress
        SET current_streak = 1,
            longest_streak = GREATEST(longest_streak, 1),
            last_active_date = v_today,
            updated_at = NOW()
        WHERE user_id = p_user_id;
    ELSIF v_last_active = v_today - INTERVAL '1 day' THEN
        v_current_streak := v_current_streak + 1;
        v_longest_streak := GREATEST(v_longest_streak, v_current_streak);
        UPDATE public.user_progress
        SET current_streak = v_current_streak,
            longest_streak = v_longest_streak,
            last_active_date = v_today,
            updated_at = NOW()
        WHERE user_id = p_user_id;
    END IF;

    v_result := jsonb_build_object(
        'user_id', p_user_id,
        'current_streak', v_current_streak,
        'longest_streak', v_longest_streak,
        'today', v_today
    );

    RETURN v_result;
END;
$$;

-- RPC 3: upsert_leetcode_solve
CREATE OR REPLACE FUNCTION public.upsert_leetcode_solve(
    p_user_id TEXT,
    p_company TEXT,
    p_question_id INTEGER,
    p_title TEXT,
    p_difficulty TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_row_id BIGINT;
    v_result JSONB;
BEGIN
    INSERT INTO public.leetcode_progress (
        user_id, company, question_id, title, difficulty, solved, solved_at, updated_at
    )
    VALUES (
        p_user_id, p_company, p_question_id, p_title, p_difficulty, true, NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET solved = true,
        solved_at = NOW(),
        updated_at = NOW()
    RETURNING id INTO v_row_id;

    v_result := jsonb_build_object(
        'status', 'success',
        'row_id', v_row_id,
        'question_id', p_question_id
    );

    RETURN v_result;
END;
$$;

-- RPC 4: upsert_user_aptitude_attempt
CREATE OR REPLACE FUNCTION public.upsert_user_aptitude_attempt(
    p_user_id UUID,
    p_topic_id INTEGER,
    p_question_id INTEGER,
    p_selected_option_index INTEGER,
    p_is_correct BOOLEAN,
    p_time_taken_seconds INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_attempt_id BIGINT;
    v_result JSONB;
BEGIN
    INSERT INTO public.user_aptitude_attempts (
        user_id, topic_id, question_id, selected_option_index, is_correct, time_taken_seconds, attempted_at
    )
    VALUES (
        p_user_id, p_topic_id, p_question_id, p_selected_option_index, p_is_correct, p_time_taken_seconds, NOW()
    )
    RETURNING id INTO v_attempt_id;

    v_result := jsonb_build_object(
        'status', 'success',
        'attempt_id', v_attempt_id,
        'is_correct', p_is_correct
    );

    RETURN v_result;
END;
$$;

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aptitude_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aptitude_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aptitude_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_academic_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leetcode_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_score_engine ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_aptitude_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_schedule_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welcome_email_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devpulse_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsa_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_metrics ENABLE ROW LEVEL SECURITY;

-- Policies for aptitude_categories (Public Read)
DROP POLICY IF EXISTS "Public read access on aptitude_categories" ON public.aptitude_categories;
CREATE POLICY "Public read access on aptitude_categories" ON public.aptitude_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access on aptitude_categories" ON public.aptitude_categories;
CREATE POLICY "Service role full access on aptitude_categories" ON public.aptitude_categories FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for aptitude_topics (Public Read)
DROP POLICY IF EXISTS "Public read access on aptitude_topics" ON public.aptitude_topics;
CREATE POLICY "Public read access on aptitude_topics" ON public.aptitude_topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access on aptitude_topics" ON public.aptitude_topics;
CREATE POLICY "Service role full access on aptitude_topics" ON public.aptitude_topics FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for aptitude_questions (Public Read)
DROP POLICY IF EXISTS "Public read access on aptitude_questions" ON public.aptitude_questions;
CREATE POLICY "Public read access on aptitude_questions" ON public.aptitude_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access on aptitude_questions" ON public.aptitude_questions;
CREATE POLICY "Service role full access on aptitude_questions" ON public.aptitude_questions FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for devpulse_stories (Public Read)
DROP POLICY IF EXISTS "Public read access on devpulse_stories" ON public.devpulse_stories;
CREATE POLICY "Public read access on devpulse_stories" ON public.devpulse_stories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access on devpulse_stories" ON public.devpulse_stories;
CREATE POLICY "Service role full access on devpulse_stories" ON public.devpulse_stories FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for skills_cache (Public Read)
DROP POLICY IF EXISTS "Public read access on skills_cache" ON public.skills_cache;
CREATE POLICY "Public read access on skills_cache" ON public.skills_cache FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access on skills_cache" ON public.skills_cache;
CREATE POLICY "Service role full access on skills_cache" ON public.skills_cache FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for trust_score_engine (Public Read)
DROP POLICY IF EXISTS "Public read access on trust_score_engine" ON public.trust_score_engine;
CREATE POLICY "Public read access on trust_score_engine" ON public.trust_score_engine FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access on trust_score_engine" ON public.trust_score_engine;
CREATE POLICY "Service role full access on trust_score_engine" ON public.trust_score_engine FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for profiles (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
CREATE POLICY "Users can view own profiles" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profiles" ON public.profiles;
CREATE POLICY "Users can insert own profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profiles" ON public.profiles;
CREATE POLICY "Users can update own profiles" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profiles" ON public.profiles;
CREATE POLICY "Users can delete own profiles" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role full access on profiles" ON public.profiles;
CREATE POLICY "Service role full access on profiles" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for user_progress (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own user_progress" ON public.user_progress;
CREATE POLICY "Users can view own user_progress" ON public.user_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own user_progress" ON public.user_progress;
CREATE POLICY "Users can insert own user_progress" ON public.user_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own user_progress" ON public.user_progress;
CREATE POLICY "Users can update own user_progress" ON public.user_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own user_progress" ON public.user_progress;
CREATE POLICY "Users can delete own user_progress" ON public.user_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on user_progress" ON public.user_progress;
CREATE POLICY "Service role full access on user_progress" ON public.user_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for user_academic_profile (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own user_academic_profile" ON public.user_academic_profile;
CREATE POLICY "Users can view own user_academic_profile" ON public.user_academic_profile FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own user_academic_profile" ON public.user_academic_profile;
CREATE POLICY "Users can insert own user_academic_profile" ON public.user_academic_profile FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own user_academic_profile" ON public.user_academic_profile;
CREATE POLICY "Users can update own user_academic_profile" ON public.user_academic_profile FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own user_academic_profile" ON public.user_academic_profile;
CREATE POLICY "Users can delete own user_academic_profile" ON public.user_academic_profile FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on user_academic_profile" ON public.user_academic_profile;
CREATE POLICY "Service role full access on user_academic_profile" ON public.user_academic_profile FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for user_coding_profiles (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own user_coding_profiles" ON public.user_coding_profiles;
CREATE POLICY "Users can view own user_coding_profiles" ON public.user_coding_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own user_coding_profiles" ON public.user_coding_profiles;
CREATE POLICY "Users can insert own user_coding_profiles" ON public.user_coding_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own user_coding_profiles" ON public.user_coding_profiles;
CREATE POLICY "Users can update own user_coding_profiles" ON public.user_coding_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own user_coding_profiles" ON public.user_coding_profiles;
CREATE POLICY "Users can delete own user_coding_profiles" ON public.user_coding_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on user_coding_profiles" ON public.user_coding_profiles;
CREATE POLICY "Service role full access on user_coding_profiles" ON public.user_coding_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for resume_scores (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own resume_scores" ON public.resume_scores;
CREATE POLICY "Users can view own resume_scores" ON public.resume_scores FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own resume_scores" ON public.resume_scores;
CREATE POLICY "Users can insert own resume_scores" ON public.resume_scores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own resume_scores" ON public.resume_scores;
CREATE POLICY "Users can update own resume_scores" ON public.resume_scores FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own resume_scores" ON public.resume_scores;
CREATE POLICY "Users can delete own resume_scores" ON public.resume_scores FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on resume_scores" ON public.resume_scores;
CREATE POLICY "Service role full access on resume_scores" ON public.resume_scores FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for saved_playlists (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own saved_playlists" ON public.saved_playlists;
CREATE POLICY "Users can view own saved_playlists" ON public.saved_playlists FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved_playlists" ON public.saved_playlists;
CREATE POLICY "Users can insert own saved_playlists" ON public.saved_playlists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own saved_playlists" ON public.saved_playlists;
CREATE POLICY "Users can update own saved_playlists" ON public.saved_playlists FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved_playlists" ON public.saved_playlists;
CREATE POLICY "Users can delete own saved_playlists" ON public.saved_playlists FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on saved_playlists" ON public.saved_playlists;
CREATE POLICY "Service role full access on saved_playlists" ON public.saved_playlists FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for video_progress (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own video_progress" ON public.video_progress;
CREATE POLICY "Users can view own video_progress" ON public.video_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own video_progress" ON public.video_progress;
CREATE POLICY "Users can insert own video_progress" ON public.video_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own video_progress" ON public.video_progress;
CREATE POLICY "Users can update own video_progress" ON public.video_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own video_progress" ON public.video_progress;
CREATE POLICY "Users can delete own video_progress" ON public.video_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on video_progress" ON public.video_progress;
CREATE POLICY "Service role full access on video_progress" ON public.video_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for learning_progress (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own learning_progress" ON public.learning_progress;
CREATE POLICY "Users can view own learning_progress" ON public.learning_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own learning_progress" ON public.learning_progress;
CREATE POLICY "Users can insert own learning_progress" ON public.learning_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own learning_progress" ON public.learning_progress;
CREATE POLICY "Users can update own learning_progress" ON public.learning_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own learning_progress" ON public.learning_progress;
CREATE POLICY "Users can delete own learning_progress" ON public.learning_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on learning_progress" ON public.learning_progress;
CREATE POLICY "Service role full access on learning_progress" ON public.learning_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for user_feedback (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own user_feedback" ON public.user_feedback;
CREATE POLICY "Users can view own user_feedback" ON public.user_feedback FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own user_feedback" ON public.user_feedback;
CREATE POLICY "Users can insert own user_feedback" ON public.user_feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own user_feedback" ON public.user_feedback;
CREATE POLICY "Users can update own user_feedback" ON public.user_feedback FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own user_feedback" ON public.user_feedback;
CREATE POLICY "Users can delete own user_feedback" ON public.user_feedback FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on user_feedback" ON public.user_feedback;
CREATE POLICY "Service role full access on user_feedback" ON public.user_feedback FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for user_aptitude_attempts (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own user_aptitude_attempts" ON public.user_aptitude_attempts;
CREATE POLICY "Users can view own user_aptitude_attempts" ON public.user_aptitude_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own user_aptitude_attempts" ON public.user_aptitude_attempts;
CREATE POLICY "Users can insert own user_aptitude_attempts" ON public.user_aptitude_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own user_aptitude_attempts" ON public.user_aptitude_attempts;
CREATE POLICY "Users can update own user_aptitude_attempts" ON public.user_aptitude_attempts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own user_aptitude_attempts" ON public.user_aptitude_attempts;
CREATE POLICY "Users can delete own user_aptitude_attempts" ON public.user_aptitude_attempts FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on user_aptitude_attempts" ON public.user_aptitude_attempts;
CREATE POLICY "Service role full access on user_aptitude_attempts" ON public.user_aptitude_attempts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for user_quiz_results (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own user_quiz_results" ON public.user_quiz_results;
CREATE POLICY "Users can view own user_quiz_results" ON public.user_quiz_results FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own user_quiz_results" ON public.user_quiz_results;
CREATE POLICY "Users can insert own user_quiz_results" ON public.user_quiz_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own user_quiz_results" ON public.user_quiz_results;
CREATE POLICY "Users can update own user_quiz_results" ON public.user_quiz_results FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own user_quiz_results" ON public.user_quiz_results;
CREATE POLICY "Users can delete own user_quiz_results" ON public.user_quiz_results FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on user_quiz_results" ON public.user_quiz_results;
CREATE POLICY "Service role full access on user_quiz_results" ON public.user_quiz_results FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for user_todos (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own user_todos" ON public.user_todos;
CREATE POLICY "Users can view own user_todos" ON public.user_todos FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own user_todos" ON public.user_todos;
CREATE POLICY "Users can insert own user_todos" ON public.user_todos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own user_todos" ON public.user_todos;
CREATE POLICY "Users can update own user_todos" ON public.user_todos FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own user_todos" ON public.user_todos;
CREATE POLICY "Users can delete own user_todos" ON public.user_todos FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on user_todos" ON public.user_todos;
CREATE POLICY "Service role full access on user_todos" ON public.user_todos FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for user_schedule_notes (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own user_schedule_notes" ON public.user_schedule_notes;
CREATE POLICY "Users can view own user_schedule_notes" ON public.user_schedule_notes FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own user_schedule_notes" ON public.user_schedule_notes;
CREATE POLICY "Users can insert own user_schedule_notes" ON public.user_schedule_notes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own user_schedule_notes" ON public.user_schedule_notes;
CREATE POLICY "Users can update own user_schedule_notes" ON public.user_schedule_notes FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own user_schedule_notes" ON public.user_schedule_notes;
CREATE POLICY "Users can delete own user_schedule_notes" ON public.user_schedule_notes FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on user_schedule_notes" ON public.user_schedule_notes;
CREATE POLICY "Service role full access on user_schedule_notes" ON public.user_schedule_notes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for welcome_email_events (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own welcome_email_events" ON public.welcome_email_events;
CREATE POLICY "Users can view own welcome_email_events" ON public.welcome_email_events FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own welcome_email_events" ON public.welcome_email_events;
CREATE POLICY "Users can insert own welcome_email_events" ON public.welcome_email_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own welcome_email_events" ON public.welcome_email_events;
CREATE POLICY "Users can update own welcome_email_events" ON public.welcome_email_events FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own welcome_email_events" ON public.welcome_email_events;
CREATE POLICY "Users can delete own welcome_email_events" ON public.welcome_email_events FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on welcome_email_events" ON public.welcome_email_events;
CREATE POLICY "Service role full access on welcome_email_events" ON public.welcome_email_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for dsa_progress (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own dsa_progress" ON public.dsa_progress;
CREATE POLICY "Users can view own dsa_progress" ON public.dsa_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own dsa_progress" ON public.dsa_progress;
CREATE POLICY "Users can insert own dsa_progress" ON public.dsa_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own dsa_progress" ON public.dsa_progress;
CREATE POLICY "Users can update own dsa_progress" ON public.dsa_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own dsa_progress" ON public.dsa_progress;
CREATE POLICY "Users can delete own dsa_progress" ON public.dsa_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on dsa_progress" ON public.dsa_progress;
CREATE POLICY "Service role full access on dsa_progress" ON public.dsa_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for interview_progress (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own interview_progress" ON public.interview_progress;
CREATE POLICY "Users can view own interview_progress" ON public.interview_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own interview_progress" ON public.interview_progress;
CREATE POLICY "Users can insert own interview_progress" ON public.interview_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own interview_progress" ON public.interview_progress;
CREATE POLICY "Users can update own interview_progress" ON public.interview_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own interview_progress" ON public.interview_progress;
CREATE POLICY "Users can delete own interview_progress" ON public.interview_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on interview_progress" ON public.interview_progress;
CREATE POLICY "Service role full access on interview_progress" ON public.interview_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for recent_searches (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own recent_searches" ON public.recent_searches;
CREATE POLICY "Users can view own recent_searches" ON public.recent_searches FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recent_searches" ON public.recent_searches;
CREATE POLICY "Users can insert own recent_searches" ON public.recent_searches FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recent_searches" ON public.recent_searches;
CREATE POLICY "Users can update own recent_searches" ON public.recent_searches FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recent_searches" ON public.recent_searches;
CREATE POLICY "Users can delete own recent_searches" ON public.recent_searches FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on recent_searches" ON public.recent_searches;
CREATE POLICY "Service role full access on recent_searches" ON public.recent_searches FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for recommendation_history (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own recommendation_history" ON public.recommendation_history;
CREATE POLICY "Users can view own recommendation_history" ON public.recommendation_history FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recommendation_history" ON public.recommendation_history;
CREATE POLICY "Users can insert own recommendation_history" ON public.recommendation_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recommendation_history" ON public.recommendation_history;
CREATE POLICY "Users can update own recommendation_history" ON public.recommendation_history FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recommendation_history" ON public.recommendation_history;
CREATE POLICY "Users can delete own recommendation_history" ON public.recommendation_history FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on recommendation_history" ON public.recommendation_history;
CREATE POLICY "Service role full access on recommendation_history" ON public.recommendation_history FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for resume_analysis (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own resume_analysis" ON public.resume_analysis;
CREATE POLICY "Users can view own resume_analysis" ON public.resume_analysis FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own resume_analysis" ON public.resume_analysis;
CREATE POLICY "Users can insert own resume_analysis" ON public.resume_analysis FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own resume_analysis" ON public.resume_analysis;
CREATE POLICY "Users can update own resume_analysis" ON public.resume_analysis FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own resume_analysis" ON public.resume_analysis;
CREATE POLICY "Users can delete own resume_analysis" ON public.resume_analysis FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on resume_analysis" ON public.resume_analysis;
CREATE POLICY "Service role full access on resume_analysis" ON public.resume_analysis FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for success_metrics (Strict User Isolation)
DROP POLICY IF EXISTS "Users can view own success_metrics" ON public.success_metrics;
CREATE POLICY "Users can view own success_metrics" ON public.success_metrics FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own success_metrics" ON public.success_metrics;
CREATE POLICY "Users can insert own success_metrics" ON public.success_metrics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own success_metrics" ON public.success_metrics;
CREATE POLICY "Users can update own success_metrics" ON public.success_metrics FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own success_metrics" ON public.success_metrics;
CREATE POLICY "Users can delete own success_metrics" ON public.success_metrics FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access on success_metrics" ON public.success_metrics;
CREATE POLICY "Service role full access on success_metrics" ON public.success_metrics FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for leetcode_progress
DROP POLICY IF EXISTS "Users can view own leetcode_progress" ON public.leetcode_progress;
CREATE POLICY "Users can view own leetcode_progress" ON public.leetcode_progress FOR SELECT TO authenticated USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert own leetcode_progress" ON public.leetcode_progress;
CREATE POLICY "Users can insert own leetcode_progress" ON public.leetcode_progress FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own leetcode_progress" ON public.leetcode_progress;
CREATE POLICY "Users can update own leetcode_progress" ON public.leetcode_progress FOR UPDATE TO authenticated USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own leetcode_progress" ON public.leetcode_progress;
CREATE POLICY "Users can delete own leetcode_progress" ON public.leetcode_progress FOR DELETE TO authenticated USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Service role full access on leetcode_progress" ON public.leetcode_progress;
CREATE POLICY "Service role full access on leetcode_progress" ON public.leetcode_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for roadmap_progress
DROP POLICY IF EXISTS "Users can view own roadmap_progress" ON public.roadmap_progress;
CREATE POLICY "Users can view own roadmap_progress" ON public.roadmap_progress FOR SELECT TO authenticated USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert own roadmap_progress" ON public.roadmap_progress;
CREATE POLICY "Users can insert own roadmap_progress" ON public.roadmap_progress FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own roadmap_progress" ON public.roadmap_progress;
CREATE POLICY "Users can update own roadmap_progress" ON public.roadmap_progress FOR UPDATE TO authenticated USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own roadmap_progress" ON public.roadmap_progress;
CREATE POLICY "Users can delete own roadmap_progress" ON public.roadmap_progress FOR DELETE TO authenticated USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Service role full access on roadmap_progress" ON public.roadmap_progress;
CREATE POLICY "Service role full access on roadmap_progress" ON public.roadmap_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- 8. GRANTS & PRIVILEGES
-- ============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON TABLE public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated, service_role;
GRANT SELECT ON TABLE public.aptitude_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.aptitude_categories TO authenticated, service_role;
GRANT SELECT ON TABLE public.aptitude_topics TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.aptitude_topics TO authenticated, service_role;
GRANT SELECT ON TABLE public.aptitude_questions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.aptitude_questions TO authenticated, service_role;
GRANT SELECT ON TABLE public.user_academic_profile TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_academic_profile TO authenticated, service_role;
GRANT SELECT ON TABLE public.user_coding_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_coding_profiles TO authenticated, service_role;
GRANT SELECT ON TABLE public.user_progress TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_progress TO authenticated, service_role;
GRANT SELECT ON TABLE public.leetcode_progress TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.leetcode_progress TO authenticated, service_role;
GRANT SELECT ON TABLE public.roadmap_progress TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.roadmap_progress TO authenticated, service_role;
GRANT SELECT ON TABLE public.resume_scores TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.resume_scores TO authenticated, service_role;
GRANT SELECT ON TABLE public.saved_playlists TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.saved_playlists TO authenticated, service_role;
GRANT SELECT ON TABLE public.video_progress TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.video_progress TO authenticated, service_role;
GRANT SELECT ON TABLE public.learning_progress TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.learning_progress TO authenticated, service_role;
GRANT SELECT ON TABLE public.skills_cache TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.skills_cache TO authenticated, service_role;
GRANT SELECT ON TABLE public.trust_score_engine TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.trust_score_engine TO authenticated, service_role;
GRANT SELECT ON TABLE public.user_feedback TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_feedback TO authenticated, service_role;
GRANT SELECT ON TABLE public.user_aptitude_attempts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_aptitude_attempts TO authenticated, service_role;
GRANT SELECT ON TABLE public.user_quiz_results TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_quiz_results TO authenticated, service_role;
GRANT SELECT ON TABLE public.user_todos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_todos TO authenticated, service_role;
GRANT SELECT ON TABLE public.user_schedule_notes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_schedule_notes TO authenticated, service_role;
GRANT SELECT ON TABLE public.welcome_email_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.welcome_email_events TO authenticated, service_role;
GRANT SELECT ON TABLE public.devpulse_stories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.devpulse_stories TO authenticated, service_role;
GRANT SELECT ON TABLE public.dsa_progress TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.dsa_progress TO authenticated, service_role;
GRANT SELECT ON TABLE public.interview_progress TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.interview_progress TO authenticated, service_role;
GRANT SELECT ON TABLE public.recent_searches TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.recent_searches TO authenticated, service_role;
GRANT SELECT ON TABLE public.recommendation_history TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.recommendation_history TO authenticated, service_role;
GRANT SELECT ON TABLE public.resume_analysis TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.resume_analysis TO authenticated, service_role;
GRANT SELECT ON TABLE public.success_metrics TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.success_metrics TO authenticated, service_role;
GRANT SELECT ON public.user_aptitude_question_analytics TO anon, authenticated, service_role;

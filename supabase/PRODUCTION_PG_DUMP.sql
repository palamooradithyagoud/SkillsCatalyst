--
-- PostgreSQL database dump
--
-- Dumped from database version 17.6
-- Supabase Project Ref: zzjxprhapptjoziwdcro
-- Host: db.zzjxprhapptjoziwdcro.supabase.co
-- Extracted: 2026-09-06
-- Schema: public
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'public', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = on;

--
-- Extensions
--
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

--
-- Functions & Stored Procedures (10 functions)
--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.user_academic_profile (user_id, full_name, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        updated_at = NOW();

    INSERT INTO public.user_progress (user_id, updated_at)
    VALUES (NEW.id, NOW())
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.user_coding_profiles (user_id, updated_at)
    VALUES (NEW.id, NOW())
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$function$
;

-- Name: handle_welcome_email_on_signup(); Type: FUNCTION; Schema: public
CREATE OR REPLACE FUNCTION public.handle_welcome_email_on_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.welcome_email_events (user_id, email, status, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        'pending',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$function$
;

-- Name: recalculate_user_level(); Type: FUNCTION; Schema: public
CREATE OR REPLACE FUNCTION public.recalculate_user_level(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_questions INTEGER := 0;
    v_videos INTEGER := 0;
    v_roadmaps INTEGER := 0;
    v_xp INTEGER := 0;
    v_level INTEGER := 0;
BEGIN
    SELECT COUNT(*) INTO v_questions
    FROM public.leetcode_progress
    WHERE user_id = p_user_id AND status = 'solved';

    SELECT COUNT(*) INTO v_videos
    FROM public.video_progress
    WHERE user_id = p_user_id AND watched = TRUE;

    SELECT COUNT(*) INTO v_roadmaps
    FROM public.roadmap_progress
    WHERE user_id = p_user_id AND status = 'completed' AND node_id <> '_roadmap_started';

    v_xp := (v_videos * 25) + (v_questions * 50) + (v_roadmaps * 50);
    v_level := FLOOR(v_xp / 100);

    UPDATE public.user_progress
    SET problems_solved = v_questions, total_xp = v_xp, level = v_level, updated_at = NOW()
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object(
        'user_id', p_user_id,
        'problems_solved', v_questions,
        'completed_videos', v_videos,
        'completed_roadmaps', v_roadmaps,
        'total_xp', v_xp,
        'level', v_level
    );
END;
$function$
;

-- Name: record_daily_login(); Type: FUNCTION; Schema: public
CREATE OR REPLACE FUNCTION public.record_daily_login(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_streak INTEGER := 0;
    v_last_date DATE;
    v_today DATE := CURRENT_DATE;
    v_yesterday DATE := CURRENT_DATE - 1;
BEGIN
    SELECT streak_days, last_login_date
    INTO v_streak, v_last_date
    FROM public.user_progress
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        v_streak := 1;
        INSERT INTO public.user_progress (
            user_id, streak_days, last_login_date, last_active_at, problems_solved, total_xp, level, updated_at
        ) VALUES (
            p_user_id, 1, v_today, NOW(), 0, 0, 0, NOW()
        );
    ELSE
        IF v_last_date = v_today THEN
            v_streak := COALESCE(v_streak, 1);
            UPDATE public.user_progress
            SET last_active_at = NOW(), updated_at = NOW()
            WHERE user_id = p_user_id;
        ELSIF v_last_date = v_yesterday THEN
            v_streak := COALESCE(v_streak, 0) + 1;
            UPDATE public.user_progress
            SET streak_days = v_streak, last_login_date = v_today, last_active_at = NOW(), updated_at = NOW()
            WHERE user_id = p_user_id;
        ELSE
            v_streak := 1;
            UPDATE public.user_progress
            SET streak_days = 1, last_login_date = v_today, last_active_at = NOW(), updated_at = NOW()
            WHERE user_id = p_user_id;
        END IF;
    END IF;

    RETURN jsonb_build_object('user_id', p_user_id, 'streak_days', v_streak, 'last_login_date', v_today);
END;
$function$
;

-- Name: set_updated_at(); Type: FUNCTION; Schema: public
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

-- Name: trg_sync_leetcode_progress_solved(); Type: FUNCTION; Schema: public
CREATE OR REPLACE FUNCTION public.trg_sync_leetcode_progress_solved()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_target_user UUID;
    v_count INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_target_user := OLD.user_id;
    ELSE
        v_target_user := NEW.user_id;
    END IF;

    IF v_target_user IS NOT NULL THEN
        SELECT COUNT(*) INTO v_count
        FROM public.leetcode_progress
        WHERE user_id = v_target_user AND status = 'solved';

        UPDATE public.user_progress
        SET problems_solved = v_count, updated_at = NOW()
        WHERE user_id = v_target_user;
    END IF;

    RETURN NULL;
END;
$function$
;

-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

-- Name: upsert_leetcode_solve(); Type: FUNCTION; Schema: public
CREATE OR REPLACE FUNCTION public.upsert_leetcode_solve(p_user_id text, p_company text, p_question_id integer, p_title text, p_difficulty text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO public.leetcode_progress
        (user_id, company_slug, question_id, question_title, difficulty, status)
    VALUES
        (p_user_id, p_company, p_question_id, p_title, p_difficulty, 'solved')
    ON CONFLICT (user_id, company_slug, question_id)
    DO UPDATE SET status = 'solved', solved_at = NOW();

    INSERT INTO public.user_progress (user_id, problems_solved, updated_at)
    VALUES (p_user_id, 1, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
        problems_solved = (
            SELECT COUNT(*) FROM public.leetcode_progress
            WHERE user_id = p_user_id AND status = 'solved'
        ),
        updated_at = NOW();
END;
$function$
;

-- Name: upsert_leetcode_solve(); Type: FUNCTION; Schema: public
CREATE OR REPLACE FUNCTION public.upsert_leetcode_solve(p_company text, p_question_id integer, p_title text, p_difficulty text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthenticated call to upsert_leetcode_solve';
    END IF;

    INSERT INTO public.leetcode_progress (user_id, company_slug, question_id, question_title, difficulty, status)
    VALUES (v_user_id, p_company, p_question_id, p_title, p_difficulty, 'solved')
    ON CONFLICT (user_id, company_slug, question_id)
    DO UPDATE SET status = 'solved', solved_at = NOW();

    INSERT INTO public.user_progress (user_id, problems_solved, updated_at)
    VALUES (v_user_id, 1, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET 
        problems_solved = (SELECT COUNT(*) FROM public.leetcode_progress WHERE user_id = v_user_id AND status = 'solved'),
        updated_at = NOW();
END;
$function$
;

-- Name: upsert_user_aptitude_attempt(); Type: FUNCTION; Schema: public
CREATE OR REPLACE FUNCTION public.upsert_user_aptitude_attempt(p_user_id uuid, p_topic_id integer, p_question_id integer, p_selected_option_index integer, p_is_correct boolean, p_time_taken_seconds integer)
 RETURNS user_aptitude_attempts
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    v_result public.user_aptitude_attempts;
BEGIN
    IF p_user_id::text IS DISTINCT FROM auth.uid()::text THEN
        RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
    END IF;

    INSERT INTO public.user_aptitude_attempts (
        user_id, topic_id, question_id, selected_option_index, is_correct, time_taken_seconds, attempted_at
    ) VALUES (
        p_user_id, p_topic_id, p_question_id, p_selected_option_index, p_is_correct, p_time_taken_seconds, NOW()
    )
    ON CONFLICT (user_id, question_id) DO UPDATE SET
        selected_option_index = EXCLUDED.selected_option_index,
        is_correct = EXCLUDED.is_correct,
        time_taken_seconds = EXCLUDED.time_taken_seconds,
        attempted_at = NOW()
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$function$
;

--
-- Tables & Column Definitions (28 tables)
--
-- Name: aptitude_categories; Type: TABLE; Schema: public
CREATE TABLE public.aptitude_categories (
    id integer DEFAULT nextval('aptitude_categories_id_seq'::regclass) NOT NULL,
    category_name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    icon_name character varying(50) DEFAULT 'Calculator'::character varying,
    created_at timestamp with time zone DEFAULT now()
);

-- Name: aptitude_questions; Type: TABLE; Schema: public
CREATE TABLE public.aptitude_questions (
    id integer DEFAULT nextval('aptitude_questions_id_seq'::regclass) NOT NULL,
    topic_id integer NOT NULL,
    question_number integer NOT NULL,
    question_text text NOT NULL,
    options jsonb NOT NULL,
    correct_index integer NOT NULL,
    answer_text character varying(100) NOT NULL,
    solution_text text NOT NULL,
    difficulty character varying(20) DEFAULT 'Medium'::character varying,
    per_question_timer integer DEFAULT 60,
    created_at timestamp with time zone DEFAULT now()
);

-- Name: aptitude_topics; Type: TABLE; Schema: public
CREATE TABLE public.aptitude_topics (
    id integer DEFAULT nextval('aptitude_topics_id_seq'::regclass) NOT NULL,
    category_id integer,
    topic_name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    total_questions integer DEFAULT 0,
    default_timer_seconds integer DEFAULT 60,
    created_at timestamp with time zone DEFAULT now()
);

-- Name: devpulse_stories; Type: TABLE; Schema: public
CREATE TABLE public.devpulse_stories (
    id bigint DEFAULT nextval('devpulse_stories_id_seq'::regclass) NOT NULL,
    source character varying(50) DEFAULT 'hackernews'::character varying NOT NULL,
    external_story_id bigint NOT NULL,
    title text NOT NULL,
    url text NOT NULL,
    domain character varying(255) NOT NULL,
    author character varying(255) NOT NULL,
    score integer DEFAULT 0 NOT NULL,
    comments integer DEFAULT 0 NOT NULL,
    published_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    section character varying(50) DEFAULT 'ai_breakthroughs'::character varying NOT NULL,
    category character varying(100) DEFAULT 'AI & ML'::character varying NOT NULL,
    entity_tag character varying(100),
    tech_tags text[] DEFAULT '{}'::text[],
    trending_score integer DEFAULT 0 NOT NULL
);

-- Name: dsa_progress; Type: TABLE; Schema: public
CREATE TABLE public.dsa_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    leetcode_username text,
    total_solved integer DEFAULT 0,
    easy_solved integer DEFAULT 0,
    medium_solved integer DEFAULT 0,
    hard_solved integer DEFAULT 0,
    solved_problems jsonb DEFAULT '[]'::jsonb,
    category_counts jsonb DEFAULT '{}'::jsonb,
    weak_topics text[],
    daily_streak integer DEFAULT 0,
    last_active_date date DEFAULT CURRENT_DATE,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: interview_progress; Type: TABLE; Schema: public
CREATE TABLE public.interview_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    target_company text,
    role_key text DEFAULT 'general'::text,
    mock_interview_score integer,
    overall_score numeric DEFAULT 0,
    weak_areas text[],
    interview_round_type text,
    preparation_status text,
    completed_rounds jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: learning_progress; Type: TABLE; Schema: public
CREATE TABLE public.learning_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_id text,
    skill_name text,
    playlist_url text,
    video_id text,
    watched_seconds integer DEFAULT 0,
    completed_steps jsonb DEFAULT '[]'::jsonb,
    completion_pct numeric(5,2) DEFAULT 0,
    completed boolean DEFAULT false,
    started_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Name: leetcode_progress; Type: TABLE; Schema: public
CREATE TABLE public.leetcode_progress (
    id bigint DEFAULT nextval('leetcode_progress_id_seq'::regclass) NOT NULL,
    user_id uuid NOT NULL,
    company_slug text NOT NULL,
    question_id integer NOT NULL,
    question_title text NOT NULL,
    difficulty text DEFAULT 'Easy'::text,
    acceptance text,
    frequency text,
    status text DEFAULT 'solved'::text NOT NULL,
    solved_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: profiles; Type: TABLE; Schema: public
CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text NOT NULL,
    avatar_url text,
    college text,
    department text,
    academic_class text,
    current_role text DEFAULT 'Learner'::text,
    target_role text DEFAULT 'Full Stack Developer'::text,
    skill_level text,
    preferred_learning_path text,
    target_companies text[],
    streak_days integer DEFAULT 0,
    leetcode_profile text,
    github_profile text,
    hackerrank_profile text,
    codechef_profile text,
    gfg_profile text,
    codeforces_profile text,
    codementor_profile text,
    coding_stats jsonb DEFAULT '{}'::jsonb,
    last_stats_sync timestamp with time zone DEFAULT now(),
    welcome_email_sent boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: recent_searches; Type: TABLE; Schema: public
CREATE TABLE public.recent_searches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    query text NOT NULL,
    level text,
    language text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: recommendation_history; Type: TABLE; Schema: public
CREATE TABLE public.recommendation_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    skill_name text NOT NULL,
    tier integer,
    source_type text,
    recommendations_json jsonb,
    roadmap_generated boolean DEFAULT false,
    session_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: resume_analysis; Type: TABLE; Schema: public
CREATE TABLE public.resume_analysis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    resume_file_url text NOT NULL,
    file_name text,
    ats_score integer,
    ai_feedback text,
    improvement_suggestions jsonb DEFAULT '[]'::jsonb,
    analysis_json jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: resume_scores; Type: TABLE; Schema: public
CREATE TABLE public.resume_scores (
    id bigint DEFAULT nextval('resume_scores_id_seq'::regclass) NOT NULL,
    user_id uuid NOT NULL,
    filename text NOT NULL,
    target_role text NOT NULL,
    company_type text DEFAULT 'Product-Based'::text,
    overall_score numeric(5,2) NOT NULL,
    ats_compatibility_score numeric(5,2),
    skills_match_score numeric(5,2),
    experience_score numeric(5,2),
    strengths jsonb DEFAULT '[]'::jsonb,
    improvements jsonb DEFAULT '[]'::jsonb,
    full_review_json jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: roadmap_progress; Type: TABLE; Schema: public
CREATE TABLE public.roadmap_progress (
    id bigint DEFAULT nextval('roadmap_progress_id_seq'::regclass) NOT NULL,
    user_id uuid NOT NULL,
    roadmap_id text NOT NULL,
    node_id text NOT NULL,
    node_title text NOT NULL,
    category text,
    status text DEFAULT 'completed'::text NOT NULL,
    completed_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: saved_playlists; Type: TABLE; Schema: public
CREATE TABLE public.saved_playlists (
    id bigint DEFAULT nextval('saved_playlists_id_seq'::regclass) NOT NULL,
    user_id uuid NOT NULL,
    playlist_id text NOT NULL,
    title text NOT NULL,
    channel text,
    description text,
    level text,
    video_count text,
    duration text,
    playlist_url text,
    thumbnail text,
    source text DEFAULT 'youtube'::text,
    skill_query text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    language text
);

-- Name: skills_cache; Type: TABLE; Schema: public
CREATE TABLE public.skills_cache (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    skill_name text,
    skill_key text NOT NULL,
    tier integer DEFAULT 1,
    source_type text,
    playlists_json jsonb,
    certificates_json jsonb,
    recommendations jsonb,
    fallback_playlists jsonb,
    fallback_certs jsonb,
    roadmap jsonb,
    roadmap_json jsonb,
    total_searches integer DEFAULT 1,
    avg_confidence numeric(5,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Name: success_metrics; Type: TABLE; Schema: public
CREATE TABLE public.success_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_id text,
    skill_name text,
    event_type text,
    target_url text,
    outcome_type text,
    outcome_detail text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: trust_score_engine; Type: TABLE; Schema: public
CREATE TABLE public.trust_score_engine (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    resource_url text,
    resource_title text,
    channel_name text,
    skill_name text,
    metric_key text,
    score_data jsonb,
    trust_score numeric(5,2) DEFAULT 50.0,
    confidence_score numeric(5,2) DEFAULT 50.0,
    click_count integer DEFAULT 0,
    save_count integer DEFAULT 0,
    ignore_count integer DEFAULT 0,
    completion_rate numeric(5,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Name: user_academic_profile; Type: TABLE; Schema: public
CREATE TABLE public.user_academic_profile (
    user_id uuid NOT NULL,
    full_name text DEFAULT ''::text,
    college text DEFAULT ''::text,
    department text DEFAULT ''::text,
    academic_year text DEFAULT ''::text,
    target_role text DEFAULT ''::text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: user_aptitude_attempts; Type: TABLE; Schema: public
CREATE TABLE public.user_aptitude_attempts (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    topic_id integer NOT NULL,
    question_id integer NOT NULL,
    selected_option_index integer NOT NULL,
    is_correct boolean NOT NULL,
    time_taken_seconds integer DEFAULT 0,
    attempted_at timestamp with time zone DEFAULT now()
);

-- Name: user_coding_profiles; Type: TABLE; Schema: public
CREATE TABLE public.user_coding_profiles (
    user_id uuid NOT NULL,
    leetcode_url text DEFAULT ''::text,
    github_url text DEFAULT ''::text,
    hackerrank_url text DEFAULT ''::text,
    codechef_url text DEFAULT ''::text,
    geeksforgeeks_url text DEFAULT ''::text,
    codeforces_url text DEFAULT ''::text,
    stats_json jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: user_feedback; Type: TABLE; Schema: public
CREATE TABLE public.user_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_id text,
    skill_name text,
    resource_url text,
    resource_title text,
    action text,
    rating integer,
    feedback_text text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: user_progress; Type: TABLE; Schema: public
CREATE TABLE public.user_progress (
    user_id uuid NOT NULL,
    problems_solved integer DEFAULT 0 NOT NULL,
    success_rate numeric(5,2) DEFAULT 0.00 NOT NULL,
    streak_days integer DEFAULT 0 NOT NULL,
    learning_progress_percent numeric(5,2) DEFAULT 0.00 NOT NULL,
    resume_readiness_score numeric(5,2) DEFAULT 0.00 NOT NULL,
    ai_career_health_score numeric(5,2) DEFAULT 0.00 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_login_date date,
    last_active_at timestamp with time zone DEFAULT now(),
    total_xp integer DEFAULT 0 NOT NULL,
    level integer DEFAULT 0 NOT NULL
);

-- Name: user_quiz_results; Type: TABLE; Schema: public
CREATE TABLE public.user_quiz_results (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    topic_id integer NOT NULL,
    total_questions integer NOT NULL,
    correct_answers integer NOT NULL,
    score_percentage numeric(5,2) NOT NULL,
    timer_mode_seconds integer DEFAULT 60,
    completed_at timestamp with time zone DEFAULT now()
);

-- Name: user_schedule_notes; Type: TABLE; Schema: public
CREATE TABLE public.user_schedule_notes (
    id text NOT NULL,
    user_id uuid NOT NULL,
    text text NOT NULL,
    day integer NOT NULL,
    date text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: user_todos; Type: TABLE; Schema: public
CREATE TABLE public.user_todos (
    id text NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    deadline text DEFAULT ''::text,
    progress integer DEFAULT 0 NOT NULL,
    scheduled_day integer,
    scheduled_date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: video_progress; Type: TABLE; Schema: public
CREATE TABLE public.video_progress (
    id bigint DEFAULT nextval('video_progress_id_seq'::regclass) NOT NULL,
    user_id uuid NOT NULL,
    playlist_id text NOT NULL,
    video_id text NOT NULL,
    watched boolean DEFAULT false,
    last_position integer DEFAULT 0,
    watch_time integer DEFAULT 0,
    completed_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Name: welcome_email_events; Type: TABLE; Schema: public
CREATE TABLE public.welcome_email_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    resend_id text,
    last_error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    processing_until timestamp with time zone,
    sent_at timestamp with time zone
);

--
-- Views (1 view)
--
-- Name: user_aptitude_question_analytics; Type: VIEW; Schema: public
CREATE OR REPLACE VIEW public.user_aptitude_question_analytics AS
 SELECT a.user_id,
    a.topic_id,
    t.topic_name,
    count(a.id) AS total_questions_attempted,
    count(
        CASE
            WHEN a.is_correct = true THEN 1
            ELSE NULL::integer
        END) AS correct_answers_count,
    count(
        CASE
            WHEN a.is_correct = false THEN 1
            ELSE NULL::integer
        END) AS wrong_answers_count,
    round(count(
        CASE
            WHEN a.is_correct = true THEN 1
            ELSE NULL::integer
        END)::numeric / NULLIF(count(a.id), 0)::numeric * 100.0, 2) AS accuracy_percent,
    round(avg(
        CASE
            WHEN a.is_correct = true THEN a.time_taken_seconds
            ELSE NULL::integer
        END), 2) AS avg_time_correct_sec,
    round(avg(
        CASE
            WHEN a.is_correct = false THEN a.time_taken_seconds
            ELSE NULL::integer
        END), 2) AS avg_time_wrong_sec,
    sum(a.time_taken_seconds) AS total_practice_time_sec,
    max(a.attempted_at) AS last_practiced_at
   FROM user_aptitude_attempts a
     JOIN aptitude_topics t ON t.id = a.topic_id
  GROUP BY a.user_id, a.topic_id, t.topic_name;

--
-- Constraints (Primary Key, Unique, Check - non-FK)
--
ALTER TABLE ONLY aptitude_categories ADD CONSTRAINT aptitude_categories_category_name_key UNIQUE (category_name);
ALTER TABLE ONLY aptitude_categories ADD CONSTRAINT aptitude_categories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY aptitude_categories ADD CONSTRAINT aptitude_categories_slug_key UNIQUE (slug);
ALTER TABLE ONLY aptitude_questions ADD CONSTRAINT aptitude_questions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY aptitude_questions ADD CONSTRAINT unique_topic_question_number UNIQUE (topic_id, question_number);
ALTER TABLE ONLY aptitude_topics ADD CONSTRAINT aptitude_topics_pkey PRIMARY KEY (id);
ALTER TABLE ONLY aptitude_topics ADD CONSTRAINT aptitude_topics_slug_key UNIQUE (slug);
ALTER TABLE ONLY aptitude_topics ADD CONSTRAINT aptitude_topics_topic_name_key UNIQUE (topic_name);
ALTER TABLE ONLY devpulse_stories ADD CONSTRAINT devpulse_stories_comments_check CHECK ((comments >= 0));
ALTER TABLE ONLY devpulse_stories ADD CONSTRAINT devpulse_stories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY devpulse_stories ADD CONSTRAINT devpulse_stories_score_check CHECK ((score >= 0));
ALTER TABLE ONLY devpulse_stories ADD CONSTRAINT uq_source_story UNIQUE (source, external_story_id);
ALTER TABLE ONLY dsa_progress ADD CONSTRAINT dsa_progress_pkey PRIMARY KEY (id);
ALTER TABLE ONLY dsa_progress ADD CONSTRAINT dsa_progress_user_id_key UNIQUE (user_id);
ALTER TABLE ONLY interview_progress ADD CONSTRAINT interview_progress_mock_interview_score_check CHECK (((mock_interview_score >= 0) AND (mock_interview_score <= 100)));
ALTER TABLE ONLY interview_progress ADD CONSTRAINT interview_progress_pkey PRIMARY KEY (id);
ALTER TABLE ONLY learning_progress ADD CONSTRAINT learning_progress_pkey PRIMARY KEY (id);
ALTER TABLE ONLY leetcode_progress ADD CONSTRAINT leetcode_progress_pkey PRIMARY KEY (id);
ALTER TABLE ONLY leetcode_progress ADD CONSTRAINT unique_user_company_question UNIQUE (user_id, company_slug, question_id);
ALTER TABLE ONLY profiles ADD CONSTRAINT profiles_email_key UNIQUE (email);
ALTER TABLE ONLY profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY recent_searches ADD CONSTRAINT recent_searches_pkey PRIMARY KEY (id);
ALTER TABLE ONLY recommendation_history ADD CONSTRAINT recommendation_history_pkey PRIMARY KEY (id);
ALTER TABLE ONLY resume_analysis ADD CONSTRAINT resume_analysis_ats_score_check CHECK (((ats_score >= 0) AND (ats_score <= 100)));
ALTER TABLE ONLY resume_analysis ADD CONSTRAINT resume_analysis_pkey PRIMARY KEY (id);
ALTER TABLE ONLY resume_scores ADD CONSTRAINT resume_scores_pkey PRIMARY KEY (id);
ALTER TABLE ONLY roadmap_progress ADD CONSTRAINT roadmap_progress_pkey PRIMARY KEY (id);
ALTER TABLE ONLY roadmap_progress ADD CONSTRAINT unique_user_roadmap_node UNIQUE (user_id, roadmap_id, node_id);
ALTER TABLE ONLY saved_playlists ADD CONSTRAINT saved_playlists_pkey PRIMARY KEY (id);
ALTER TABLE ONLY saved_playlists ADD CONSTRAINT unique_user_playlist UNIQUE (playlist_id, user_id);
ALTER TABLE ONLY skills_cache ADD CONSTRAINT skills_cache_pkey PRIMARY KEY (id);
ALTER TABLE ONLY skills_cache ADD CONSTRAINT skills_cache_skill_key_key UNIQUE (skill_key);
ALTER TABLE ONLY success_metrics ADD CONSTRAINT success_metrics_outcome_type_check CHECK (((outcome_type IS NULL) OR (outcome_type = ANY (ARRAY['roadmap_complete'::text, 'project_complete'::text, 'resume_improved'::text, 'interview_call'::text, 'placement_success'::text, 'skill_certified'::text]))));
ALTER TABLE ONLY success_metrics ADD CONSTRAINT success_metrics_pkey PRIMARY KEY (id);
ALTER TABLE ONLY trust_score_engine ADD CONSTRAINT trust_score_engine_metric_key_key UNIQUE (metric_key);
ALTER TABLE ONLY trust_score_engine ADD CONSTRAINT trust_score_engine_pkey PRIMARY KEY (id);
ALTER TABLE ONLY trust_score_engine ADD CONSTRAINT trust_score_engine_resource_url_key UNIQUE (resource_url);
ALTER TABLE ONLY user_academic_profile ADD CONSTRAINT user_academic_profile_pkey PRIMARY KEY (user_id);
ALTER TABLE ONLY user_aptitude_attempts ADD CONSTRAINT unique_user_question_attempt UNIQUE (user_id, question_id);
ALTER TABLE ONLY user_aptitude_attempts ADD CONSTRAINT user_aptitude_attempts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY user_coding_profiles ADD CONSTRAINT user_coding_profiles_pkey PRIMARY KEY (user_id);
ALTER TABLE ONLY user_feedback ADD CONSTRAINT user_feedback_action_check CHECK (((action IS NULL) OR (action = ANY (ARRAY['click'::text, 'save'::text, 'ignore'::text, 'complete'::text, 'roadmap_view'::text]))));
ALTER TABLE ONLY user_feedback ADD CONSTRAINT user_feedback_pkey PRIMARY KEY (id);
ALTER TABLE ONLY user_progress ADD CONSTRAINT user_progress_pkey PRIMARY KEY (user_id);
ALTER TABLE ONLY user_quiz_results ADD CONSTRAINT user_quiz_results_pkey PRIMARY KEY (id);
ALTER TABLE ONLY user_schedule_notes ADD CONSTRAINT user_schedule_notes_pkey PRIMARY KEY (id);
ALTER TABLE ONLY user_todos ADD CONSTRAINT user_todos_pkey PRIMARY KEY (id);
ALTER TABLE ONLY video_progress ADD CONSTRAINT unique_user_playlist_video UNIQUE (user_id, playlist_id, video_id);
ALTER TABLE ONLY video_progress ADD CONSTRAINT video_progress_pkey PRIMARY KEY (id);
ALTER TABLE ONLY welcome_email_events ADD CONSTRAINT welcome_email_events_pkey PRIMARY KEY (id);
ALTER TABLE ONLY welcome_email_events ADD CONSTRAINT welcome_email_events_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'sent'::text, 'failed'::text])));
ALTER TABLE ONLY welcome_email_events ADD CONSTRAINT welcome_email_events_user_id_key UNIQUE (user_id);

--
-- Indexes (81 indexes)
--
CREATE INDEX idx_questions_topic ON public.aptitude_questions USING btree (topic_id);
CREATE INDEX idx_devpulse_domain ON public.devpulse_stories USING btree (domain);
CREATE INDEX idx_devpulse_entity ON public.devpulse_stories USING btree (entity_tag);
CREATE INDEX idx_devpulse_feed ON public.devpulse_stories USING btree (score DESC, published_at DESC) WHERE (is_active = true);
CREATE INDEX idx_devpulse_published ON public.devpulse_stories USING btree (published_at DESC);
CREATE INDEX idx_devpulse_section ON public.devpulse_stories USING btree (section);
CREATE INDEX idx_devpulse_source ON public.devpulse_stories USING btree (source);
CREATE INDEX idx_devpulse_trending_feed ON public.devpulse_stories USING btree (trending_score DESC, published_at DESC) WHERE (is_active = true);
CREATE INDEX idx_dsa_progress_user ON public.dsa_progress USING btree (user_id);
CREATE INDEX idx_interview_progress_user_company ON public.interview_progress USING btree (user_id, target_company);
CREATE INDEX idx_learning_progress_session ON public.learning_progress USING btree (session_id);
CREATE INDEX idx_learning_progress_skill ON public.learning_progress USING btree (skill_name);
CREATE INDEX idx_learning_progress_user ON public.learning_progress USING btree (user_id);
CREATE INDEX idx_leetcode_company ON public.leetcode_progress USING btree (company_slug);
CREATE INDEX idx_leetcode_user ON public.leetcode_progress USING btree (user_id);
CREATE INDEX idx_profiles_email ON public.profiles USING btree (email);
CREATE INDEX idx_recent_searches_user_created ON public.recent_searches USING btree (user_id, created_at DESC);
CREATE INDEX idx_resume_analysis_user_created ON public.resume_analysis USING btree (user_id, created_at DESC);
CREATE INDEX idx_resume_user ON public.resume_scores USING btree (user_id);
CREATE INDEX idx_roadmap_id ON public.roadmap_progress USING btree (roadmap_id);
CREATE INDEX idx_roadmap_user ON public.roadmap_progress USING btree (user_id);
CREATE INDEX idx_saved_playlists_user ON public.saved_playlists USING btree (user_id);
CREATE INDEX idx_skills_cache_key ON public.skills_cache USING btree (skill_key);
CREATE INDEX idx_success_metrics_user ON public.success_metrics USING btree (user_id);
CREATE INDEX idx_trust_score_url ON public.trust_score_engine USING btree (resource_url);
CREATE INDEX idx_attempts_user_topic ON public.user_aptitude_attempts USING btree (user_id, topic_id);
CREATE INDEX idx_user_feedback_action ON public.user_feedback USING btree (action);
CREATE INDEX idx_user_feedback_user ON public.user_feedback USING btree (user_id);
CREATE INDEX idx_quiz_results_user ON public.user_quiz_results USING btree (user_id);
CREATE INDEX idx_user_notes_created_at ON public.user_schedule_notes USING btree (user_id, created_at DESC);
CREATE INDEX idx_user_notes_user_id ON public.user_schedule_notes USING btree (user_id);
CREATE INDEX idx_user_todos_created_at ON public.user_todos USING btree (user_id, created_at DESC);
CREATE INDEX idx_user_todos_user_id ON public.user_todos USING btree (user_id);
CREATE INDEX idx_video_progress_user ON public.video_progress USING btree (user_id);
CREATE INDEX idx_welcome_email_events_status_lease ON public.welcome_email_events USING btree (status, processing_until);
CREATE INDEX idx_welcome_email_events_user_id ON public.welcome_email_events USING btree (user_id);

--
-- Foreign Key Constraints
--
ALTER TABLE ONLY aptitude_questions ADD CONSTRAINT aptitude_questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES aptitude_topics(id) ON DELETE CASCADE;
ALTER TABLE ONLY aptitude_topics ADD CONSTRAINT aptitude_topics_category_id_fkey FOREIGN KEY (category_id) REFERENCES aptitude_categories(id) ON DELETE CASCADE;
ALTER TABLE ONLY dsa_progress ADD CONSTRAINT dsa_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE ONLY interview_progress ADD CONSTRAINT interview_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE ONLY learning_progress ADD CONSTRAINT learning_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE ONLY leetcode_progress ADD CONSTRAINT leetcode_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY recent_searches ADD CONSTRAINT recent_searches_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE ONLY recommendation_history ADD CONSTRAINT recommendation_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE ONLY resume_analysis ADD CONSTRAINT resume_analysis_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE ONLY resume_scores ADD CONSTRAINT resume_scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY roadmap_progress ADD CONSTRAINT roadmap_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY saved_playlists ADD CONSTRAINT saved_playlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY success_metrics ADD CONSTRAINT success_metrics_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE ONLY user_academic_profile ADD CONSTRAINT user_academic_profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY user_aptitude_attempts ADD CONSTRAINT user_aptitude_attempts_question_id_fkey FOREIGN KEY (question_id) REFERENCES aptitude_questions(id) ON DELETE CASCADE;
ALTER TABLE ONLY user_aptitude_attempts ADD CONSTRAINT user_aptitude_attempts_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES aptitude_topics(id) ON DELETE CASCADE;
ALTER TABLE ONLY user_aptitude_attempts ADD CONSTRAINT user_aptitude_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY user_coding_profiles ADD CONSTRAINT user_coding_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY user_feedback ADD CONSTRAINT user_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE ONLY user_progress ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY user_quiz_results ADD CONSTRAINT user_quiz_results_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES aptitude_topics(id) ON DELETE CASCADE;
ALTER TABLE ONLY user_quiz_results ADD CONSTRAINT user_quiz_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY user_schedule_notes ADD CONSTRAINT user_schedule_notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY user_todos ADD CONSTRAINT user_todos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY video_progress ADD CONSTRAINT video_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE ONLY welcome_email_events ADD CONSTRAINT welcome_email_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

--
-- Triggers (17 triggers)
--
-- Name: trg_devpulse_updated_at ON devpulse_stories; Type: TRIGGER; Schema: public
CREATE TRIGGER trg_devpulse_updated_at BEFORE UPDATE ON public.devpulse_stories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Name: trg_dsa_progress_updated ON dsa_progress; Type: TRIGGER; Schema: public
CREATE TRIGGER trg_dsa_progress_updated BEFORE UPDATE ON public.dsa_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Name: trg_interview_progress_updated ON interview_progress; Type: TRIGGER; Schema: public
CREATE TRIGGER trg_interview_progress_updated BEFORE UPDATE ON public.interview_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Name: trg_learning_progress_updated ON learning_progress; Type: TRIGGER; Schema: public
CREATE TRIGGER trg_learning_progress_updated BEFORE UPDATE ON public.learning_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Name: trg_set_updated_at_learning_progress ON learning_progress; Type: TRIGGER; Schema: public
CREATE TRIGGER trg_set_updated_at_learning_progress BEFORE UPDATE ON public.learning_progress FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Name: trg_leetcode_progress_solved ON leetcode_progress; Type: TRIGGER; Schema: public
CREATE TRIGGER trg_leetcode_progress_solved AFTER INSERT OR DELETE OR UPDATE ON public.leetcode_progress FOR EACH ROW EXECUTE FUNCTION trg_sync_leetcode_progress_solved();

-- Name: trg_profiles_updated ON profiles; Type: TRIGGER; Schema: public
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Name: trg_set_updated_at_skills_cache ON skills_cache; Type: TRIGGER; Schema: public
CREATE TRIGGER trg_set_updated_at_skills_cache BEFORE UPDATE ON public.skills_cache FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Name: trg_skills_cache_updated ON skills_cache; Type: TRIGGER; Schema: public
CREATE TRIGGER trg_skills_cache_updated BEFORE UPDATE ON public.skills_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Name: trg_trust_score_updated ON trust_score_engine; Type: TRIGGER; Schema: public
CREATE TRIGGER trg_trust_score_updated BEFORE UPDATE ON public.trust_score_engine FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Name: trg_set_updated_at_user_academic ON user_academic_profile; Type: TRIGGER; Schema: public
CREATE TRIGGER trg_set_updated_at_user_academic BEFORE UPDATE ON public.user_academic_profile FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Name: trg_set_updated_at_user_coding ON user_coding_profiles; Type: TRIGGER; Schema: public
CREATE TRIGGER trg_set_updated_at_user_coding BEFORE UPDATE ON public.user_coding_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Name: trg_set_updated_at_user_progress ON user_progress; Type: TRIGGER; Schema: public
CREATE TRIGGER trg_set_updated_at_user_progress BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Name: trg_set_updated_at_user_notes ON user_schedule_notes; Type: TRIGGER; Schema: public
CREATE TRIGGER trg_set_updated_at_user_notes BEFORE UPDATE ON public.user_schedule_notes FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Name: trg_set_updated_at_user_schedule_notes ON user_schedule_notes; Type: TRIGGER; Schema: public
CREATE TRIGGER trg_set_updated_at_user_schedule_notes BEFORE UPDATE ON public.user_schedule_notes FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Name: trg_set_updated_at_user_todos ON user_todos; Type: TRIGGER; Schema: public
CREATE TRIGGER trg_set_updated_at_user_todos BEFORE UPDATE ON public.user_todos FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Name: trg_set_updated_at_video_progress ON video_progress; Type: TRIGGER; Schema: public
CREATE TRIGGER trg_set_updated_at_video_progress BEFORE UPDATE ON public.video_progress FOR EACH ROW EXECUTE FUNCTION set_updated_at();

--
-- Row Level Security State
--
ALTER TABLE public.aptitude_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aptitude_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aptitude_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devpulse_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsa_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leetcode_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_score_engine ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_academic_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_aptitude_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coding_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_schedule_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.welcome_email_events ENABLE ROW LEVEL SECURITY;

--
-- Policies (53 RLS policies)
--
-- Policy: Public read aptitude categories on aptitude_categories
CREATE POLICY "Public read aptitude categories" ON public.aptitude_categories FOR SELECT TO public USING (true);

-- Policy: Public read aptitude questions on aptitude_questions
CREATE POLICY "Public read aptitude questions" ON public.aptitude_questions FOR SELECT TO public USING (true);

-- Policy: Public read aptitude topics on aptitude_topics
CREATE POLICY "Public read aptitude topics" ON public.aptitude_topics FOR SELECT TO public USING (true);

-- Policy: Public can read DevPulse stories on devpulse_stories
CREATE POLICY "Public can read DevPulse stories" ON public.devpulse_stories FOR SELECT TO public USING (true);

-- Policy: Users own dsa on dsa_progress
CREATE POLICY "Users own dsa" ON public.dsa_progress FOR ALL TO public USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

-- Policy: Users own interviews on interview_progress
CREATE POLICY "Users own interviews" ON public.interview_progress FOR ALL TO public USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

-- Policy: Service role full access on learning_progress on learning_progress
CREATE POLICY "Service role full access on learning_progress" ON public.learning_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy: Strict user ownership on learning_progress on learning_progress
CREATE POLICY "Strict user ownership on learning_progress" ON public.learning_progress FOR ALL TO authenticated USING (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text))) WITH CHECK (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text)));

-- Policy: Service role access on leetcode_progress on leetcode_progress
CREATE POLICY "Service role access on leetcode_progress" ON public.leetcode_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy: Strict user ownership on leetcode_progress on leetcode_progress
CREATE POLICY "Strict user ownership on leetcode_progress" ON public.leetcode_progress FOR ALL TO authenticated USING (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text))) WITH CHECK (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text)));

-- Policy: Users can insert own profile on profiles
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO public WITH CHECK ((auth.uid() = id));

-- Policy: Users can update own profile on profiles
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO public USING ((auth.uid() = id));

-- Policy: Users can view own profile on profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO public USING ((auth.uid() = id));

-- Policy: Users own recent searches on recent_searches
CREATE POLICY "Users own recent searches" ON public.recent_searches FOR ALL TO public USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

-- Policy: Users own rec history on recommendation_history
CREATE POLICY "Users own rec history" ON public.recommendation_history FOR ALL TO public USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

-- Policy: Users own resume on resume_analysis
CREATE POLICY "Users own resume" ON public.resume_analysis FOR ALL TO public USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

-- Policy: Service role access on resume_scores on resume_scores
CREATE POLICY "Service role access on resume_scores" ON public.resume_scores FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy: Strict user ownership on resume_scores on resume_scores
CREATE POLICY "Strict user ownership on resume_scores" ON public.resume_scores FOR ALL TO authenticated USING (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text))) WITH CHECK (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text)));

-- Policy: Service role access on roadmap_progress on roadmap_progress
CREATE POLICY "Service role access on roadmap_progress" ON public.roadmap_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy: Strict user ownership on roadmap_progress on roadmap_progress
CREATE POLICY "Strict user ownership on roadmap_progress" ON public.roadmap_progress FOR ALL TO authenticated USING (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text))) WITH CHECK (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text)));

-- Policy: Service role access on saved_playlists on saved_playlists
CREATE POLICY "Service role access on saved_playlists" ON public.saved_playlists FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy: Strict user ownership on saved_playlists on saved_playlists
CREATE POLICY "Strict user ownership on saved_playlists" ON public.saved_playlists FOR ALL TO authenticated USING (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text))) WITH CHECK (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text)));

-- Policy: Allow read skills_cache on skills_cache
CREATE POLICY "Allow read skills_cache" ON public.skills_cache FOR SELECT TO public USING (true);

-- Policy: Public read skills cache on skills_cache
CREATE POLICY "Public read skills cache" ON public.skills_cache FOR SELECT TO public USING (true);

-- Policy: Users own success metrics on success_metrics
CREATE POLICY "Users own success metrics" ON public.success_metrics FOR ALL TO public USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

-- Policy: Allow read trust_score_engine on trust_score_engine
CREATE POLICY "Allow read trust_score_engine" ON public.trust_score_engine FOR SELECT TO public USING (true);

-- Policy: Public read trust engine on trust_score_engine
CREATE POLICY "Public read trust engine" ON public.trust_score_engine FOR SELECT TO public USING (true);

-- Policy: Service role access on user_academic_profile on user_academic_profile
CREATE POLICY "Service role access on user_academic_profile" ON public.user_academic_profile FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy: Strict user ownership on user_academic_profile on user_academic_profile
CREATE POLICY "Strict user ownership on user_academic_profile" ON public.user_academic_profile FOR ALL TO authenticated USING (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text))) WITH CHECK (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text)));

-- Policy: Users insert own attempts on user_aptitude_attempts
CREATE POLICY "Users insert own attempts" ON public.user_aptitude_attempts FOR INSERT TO authenticated WITH CHECK (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text)));

-- Policy: Users update own attempts on user_aptitude_attempts
CREATE POLICY "Users update own attempts" ON public.user_aptitude_attempts FOR UPDATE TO public USING ((auth.uid() = user_id));

-- Policy: Users view own attempts on user_aptitude_attempts
CREATE POLICY "Users view own attempts" ON public.user_aptitude_attempts FOR SELECT TO authenticated USING (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text)));

-- Policy: Service role access on user_coding_profiles on user_coding_profiles
CREATE POLICY "Service role access on user_coding_profiles" ON public.user_coding_profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy: Strict user ownership on user_coding_profiles on user_coding_profiles
CREATE POLICY "Strict user ownership on user_coding_profiles" ON public.user_coding_profiles FOR ALL TO authenticated USING (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text))) WITH CHECK (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text)));

-- Policy: Authenticated insert on user_feedback on user_feedback
CREATE POLICY "Authenticated insert on user_feedback" ON public.user_feedback FOR INSERT TO authenticated WITH CHECK (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text)));

-- Policy: Service role access on user_feedback on user_feedback
CREATE POLICY "Service role access on user_feedback" ON public.user_feedback FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy: Users own feedback on user_feedback
CREATE POLICY "Users own feedback" ON public.user_feedback FOR ALL TO public USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

-- Policy: Service role access on user_progress on user_progress
CREATE POLICY "Service role access on user_progress" ON public.user_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy: Strict user ownership on user_progress on user_progress
CREATE POLICY "Strict user ownership on user_progress" ON public.user_progress FOR ALL TO authenticated USING (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text))) WITH CHECK (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text)));

-- Policy: Users insert own quiz results on user_quiz_results
CREATE POLICY "Users insert own quiz results" ON public.user_quiz_results FOR INSERT TO authenticated WITH CHECK (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text)));

-- Policy: Users view own quiz results on user_quiz_results
CREATE POLICY "Users view own quiz results" ON public.user_quiz_results FOR SELECT TO authenticated USING (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text)));

-- Policy: Users can delete their own notes on user_schedule_notes
CREATE POLICY "Users can delete their own notes" ON public.user_schedule_notes FOR DELETE TO public USING ((auth.uid() = user_id));

-- Policy: Users can insert their own notes on user_schedule_notes
CREATE POLICY "Users can insert their own notes" ON public.user_schedule_notes FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));

-- Policy: Users can update their own notes on user_schedule_notes
CREATE POLICY "Users can update their own notes" ON public.user_schedule_notes FOR UPDATE TO public USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

-- Policy: Users can view their own notes on user_schedule_notes
CREATE POLICY "Users can view their own notes" ON public.user_schedule_notes FOR SELECT TO public USING ((auth.uid() = user_id));

-- Policy: Users can delete their own todos on user_todos
CREATE POLICY "Users can delete their own todos" ON public.user_todos FOR DELETE TO public USING ((auth.uid() = user_id));

-- Policy: Users can insert their own todos on user_todos
CREATE POLICY "Users can insert their own todos" ON public.user_todos FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));

-- Policy: Users can update their own todos on user_todos
CREATE POLICY "Users can update their own todos" ON public.user_todos FOR UPDATE TO public USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));

-- Policy: Users can view their own todos on user_todos
CREATE POLICY "Users can view their own todos" ON public.user_todos FOR SELECT TO public USING ((auth.uid() = user_id));

-- Policy: Service role access on video_progress on video_progress
CREATE POLICY "Service role access on video_progress" ON public.video_progress FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy: Strict user ownership on video_progress on video_progress
CREATE POLICY "Strict user ownership on video_progress" ON public.video_progress FOR ALL TO authenticated USING (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text))) WITH CHECK (((user_id IS NOT NULL) AND ((auth.uid())::text = (user_id)::text)));

-- Policy: Service role full access on welcome_email_events on welcome_email_events
CREATE POLICY "Service role full access on welcome_email_events" ON public.welcome_email_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy: Users can view their own welcome_email_events on welcome_email_events
CREATE POLICY "Users can view their own welcome_email_events" ON public.welcome_email_events FOR SELECT TO authenticated USING ((auth.uid() = user_id));

--
-- Access Privileges & Grants
--
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.aptitude_categories TO anon;
GRANT ALL ON TABLE public.aptitude_categories TO authenticated, service_role;
GRANT SELECT ON TABLE public.aptitude_questions TO anon;
GRANT ALL ON TABLE public.aptitude_questions TO authenticated, service_role;
GRANT SELECT ON TABLE public.aptitude_topics TO anon;
GRANT ALL ON TABLE public.aptitude_topics TO authenticated, service_role;
GRANT SELECT ON TABLE public.devpulse_stories TO anon;
GRANT ALL ON TABLE public.devpulse_stories TO authenticated, service_role;
GRANT SELECT ON TABLE public.dsa_progress TO anon;
GRANT ALL ON TABLE public.dsa_progress TO authenticated, service_role;
GRANT SELECT ON TABLE public.interview_progress TO anon;
GRANT ALL ON TABLE public.interview_progress TO authenticated, service_role;
GRANT SELECT ON TABLE public.learning_progress TO anon;
GRANT ALL ON TABLE public.learning_progress TO authenticated, service_role;
GRANT SELECT ON TABLE public.leetcode_progress TO anon;
GRANT ALL ON TABLE public.leetcode_progress TO authenticated, service_role;
GRANT SELECT ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated, service_role;
GRANT SELECT ON TABLE public.recent_searches TO anon;
GRANT ALL ON TABLE public.recent_searches TO authenticated, service_role;
GRANT SELECT ON TABLE public.recommendation_history TO anon;
GRANT ALL ON TABLE public.recommendation_history TO authenticated, service_role;
GRANT SELECT ON TABLE public.resume_analysis TO anon;
GRANT ALL ON TABLE public.resume_analysis TO authenticated, service_role;
GRANT SELECT ON TABLE public.resume_scores TO anon;
GRANT ALL ON TABLE public.resume_scores TO authenticated, service_role;
GRANT SELECT ON TABLE public.roadmap_progress TO anon;
GRANT ALL ON TABLE public.roadmap_progress TO authenticated, service_role;
GRANT SELECT ON TABLE public.saved_playlists TO anon;
GRANT ALL ON TABLE public.saved_playlists TO authenticated, service_role;
GRANT SELECT ON TABLE public.skills_cache TO anon;
GRANT ALL ON TABLE public.skills_cache TO authenticated, service_role;
GRANT SELECT ON TABLE public.success_metrics TO anon;
GRANT ALL ON TABLE public.success_metrics TO authenticated, service_role;
GRANT SELECT ON TABLE public.trust_score_engine TO anon;
GRANT ALL ON TABLE public.trust_score_engine TO authenticated, service_role;
GRANT SELECT ON TABLE public.user_academic_profile TO anon;
GRANT ALL ON TABLE public.user_academic_profile TO authenticated, service_role;
GRANT SELECT ON TABLE public.user_aptitude_attempts TO anon;
GRANT ALL ON TABLE public.user_aptitude_attempts TO authenticated, service_role;
GRANT SELECT ON TABLE public.user_coding_profiles TO anon;
GRANT ALL ON TABLE public.user_coding_profiles TO authenticated, service_role;
GRANT SELECT ON TABLE public.user_feedback TO anon;
GRANT ALL ON TABLE public.user_feedback TO authenticated, service_role;
GRANT SELECT ON TABLE public.user_progress TO anon;
GRANT ALL ON TABLE public.user_progress TO authenticated, service_role;
GRANT SELECT ON TABLE public.user_quiz_results TO anon;
GRANT ALL ON TABLE public.user_quiz_results TO authenticated, service_role;
GRANT SELECT ON TABLE public.user_schedule_notes TO anon;
GRANT ALL ON TABLE public.user_schedule_notes TO authenticated, service_role;
GRANT SELECT ON TABLE public.user_todos TO anon;
GRANT ALL ON TABLE public.user_todos TO authenticated, service_role;
GRANT SELECT ON TABLE public.video_progress TO anon;
GRANT ALL ON TABLE public.video_progress TO authenticated, service_role;
GRANT SELECT ON TABLE public.welcome_email_events TO anon;
GRANT ALL ON TABLE public.welcome_email_events TO authenticated, service_role;
GRANT SELECT ON TABLE public.user_aptitude_question_analytics TO anon, authenticated, service_role;

--
-- PostgreSQL database dump complete
--
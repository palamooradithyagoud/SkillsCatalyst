# Comprehensive Production Schema vs Local Migrations Comparison

**Audit Date:** 2026-09-06
**Target Supabase Project:** `zzjxprhapptjoziwdcro` (`https://zzjxprhapptjoziwdcro.supabase.co`)
**Status:** READ-ONLY Verification Complete. No changes made to Production.

---

## Executive Summary
A full audit comparing the live production database (`zzjxprhapptjoziwdcro`) against the local migration files in `supabase/migrations/` was conducted. The local migration files represent a cleaned, consolidated 20-table architecture, whereas live remote production contains **29 tables/views**, an underlying `profiles` table that acts as the foreign-key anchor for user data, and several extended schemas from earlier iterations.

---

## 1. Objects in Production but Missing Locally
The following **9 database objects** exist in live Production but are **NOT** defined in any local `CREATE TABLE` migration file:

| Object Name | Type | Columns | Key Purpose in Production |
| :--- | :---: | :---: | :--- |
| `public.profiles` | Table | 25 | Mirror table for user profiles; foreign-key anchor for 8 production tables. |
| `public.devpulse_stories` | Table | 18 | Tech news & AI stories feed ingested from HackerNews/DevPulse. |
| `public.dsa_progress` | Table | 13 | Data Structures & Algorithms topic-level tracking. |
| `public.interview_progress` | Table | 12 | Mock interview round scores and evaluation records. |
| `public.recent_searches` | Table | 6 | Search history tracking for learning resources and skill queries. |
| `public.recommendation_history` | Table | 9 | Historic recommendations and generated roadmap session states. |
| `public.resume_analysis` | Table | 9 | ATS score records and AI feedback logs for uploaded resumes. |
| `public.success_metrics` | Table | 10 | Telemetry and funnel analytics for user conversions and clicks. |
| `public.user_aptitude_question_analytics` | View | 11 | Aggregated analytics view for aptitude accuracy, attempts, and times. |


---

## 2. Objects in Local Migrations but Missing in Production

- **Count:** **0 tables**
- **Status:** All 20 tables defined in local migrations (`master_production_schema.sql`, `20260904_user_todos_schema.sql`, `20260906_welcome_email_events.sql`) **exist** in live remote production.
- **Verdict:** Remote production is a strict **superset** of local migrations.


---

## 3. Column-Level Differences in Common Tables
Among the 20 tables shared between Production and local migrations, the following column discrepancies exist:

### `public.learning_progress`
- **In Production:** Contains columns `completed` (boolean), `playlist_url` (text), `video_id` (text), `watched_seconds` (integer).
- **In Local Migration:** Defined with generic progress columns (`progress_percentage`, `status`).
- **Impact:** Production supports granular per-video telemetry that local migration models did not reflect.

### `public.saved_playlists`
- **In Production:** Contains `language` (text).
- **In Local Migration:** Column `language` is missing from `master_production_schema.sql`.

### `public.skills_cache`
- **In Production:** Contains 16 columns including full roadmap and certificate fallbacks: `avg_confidence`, `certificates_json`, `fallback_certs`, `fallback_playlists`, `recommendations`, `roadmap`, `skill_key`, `source_type`, `tier`, `total_searches`.
- **In Local Migration:** Defined with only 6 basic cache columns (`id`, `skill_name`, `playlists_json`, `roadmap_json`, `created_at`, `updated_at`).

### `public.trust_score_engine`
- **In Production:** Uses UUID `id` primary key, `channel_name`, `click_count`, `completion_rate`, `confidence_score`, `created_at`, `ignore_count`, `metric_key`, `resource_title`, `resource_url`, `save_count`, `score_data`, `skill_name`, `trust_score`, `updated_at`.
- **In Local Migration:** Defined with text `url` primary key, `clicks`, `saves`, `ignores`, `completions`, `last_updated`.
- **Impact:** Production has a completely different metric schema with confidence scoring and JSONB telemetry.

### `public.user_feedback`
- **In Production:** Contains `feedback_text`, `rating`, `resource_title`, `session_id`, `skill_name` with FK `user_id -> profiles.id`.
- **In Local Migration:** Defined with a single generic `metadata` JSONB column.


---

## 4. Foreign-Key Differences

| Table | Remote Production Foreign Key | Local Migration Foreign Key |
| :--- | :--- | :--- |
| `learning_progress` | `user_id -> public.profiles(id)` | `user_id -> auth.users(id)` |
| `user_feedback` | `user_id -> public.profiles(id)` | `user_id -> auth.users(id)` |
| `dsa_progress` | `user_id -> public.profiles(id)` | *Table not in local migrations* |
| `interview_progress` | `user_id -> public.profiles(id)` | *Table not in local migrations* |
| `recent_searches` | `user_id -> public.profiles(id)` | *Table not in local migrations* |
| `recommendation_history` | `user_id -> public.profiles(id)` | *Table not in local migrations* |
| `resume_analysis` | `user_id -> public.profiles(id)` | *Table not in local migrations* |
| `success_metrics` | `user_id -> public.profiles(id)` | *Table not in local migrations* |

> **Key Architectural Insight:** In Production, a custom `public.profiles` table was historically used as the primary parent table for user data. Local migrations attempted to bypass `profiles` by pointing directly to `auth.users(id)`.


---

## 5. RLS & Policy Differences

1. **Public Reference Content:**
   - In Production, `aptitude_categories`, `aptitude_questions`, `aptitude_topics`, `devpulse_stories`, `skills_cache`, and `trust_score_engine` have active `SELECT` policies allowing `anon` and `authenticated` roles to read without restriction.
2. **User Isolation:**
   - In Production, all 23 user-specific tables enforce strict user row isolation. When queried by `anon` or an unauthenticated user, PostgREST returns `200 OK` with `0 rows` (`[]`).
3. **Guest Session on Learning Progress:**
   - Local file `20260906_fix_anon_permissions_and_rls.sql` hardened the guest policy to prevent `anon` from writing directly to `learning_progress` via PostgREST, delegating guest operations exclusively to the backend service role.


---

## 6. Privilege & Grant Differences

- **Anon Table Grants:**
  - In earlier local drafts, `REVOKE ALL ON public.<table> FROM anon` was executed, causing PostgreSQL error `42501: permission denied for table ...`.
  - In live Production, `GRANT SELECT ON ... TO anon` is currently active across all tables, allowing PostgREST schema inspection and RLS-filtered queries to execute cleanly without 42501 errors.
- **Service Role:**
  - `service_role` has full administrative access (`ALL`) and bypasses RLS in both environments.


---

## 7. Functions & Triggers Differences

- **RPC Functions in Production:**
  - `public.recalculate_user_level(p_user_id uuid)`
  - `public.record_daily_login(p_user_id uuid)`
  - `public.upsert_leetcode_solve(p_user_id text, p_company text, p_question_id integer, p_title text, p_difficulty text)`
  - `public.upsert_user_aptitude_attempt(p_user_id uuid, p_topic_id integer, p_question_id integer, p_selected_option_index integer, p_is_correct boolean, p_time_taken_seconds integer)`
- **Local Equivalents:**
  - Local migration `master_production_schema.sql` and `20260904_profile_zero_init_and_daily_streak.sql` define these same 4 functions.
- **Triggers:**
  - Both environments support the streak calculation, level updates, and welcome email tracking triggers (`tr_welcome_email_events_updated_at`).

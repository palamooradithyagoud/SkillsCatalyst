-- ====================================================================
-- SKILLSCATALYST - AI MENTOR PERSISTENT CONVERSATION MEMORY (PHASE 2)
-- ====================================================================
-- Safe to execute in Supabase SQL Editor.
-- Provisions tables, RLS policies, performance indexes, and triggers
-- for multi-turn AI Mentor conversations and message history.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. MENTOR CONVERSATIONS TABLE ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mentor_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL DEFAULT 'New Mentorship Session',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. MENTOR MESSAGES TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.mentor_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.mentor_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 8000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 3. PERFORMANCE INDEXES ───────────────────────────────────────────
-- Conversations query patterns: list by user descending by updated_at or last_message_at
CREATE INDEX IF NOT EXISTS idx_mentor_conversations_user_updated
    ON public.mentor_conversations(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_mentor_conversations_user_last_msg
    ON public.mentor_conversations(user_id, last_message_at DESC);

-- Messages query patterns: load chronological or recent messages for a conversation
CREATE INDEX IF NOT EXISTS idx_mentor_messages_conv_created_asc
    ON public.mentor_messages(conversation_id, created_at ASC, id ASC);

CREATE INDEX IF NOT EXISTS idx_mentor_messages_conv_created_desc
    ON public.mentor_messages(conversation_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_mentor_messages_user_id
    ON public.mentor_messages(user_id);

-- ── 4. ROW LEVEL SECURITY (RLS) ──────────────────────────────────────
ALTER TABLE public.mentor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;

-- ── 5. RLS POLICIES: MENTOR_CONVERSATIONS ─────────────────────────────
DROP POLICY IF EXISTS "Users can view their own mentor conversations" ON public.mentor_conversations;
CREATE POLICY "Users can view their own mentor conversations"
    ON public.mentor_conversations FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own mentor conversations" ON public.mentor_conversations;
CREATE POLICY "Users can insert their own mentor conversations"
    ON public.mentor_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own mentor conversations" ON public.mentor_conversations;
CREATE POLICY "Users can update their own mentor conversations"
    ON public.mentor_conversations FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own mentor conversations" ON public.mentor_conversations;
CREATE POLICY "Users can delete their own mentor conversations"
    ON public.mentor_conversations FOR DELETE
    USING (auth.uid() = user_id);

-- ── 6. RLS POLICIES: MENTOR_MESSAGES ──────────────────────────────────
DROP POLICY IF EXISTS "Users can view their own mentor messages" ON public.mentor_messages;
CREATE POLICY "Users can view their own mentor messages"
    ON public.mentor_messages FOR SELECT
    USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.mentor_conversations c
            WHERE c.id = mentor_messages.conversation_id AND c.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert their own mentor messages" ON public.mentor_messages;
CREATE POLICY "Users can insert their own mentor messages"
    ON public.mentor_messages FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.mentor_conversations c
            WHERE c.id = mentor_messages.conversation_id AND c.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own mentor messages" ON public.mentor_messages;
CREATE POLICY "Users can update their own mentor messages"
    ON public.mentor_messages FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own mentor messages" ON public.mentor_messages;
CREATE POLICY "Users can delete their own mentor messages"
    ON public.mentor_messages FOR DELETE
    USING (auth.uid() = user_id);

-- ── 7. PERMISSION GRANTS ─────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_conversations TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_messages TO authenticated, service_role;

-- ── 8. UPDATED_AT TRIGGER ────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_set_updated_at_mentor_conversations ON public.mentor_conversations;
CREATE TRIGGER trg_set_updated_at_mentor_conversations
    BEFORE UPDATE ON public.mentor_conversations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

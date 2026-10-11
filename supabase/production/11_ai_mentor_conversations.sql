-- ====================================================================
-- MODULE 11: AI MENTOR CHAT SYSTEM (2 TABLES)
-- ====================================================================

-- 1. MENTOR CONVERSATIONS (Chat Sessions)
CREATE TABLE IF NOT EXISTS public.mentor_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL DEFAULT 'New Mentorship Session',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mentor_conv_user ON public.mentor_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentor_conv_last_msg ON public.mentor_conversations(user_id, last_message_at DESC);

-- 2. MENTOR MESSAGES (Messages within sessions)
CREATE TABLE IF NOT EXISTS public.mentor_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.mentor_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 8000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mentor_msgs_conv ON public.mentor_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_mentor_msgs_user ON public.mentor_messages(user_id);

-- ── TRIGGER ──────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_set_updated_at_mentor_conversations ON public.mentor_conversations;
CREATE TRIGGER trg_set_updated_at_mentor_conversations
    BEFORE UPDATE ON public.mentor_conversations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── ROW LEVEL SECURITY (RLS) ─────────────────────────────────────────
ALTER TABLE public.mentor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_messages ENABLE ROW LEVEL SECURITY;

-- mentor_conversations policies
DROP POLICY IF EXISTS "Users can view their own mentor conversations" ON public.mentor_conversations;
CREATE POLICY "Users can view their own mentor conversations" ON public.mentor_conversations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own mentor conversations" ON public.mentor_conversations;
CREATE POLICY "Users can insert their own mentor conversations" ON public.mentor_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own mentor conversations" ON public.mentor_conversations;
CREATE POLICY "Users can update their own mentor conversations" ON public.mentor_conversations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own mentor conversations" ON public.mentor_conversations;
CREATE POLICY "Users can delete their own mentor conversations" ON public.mentor_conversations FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role access on mentor_conversations" ON public.mentor_conversations;
CREATE POLICY "Service role access on mentor_conversations" ON public.mentor_conversations FOR ALL TO service_role USING (true) WITH CHECK (true);

-- mentor_messages policies
DROP POLICY IF EXISTS "Users can view their own mentor messages" ON public.mentor_messages;
CREATE POLICY "Users can view their own mentor messages" ON public.mentor_messages FOR SELECT 
    USING (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.mentor_conversations c WHERE c.id = mentor_messages.conversation_id AND c.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own mentor messages" ON public.mentor_messages;
CREATE POLICY "Users can insert their own mentor messages" ON public.mentor_messages FOR INSERT 
    WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.mentor_conversations c WHERE c.id = mentor_messages.conversation_id AND c.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their own mentor messages" ON public.mentor_messages;
CREATE POLICY "Users can update their own mentor messages" ON public.mentor_messages FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own mentor messages" ON public.mentor_messages;
CREATE POLICY "Users can delete their own mentor messages" ON public.mentor_messages FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role access on mentor_messages" ON public.mentor_messages;
CREATE POLICY "Service role access on mentor_messages" ON public.mentor_messages FOR ALL TO service_role USING (true) WITH CHECK (true);

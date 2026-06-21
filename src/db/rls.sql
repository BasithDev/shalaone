-- ============================================================================
-- Row-Level Security for ShalaOne
--
-- IMPORTANT: run this in the Supabase SQL Editor. It is NOT optional.
-- The anon key is public (it ships in the browser), so any table WITHOUT RLS
-- is readable/writable by anyone through Supabase's auto REST API.
--
-- The app itself talks to the DB via the direct Postgres connection (DATABASE_URL,
-- the `postgres` role), which OWNS these tables and therefore bypasses RLS — so
-- enabling RLS here does not break the app. RLS only locks down the public API.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ── Enable RLS on EVERY public table ────────────────────────────────────────
ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_chunks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubt_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts   ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_progress  ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards          ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters        ENABLE ROW LEVEL SECURITY;
ALTER TABLE books           ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_chunks     ENABLE ROW LEVEL SECURITY;

-- ── Per-user data: owner can read/write only their own rows ─────────────────
CREATE POLICY "own notes select" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own notes insert" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own notes update" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own notes delete" ON notes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "own doubts select" ON doubt_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own doubts insert" ON doubt_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own doubts update" ON doubt_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own doubts delete" ON doubt_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "own attempts select" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own attempts insert" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own attempts update" ON quiz_attempts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own attempts delete" ON quiz_attempts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "own progress select" ON study_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own progress insert" ON study_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own progress update" ON study_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own progress delete" ON study_progress FOR DELETE USING (auth.uid() = user_id);

-- Profiles: users may read/update only their own profile (role is never writable
-- from the client — promotions happen via the service connection only).
CREATE POLICY "own profile select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile update" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ── Curriculum browse tables: read-only for signed-in users; no client writes ─
-- (Writes happen only through the admin server routes via the service connection.)
CREATE POLICY "curriculum read boards"   ON boards   FOR SELECT TO authenticated USING (true);
CREATE POLICY "curriculum read classes"  ON classes  FOR SELECT TO authenticated USING (true);
CREATE POLICY "curriculum read subjects" ON subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "curriculum read chapters" ON chapters FOR SELECT TO authenticated USING (true);
CREATE POLICY "curriculum read books"    ON books    FOR SELECT TO authenticated USING (true);

-- ── Sensitive content: NO client access at all (RLS enabled, zero policies). ──
-- book_chunks / note_chunks hold raw content + embeddings; quizzes holds the
-- correct answers. These are only ever read via the server's service connection,
-- so the public API must never expose them. (Deny-all by leaving them policy-less.)

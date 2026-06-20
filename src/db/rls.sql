-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubt_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Notes Policies
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Doubt Sessions Policies
CREATE POLICY "Users can view own doubt_sessions" ON doubt_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own doubt_sessions" ON doubt_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own doubt_sessions" ON doubt_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own doubt_sessions" ON doubt_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Quiz Attempts Policies
CREATE POLICY "Users can view own quiz_attempts" ON quiz_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz_attempts" ON quiz_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz_attempts" ON quiz_attempts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quiz_attempts" ON quiz_attempts
  FOR DELETE USING (auth.uid() = user_id);

-- Study Progress Policies
CREATE POLICY "Users can view own study_progress" ON study_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study_progress" ON study_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study_progress" ON study_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own study_progress" ON study_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- HNSW indexes for vector similarity search
CREATE INDEX IF NOT EXISTS book_chunks_embedding_hnsw
ON book_chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS note_chunks_embedding_hnsw
ON note_chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- B-tree indexes on frequently queried foreign keys
CREATE INDEX IF NOT EXISTS idx_book_chunks_book_id ON book_chunks(book_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_chapter_id ON notes(chapter_id);
CREATE INDEX IF NOT EXISTS idx_note_chunks_note_id ON note_chunks(note_id);
CREATE INDEX IF NOT EXISTS idx_doubt_sessions_user_id ON doubt_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_doubt_sessions_chapter_id ON doubt_sessions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_chapter_id ON quizzes(chapter_id);
CREATE INDEX IF NOT EXISTS idx_study_progress_user_id ON study_progress(user_id);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  chat_type VARCHAR(20) NOT NULL CHECK (chat_type IN ('ai', 'teacher')),
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'student', 'admin')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_student_type ON chat_messages(student_id, chat_type);
CREATE INDEX idx_chat_created_at ON chat_messages(created_at);
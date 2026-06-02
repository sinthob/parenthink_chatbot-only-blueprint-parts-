-- Dummy schema for portfolio snapshot
--
-- This schema is intentionally generic and does NOT reflect any production schema.
-- It is provided only to explain the data shape used by the handlers.

CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  line_user_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  current_week INTEGER DEFAULT 1,
  current_day INTEGER DEFAULT 1,
  flags_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE questions (
  id BIGSERIAL PRIMARY KEY,
  week INTEGER NOT NULL,
  day INTEGER NOT NULL,
  question_order INTEGER NOT NULL,
  question_type TEXT NOT NULL,
  question_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_answers (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  question_id BIGINT NOT NULL REFERENCES questions(id),
  answer_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_surveys (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  survey_type TEXT NOT NULL,
  status TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE TABLE message_retry_log (
  id BIGSERIAL PRIMARY KEY,
  line_user_id TEXT NOT NULL,
  payload_json JSONB NOT NULL,
  status TEXT NOT NULL,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

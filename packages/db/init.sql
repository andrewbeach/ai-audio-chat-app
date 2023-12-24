CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  email TEXT NOT NULL
);

CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  has_language_pending BOOLEAN DEFAULT false,
  has_transcription_pending BOOLEAN DEFAULT false,
  language TEXT NULL,
  text TEXT NULL,
  file_bucket TEXT NOT NULL,
  file_key TEXT NOT NULL
);

INSERT INTO users (id, email, created_at)
VALUES
  (
    'c4679872-24fd-481a-be52-50f2a6ab257f'::uuid,
    'example@example.com',
    CURRENT_TIMESTAMP
  );

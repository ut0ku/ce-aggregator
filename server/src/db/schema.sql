CREATE TABLE IF NOT EXISTS cities (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL UNIQUE,
  region TEXT,
  timezone TEXT NOT NULL DEFAULT 'Europe/Moscow',
  kudago_slug TEXT
);

CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  icon TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS sources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rss', 'html', 'api')),
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL,
  parser_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  source_id INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL UNIQUE,
  image_url TEXT,
  published_at TIMESTAMPTZ,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  city_id INTEGER REFERENCES cities(id) ON DELETE SET NULL,
  is_event BOOLEAN NOT NULL DEFAULT FALSE,
  venue TEXT,
  title_key TEXT,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS articles_topic_city_published_idx
  ON articles (topic_id, city_id, published_at DESC);

CREATE INDEX IF NOT EXISTS articles_cached_at_idx
  ON articles (cached_at DESC);

CREATE INDEX IF NOT EXISTS articles_title_key_idx
  ON articles (title_key);

CREATE INDEX IF NOT EXISTS sources_topic_city_idx
  ON sources (topic_id, city_id, is_active);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS article_likes (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (article_id, user_id)
);

CREATE TABLE IF NOT EXISTS article_comments (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS article_likes_article_idx ON article_likes (article_id);
CREATE INDEX IF NOT EXISTS article_comments_article_idx ON article_comments (article_id, created_at);

-- v2: admin and blocking
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT FALSE;

-- v2: search event tracking
CREATE TABLE IF NOT EXISTS search_events (
  id SERIAL PRIMARY KEY,
  city_slug TEXT NOT NULL,
  topic_slug TEXT NOT NULL,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS search_events_time_idx ON search_events (searched_at);
CREATE INDEX IF NOT EXISTS search_events_city_topic_idx ON search_events (city_slug, topic_slug);

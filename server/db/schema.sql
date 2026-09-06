-- GoalBangla Production Database Schema
-- Dialect: PostgreSQL (Supabase compatible)

CREATE TABLE IF NOT EXISTS roles (
  name VARCHAR(50) PRIMARY KEY,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
  name VARCHAR(100) PRIMARY KEY,
  module VARCHAR(50) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL REFERENCES roles(name) ON UPDATE CASCADE,
  avatar TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  last_active TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS authors (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bangla_name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  avatar TEXT,
  bio TEXT,
  twitter_handle VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  bangla_name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tags (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS articles (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
  author_id VARCHAR(64) REFERENCES authors(id) ON DELETE SET NULL,
  featured_image TEXT NOT NULL,
  image_caption TEXT,
  image_credit TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  is_breaking BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_tactical BOOLEAN NOT NULL DEFAULT FALSE,
  view_count INT NOT NULL DEFAULT 0,
  read_time VARCHAR(20) DEFAULT '৪ মিনিট',
  published_at TIMESTAMPTZ,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS article_translations (
  id VARCHAR(64) PRIMARY KEY,
  article_id VARCHAR(64) NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  language VARCHAR(10) NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_article_lang UNIQUE (article_id, language)
);

CREATE TABLE IF NOT EXISTS article_tags (
  article_id VARCHAR(64) NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id VARCHAR(64) NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

CREATE TABLE IF NOT EXISTS article_entities (
  id SERIAL PRIMARY KEY,
  article_id VARCHAR(64) NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  entity_type VARCHAR(20) NOT NULL, -- 'club' | 'player' | 'competition' | 'match'
  entity_id VARCHAR(64) NOT NULL,
  CONSTRAINT uq_article_entity UNIQUE (article_id, entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS media (
  id VARCHAR(64) PRIMARY KEY,
  url TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  caption TEXT,
  alt_text TEXT,
  credit VARCHAR(255),
  category VARCHAR(50) DEFAULT 'general',
  mime_type VARCHAR(100),
  file_size BIGINT,
  dimensions VARCHAR(50),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS galleries (
  id VARCHAR(64) PRIMARY KEY,
  title TEXT NOT NULL,
  bangla_title TEXT NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  cover_image TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_items (
  id VARCHAR(64) PRIMARY KEY,
  gallery_id VARCHAR(64) NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  credit TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS videos (
  id VARCHAR(64) PRIMARY KEY,
  title TEXT NOT NULL,
  bangla_title TEXT NOT NULL,
  url TEXT NOT NULL,
  video_type VARCHAR(20) NOT NULL DEFAULT 'youtube', -- 'youtube' | 'vimeo' | 'external' | 'upload'
  thumbnail TEXT NOT NULL,
  duration VARCHAR(20) NOT NULL,
  category VARCHAR(50) DEFAULT 'match-highlights',
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competitions (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bangla_name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  country VARCHAR(100) NOT NULL,
  logo TEXT NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'league', -- 'league' | 'cup' | 'international'
  priority INT NOT NULL DEFAULT 1,
  current_season VARCHAR(20) NOT NULL DEFAULT '2024-25'
);

CREATE TABLE IF NOT EXISTS clubs (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bangla_name VARCHAR(255) NOT NULL,
  short_name VARCHAR(50) NOT NULL,
  code VARCHAR(10) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo TEXT NOT NULL,
  stadium VARCHAR(255),
  city VARCHAR(100),
  founded INT,
  competition_id VARCHAR(64) REFERENCES competitions(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS players (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bangla_name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  club_id VARCHAR(64) REFERENCES clubs(id) ON DELETE SET NULL,
  nationality VARCHAR(100) NOT NULL,
  position VARCHAR(20) NOT NULL,
  shirt_number INT,
  avatar TEXT NOT NULL,
  market_value VARCHAR(50),
  date_of_birth DATE,
  goals INT DEFAULT 0,
  assists INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS matches (
  id VARCHAR(64) PRIMARY KEY,
  competition_id VARCHAR(64) NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  home_club_id VARCHAR(64) NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  away_club_id VARCHAR(64) NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  home_score INT NOT NULL DEFAULT 0,
  away_score INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming', -- 'upcoming' | 'live' | 'ht' | 'ft' | 'postponed' | 'cancelled'
  minute INT NOT NULL DEFAULT 0,
  date TIMESTAMPTZ NOT NULL,
  stadium VARCHAR(255),
  referee VARCHAR(100),
  data_source VARCHAR(30) NOT NULL DEFAULT 'editorial', -- 'editorial' | 'api-football'
  external_id VARCHAR(100),
  events JSONB NOT NULL DEFAULT '[]'::jsonb,
  lineups JSONB NOT NULL DEFAULT '{"home": [], "away": []}'::jsonb,
  stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS standings (
  id VARCHAR(64) PRIMARY KEY,
  competition_id VARCHAR(64) NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  club_id VARCHAR(64) NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  position INT NOT NULL,
  played INT NOT NULL DEFAULT 0,
  won INT NOT NULL DEFAULT 0,
  drawn INT NOT NULL DEFAULT 0,
  lost INT NOT NULL DEFAULT 0,
  goals_for INT NOT NULL DEFAULT 0,
  goals_against INT NOT NULL DEFAULT 0,
  goal_difference INT NOT NULL DEFAULT 0,
  points INT NOT NULL DEFAULT 0,
  form JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_comp_club_standing UNIQUE (competition_id, club_id)
);

CREATE TABLE IF NOT EXISTS transfers (
  id VARCHAR(64) PRIMARY KEY,
  player_id VARCHAR(64) NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  from_club_id VARCHAR(64) REFERENCES clubs(id) ON DELETE SET NULL,
  to_club_id VARCHAR(64) REFERENCES clubs(id) ON DELETE SET NULL,
  fee VARCHAR(100) NOT NULL,
  fee_amount NUMERIC(14, 2),
  currency VARCHAR(10) DEFAULT 'EUR',
  type VARCHAR(20) NOT NULL DEFAULT 'permanent', -- 'permanent' | 'loan' | 'free'
  status VARCHAR(20) NOT NULL DEFAULT 'rumour', -- 'rumour' | 'interest' | 'negotiation' | 'medical' | 'agreed' | 'completed' | 'rejected' | 'cancelled'
  source VARCHAR(255) NOT NULL,
  confidence INT NOT NULL DEFAULT 70,
  transfer_date DATE NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS injuries (
  id VARCHAR(64) PRIMARY KEY,
  player_id VARCHAR(64) NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  club_id VARCHAR(64) REFERENCES clubs(id) ON DELETE SET NULL,
  type VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'out', -- 'out' | 'doubtful' | 'recovering'
  expected_return VARCHAR(100),
  source VARCHAR(255) NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS breaking_news (
  id VARCHAR(64) PRIMARY KEY,
  headline TEXT NOT NULL,
  bangla_headline TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'high', -- 'urgent' | 'high' | 'normal'
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active' | 'archived'
  category VARCHAR(50) DEFAULT 'breaking',
  url TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS homepage_config (
  id VARCHAR(64) PRIMARY KEY,
  section_id VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(100) NOT NULL,
  bangla_title VARCHAR(100) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  order_index INT NOT NULL,
  limit_count INT NOT NULL DEFAULT 6,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id VARCHAR(64) NOT NULL,
  details TEXT NOT NULL,
  ip_address VARCHAR(45),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for optimal read performance
CREATE INDEX IF NOT EXISTS idx_articles_status_pub ON articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_cat ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_auth ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_art_trans_art_lang ON article_translations(article_id, language);
CREATE INDEX IF NOT EXISTS idx_matches_comp_date ON matches(competition_id, date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_standings_comp_pos ON standings(competition_id, position ASC);
CREATE INDEX IF NOT EXISTS idx_transfers_status ON transfers(status, last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_injuries_club ON injuries(club_id);
CREATE INDEX IF NOT EXISTS idx_breaking_status ON breaking_news(status, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_time ON audit_logs(timestamp DESC);

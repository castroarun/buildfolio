-- ============================================================================
-- NoteApp Database Schema for Supabase (PostgreSQL)
-- ============================================================================
-- This schema should be run in your Supabase SQL editor
-- It creates all necessary tables, RLS policies, and indexes

-- ============================================================================
-- Enable Required Extensions
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- Users Table (Extended from auth.users)
-- ============================================================================
-- Note: Supabase auth.users table is managed automatically
-- We'll use a profiles table for additional user data

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Notes Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content TEXT NOT NULL DEFAULT '',
  plain_text TEXT NOT NULL DEFAULT '', -- For full-text search
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  jira_issue_key TEXT, -- e.g., "PROJ-123"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index on plain_text
CREATE INDEX IF NOT EXISTS notes_plain_text_search_idx ON public.notes
  USING gin(to_tsvector('english', plain_text));

-- Index for user's notes
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes(user_id);

-- Index for deleted notes (for cleanup)
CREATE INDEX IF NOT EXISTS notes_deleted_at_idx ON public.notes(deleted_at)
  WHERE is_deleted = TRUE;

-- ============================================================================
-- Tags Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Index for user's tags
CREATE INDEX IF NOT EXISTS tags_user_id_idx ON public.tags(user_id);

-- ============================================================================
-- Note-Tag Junction Table (Many-to-Many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.note_tags (
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (note_id, tag_id)
);

-- Indexes for junction table
CREATE INDEX IF NOT EXISTS note_tags_note_id_idx ON public.note_tags(note_id);
CREATE INDEX IF NOT EXISTS note_tags_tag_id_idx ON public.note_tags(tag_id);

-- ============================================================================
-- Note Sharing Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.note_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  shared_with_email TEXT NOT NULL,
  shared_with_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission TEXT CHECK (permission IN ('view', 'edit')) NOT NULL DEFAULT 'view',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for finding shares by note
CREATE INDEX IF NOT EXISTS note_shares_note_id_idx ON public.note_shares(note_id);

-- Index for finding shares by user
CREATE INDEX IF NOT EXISTS note_shares_shared_with_id_idx ON public.note_shares(shared_with_id);

-- ============================================================================
-- Jira Configuration Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.jira_configs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  domain TEXT NOT NULL, -- e.g., "yourcompany.atlassian.net"
  email TEXT NOT NULL,
  api_token_encrypted TEXT NOT NULL, -- Encrypted API token
  default_project TEXT,
  default_issue_type TEXT DEFAULT 'Task',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS jira_configs_user_id_idx ON public.jira_configs(user_id);

-- ============================================================================
-- Gmail Configuration Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.gmail_configs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL, -- Encrypted access token
  refresh_token_encrypted TEXT NOT NULL, -- Encrypted refresh token
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS gmail_configs_user_id_idx ON public.gmail_configs(user_id);

-- ============================================================================
-- Email Templates Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user's templates
CREATE INDEX IF NOT EXISTS email_templates_user_id_idx ON public.email_templates(user_id);

-- ============================================================================
-- File Sync Configuration Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sync_configs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  folder_path TEXT NOT NULL,
  last_sync TIMESTAMPTZ,
  sync_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS sync_configs_user_id_idx ON public.sync_configs(user_id);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jira_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmail_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_configs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Notes: Users can CRUD their own notes + view shared notes
CREATE POLICY "Users can view own notes" ON public.notes
  FOR SELECT USING (
    auth.uid() = user_id
    OR id IN (
      SELECT note_id FROM public.note_shares
      WHERE shared_with_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own notes" ON public.notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes or shared notes with edit permission" ON public.notes
  FOR UPDATE USING (
    auth.uid() = user_id
    OR id IN (
      SELECT note_id FROM public.note_shares
      WHERE shared_with_id = auth.uid() AND permission = 'edit'
    )
  );

CREATE POLICY "Users can delete own notes" ON public.notes
  FOR DELETE USING (auth.uid() = user_id);

-- Tags: Users can only manage their own tags
CREATE POLICY "Users can view own tags" ON public.tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tags" ON public.tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" ON public.tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" ON public.tags
  FOR DELETE USING (auth.uid() = user_id);

-- Note Tags: Users can manage tags on their own notes
CREATE POLICY "Users can view note tags for accessible notes" ON public.note_tags
  FOR SELECT USING (
    note_id IN (SELECT id FROM public.notes WHERE auth.uid() = user_id)
    OR note_id IN (
      SELECT note_id FROM public.note_shares WHERE shared_with_id = auth.uid()
    )
  );

CREATE POLICY "Users can add tags to own notes" ON public.note_tags
  FOR INSERT WITH CHECK (
    note_id IN (SELECT id FROM public.notes WHERE auth.uid() = user_id)
  );

CREATE POLICY "Users can remove tags from own notes" ON public.note_tags
  FOR DELETE USING (
    note_id IN (SELECT id FROM public.notes WHERE auth.uid() = user_id)
  );

-- Note Shares: Users can manage shares on their own notes
CREATE POLICY "Users can view shares for own notes" ON public.note_shares
  FOR SELECT USING (auth.uid() = owner_id OR auth.uid() = shared_with_id);

CREATE POLICY "Users can create shares for own notes" ON public.note_shares
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete shares for own notes" ON public.note_shares
  FOR DELETE USING (auth.uid() = owner_id);

-- Jira Configs: Users can only access their own configuration
CREATE POLICY "Users can view own jira config" ON public.jira_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own jira config" ON public.jira_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jira config" ON public.jira_configs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jira config" ON public.jira_configs
  FOR DELETE USING (auth.uid() = user_id);

-- Gmail Configs: Users can only access their own configuration
CREATE POLICY "Users can view own gmail config" ON public.gmail_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own gmail config" ON public.gmail_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gmail config" ON public.gmail_configs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gmail config" ON public.gmail_configs
  FOR DELETE USING (auth.uid() = user_id);

-- Email Templates: Users can only manage their own templates
CREATE POLICY "Users can view own email templates" ON public.email_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own email templates" ON public.email_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own email templates" ON public.email_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own email templates" ON public.email_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Sync Configs: Users can only access their own configuration
CREATE POLICY "Users can view own sync config" ON public.sync_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sync config" ON public.sync_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync config" ON public.sync_configs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sync config" ON public.sync_configs
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- Functions and Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jira_configs_updated_at BEFORE UPDATE ON public.jira_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gmail_configs_updated_at BEFORE UPDATE ON public.gmail_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_configs_updated_at BEFORE UPDATE ON public.sync_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to clean up deleted notes after 30 days
CREATE OR REPLACE FUNCTION public.cleanup_deleted_notes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.notes
  WHERE is_deleted = TRUE
    AND deleted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Grant Permissions
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant sequence permissions
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- Sample Data (Optional - for testing)
-- ============================================================================

-- Uncomment to insert sample email templates after user creation
-- INSERT INTO public.email_templates (user_id, name, subject, body) VALUES
-- ('your-user-id', 'Default Note Share', 'Shared Note: {{noteTitle}}',
--  'Hi,\n\nI wanted to share this note with you:\n\n{{noteContent}}\n\nBest regards');

-- ============================================================================
-- End of Schema
-- ============================================================================

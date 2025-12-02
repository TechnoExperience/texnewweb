-- =============================================
-- ENTERPRISE FEATURES MIGRATION
-- Content Versioning, Audit Logs, API Keys, Rate Limiting
-- =============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CONTENT VERSIONING
-- Tracks all changes to content tables
-- =============================================
CREATE TABLE IF NOT EXISTS content_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN ('news', 'events', 'dj_releases', 'videos')),
  content_id UUID NOT NULL,
  version INT NOT NULL,
  data JSONB NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  comment TEXT,
  
  UNIQUE(content_type, content_id, version)
);

CREATE INDEX IF NOT EXISTS idx_content_versions_lookup 
ON content_versions(content_type, content_id, version DESC);

CREATE INDEX IF NOT EXISTS idx_content_versions_created_at 
ON content_versions(created_at DESC);

-- =============================================
-- AUDIT LOGS
-- Track all important actions in the system
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', etc.
  resource_type TEXT, -- 'news', 'event', 'user', etc.
  resource_id UUID,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- =============================================
-- API KEYS
-- For external integrations and public API access
-- =============================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rate_limit INT DEFAULT 60, -- requests per minute
  allowed_endpoints TEXT[] DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- =============================================
-- RATE LIMITING
-- Track API usage for rate limiting
-- =============================================
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL, -- IP address or API key
  endpoint TEXT NOT NULL,
  request_count INT DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, window_end);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_end);

-- =============================================
-- CACHE INVALIDATIONS
-- Track cache invalidations for distributed systems
-- =============================================
CREATE TABLE IF NOT EXISTS cache_invalidations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cache_key TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cache_invalidations_created_at ON cache_invalidations(created_at DESC);

-- Index removed: idx_cache_invalidations_auto_delete (NOW() is not immutable)

-- =============================================
-- TRIGGERS FOR CONTENT VERSIONING
-- =============================================

-- Function to create content version on update
CREATE OR REPLACE FUNCTION create_content_version()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO content_versions (content_type, content_id, version, data, created_by)
  VALUES (
    TG_TABLE_NAME::text,
    NEW.id,
    (SELECT COALESCE(MAX(version), 0) + 1 
     FROM content_versions 
     WHERE content_type = TG_TABLE_NAME AND content_id = NEW.id),
    row_to_json(NEW.*)::jsonb,
    (SELECT auth.uid())
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply versioning triggers to content tables
DROP TRIGGER IF EXISTS news_versioning ON news;
CREATE TRIGGER news_versioning
AFTER UPDATE ON news
FOR EACH ROW EXECUTE FUNCTION create_content_version();

DROP TRIGGER IF EXISTS events_versioning ON events;
CREATE TRIGGER events_versioning
AFTER UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION create_content_version();

DROP TRIGGER IF EXISTS releases_versioning ON dj_releases;
CREATE TRIGGER releases_versioning
AFTER UPDATE ON dj_releases
FOR EACH ROW EXECUTE FUNCTION create_content_version();

DROP TRIGGER IF EXISTS videos_versioning ON videos;
CREATE TRIGGER videos_versioning
AFTER UPDATE ON videos
FOR EACH ROW EXECUTE FUNCTION create_content_version();

-- =============================================
-- TRIGGERS FOR AUDIT LOGGING
-- =============================================

-- Function to log content changes
CREATE OR REPLACE FUNCTION log_content_change()
RETURNS TRIGGER AS $$
DECLARE
  event_t TEXT;
BEGIN
  -- Determine event type
  IF TG_OP = 'INSERT' THEN
    event_t := 'create';
  ELSIF TG_OP = 'UPDATE' THEN
    event_t := 'update';
  ELSIF TG_OP = 'DELETE' THEN
    event_t := 'delete';
  END IF;

  INSERT INTO audit_logs (
    event_type,
    resource_type,
    resource_id,
    user_id,
    old_values,
    new_values
  ) VALUES (
    event_t,
    TG_TABLE_NAME::text,
    COALESCE(NEW.id, OLD.id),
    (SELECT auth.uid()),
    CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD.*)::jsonb END,
    CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW.*)::jsonb END
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit logging to content tables
DROP TRIGGER IF EXISTS news_audit ON news;
CREATE TRIGGER news_audit
AFTER INSERT OR UPDATE OR DELETE ON news
FOR EACH ROW EXECUTE FUNCTION log_content_change();

DROP TRIGGER IF EXISTS events_audit ON events;
CREATE TRIGGER events_audit
AFTER INSERT OR UPDATE OR DELETE ON events
FOR EACH ROW EXECUTE FUNCTION log_content_change();

DROP TRIGGER IF EXISTS releases_audit ON dj_releases;
CREATE TRIGGER releases_audit
AFTER INSERT OR UPDATE OR DELETE ON dj_releases
FOR EACH ROW EXECUTE FUNCTION log_content_change();

DROP TRIGGER IF EXISTS videos_audit ON videos;
CREATE TRIGGER videos_audit
AFTER INSERT OR UPDATE OR DELETE ON videos
FOR EACH ROW EXECUTE FUNCTION log_content_change();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Content Versions: Admins can view all versions
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content versions are viewable by admins and editors"
ON content_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin', 'editor')
  )
);

-- Audit Logs: Only super admins can view
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs are viewable by super admins only"
ON audit_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- API Keys: Users can only see their own API keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own API keys"
ON api_keys FOR SELECT
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid()
  AND profiles.role IN ('super_admin', 'admin')
));

CREATE POLICY "Users can create their own API keys"
ON api_keys FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own API keys"
ON api_keys FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own API keys"
ON api_keys FOR DELETE
USING (user_id = auth.uid());

-- Rate Limits: No direct access (managed by functions)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Cache Invalidations: Admins only
ALTER TABLE cache_invalidations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cache invalidations are viewable by admins"
ON cache_invalidations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin')
  )
);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to cleanup old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_end < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old audit logs (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old cache invalidations (keep 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_cache_invalidations()
RETURNS void AS $$
BEGIN
  DELETE FROM cache_invalidations WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
BEGIN
  RETURN 'sk_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- SCHEDULED CLEANUP (using pg_cron if available)
-- =============================================
-- Note: This requires pg_cron extension
-- Uncomment if pg_cron is available

-- SELECT cron.schedule(
--   'cleanup-rate-limits',
--   '*/30 * * * *', -- Every 30 minutes
--   $$SELECT cleanup_old_rate_limits();$$
-- );

-- SELECT cron.schedule(
--   'cleanup-audit-logs',
--   '0 2 * * *', -- Daily at 2 AM
--   $$SELECT cleanup_old_audit_logs();$$
-- );

-- SELECT cron.schedule(
--   'cleanup-cache-invalidations',
--   '0 * * * *', -- Every hour
--   $$SELECT cleanup_old_cache_invalidations();$$
-- );

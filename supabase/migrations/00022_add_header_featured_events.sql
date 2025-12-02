-- Add header_featured field to events table
-- Allows marking events to appear in the header carousel

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS header_featured BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_events_header_featured ON events(header_featured) WHERE header_featured = true;

COMMENT ON COLUMN events.header_featured IS 'If true, event appears in the header carousel on events page';


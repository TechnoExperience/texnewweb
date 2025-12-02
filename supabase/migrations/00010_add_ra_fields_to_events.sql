-- Migration: Add Resident Advisor sync fields to events table
-- Adds fields to track RA event IDs and sync status

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS ra_event_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS ra_synced BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ra_sync_date TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_events_ra_event_id ON events(ra_event_id);
CREATE INDEX IF NOT EXISTS idx_events_ra_synced ON events(ra_synced);

-- Add comment
COMMENT ON COLUMN events.ra_event_id IS 'Resident Advisor event ID for syncing';
COMMENT ON COLUMN events.ra_synced IS 'Whether this event was synced from Resident Advisor';
COMMENT ON COLUMN events.ra_sync_date IS 'Last sync date from Resident Advisor';


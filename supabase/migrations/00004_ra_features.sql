-- Migration: Add RA Pro features to events table
-- File: 00004_ra_features.sql

-- Add columns to events table
ALTER TABLE events
  ADD COLUMN ticket_url TEXT,
  ADD COLUMN featured BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN set_times JSONB,
  ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;

-- Optionally, add indexes for featured and view_count
CREATE INDEX IF NOT EXISTS idx_events_featured ON events (featured);
CREATE INDEX IF NOT EXISTS idx_events_view_count ON events (view_count);

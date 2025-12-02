-- Add card customization fields to profiles table
-- Allows DJs to customize their profile card appearance

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS card_color TEXT,
ADD COLUMN IF NOT EXISTS badge_text TEXT DEFAULT 'DJ',
ADD COLUMN IF NOT EXISTS short_description TEXT;

COMMENT ON COLUMN profiles.card_color IS 'Hex color code for profile card background gradient';
COMMENT ON COLUMN profiles.badge_text IS 'Text to display in the profile card badge (e.g., "DJ", "Producer")';
COMMENT ON COLUMN profiles.short_description IS 'Short description displayed on profile card (e.g., "Techno Artist", "Vue.js Expert")';


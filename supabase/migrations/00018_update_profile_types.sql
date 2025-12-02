-- =============================================
-- UPDATE PROFILE TYPES
-- Add 'club' to allowed profile types
-- =============================================

-- 1. Add column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_type') THEN
        ALTER TABLE profiles ADD COLUMN profile_type TEXT;
    END IF;
END $$;

-- 2. Drop existing check constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_profile_type_check;

-- 3. Add new check constraint with 'club' included
ALTER TABLE profiles ADD CONSTRAINT profiles_profile_type_check 
  CHECK (profile_type IN ('dj', 'promoter', 'clubber', 'label', 'agency', 'club'));

-- 4. Comment on column
COMMENT ON COLUMN profiles.profile_type IS 'Type of user profile: dj, promoter, clubber, label, agency, club';

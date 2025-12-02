-- =============================================
-- SEED TEST USERS
-- Creates one user for each profile type
-- Password for all users: 123456
-- =============================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  new_id UUID;
BEGIN
  -- 1. Clubber (clubber@test.com)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'clubber@test.com') THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (
      new_id,
      'clubber@test.com',
      crypt('123456', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    );
    -- Trigger handle_new_user should run, but we update to be sure
    UPDATE public.profiles SET profile_type = 'clubber' WHERE id = new_id;
  END IF;

  -- 2. DJ (dj@test.com)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'dj@test.com') THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (
      new_id,
      'dj@test.com',
      crypt('123456', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    );
    UPDATE public.profiles SET profile_type = 'dj' WHERE id = new_id;
  END IF;

  -- 3. Promoter (promoter@test.com)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'promoter@test.com') THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (
      new_id,
      'promoter@test.com',
      crypt('123456', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    );
    UPDATE public.profiles SET profile_type = 'promoter' WHERE id = new_id;
  END IF;

  -- 4. Label (label@test.com)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'label@test.com') THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (
      new_id,
      'label@test.com',
      crypt('123456', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    );
    UPDATE public.profiles SET profile_type = 'label' WHERE id = new_id;
  END IF;

  -- 5. Club (club@test.com)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'club@test.com') THEN
    new_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
    VALUES (
      new_id,
      'club@test.com',
      crypt('123456', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      'authenticated',
      'authenticated'
    );
    UPDATE public.profiles SET profile_type = 'club' WHERE id = new_id;
  END IF;

END $$;

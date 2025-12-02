-- =============================================
-- USER ROLE PROFILES & VERIFICATION (NON-BREAKING)
-- =============================================
-- Objetivo:
-- - No tocar auth.users
-- - Extender public.profiles con flags de activación/verificación
-- - Crear tablas auxiliares por tipo de perfil (DJ, Promoter, Club, Label, Clubber)
-- - Mantener compatibilidad con el frontend actual (profile_type, role)

-- 1) Campos genéricos en profiles
DO $$
BEGIN
  -- is_active
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
      AND column_name = 'is_active'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
  END IF;

  -- is_verified (flag rápido, además de estados por tabla específica)
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
      AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT false;
  END IF;

  -- verification_status a nivel global (PENDING / APPROVED / REJECTED)
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
      AND column_name = 'verification_status'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN verification_status TEXT
        CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED'))
        DEFAULT 'PENDING';
  END IF;

  -- notas internas de verificación
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
      AND column_name = 'verification_notes'
  ) THEN
    ALTER TABLE profiles
      ADD COLUMN verification_notes TEXT;
  END IF;
END
$$;

COMMENT ON COLUMN profiles.is_active IS 'Indica si el perfil está activo para login/acciones no administrativas';
COMMENT ON COLUMN profiles.is_verified IS 'Flag rápido de verificación global (roles funcionales verificados)';
COMMENT ON COLUMN profiles.verification_status IS 'Estado de verificación global: PENDING, APPROVED, REJECTED';
COMMENT ON COLUMN profiles.verification_notes IS 'Notas internas del equipo editorial/admin sobre la verificación';

-- 2) Tabla auxiliar: DJ profiles
CREATE TABLE IF NOT EXISTS dj_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  instagram_url TEXT NOT NULL,
  soundcloud_url TEXT,
  spotify_url TEXT,
  bandcamp_url TEXT,
  mixcloud_url TEXT,
  presskit_url TEXT,
  evidencias JSONB, -- links a carteles, vídeos, etc.
  verification_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE dj_profiles IS 'Datos específicos para DJs vinculados a profiles(profile_type = dj)';

-- 3) Tabla auxiliar: Promoters
CREATE TABLE IF NOT EXISTS promoters_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  instagram_url TEXT,
  web_url TEXT,
  social_links JSONB, -- otras redes
  short_description TEXT,
  verification_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE promoters_profiles IS 'Datos específicos para promotores vinculados a profiles(profile_type = promoter)';

-- 4) Tabla auxiliar: Clubs
CREATE TABLE IF NOT EXISTS clubs_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  name_of_club TEXT NOT NULL,
  location TEXT,
  description TEXT,
  official_contacts JSONB, -- emails/phones oficiales
  social_links JSONB, -- instagram, facebook, etc
  photos TEXT[], -- URLs o integración con tabla de media futura
  verification_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE clubs_profiles IS 'Datos específicos para clubs vinculados a profiles(profile_type = club)';

-- 5) Tabla auxiliar: Labels
CREATE TABLE IF NOT EXISTS labels_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  label_name TEXT NOT NULL,
  bandcamp_url TEXT,
  beatport_url TEXT,
  spotify_url TEXT,
  soundcloud_url TEXT,
  web_url TEXT,
  has_releases_verified BOOLEAN DEFAULT false,
  verification_status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE labels_profiles IS 'Datos específicos para sellos discográficos vinculados a profiles(profile_type = label)';

-- 6) Tabla auxiliar: Clubbers (perfil básico)
CREATE TABLE IF NOT EXISTS clubbers_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  interests TEXT[], -- géneros, ciudades, etc.
  social_links JSONB,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

COMMENT ON TABLE clubbers_profiles IS 'Datos adicionales para usuarios clubber (asistentes) vinculados a profiles(profile_type = clubber)';

-- 7) Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_dj_profiles_profile_id ON dj_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_promoters_profiles_profile_id ON promoters_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_clubs_profiles_profile_id ON clubs_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_labels_profiles_profile_id ON labels_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_clubbers_profiles_profile_id ON clubbers_profiles(profile_id);

-- 8) RLS (heredando modelo: lectura pública limitada / gestión solo por propietario + admin/editor)
ALTER TABLE dj_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoters_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubbers_profiles ENABLE ROW LEVEL SECURITY;

-- Lectura: todo el mundo puede ver perfiles verificados, propietarios ven su propio perfil aunque esté pendiente
CREATE POLICY "dj_profiles_select" ON dj_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
        AND (
          p.is_verified = true
          OR p.id = auth.uid()
          OR p.role IN ('admin', 'editor')
        )
    )
  );

CREATE POLICY "promoters_profiles_select" ON promoters_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
        AND (
          p.is_verified = true
          OR p.id = auth.uid()
          OR p.role IN ('admin', 'editor')
        )
    )
  );

CREATE POLICY "clubs_profiles_select" ON clubs_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
        AND (
          p.is_verified = true
          OR p.id = auth.uid()
          OR p.role IN ('admin', 'editor')
        )
    )
  );

CREATE POLICY "labels_profiles_select" ON labels_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
        AND (
          p.is_verified = true
          OR p.id = auth.uid()
          OR p.role IN ('admin', 'editor')
        )
    )
  );

CREATE POLICY "clubbers_profiles_select" ON clubbers_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
        AND (
          p.id = auth.uid()
          OR p.role IN ('admin', 'editor')
        )
    )
  );

-- Insert/update: solo el propietario puede crear/editar su perfil específico, admins/editores también
CREATE POLICY "dj_profiles_modify" ON dj_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
        AND (p.id = auth.uid() OR p.role IN ('admin', 'editor'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
        AND (p.id = auth.uid() OR p.role IN ('admin', 'editor'))
    )
  );

CREATE POLICY "promoters_profiles_modify" ON promoters_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
        AND (p.id = auth.uid() OR p.role IN ('admin', 'editor'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
        AND (p.id = auth.uid() OR p.role IN ('admin', 'editor'))
    )
  );

CREATE POLICY "clubs_profiles_modify" ON clubs_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
        AND (p.id = auth.uid() OR p.role IN ('admin', 'editor'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
        AND (p.id = auth.uid() OR p.role IN ('admin', 'editor'))
    )
  );

CREATE POLICY "labels_profiles_modify" ON labels_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
        AND (p.id = auth.uid() OR p.role IN ('admin', 'editor'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
        AND (p.id = auth.uid() OR p.role IN ('admin', 'editor'))
    )
  );

CREATE POLICY "clubbers_profiles_modify" ON clubbers_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
        AND (p.id = auth.uid() OR p.role IN ('admin', 'editor'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = profile_id
        AND (p.id = auth.uid() OR p.role IN ('admin', 'editor'))
    )
  );



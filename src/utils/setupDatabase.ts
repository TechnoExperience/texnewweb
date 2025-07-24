import { supabase } from '../lib/supabase';

export const checkTablesExist = async () => {
  try {
    console.log('🔍 Verificando qué tablas existen...');
    
    const tables = ['events', 'articles', 'artists', 'venues', 'music_tracks', 'user_profiles'];
    const results: Record<string, boolean> = {};
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Tabla ${table}: No existe o error -`, error.message);
          results[table] = false;
        } else {
          console.log(`✅ Tabla ${table}: Existe`);
          results[table] = true;
        }
      } catch (err) {
        console.log(`❌ Tabla ${table}: Error -`, err);
        results[table] = false;
      }
    }
    
    console.log('📊 Resumen de tablas:', results);
    return results;
    
  } catch (error) {
    console.error('❌ Error verificando tablas:', error);
    return false;
  }
};

export const createBasicTables = async () => {
  try {
    console.log('🔧 Creando tablas básicas...');
    
    // Primero verificamos si podemos ejecutar SQL directamente
    // Si no, daremos las instrucciones SQL para ejecutar manualmente
    
    const sqlCommands = [
      // Tabla events
      `CREATE TABLE IF NOT EXISTS public.events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        time TIME,
        location TEXT,
        image_url TEXT,
        price DECIMAL(10,2),
        capacity INTEGER,
        genre TEXT,
        featured BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'published',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );`,
      
      // Tabla articles
      `CREATE TABLE IF NOT EXISTS public.articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        excerpt TEXT,
        image_url TEXT,
        category TEXT,
        tags TEXT[],
        published BOOLEAN DEFAULT false,
        featured BOOLEAN DEFAULT false,
        slug TEXT UNIQUE,
        reading_time INTEGER,
        views_count INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        published_at TIMESTAMP WITH TIME ZONE
      );`,
      
      // Tabla artists
      `CREATE TABLE IF NOT EXISTS public.artists (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        bio TEXT,
        genre TEXT,
        country TEXT,
        city TEXT,
        image TEXT,
        social_links JSONB,
        featured BOOLEAN DEFAULT false,
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );`,
      
      // Tabla venues
      `CREATE TABLE IF NOT EXISTS public.venues (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT,
        city TEXT,
        country TEXT DEFAULT 'España',
        capacity INTEGER,
        description TEXT,
        image TEXT,
        website TEXT,
        phone TEXT,
        email TEXT,
        featured BOOLEAN DEFAULT false,
        venue_type TEXT DEFAULT 'club',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );`,
      
      // Tabla music_tracks
      `CREATE TABLE IF NOT EXISTS public.music_tracks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        artist_id INTEGER REFERENCES public.artists(id),
        album TEXT,
        genre TEXT,
        duration INTEGER,
        file_url TEXT,
        cover_image_url TEXT,
        release_date DATE,
        bpm INTEGER,
        key TEXT,
        description TEXT,
        tags TEXT[],
        is_featured BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        play_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );`,
      
      // Tabla user_profiles
      `CREATE TABLE IF NOT EXISTS public.user_profiles (
        id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
        user_id UUID REFERENCES auth.users,
        username TEXT UNIQUE,
        full_name TEXT,
        email TEXT,
        bio TEXT,
        website TEXT,
        location TEXT,
        avatar_url TEXT,
        role TEXT DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        subscription_status TEXT DEFAULT 'free',
        blocked_until TIMESTAMP WITH TIME ZONE,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );`
    ];
    
    console.log('📋 Scripts SQL necesarios:');
    console.log('==========================================');
    sqlCommands.forEach((sql, index) => {
      console.log(`-- Comando ${index + 1}:`);
      console.log(sql);
      console.log('');
    });
    console.log('==========================================');
    
    console.log('⚠️ Necesitas ejecutar estos comandos SQL manualmente en el panel de Supabase:');
    console.log('1. Ve a tu proyecto en https://supabase.com');
    console.log('2. Navega a SQL Editor');
    console.log('3. Ejecuta cada comando SQL uno por uno');
    console.log('4. Luego regresa aquí y usa "Verificar Base de Datos"');
    
    return {
      success: false,
      message: 'Scripts SQL generados. Necesitas ejecutarlos manualmente en Supabase.',
      commands: sqlCommands
    };
    
  } catch (error) {
    console.error('❌ Error creando tablas:', error);
    return {
      success: false,
      message: 'Error generando scripts SQL',
      error
    };
  }
};

export const setupRowLevelSecurity = () => {
  const rlsPolicies = [
    // RLS para events
    `ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;`,
    `CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);`,
    `CREATE POLICY "Events are manageable by admins" ON public.events FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role IN ('admin', 'editor')
      )
    );`,
    
    // RLS para articles
    `ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;`,
    `CREATE POLICY "Articles are viewable by everyone" ON public.articles FOR SELECT USING (published = true);`,
    `CREATE POLICY "Articles are manageable by admins" ON public.articles FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role IN ('admin', 'editor', 'redactor')
      )
    );`,
    
    // RLS para artists
    `ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;`,
    `CREATE POLICY "Artists are viewable by everyone" ON public.artists FOR SELECT USING (true);`,
    `CREATE POLICY "Artists are manageable by admins" ON public.artists FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role IN ('admin', 'editor')
      )
    );`,
    
    // RLS para otros
    `ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;`,
    `CREATE POLICY "Venues are viewable by everyone" ON public.venues FOR SELECT USING (true);`,
    
    `ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;`,
    `CREATE POLICY "Music tracks are viewable by everyone" ON public.music_tracks FOR SELECT USING (is_active = true);`,
    
    `ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;`,
    `CREATE POLICY "User profiles are viewable by owner" ON public.user_profiles FOR SELECT USING (auth.uid() = id);`,
    `CREATE POLICY "User profiles are manageable by admins" ON public.user_profiles FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
      )
    );`
  ];
  
  console.log('🔒 Políticas RLS recomendadas:');
  console.log('==========================================');
  rlsPolicies.forEach((policy, index) => {
    console.log(`-- Política ${index + 1}:`);
    console.log(policy);
    console.log('');
  });
  console.log('==========================================');
  
  return rlsPolicies;
}; 
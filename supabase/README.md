# Instrucciones para Configurar la Base de Datos en Supabase

## Opción 1: Usando la UI de Supabase (Recomendado)

1. Ve a https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd
2. Click en "SQL Editor" en el menú lateral
3. Click en "New Query"
4. Copia y pega el contenido completo de `supabase/migrations/00001_initial_schema.sql`
5. Click en "Run" para ejecutar el script

## Opción 2: Usando Supabase CLI

```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref cfgfshoobuvycrbhnvkd

# Aplicar migraciones
supabase db push
```

## Verificar que Todo Funcione

Después de ejecutar el script, verifica en Supabase:

1. **Table Editor** - Deberías ver las tablas:
   - `profiles`
   - `news`
   - `events`
   - `dj_releases`
   - `videos`

2. **Authentication > Policies** - Cada tabla debe tener policies RLS configuradas

3. **Database > Indexes** - Deberían existir índices para optimizar queries

## Datos de Prueba

Si quieres agregar datos de prueba, ejecuta esto en el SQL Editor:

```sql
-- Noticia de ejemplo
INSERT INTO news (title, slug, excerpt, content, author, category, language)
VALUES (
  'Bienvenido a Techno Experience',
  'bienvenido-techno-experience',
  'Descubre la mejor música techno underground',
  '<p>Este es el contenido completo del artículo...</p>',
  'Admin',
  'General',
  'es'
);

-- Evento de ejemplo
INSERT INTO events (title, slug, description, event_date, venue, city, country, language)
VALUES (
  'Techno Night 2025',
  'techno-night-2025',
  'Una noche inolvidable de techno underground',
  '2025-12-31 23:00:00+00',
  'Club Underground',
  'Madrid',
  'España',
  'es'
);
```

## Troubleshooting

Si sigues viendo errores 400:
1. Verifica que las tablas se crearon correctamente en Table Editor
2. Verifica que RLS está habilitado para cada tabla
3. Asegúrate que las policies permiten SELECT público
4. Revisa los logs en Dashboard > Logs

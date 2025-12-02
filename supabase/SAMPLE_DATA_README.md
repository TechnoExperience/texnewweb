# 📋 Instrucciones para Cargar Datos de Ejemplo

## 🎯 Scripts SQL a Ejecutar en Supabase

Dirígete a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql/new

### Script 1: Agregar campo event_type (si no lo has hecho)
```sql
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS event_type TEXT CHECK (event_type IN ('dj', 'promoter_festival', 'record_label', 'club'));

CREATE INDEX IF NOT EXISTS events_event_type_idx ON events(event_type);
```

### Script 2: Cargar Datos de Ejemplo
Copia y pega el contenido completo del archivo `supabase/migrations/00003_sample_data.sql`

## 📊 Datos Incluidos

### ✍️ Noticias (5 artículos)
- Amelie Lens en Tomorrowland 2025 (Destacado)
- Drumcode 25 aniversario
- Berghain reapertura
- Time Warp lineup 2025 (Destacado)
- Nuevo EP de Enrico Sangiuliano

### 🎪 Eventos (6 eventos)
- **DJs:** Drumcode Night con Adam Beyer & Amelie Lens
- **Festivales:** Sonar 2025, Awakenings ADE, Monegros Desert
- **Sellos:** Afterlife presenta Tale Of Us
- **Clubs:** Exhale Night at Bassiani

### 💿 Lanzamientos (5 releases)
- Moon Rocks EP - Enrico Sangiuliano
- Rave - Amelie Lens
- Drumcode A-Sides Vol. 10
- Intergalactic - Charlotte de Witte
- Time Warp Compilation 2025

### 🎬 Videos (5 videos)
- Adam Beyer @ Drumcode Festival
- Amelie Lens - Tomorrowland
- Awakenings Festival Aftermovie
- Charlotte de Witte - KNTXT
- Carl Cox - Space Ibiza

## ✅ Después de Ejecutar

1. Refresca la página de tu aplicación
2. Navega por las diferentes secciones:
   - Home (verás noticias y eventos destacados)
   - Eventos (con filtros por categoría)
   - Noticias (con búsqueda y filtros)
   - Releases
   - Videos
3. Todo el diseño moderno se mostrará con contenido real

## 🌐 Imágenes

Todas las imágenes usan Unsplash (gratuitas) relacionadas con:
- Festivales de música
- DJs en vivo
- Producción musical
- Clubs y eventos nocturnos

# 📅 Instrucciones para Crear Eventos de Prueba

## Método 1: Usando SQL (Recomendado)

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **SQL Editor**
3. Copia y pega el contenido del archivo `scripts/create-sample-events.sql`
4. Ejecuta el script
5. Los eventos se crearán automáticamente

## Método 2: Usando el Script TypeScript

Si tienes configurada la variable `SUPABASE_SERVICE_ROLE_KEY` en tu archivo `.env`:

```bash
npm run create-sample-events
```

**Nota:** El script TypeScript requiere la `SUPABASE_SERVICE_ROLE_KEY` para bypassear las políticas RLS. Si no la tienes configurada, usa el Método 1 (SQL).

## Eventos que se crearán:

1. **Techno Underground Madrid** - Fabrik (7 días)
2. **Barcelona Techno Festival** - Poble Espanyol (14 días)
3. **Valencia Techno Night** - La Fábrica de Hielo (10 días)
4. **Bilbao Industrial Techno** - Kafe Antzokia (21 días)
5. **Sevilla Deep Techno** - Sala Custom (18 días)
6. **Málaga Beach Techno** - Playa de la Misericordia (25 días)
7. **Zaragoza Minimal Techno** - Sala Oasis (12 días)
8. **Murcia Techno Underground** - Sala REM (16 días)

Todos los eventos tienen:
- ✅ Fechas futuras (entre 7 y 25 días desde ahora)
- ✅ Lineups completos
- ✅ Imágenes de ejemplo
- ✅ Estado PUBLISHED
- ✅ Algunos marcados como featured


# 📅 Instrucciones para Crear Eventos de Prueba

## Problema
Los eventos no se están mostrando en la página web porque:
1. No hay eventos en la base de datos
2. Los eventos están con status DRAFT y no se muestran
3. Los eventos tienen fechas pasadas

## Solución

### Opción 1: Crear eventos desde el CMS (Recomendado)
1. Ve a: https://techno-experience.vercel.app/admin/events
2. Haz clic en "Nuevo Evento"
3. Completa el formulario con:
   - **Título**: Ej: "Techno Underground Madrid"
   - **Fecha**: Selecciona una fecha futura
   - **Ciudad**: Madrid, Barcelona, etc.
   - **Venue**: Nombre del lugar
   - **Status**: Selecciona "PUBLISHED" (no DRAFT)
   - **Featured**: Marca si quieres que aparezca destacado

### Opción 2: Insertar eventos directamente en Supabase

1. Ve a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql/new
2. Abre el archivo: `scripts/create-sample-events.sql`
3. Copia todo el contenido
4. Pégalo en el SQL Editor de Supabase
5. Haz clic en "Run"

Este script creará 8 eventos de prueba con:
- Fechas futuras (7-25 días desde hoy)
- Status: PUBLISHED
- Diferentes ciudades de España
- Diferentes tipos de eventos (club, promoter_festival)

### Opción 3: Verificar eventos existentes

1. Ve a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql/new
2. Abre el archivo: `scripts/check-events-in-db.sql`
3. Ejecuta las consultas para ver:
   - Todos los eventos
   - Eventos por status
   - Eventos futuros

## Verificar que los eventos se muestren

Después de crear los eventos:
1. Recarga la página de eventos: https://techno-experience.vercel.app/events
2. Deberías ver los eventos listados
3. En el home también deberían aparecer en el carrusel

## Notas importantes

- Los eventos con `status = 'DRAFT'` NO se muestran en el frontend
- Los eventos con fechas pasadas NO se muestran (solo futuros)
- Asegúrate de que `event_date` sea una fecha futura
- El campo `status` debe ser `'PUBLISHED'` para que se muestre


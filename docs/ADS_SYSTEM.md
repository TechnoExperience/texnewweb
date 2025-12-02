# Sistema de Publicidad - Guía de Uso

## Descripción General

El sistema de publicidad permite gestionar banners y anuncios en diferentes posiciones de la plataforma, con tracking automático de impresiones y clicks.

## Posiciones Disponibles

### Desktop
- **header_leaderboard**: Banner superior (970x90 o 728x90)
- **sidebar_top**: Sidebar superior (300x250)
- **sidebar_middle**: Sidebar medio (300x250)
- **sidebar_bottom**: Sidebar inferior (300x600 skyscraper)
- **inline_content**: Entre contenido (nativo)
- **footer_banner**: Banner inferior (728x90)

### Mobile
- **mobile_banner**: Banner móvil (320x50)

## Cómo Usar

### 1. Aplicar Migración

Ejecuta la migración en Supabase SQL Editor:

```sql
-- Ir a: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- Copiar y pegar el contenido de: supabase/migrations/00015_ads_system.sql
```

### 2. Agregar Ads desde Admin

```typescript
// Insertar nuevo ad
const { data, error } = await supabase
  .from('ads')
  .insert({
    title: 'Mi Anuncio',
    image_url: 'https://example.com/banner.jpg',
    link_url: 'https://example.com',
    alt_text: 'Descripción del anuncio',
    position: 'header_leaderboard',
    priority: 10, // Mayor prioridad = se muestra primero
    is_active: true,
    start_date: new Date().toISOString(),
    end_date: null, // null = sin fecha de fin
    advertiser_name: 'Nombre del Anunciante',
    campaign_name: 'Campaña 2025'
  })
```

### 3. Usar Componente AdSpace

```tsx
import { AdSpace } from "@/components/ad-space"

// En cualquier página
<AdSpace position="header_leaderboard" />
<AdSpace position="sidebar_top" />
<AdSpace position="inline_content" />
```

## Tracking

El sistema automáticamente registra:
- **Impresiones**: Cuando el ad se muestra
- **Clicks**: Cuando el usuario hace click

### Ver Estadísticas

```sql
-- Ver ads con estadísticas
SELECT 
  title,
  position,
  impressions,
  clicks,
  CASE 
    WHEN impressions > 0 THEN ROUND((clicks::DECIMAL / impressions) * 100, 2)
    ELSE 0
  END as ctr_percentage
FROM ads
WHERE is_active = true
ORDER BY impressions DESC;

-- Ver logs detallados
SELECT 
  a.title,
  ai.impression_type,
  ai.page_url,
  ai.created_at
FROM ad_impressions ai
JOIN ads a ON a.id = ai.ad_id
ORDER BY ai.created_at DESC
LIMIT 100;
```

## Targeting

### Por Página

```typescript
// Ad solo en homepage
target_pages: ['/']

// Ad en eventos y releases
target_pages: ['/events', '/releases']

// Ad en todas las páginas
target_pages: [] // array vacío
```

### Por País

```typescript
// Solo en España
target_countries: ['Spain']

// España y Portugal
target_countries: ['Spain', 'Portugal']

// Todos los países
target_countries: [] // array vacío
```

## Rotación de Ads

Si hay múltiples ads activos para la misma posición:
1. Se ordenan por **priority** (descendente)
2. Se selecciona uno aleatoriamente entre los de mayor prioridad
3. Se aplican filtros de targeting (páginas, países)

## Tamaños Recomendados

| Posición | Tamaño (px) | Formato |
|----------|-------------|---------|
| header_leaderboard | 970x90 o 728x90 | Horizontal |
| sidebar_top | 300x250 | Cuadrado |
| sidebar_middle | 300x250 | Cuadrado |
| sidebar_bottom | 300x600 | Vertical |
| inline_content | 728x90 o 300x250 | Flexible |
| footer_banner | 728x90 | Horizontal |
| mobile_banner | 320x50 | Horizontal |

## Mejores Prácticas

1. **Optimizar imágenes**: Usar formatos WebP o JPEG optimizados
2. **Alt text**: Siempre incluir texto alternativo descriptivo
3. **Prioridades**: Usar 1-10, donde 10 es máxima prioridad
4. **Fechas**: Configurar end_date para campañas temporales
5. **Testing**: Probar en diferentes dispositivos y resoluciones

## Ejemplo Completo

```typescript
// Crear campaña de festival
await supabase.from('ads').insert({
  title: 'Techno Festival 2025',
  image_url: 'https://cdn.example.com/festival-banner.webp',
  link_url: 'https://technofestival.com/tickets',
  alt_text: 'Techno Festival 2025 - Compra tus entradas',
  position: 'header_leaderboard',
  priority: 10,
  weight: 1,
  is_active: true,
  start_date: '2025-01-01T00:00:00Z',
  end_date: '2025-06-30T23:59:59Z',
  target_pages: ['/', '/events'],
  target_countries: ['Spain', 'Portugal'],
  advertiser_name: 'Techno Festival Ltd',
  campaign_name: 'Summer 2025',
  notes: 'Campaña principal de verano'
})
```

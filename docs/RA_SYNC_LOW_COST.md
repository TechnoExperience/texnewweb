# Sistema Automático de Importación RA - Low Cost

## 🎯 Implementación Completada

Sistema 100% automático y gratuito que importa eventos desde Resident Advisor usando su API GraphQL pública.

---

## ✅ Componentes Implementados

### 1. Base de Datos (Migraciones SQL)

#### `00016_enhanced_ra_sync.sql`
- ✅ Campos de deduplicación (`source`, `source_id`)
- ✅ Tabla `sync_logs` para monitoreo
- ✅ Tabla `rate_limits` para control de llamadas
- ✅ Tabla `sync_config` para gestión de ciudades
- ✅ Funciones helper (`check_rate_limit`, `get_sync_cities`)
- ✅ Vista `sync_statistics` para métricas

#### `00017_setup_cron_job.sql`
- ✅ Cron job automático cada 30 minutos
- ✅ Queries de monitoreo incluidas

### 2. Edge Function

#### `sync-ra-events-v2/index.ts`
- ✅ GraphQL query a RA API
- ✅ Deduplicación automática por `source_id`
- ✅ Rate limiting (50 requests/hora)
- ✅ Manejo de errores robusto
- ✅ Logging completo
- ✅ Delays entre ciudades (2s)
- ✅ Status `draft` para moderación

---

## 🚀 Pasos de Implementación

### 1. Aplicar Migraciones

```bash
# En Supabase Dashboard > SQL Editor
# Ejecutar en orden:
1. 00016_enhanced_ra_sync.sql
2. 00017_setup_cron_job.sql
```

### 2. Desplegar Edge Function

```bash
# Desde tu proyecto
cd supabase/functions

# Deploy
supabase functions deploy sync-ra-events-v2
```

### 3. Configurar Ciudades

```sql
-- Actualizar ciudades objetivo en Supabase
UPDATE sync_config 
SET config_value = '[
  {"city": "madrid", "country": "spain", "area_id": "34"},
  {"city": "barcelona", "country": "spain", "area_id": "7"},
  {"city": "valencia", "country": "spain", "area_id": "169"}
]'::jsonb
WHERE source = 'resident_advisor' 
  AND config_key = 'target_cities';
```

### 4. Probar Manualmente

```sql
-- Trigger manual para testing
SELECT
  net.http_post(
    url := 'https://TU_PROJECT.supabase.co/functions/v1/sync-ra-events-v2',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer TU_ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
```

---

## 📊 Monitoreo

### Ver Estadísticas

```sql
-- Resumen general
SELECT * FROM sync_statistics;

-- Últimos 20 syncs
SELECT 
  created_at,
  status,
  events_fetched,
  events_created,
  events_updated,
  cities_processed,
  execution_time_ms
FROM sync_logs
ORDER BY created_at DESC
LIMIT 20;
```

### Ver Cron Jobs

```sql
-- Jobs programados
SELECT * FROM cron.job;

-- Historial de ejecuciones
SELECT * FROM cron.job_run_details 
WHERE jobname = 'ra-events-sync-v2'
ORDER BY start_time DESC 
LIMIT 10;
```

---

## 🎛️ Gestión de Ciudades

### Añadir Ciudad

```sql
UPDATE sync_config 
SET config_value = config_value || '{"city": "ibiza", "country": "spain", "area_id": "52"}'::jsonb
WHERE source = 'resident_advisor' 
  AND config_key = 'target_cities';
```

### Deshabilitar Sync

```sql
UPDATE sync_config 
SET enabled = false
WHERE source = 'resident_advisor';
```

---

## 🔧 Configuración de Rate Limiting

```sql
-- Ajustar límites
UPDATE rate_limits
SET max_requests = 100,
    window_duration_minutes = 60
WHERE service = 'resident_advisor';
```

---

## 📱 Frontend - Panel de Moderación

### Hook para Eventos Draft

```typescript
// src/hooks/use-draft-events.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useDraftEvents() {
  return useQuery({
    queryKey: ['events', 'draft'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'draft')
        .eq('source', 'resident_advisor')
        .order('event_date', { ascending: true })

      if (error) throw error
      return data
    }
  })
}
```

### Componente de Moderación

```typescript
// src/pages/admin/moderate-events.tsx
import { useDraftEvents } from '@/hooks/use-draft-events'
import { supabase } from '@/lib/supabase'

export function ModerateEventsPage() {
  const { data: draftEvents, refetch } = useDraftEvents()

  async function publishEvent(id: string) {
    await supabase
      .from('events')
      .update({ status: 'published' })
      .eq('id', id)
    
    refetch()
  }

  async function rejectEvent(id: string) {
    await supabase
      .from('events')
      .delete()
      .eq('id', id)
    
    refetch()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Eventos Pendientes de Moderación
      </h1>
      
      <div className="grid gap-4">
        {draftEvents?.map(event => (
          <div key={event.id} className="border p-4 rounded">
            <h3 className="font-bold">{event.title}</h3>
            <p className="text-sm text-gray-600">
              {event.city} • {new Date(event.event_date).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Venue: {event.venue}
            </p>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => publishEvent(event.id)}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                ✓ Publicar
              </button>
              <button
                onClick={() => rejectEvent(event.id)}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                ✗ Rechazar
              </button>
              <a
                href={event.source_url}
                target="_blank"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Ver en RA →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 💰 Costos

| Componente | Costo |
|------------|-------|
| Supabase Free Tier | $0 |
| RA GraphQL API | $0 |
| **Total** | **$0/mes** |

### Límites Free Tier
- ✅ 500MB base de datos
- ✅ 2GB ancho de banda
- ✅ 50,000 usuarios activos
- ✅ Edge Functions ilimitadas

---

## ⚠️ Consideraciones

### Rate Limiting
- **Límite actual**: 50 requests/hora
- **Delay entre ciudades**: 2 segundos
- **Recomendación**: Máximo 6 ciudades por sync

### Moderación
- Todos los eventos importados tienen `status = 'draft'`
- Requiere aprobación manual antes de publicarse
- Previene contenido no deseado

### Deduplicación
- Usa `source + source_id` como clave única
- Actualiza eventos existentes en lugar de duplicar
- Mantiene `last_synced_at` actualizado

---

## 🔄 Flujo Completo

```
1. Cron Job (cada 30 min)
   ↓
2. Edge Function se ejecuta
   ↓
3. Verifica rate limit
   ↓
4. Lee ciudades de config
   ↓
5. Para cada ciudad:
   - Llama a RA GraphQL API
   - Delay 2s
   ↓
6. Procesa eventos:
   - Verifica duplicados
   - Crea/actualiza en BD
   - Status = draft
   ↓
7. Guarda log de ejecución
   ↓
8. Admin modera eventos
   ↓
9. Eventos publicados aparecen en web
```

---

## 📈 Próximas Mejoras

- [ ] Auto-publicación de eventos de venues verificados
- [ ] Enriquecimiento de datos (precios, géneros)
- [ ] Notificaciones de nuevos eventos
- [ ] Integración con más fuentes (Dice, Songkick)
- [ ] Machine learning para categorización automática

---

## 🐛 Troubleshooting

### El cron no se ejecuta
```sql
-- Verificar que pg_cron está habilitado
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Ver errores en logs
SELECT * FROM cron.job_run_details 
WHERE status = 'failed'
ORDER BY start_time DESC;
```

### Rate limit excedido
```sql
-- Reset manual
DELETE FROM rate_limits 
WHERE service = 'resident_advisor';
```

### Eventos duplicados
```sql
-- Limpiar duplicados (mantener el más reciente)
DELETE FROM events a
USING events b
WHERE a.source_id = b.source_id
  AND a.source = b.source
  AND a.created_at < b.created_at;
```

---

## ✅ Checklist de Verificación

- [ ] Migraciones aplicadas sin errores
- [ ] Edge function desplegada
- [ ] Cron job programado y activo
- [ ] Ciudades configuradas en `sync_config`
- [ ] Sync manual ejecutado con éxito
- [ ] Eventos aparecen en tabla con status `draft`
- [ ] Panel de moderación funcional
- [ ] Eventos publicados visibles en frontend
- [ ] Logs de sync registrándose correctamente
- [ ] Rate limiting funcionando

---

**Sistema listo para producción! 🚀**

# ✅ Checklist de Despliegue - Resident Advisor Integration

## 🎯 Pasos para Activar la Integración

### ✅ Paso 1: Verificar Configuración Actual

Ejecuta el script de verificación:

```bash
npm run verify:ra
```

Este script te dirá qué está configurado y qué falta.

---

### ✅ Paso 2: Ejecutar Migraciones de Base de Datos

#### 2.1. Migración 00010 - Campos RA (si no está aplicada)

1. Ve a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql/new
2. Abre el archivo: `supabase/migrations/00010_add_ra_fields_to_events.sql`
3. Copia y pega el contenido
4. Ejecuta la migración

**Verificar que se aplicó:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'events' AND column_name LIKE 'ra_%';
```

Deberías ver: `ra_event_id`, `ra_synced`, `ra_sync_date`

#### 2.2. Migración 00012 - Cron Job

1. Ve a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql/new
2. Abre el archivo: `supabase/migrations/00012_create_ra_sync_cron.sql`
3. Copia y pega el contenido completo
4. Ejecuta la migración

**Verificar que se creó el cron job:**
```sql
SELECT jobid, jobname, schedule FROM cron.job WHERE jobname = 'sync-ra-events';
```

#### 2.3. Migración 00013 - Tabla de Anuncios (Opcional)

Si quieres usar el sistema de publicidad:

1. Ve a: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/sql/new
2. Abre el archivo: `supabase/migrations/00013_create_ads_table.sql`
3. Copia y pega el contenido
4. Ejecuta la migración

---

### ✅ Paso 3: Desplegar Edge Function

#### Opción A: Desde Dashboard (Recomendado)

1. **Ve a Functions:**
   https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd/functions

2. **Crea nueva función:**
   - Haz clic en "Create a new function"
   - Nombre: `sync-ra-events`
   - Runtime: Deno (por defecto)

3. **Copia el código:**
   - Abre: `supabase/functions/sync-ra-events/index.ts`
   - Copia TODO el contenido
   - Pégalo en el editor de la función

4. **Configura Secrets:**
   - Ve a: Settings > Edge Functions > Secrets
   - Añade estos secrets:
     ```
     SUPABASE_URL = https://cfgfshoobuvycrbhnvkd.supabase.co
     SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZ2ZzaG9vYnV2eWNyYmhudmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzkwOTY2MSwiZXhwIjoyMDc5NDg1NjYxfQ.MS-DvFjCox0v-FCFN0GiiCdus5t-jlf8P3ESdfnJXPc
     ```

5. **Despliega:**
   - Haz clic en "Deploy"
   - Espera a que termine el despliegue

#### Opción B: Desde CLI (si tienes acceso)

```bash
supabase functions deploy sync-ra-events --project-ref cfgfshoobuvycrbhnvkd
```

---

### ✅ Paso 4: Probar la Sincronización

#### 4.1. Probar Edge Function Manualmente

```bash
npm run trigger:ra
```

Deberías ver una respuesta JSON con estadísticas de sincronización.

#### 4.2. Verificar Eventos en la Base de Datos

```sql
-- Ver eventos sincronizados
SELECT 
  title, 
  city, 
  country, 
  ra_sync_date,
  ra_event_id
FROM events 
WHERE ra_synced = true 
ORDER BY ra_sync_date DESC 
LIMIT 10;
```

#### 4.3. Verificar que los Eventos Aparecen en el Frontend

1. Ve a tu sitio web
2. Navega a la página de eventos
3. Deberías ver eventos sincronizados desde RA

---

### ✅ Paso 5: Verificar Cron Job

#### 5.1. Verificar que el Cron Job está Activo

```sql
SELECT 
  jobid,
  jobname,
  schedule,
  active
FROM cron.job 
WHERE jobname = 'sync-ra-events';
```

#### 5.2. Ver Historial de Ejecuciones

```sql
SELECT 
  runid,
  status,
  start_time,
  end_time,
  return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'sync-ra-events')
ORDER BY start_time DESC
LIMIT 5;
```

#### 5.3. Ejecutar Manualmente (Opcional)

```sql
SELECT cron.run('sync-ra-events');
```

---

## 🎉 ¡Listo!

Una vez completados estos pasos:

- ✅ Los eventos se sincronizarán automáticamente cada 6 horas
- ✅ Los eventos aparecerán en tu sitio web
- ✅ Puedes ejecutar sincronizaciones manuales cuando quieras
- ✅ Todo está monitoreado y documentado

---

## 🐛 Troubleshooting

### La Edge Function no responde

1. Verifica que esté desplegada en el Dashboard
2. Verifica que los Secrets estén configurados
3. Revisa los logs en: Functions > sync-ra-events > Logs

### El Cron Job no se ejecuta

1. Verifica que el cron job exista:
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'sync-ra-events';
   ```

2. Verifica los logs de ejecución:
   ```sql
   SELECT * FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'sync-ra-events')
   ORDER BY start_time DESC LIMIT 1;
   ```

### No se sincronizan eventos

1. Ejecuta el sync manualmente: `npm run trigger:ra`
2. Revisa los errores en la respuesta
3. Verifica la conexión a la API de RA

---

## 📞 Soporte

Si tienes problemas, revisa:
- `docs/RA_INTEGRATION_COMPLETE.md` - Documentación completa
- Logs de la Edge Function en el Dashboard
- Logs del cron job en la base de datos


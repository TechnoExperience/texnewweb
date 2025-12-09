# 🔧 Verificar Edge Function para RA Sync

## Pasos para verificar y configurar

### 1. Verificar que la función existe

Desde Supabase Dashboard:
1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **Edge Functions** (en el menú lateral)
4. Busca `sync-ra-events-stealth`
5. Verifica que esté desplegada

### 2. Configurar Variables de Entorno

1. En Supabase Dashboard → **Edge Functions**
2. Click en `sync-ra-events-stealth`
3. Ve a la pestaña **Settings** o **Environment Variables**
4. Agrega estas variables:

```
SUPABASE_URL=https://[tu-proyecto-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[tu-service-role-key]
```

**⚠️ IMPORTANTE**: La Service Role Key es diferente de la Anon Key. Encuéntrala en:
- Supabase Dashboard → Settings → API → `service_role` `secret`

### 3. Desplegar la función (si no está desplegada)

Desde tu terminal local:

```bash
# Asegúrate de estar en el directorio del proyecto
cd "C:\Users\Edu\OneDrive\Desktop\web tex"

# Login en Supabase (si no lo has hecho)
supabase login

# Link tu proyecto
supabase link --project-ref [tu-project-ref]

# Desplegar la función
supabase functions deploy sync-ra-events-stealth
```

### 4. Probar la función

#### Opción A: Desde el Dashboard
1. Supabase Dashboard → Edge Functions → `sync-ra-events-stealth`
2. Click en **Invoke**
3. Revisa los logs para ver si funciona

#### Opción B: Desde la aplicación
1. Inicia sesión en tu aplicación como admin
2. Ve a `/admin/events`
3. Click en "Sincronizar con RA"
4. Revisa el toast para ver el resultado

### 5. Verificar logs

Si hay errores:
1. Ve a Supabase Dashboard → Edge Functions → `sync-ra-events-stealth`
2. Click en **Logs**
3. Revisa los errores recientes
4. Los errores comunes:
   - `SUPABASE_SERVICE_ROLE_KEY no configurado` → Agrega la variable
   - `SUPABASE_URL no configurado` → Agrega la variable
   - `Timeout` → Normal, RA puede bloquear peticiones

## Troubleshooting

### Error: Function not found
- **Solución**: Despliega la función con `supabase functions deploy`

### Error: 401 Unauthorized
- **Solución**: Asegúrate de estar logueado como admin en la app

### Error: 500 Internal Server Error
- **Solución**: Verifica que las variables de entorno estén configuradas

### Error: Timeout
- **Solución**: Es normal, RA tiene rate limiting. La función tiene delays incorporados.

## Verificación exitosa

Si todo está bien, deberías ver:
- ✅ Función desplegada en Supabase Dashboard
- ✅ Variables de entorno configuradas
- ✅ Botón "Sincronizar con RA" funciona
- ✅ Toast con mensaje de éxito (aunque puede que no encuentre eventos si RA bloquea)


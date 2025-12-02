# 🔧 Solución de Problemas con las APIs

## Problemas Comunes y Soluciones

### 1. ❌ Variables de Entorno Faltantes

**Síntoma:**
- Error: "Missing Supabase environment variables"
- No se cargan datos en ninguna página
- Console muestra errores de conexión

**Solución:**
1. Crea un archivo `.env` en la raíz del proyecto
2. Agrega las siguientes variables:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
VITE_SITE_URL=http://localhost:5173
```

3. Reinicia el servidor de desarrollo (`npm run dev`)

**Dónde encontrar las credenciales:**
- Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
- Settings → API
- Copia `Project URL` y `anon public` key

---

### 2. 🔒 Errores de RLS (Row Level Security)

**Síntoma:**
- Error: "permission denied" o "row-level security"
- Código de error: `42501`
- Los datos no se cargan aunque las variables de entorno estén correctas

**Solución:**
1. Ve a Supabase Dashboard → Authentication → Policies
2. Verifica que las tablas tengan políticas de SELECT públicas:
   - `news`: Debe tener política "News are viewable by everyone"
   - `events`: Debe tener política "Events are viewable by everyone"
   - `dj_releases`: Debe tener política "Releases are viewable by everyone"
   - `videos`: Debe tener política "Videos are viewable by everyone"

3. Si faltan políticas, ejecuta las migraciones:
   ```sql
   -- Ejemplo para news
   CREATE POLICY "News are viewable by everyone" 
     ON news FOR SELECT 
     USING (true);
   ```

---

### 3. 📋 Tabla No Encontrada

**Síntoma:**
- Error: "relation does not exist" o código `42P01`
- La tabla no existe en la base de datos

**Solución:**
1. Verifica que las migraciones se hayan ejecutado:
   - Ve a Supabase Dashboard → SQL Editor
   - Ejecuta las migraciones en orden desde `supabase/migrations/`

2. Verifica los nombres de las tablas:
   - Las tablas deben llamarse: `news`, `events`, `dj_releases`, `videos`
   - NO: `noticias`, `eventos`, `lanzamientos` (esos son nombres antiguos)

---

### 4. 🌐 Errores de Red/Proxy

**Síntoma:**
- Error: "Failed to fetch" o "ERR_PROXY_CONNECTION_FAILED"
- Timeout en las peticiones
- Datos se cargan intermitentemente

**Solución:**
1. Verifica tu conexión a internet
2. Si estás detrás de un proxy corporativo, configura las variables:
   ```env
   HTTPS_PROXY=tu_proxy
   HTTP_PROXY=tu_proxy
   ```

3. El sistema usa cache automático, así que si hay un error de red temporal, usará datos cacheados

---

### 5. 🔍 Diagnóstico Rápido

Abre la consola del navegador (F12) y busca estos mensajes:

**✅ Todo está bien:**
```
[HeroHeader] 📊 Status: { loadingFeatured: false, featuredCount: 15, ... }
[useSupabaseQuery] ✅ Connection successful!
```

**❌ Problemas detectados:**
```
[HeroHeader] ⚠️ Missing Supabase environment variables!
[useSupabaseQuery] 🔒 RLS Policy Error for table news
[useSupabaseQuery] 📋 Table Error for news: relation does not exist
[useSupabaseQuery] 🌐 Network error fetching from news
```

---

### 6. 🛠️ Verificación Manual

Ejecuta este código en la consola del navegador para diagnosticar:

```javascript
// Verificar variables de entorno
console.log('URL:', import.meta.env.VITE_SUPABASE_URL ? '✅' : '❌')
console.log('KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅' : '❌')

// Probar conexión
import { supabase } from './src/lib/supabase'
const { data, error } = await supabase.from('news').select('id').limit(1)
console.log('Connection:', error ? '❌ ' + error.message : '✅ OK')
```

---

### 7. 📞 Soporte Adicional

Si el problema persiste:

1. **Revisa los logs completos** en la consola del navegador
2. **Verifica el estado de Supabase** en el dashboard
3. **Comprueba las políticas RLS** en Authentication → Policies
4. **Revisa las migraciones** en SQL Editor → Migrations

---

## Checklist de Verificación

- [ ] Archivo `.env` existe y tiene las variables correctas
- [ ] Variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están configuradas
- [ ] Las tablas existen en Supabase (news, events, dj_releases, videos)
- [ ] Las políticas RLS permiten SELECT público
- [ ] El servidor de desarrollo se reinició después de crear `.env`
- [ ] No hay errores de red/proxy en la consola
- [ ] Las migraciones se ejecutaron correctamente

---

## Comandos Útiles

```bash
# Verificar variables de entorno (PowerShell)
Get-Content .env | Select-String "VITE_SUPABASE"

# Reiniciar servidor de desarrollo
npm run dev

# Limpiar cache y reinstalar
rm -rf node_modules .vite
npm install
npm run dev
```


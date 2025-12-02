# Instrucciones: Migración de Datos para Barra de Navegación Tech Scene

## Objetivo
Esta migración inserta datos de ejemplo de clubs, festivales y labels en las tablas de Supabase para que la barra de navegación muestre datos reales desde la base de datos.

## Pasos para Ejecutar

### 1. Ejecutar la Migración SQL

1. Abre el **Supabase Dashboard**: https://supabase.com/dashboard/project/cfgfshoobuvycrbhnvkd
2. Ve a **SQL Editor** en el menú lateral
3. Haz clic en **New Query**
4. Copia y pega el contenido completo del archivo:
   ```
   supabase/migrations/00032_tech_scene_nav_data.sql
   ```
5. Haz clic en **Run** (o presiona `Ctrl+Enter`)

### 2. Verificar los Datos

Después de ejecutar la migración, verifica que los datos se insertaron correctamente:

#### Verificar Clubs:
```sql
SELECT name, profile_type, is_verified, city 
FROM profiles 
WHERE profile_type = 'club' 
AND is_verified = true;
```

#### Verificar Labels:
```sql
SELECT name, profile_type, is_verified, city 
FROM profiles 
WHERE profile_type = 'label' 
AND is_verified = true;
```

#### Verificar Festivales:
```sql
SELECT title, event_type, featured, city 
FROM events 
WHERE event_type = 'promoter_festival' 
AND featured = true;
```

## Qué Hace la Migración

1. **Actualiza el constraint de `profile_type`**: Añade 'club' como tipo de perfil válido
2. **Inserta Clubs**: Crea 12 perfiles de clubs techno españoles verificados
3. **Inserta Labels**: Crea 6 perfiles de sellos discográficos verificados
4. **Inserta Festivales**: Crea 7 eventos de tipo festival destacados
5. **Crea Índices**: Mejora el rendimiento de las consultas

## Datos Insertados

### Clubs (12):
- METRO DANCE CLUB (Madrid)
- Fabrik (Madrid)
- Kapital (Madrid)
- Opium (Barcelona)
- Pacha (Barcelona)
- Space (Barcelona)
- Input (Barcelona)
- Razzmatazz (Barcelona)
- Sala Apolo (Barcelona)
- Moog (Barcelona)
- Luz de Gas (Barcelona)
- Bassiani (Barcelona)

### Labels (6):
- POLE GROUP (Madrid)
- Industrial Copera (Madrid)
- Warm Up Recordings (Barcelona)
- Semantica (Barcelona)
- Informa Records (Valencia)
- Analogue Attic (Barcelona)

### Festivales (7):
- A Summer Story
- Monegros Desert Festival
- Sónar
- Awakenings
- Time Warp
- DGTL
- Brunch in the Park

## Notas Importantes

- La migración usa `ON CONFLICT DO NOTHING` para evitar duplicados
- Todos los perfiles se crean con `is_verified = true` y `verification_status = 'APPROVED'`
- Los festivales se crean con `featured = true` y `status = 'PUBLISHED'`
- Si algún dato ya existe, la migración no lo duplicará

## Solución de Problemas

### Error: "constraint already exists"
- Esto es normal si el constraint ya existe. La migración maneja esto automáticamente.

### No se muestran datos en la barra de navegación
1. Verifica que la migración se ejecutó correctamente
2. Verifica que los perfiles tienen `is_verified = true` y `is_active = true`
3. Verifica que los eventos tienen `featured = true` y `event_type = 'promoter_festival'`
4. Revisa la consola del navegador para errores de RLS (Row Level Security)

### Error de RLS (Row Level Security)
- Asegúrate de que las políticas RLS permiten lectura pública de perfiles verificados
- Verifica las políticas en: **Authentication > Policies** en el dashboard de Supabase


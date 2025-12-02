# 📰 Artículos Editoriales de Calidad

## 🎯 Contenido

Este script contiene **4 artículos editoriales** escritos con el estilo profesional de Resident Advisor y Vicious Magazine:

1. **ENTREVISTA**: Charlotte de Witte - "El techno es mi forma de conectar con el mundo"
   - Conversación íntima sobre su evolución artística y el futuro del techno
   - Categoría: Entrevistas
   - Destacado: ✅

2. **CRÍTICA**: "Rave" de Amelie Lens - Un retorno a los orígenes del techno belga
   - Análisis profundo del nuevo EP de la DJ belga
   - Categoría: Críticas
   - Destacado: ✅

3. **CRÓNICA**: Una noche en Berghain - El templo del techno que nunca duerme
   - Relato en primera persona desde dentro del club más mítico de Berlín
   - Categoría: Crónicas
   - Destacado: ✅

4. **TENDENCIAS**: El renacimiento del techno industrial
   - Análisis del resurgimiento del techno industrial desde Birmingham hasta el mundo
   - Categoría: Tendencias
   - Destacado: ❌

## 🚀 Cómo Cargar los Artículos

### Opción 1: Usando la UI de Supabase (Recomendado)

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Click en **"SQL Editor"** en el menú lateral
3. Click en **"New Query"**
4. Abre el archivo `supabase/migrations/00006_editorial_articles.sql`
5. Copia y pega **todo el contenido** del archivo
6. Click en **"Run"** para ejecutar el script

### Opción 2: Usando Supabase CLI

```bash
# Si tienes Supabase CLI instalado
supabase db push
```

## ✅ Verificar que se Cargaron Correctamente

Después de ejecutar el script:

1. Ve a **Table Editor** en Supabase
2. Selecciona la tabla **`news`**
3. Deberías ver 4 nuevos artículos con:
   - Títulos largos y descriptivos
   - Contenido extenso y profesional
   - Categorías: Entrevistas, Críticas, Crónicas, Tendencias
   - 3 artículos marcados como destacados

## 🎨 Características de los Artículos

- **Estilo editorial profesional**: Narrativa profunda, contexto histórico y cultural
- **Longitud adecuada**: Cada artículo tiene entre 800-1200 palabras
- **Estructura periodística**: Introducción, desarrollo y conclusión
- **Referencias culturales**: Menciones a la historia del techno, ciudades icónicas, artistas clave
- **Tono crítico pero constructivo**: Análisis honesto con fundamento
- **Formato HTML**: Contenido formateado con etiquetas `<p>` para mejor presentación

## 📱 Ver los Artículos en la Aplicación

Una vez cargados:

1. Refresca tu aplicación local (http://localhost:5173)
2. Ve a la página principal - deberías ver los artículos destacados
3. Navega a la sección de **Noticias** para ver todos los artículos
4. Haz click en cualquier artículo para ver el contenido completo con el diseño editorial

## 🔄 Si Necesitas Modificar los Artículos

Puedes editar los artículos directamente desde:
- **Supabase Table Editor**: Edita directamente en la base de datos
- **CMS de la aplicación**: Si tienes acceso al panel de administración

---

**Nota**: Estos artículos son de ejemplo y siguen el estilo editorial profesional descrito en el brief. Puedes usarlos como plantilla para crear más contenido siguiendo el mismo formato y calidad.


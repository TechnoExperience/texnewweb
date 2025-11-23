# Blueprint editorial y arquitectura de información para Techno Experience Magazine

Este documento traduce la visión de Techno Experience Magazine en una arquitectura de información exhaustiva, un esquema de datos operativo y un modelo de perfiles y permisos diseñado para escalar. La propuesta cubre la organización de secciones, tipos de contenido y sus campos, relaciones entre entidades, taxonomías comunes, flujos de publicación y moderación, y pautas de analítica y medición. El enfoque es editorial, práctico y orientado a la ejecución por producto, contenido y desarrollo.

## 1. Propósito, alcance y metodología

Techno Experience Magazine busca convertirse en el punto de referencia para la escena techno en español: un espacio donde DJs, promotores, sellos, agencias y clubbers encuentren noticias relevantes, agenda de eventos, lanzamientos musicales, y videos que articulan la cultura y el negocio de la electrónica. El alcance de este blueprint abarca las cinco secciones principales —Inicio, Noticias, Eventos, Lanzamientos DJs y Videos—, la definición de tipos de contenido y sus campos de datos, un sistema de perfiles por rol, y una propuesta de taxonomías, metadatos, flujos de trabajo, analítica y localización. El objetivo editorial es equilibrar descubrimiento y profundidad: mostrar lo más relevante de inmediato, pero permitir un filtrado fino y una curación que facilite explorar por ciudad, escena, sello o promoter.

La metodología combina análisis orientado a tareas, modelado por entidades y relaciones (ER), y definición de estados y transiciones de contenido. Partimos de una hipótesis clara: los usuarios llegan para informarse y decidir. Por ello, diseñamos la arquitectura para tres tareas nucleares: descubrir (what’s new), decidir (should I attend/follow/buy) y profundizar (quién, cuándo, dónde, con qué créditos y bajo qué licencias). De forma complementaria, se contemplan las necesidades de los equipos editoriales (revisión, curación, publicidad, partnerships) y de desarrollo (persistencia, validación, versionado, internacionalización).

Existen, no obstante, vacíos de información que condicionan decisiones finas de prioridad e implementación. Entre ellos: objetivos de negocio específicos, mercados geográficos iniciales y alcance de idiomas, políticas de derechos y distribución, lineamientos de marca (tono y manual), y la disponibilidad de integraciones con servicios externos. En la sección 12 se recogen estas lagunas y los supuestos operativos.

## 2. Público objetivo y casos de uso

La propuesta reconoce cinco perfiles de usuario y sus intenciones: DJs (promocionar su música y calendario, construir credibilidad), Promotores (vender entradas y fidelizar comunidad), Clubbers (descubrir eventos y contenidos, decidir asistencia), Sellos (difundir lanzamientos y posicionar artistas) y Agencias (gestionar visibilidad y agenda de artistas). Este diversidad exige que la arquitectura soporte tanto contenido editorial como activo, con permisos granulares y un sistema de curación que privilegie la calidad sobre el volumen.

En el día a día, los casos de uso se manifiestan como microtareas: publicar un lanzamiento y esperar validación; subir un aftermovie y ver métricas; anunciar un evento con preventa y esperar cobertura editorial; seguir un DJ o una ciudad para recibir recomendaciones; filtrar videos por sello o por bpm para explorar sets compatibles con el mood de la noche. La plataforma debe ofrecer formularios claros, estados visibles y feedback de moderación que reduzca la fricción entre creación y publicación.

Para alinear necesidades con valor editorial, el siguiente mapa conecta roles y motivaciones. Antes de la tabla, conviene recordar que la clave no es solo capturar el dato, sino hacerlo útil para la decisión: quién es el promotor, qué entradas están disponibles, qué sello publica, qué agencia representa al artista, en qué ciudades se concentran los eventos, y qué videos muestran mejor la atmósfera de cada noche.

Tabla 1. Mapa de roles x necesidades x tipos de contenido

| Rol       | Necesidades principales                               | Tipos de contenido prioritarios                           | Valor editorial generado                                |
|-----------|--------------------------------------------------------|-----------------------------------------------------------|---------------------------------------------------------|
| DJ        | Publicar música, agenda, credibility                   | Lanzamientos DJs, Videos                                  | Curación, verificación de créditos, descubrimiento      |
| Promotor  | Vender entradas, cubrir eventos, fidelizar             | Eventos, Videos (aftermovie/live), Noticias               | Cobertura, agenda fiable, leads por ciudad              |
| Clubber   | Descubrir qué hacer, decidir asistencia                | Inicio (destacados), Eventos, Videos                      | Recomendaciones, filtros por ciudad/fecha/mood          |
| Sello     | Difundir lanzamientos, posicionar catálogo             | Lanzamientos DJs, Videos (clips), Noticias                | Difusión verificada, enlaces a tiendas/streaming        |
| Agencia   | Gestionar visibilidad y agenda                         | Eventos (calendario de artistas), Lanzamientos, Videos    | Programación consolidada, métricas por ciudad/club      |

La tabla anterior orienta el diseño de campos y validaciones. Por ejemplo, el rol DJ necesita asociar artista, sello y tracks con metadatos técnicos; el promotor requiere datos del evento, venue, ticketing y cobertura; el clubber necesita filtros potentes y recomendaciones basadas en seguimiento y proximidad.

## 3. Arquitectura de información por secciones

La arquitectura se organiza en torno a las cinco secciones definidas. Cada sección integra componentes de descubrimiento, listas, filtros y vistas detalle, y se apoya en taxonomías y entidades transversales (artistas, sellos, agencias, venues y ciudades). A continuación, se describen los objetivos y contenidos por sección, y se propone un diseño de navegación que prioriza la exploración con profundidad.

### 3.1 Sección Inicio

La página de Inicio es la puerta de entrada y el motor de descubrimiento. Debe presentar destacados editoriales, noticias recientes, próximos eventos, lanzamientos destacados y videos sugeridos. El equilibrio entre novedad y evergreen es clave: la narrativa principal cambia a diario, pero los recursos atemporales —por ejemplo, guías por sello o entrevistas— siguen alimentando tráfico y autoridad. La personalización, aun en versión mínima, se apoya en el seguimiento de artistas, sellos, promotores y ciudades, permitiendo ajustar módulos y recomendaciones sin romper la coherencia editorial.

Para asegurar consistencia, el siguiente módulo mapa relaciona áreas con componentes y prioridades editoriales. Su lectura permite identificar la lógica detrás de la disposición y las reglas de curación que gobernarán la Homepage.

Tabla 2. Módulo x Tipo de contenido x Prioridad

| Módulo                  | Tipo de contenido           | Prioridad | Observaciones editoriales                         |
|-------------------------|-----------------------------|----------:|---------------------------------------------------|
| Hero destacado          | Noticias/Lanzamientos       |         5 | Rotación diaria, titular con verificación         |
| Lo más reciente         | Noticias                    |         5 | Carrusel cronológico, moderación prioritaria      |
| Próximos eventos        | Eventos                     |         5 | Filtro por ciudad y fecha, CTA a entradas         |
| Lanzamientos del mes    | Lanzamientos DJs            |         4 | Curación por sello, créditos completos            |
| Videos sugeridos        | Videos                      |         4 | Aftermovies, lives, clips, DJ mixes               |
| Evergreen                | Noticias/Entrevistas        |         3 | Guías, perfiles, reportajes                       |
| Recomendado para ti     | Todos                       |         3 | Basado en follows y actividad reciente            |

La tabla introduce dos principios: primero, la prioridad determina frecuencia de actualización y posición; segundo, el Hero y “Lo más reciente” requieren controles editoriales fuertes para preservar la calidad.

### 3.2 Sección Noticias

La sección de Noticias centraliza artículos, reportajes y entrevistas. El objetivo es cubrir la escena con rigor, equilibrando urgencia y análisis. El ciclo de vida incluye: borrador, en revisión, aprobado, publicado y archivado; los cambios deben registrar versiones con trazabilidad y responsables.

Para orientar la producción y coherencia, la siguiente tabla define campos clave de cada subtipo. Su propósito es asegurar metadatos esenciales para curación, descubrimiento y relación con otras entidades.

Tabla 3. Tipos de noticia x campos obligatorios/opcionales

| Subtipo           | Campos obligatorios                                        | Campos opcionales                                 | Relaciones clave                   |
|-------------------|------------------------------------------------------------|---------------------------------------------------|------------------------------------|
| Noticia           | Título,Slug,Resumen,Cuerpo,Autor,Estado,Fecha publicación | Categoría,Etiquetas,Imágenes                      | Artistas,Sellos,Agencias,Eventos   |
| Reportaje         | Título,Slug,Resumen,Cuerpo,Autor,Estado,Fecha publicación | Galería,Imágenes,Infografías                      | Escena,Venues                      |
| Entrevista        | Título,Slug,Resumen,Cuerpo,Autor,Estado,Fecha publicación | Extractos,Imágenes                                | Artista(s)                         |

La distinción práctica: la noticia privilegia inmediatez y fuente verificada; el reportaje amplía con narrativa y recursos visuales; la entrevista aporta perspectiva del artista o promotor.

### 3.3 Sección Eventos

La sección de Eventos atiende al clubber y al promotor. Debe mostrar próximos eventos, permitir filtros por ciudad, club y fecha, y ofrecer fichas completas con datos del venue, horarios, confirmaciones, estado de venta y cobertura posterior. Es crítico capturar el promoter responsable y habilitar relaciones con noticias y videos de aftermovies o lives.

La tabla siguiente organiza los subtipos más relevantes y sus metadatos. Su análisis muestra que la venta de entradas depende de campos como URL de ticketing y precio, mientras que la fidelidad del usuario se apoya en confirmaciones y recordatorios.

Tabla 4. Tipos de evento x campos y validaciones

| Tipo de evento         | Campos obligatorios                                              | Validaciones clave                                    | Relaciones                         |
|------------------------|------------------------------------------------------------------|-------------------------------------------------------|------------------------------------|
| Evento                 | Nombre,Slug,Fecha/hora inicio/fin,Venue,Ciudad,Estado           | Fechas consistentes; venue existente                  | Promotor,Artistas,Agencias         |
| Festival               | Nombre,Slug,Fecha inicio/fin,Ciudad,Venues múltiples,Estado      | Rango de fechas; al menos un venue                    | Promotor,Programación              |
| Club night             | Nombre,Slug,Fecha,Venue,Estado                                  | Fecha única; venue requerido                          | Promotor,Artistas                  |
| Workshop/Masterclass   | Nombre,Slug,Fecha/hora,Venue,Estado,Inscripción                  | Capacidad; inscripción obligatoria                    | Artista/DJ,Promotor                |
| Webinar                | Nombre,Slug,Fecha/hora,URL streaming,Estado                      | URL válida; plataforma definida                       | Artista/Promotor                   |

Con esta estructura, el descubrimiento mejora mediante filtros por ciudad y fecha, y la conversión se apoya en CTAs claros a ticketing. La cobertura posterior vincula eventos con noticias y videos, construyendo memoria y autoridad.

### 3.4 Sección Lanzamientos DJs

Los lanzamientos de música son el corazón de la escena. Esta sección debe incluir sencillos, EPs, álbumes, remixes y compilaciones, con un foco especial en créditos completos (artista, sello, productores, compositores, mezcladores y mastering), enlaces a tiendas y streaming, y posibilidad de pre-save o pre-add. El ciclo incluye borrador, pendiente de derechos, aprobado y publicado, con validaciones de metadatos técnicos (bpm, key) y artística.

La matriz siguiente permite modelar cada tipo con precisión y relacionarlo con artistas, sellos y videos asociados. Este nivel de granularidad es lo que habilita recomendaciones por estilo y la verificación de derechos.

Tabla 5. Matriz tipo de lanzamiento x campos obligatorios

| Tipo           | Campos obligatorios                                                                 | Validaciones                              | Relaciones                         |
|----------------|--------------------------------------------------------------------------------------|-------------------------------------------|------------------------------------|
| Single         | Título,Slug,Artista(s),Sello,Fecha de publicación,Estado                             | Fecha futura permitida; credits completos | Género/Subgénero,Videos            |
| EP             | Título,Slug,Artista(s),Sello,Tracklist,Fecha,Estado                                  | Tracklist no vacía                         | Género/Subgénero,Artistas          |
| Álbum          | Título,Slug,Artista(s),Sello,Tracklist,Fecha,Estado                                  | Tracklist completa                         | Género/Subgénero,Compilación       |
| Remix          | Título,Slug,Artista original,Remixer,Sello,Tracklist,Fecha,Estado                    | Créditos del original y remix              | Artista original,Clips             |
| Compilación    | Título,Slug,Compilador/Curador,Sello,Tracklist,Fecha,Estado                          | Curador o sello definido                   | Tracklist con artistas invitados   |

La clave operativa es garantizar consistencia de créditos y habilitación de enlaces a tiendas y servicios de streaming en el momento de la publicación, evitando retrasos posteriores.

### 3.5 Sección Videos

La sección de Videos contiene aftermovies, lives, videoclips, DJ mixes y documentales, con foco en metadatos técnicos (duración, resolución, códec), créditos completos (director, cámara, edición, producción) y licencias embebidas. Las relaciones con eventos y lanzamientos potencian la narrativa y la memoria cultural.

La tabla siguiente clarifica los campos y validaciones mínimas, y sugiere restricciones por tipo para preservar calidad y cumplimiento.

Tabla 6. Tipos de video x campos x restricciones

| Tipo        | Campos obligatorios                                               | Validaciones                        | Relaciones                     |
|-------------|-------------------------------------------------------------------|-------------------------------------|--------------------------------|
| Aftermovie  | Título,Slug,Evento,Duración,Estado,URL del video                  | Evento existente; duración razonable | Evento                         |
| Live set    | Título,Slug,Artista,Evento o Release,Duración,Estado,URL          | Artista válido; créditos completos   | Artista,Release                |
| Videoclip   | Título,Slug,Artista,Release,Duración,Estado,URL,Director          | Release existente                    | Release                        |
| DJ mix      | Título,Slug,DJ,Tracklist aproximada,Duración,Estado,URL           | Duración > 0; créditos básicos       | Artista,Eventos                |
| Documental  | Título,Slug,Personajes,Duración,Estado,URL,Licencia               | Licencia válida                      | Escena,Personajes              |

Las restricciones protegen la integridad de créditos y derechos. Por ejemplo, un videoclip debe vincularse a un release existente, evitando ambigüedades en la cadena de titularidad.

## 4. Modelo de entidades y relaciones (ER) transversales

La arquitectura se sostiene sobre entidades transversales que permiten consistencia, reutilización y calidad de datos. Las entidades núcleo incluyen Usuario, Perfil, Rol, Permiso, Contenido (noticias, eventos, lanzamientos, videos), Etiquetas, Géneros, Categorías y Ciudades. Las entidades de ecosistema abarcan Artista/DJ, Sello discográfico, Agencia de management, Promotor, Club/Venue, Evento y Video. Sus relaciones articulan el valor editorial: el artista pertenece a un sello y puede tener agencia, el evento sucede en un venue en una ciudad, el release se publica por un sello y tiene tracks con créditos específicos, el video se relaciona con un evento o un release.

La matriz que sigue captura cardinalidades y reglas de borrado, ofreciendo una guía para desarrollo y curación. Antes de la tabla, recordemos que el objetivo es minimizar duplicidad, habilitar navegación cruzada y garantizar integridad referencial.

Tabla 7. Matriz de entidades y relaciones

| Entidad        | Entidad relacionada | Relación                            | Cardinalidad        | Regla de borrado                |
|----------------|---------------------|-------------------------------------|---------------------|---------------------------------|
| Usuario        | Rol                 | Usuario tiene Rol                   | N:M                 | Restringido si rol en uso       |
| Perfil         | Contenido           | Perfil crea/posee Contenido         | 1:N                 | Restringido si contenido activo |
| Artista/DJ     | Sello               | Artista pertenece a Sello           | N:M                 | Libre                           |
| Agencia        | Artista/DJ          | Agencia representa a Artista        | N:M                 | Libre                           |
| Promotor       | Evento              | Promotor organiza Evento            | 1:N                 | Restringido si evento publicado |
| Venue          | Evento              | Venue alberga Evento                | 1:N                 | Restringido si evento vigente   |
| Evento         | Video               | Evento tiene Video(s)               | 1:N                 | Restringido si video publicado  |
| Release        | Artista/DJ          | Release incluye Artistas            | N:M                 | Restringido si release publicado|
| Release        | Video               | Release tiene Videoclip(s)          | 1:N                 | Libre                           |
| Contenido      | Etiquetas           | Contenido usa Etiquetas             | N:M                 | Libre                           |
| Evento         | Ciudad              | Evento ocurre en Ciudad             | N:1                 | Restringido si hay eventos      |

Las reglas de borrado protegen consistencia. Por ejemplo, eliminar un Venue no debe ser posible si hay eventos asociados; en cambio, puede marcarse como inactivo para conservar historia.

## 5. Esquemas de datos por tipo de contenido

Cada tipo de contenido exige un modelo de datos con campos obligatorios y opcionales, tipos, validaciones y estados. Las entidades transversales —tags, géneros, ciudad, artistas, sellos, agencias, venues— se integran para reforzar descubrimiento y relaciones. A continuación, se proponen los campos mínimos y sus reglas, que deben implementarse con validaciones claras y feedback útil para editores y usuarios.

### 5.1 Datos para Noticias

La noticia requiere metadatos editoriales y relaciones con entidades del ecosistema. Los campos obligatorios son: título, slug, resumen, cuerpo, autor, estado y fecha de publicación. Opcionales: categoría, etiquetas, imágenes y galería. El estado debe seguir el ciclo de vida con transiciones explícitas y registro de versiones.

Tabla 8. Especificación de campos para Noticias

| Campo               | Tipo         | Obligatorio | Validación                         | Ejemplo                                  |
|---------------------|--------------|------------:|------------------------------------|-------------------------------------------|
| título              | Texto        |           Sí| No vacío, máx. 120 caracteres      | “Nuevo EP de [Artista] en [Sello]”        |
| slug                | Slug         |           Sí| Único,URL-friendly                 | nuevo-ep-artista-sello                    |
| resumen             | Texto        |           Sí| 140–300 caracteres                 | “El sello [X] publica un EP de cuatro…”   |
| cuerpo              | Rich Text    |           Sí| Estructura H2/H3, enlaces permitidos| Párrafos con subtítulos                   |
| autor               | Relación     |           Sí| Autor existe                       | “Redacción Techno Experience”             |
| estado              | Enum         |           Sí| draft/review/approved/published/archived | “review”                             |
| fecha publicación   | Fecha/hora   |           Sí| Fecha presente/futura               | “2025-11-24T10:00:00Z”                    |
| categoría           | Taxonomía    |          Opc| Lista controlada                    | “Noticias”/“Entrevistas”                  |
| etiquetas           | Lista        |          Opc| Máx. 10                             | “techno, berlin, hypnotic”                |
| imágenes            | Media        |          Opc| Resolución mínima                   | Hero 1600x900                             |
| galería             | Media[]      |          Opc| Imágenes con pies                   | 5 fotos del evento                        |

La trazabilidad requiere registro de versiones y razones de cambio, especialmente en artículos publicados.

### 5.2 Datos para Eventos

El evento debe capturar detalles operativos y de conversión. Obligatorios: nombre, slug, fecha/hora inicio y fin, venue, ciudad, estado. Opcionales: descripción, artistas (relación), promoter, cover, imágenes, URL ticketing, precios, capacidad, edad, tipo de evento, políticas, accesibilidad, y recordatorios.

Tabla 9. Especificación de campos para Eventos

| Campo               | Tipo         | Obligatorio | Validación                         | Ejemplo                                  |
|---------------------|--------------|------------:|------------------------------------|-------------------------------------------|
| nombre              | Texto        |           Sí| No vacío                           | “Techno Night at [Club]”                  |
| slug                | Slug         |           Sí| Único                              | techno-night-club-ciudad                 |
| fecha inicio        | Fecha/hora   |           Sí| En zona definida                   | “2025-12-05T22:00:00Z”                    |
| fecha fin           | Fecha/hora   |           Sí| > inicio                           | “2025-12-06T03:00:00Z”                    |
| venue               | Relación     |           Sí| Venue existe                       | “[Club], [Ciudad]”                        |
| ciudad              | Relación     |           Sí| Ciudad existe                      | “Madrid”                                  |
| estado              | Enum         |           Sí| draft/approved/published/cancelled/archived | “approved”                           |
| descripción         | Texto        |          Opc| Longitud moderada                   | “Lineup: A, B, C”                         |
| artistas            | Relación[]   |          Opc| Artistas válidos                   | “A, B, C”                                 |
| promoter            | Relación     |          Opc| Promotor existe                     | “[Promoter]”                              |
| cover               | Media        |          Opc| Resolución mínima                   | 1200x628                                  |
| imágenes            | Media[]      |          Opc| Pie de foto                         | 3 fotos                                   |
| URL ticketing       | URL          |          Opc| Enlace válido                       | Entradas disponibles                       |
| precios             | JSON         |          Opc| Tipos y monedas                     | {“general”:35,”vip”:60}                   |
| capacidad           | Número       |          Opc| > 0                                 | 800                                       |
| edad mínima         | Número       |          Opc| 0–18                                | 18                                        |
| tipo de evento      | Enum         |          Opc| single/festival/workshop/webinar    | “single”                                  |
| políticas           | Texto        |          Opc| Normas claras                        | “No reentry”                              |
| accesibilidad       | Texto        |          Opc| Detalles                             | “Acceso adaptado”                         |
| recordatorios       | Enum[]       |          Opc| 24h/2h/7d                            | [“24h”,”2h”]                              |

La consistencia de fechas y la existencia del venue son críticas para evitar errores en agenda.

### 5.3 Datos para Lanzamientos DJs

Los lanzamientos requieren metadatos artísticos y técnicos. Obligatorios: título, slug, artista(s), sello, fecha de publicación y estado. Opcionales: género, subgénero, bpm, musical key, tracklist (con ISRC), sello y productores/compositores/mezcla/mastering, arte, tiendas y streaming.

Tabla 10. Especificación de campos para Lanzamientos

| Campo                  | Tipo         | Obligatorio | Validación                        | Ejemplo                                   |
|------------------------|--------------|------------:|-----------------------------------|--------------------------------------------|
| título                 | Texto        |           Sí| No vacío                          | “Axis EP”                                  |
| slug                   | Slug         |           Sí| Único                             | axis-ep-artista                            |
| artista(s)             | Relación[]   |           Sí| Artistas válidos                  | “[Artista]”                                |
| sello                  | Relación     |           Sí| Sello existe                      | “[Sello]”                                  |
| fecha publicación      | Fecha        |           Sí| Presente/futura                   | “2025-12-01”                               |
| estado                 | Enum         |           Sí| draft/rights-pending/approved/published | “approved”                           |
| género                 | Taxonomía    |          Opc| Lista controlada                  | “Techno”                                   |
| subgénero              | Taxonomía    |          Opc| Lista controlada                  | “Hypnotic”                                 |
| bpm                    | Número       |          Opc| 60–200                            | 128                                        |
| musical key            | Texto        |          Opc| Notación estándar                  | “Am”                                       |
| tracklist              | Lista        |          Opc| Con títulos/ISRC                  | Track1 – …; Track2 – …                     |
| productores            | Relación[]   |          Opc| Nombres/roles                     | “Prod: [Nombre]”                           |
| compositores           | Relación[]   |          Opc| Nombres                           | “Comp: [Nombre]”                           |
| mezcla                 | Relación     |          Opc| Nombre                            | “Mix: [Nombre]”                            |
| mastering              | Relación     |          Opc| Nombre                            | “Master: [Nombre]”                         |
| arte                   | Media        |          Opc| Resolución mínima                 | 3000x3000                                  |
| tiendas                | URL[]        |          Opc| Enlaces válidos                   | “Store: …”                                 |
| streaming              | URL[]        |          Opc| Enlaces válidos                   | “Spotify: …”                               |

La verificación de créditos y enlaces protege derechos y mejora la experiencia del usuario.

### 5.4 Datos para Videos

Los videos necesitan campos editoriales y técnicos. Obligatorios: título, slug, tipo de video, duración, estado y URL. Opcionales: director, cámara, edición, producción, créditos, ID de plataforma, miniatura, idioma, subtítulos y licencia.

Tabla 11. Especificación de campos para Videos

| Campo               | Tipo         | Obligatorio | Validación                        | Ejemplo                                   |
|---------------------|--------------|------------:|-----------------------------------|--------------------------------------------|
| título              | Texto        |           Sí| No vacío                          | “Aftermovie [Evento]”                      |
| slug                | Slug         |           Sí| Único                             | aftermovie-evento-ciudad                   |
| tipo de video       | Enum         |           Sí| aftermovie/live/videoclip/djmix/documental | “aftermovie”                         |
| duración            | Número       |           Sí| > 0                               | 240 segundos                               |
| estado              | Enum         |           Sí| draft/approved/published          | “approved”                                 |
| URL                 | URL          |           Sí| Enlace válido                     | “https://video…”                           |
| director            | Texto        |          Opc| Nombre                            | “[Nombre]”                                 |
| cámara              | Texto        |          Opc| Nombre                            | “[Nombre]”                                 |
| edición             | Texto        |          Opc| Nombre                            | “[Nombre]”                                 |
| producción          | Texto        |          Opc| Nombre                            | “[Nombre]”                                 |
| créditos            | Texto        |          Opc| Longitud moderada                 | “Filmación: …”                             |
| ID plataforma       | Texto        |          Opc| Formato por plataforma            | “yt: …”                                    |
| miniatura           | Media        |          Opc| Resolución mínima                 | 1280x720                                   |
| idioma              | Texto        |          Opc| ISO 639-1                         | “es”                                       |
| subtítulos          | Media        |          Opc| Formatos estándar                 | “SRT”                                      |
| licencia            | Texto        |          Opc| Tipo/texto                        | “Todos los derechos reservados”            |

Las licencias deben estar claras para evitar conflictos de derechos, especialmente en lives y mixes.

## 6. Sistema de perfiles de usuario y permisos (RBAC)

El control de acceso basado en roles (RBAC) define qué acciones puede realizar cada perfil: crear, editar, aprobar, publicar y eliminar contenido, así como moderar comentarios. La matriz que sigue orienta el diseño y la implementación, estableciendo permisos por tipo de contenido y accion.

Antes de la tabla, conviene enmarcar el principio: el DJ, el promotor, el sello y la agencia crean contenido activo; los editores y moderadores aseguran calidad, verificación y cumplimiento de políticas. El clubber puede colaborar con tips y fotos si la política lo permite.

Tabla 12. Matriz rol x permisos por tipo de contenido

| Rol        | Noticias          | Eventos             | Lanzamientos        | Videos              | Comentarios |
|------------|-------------------|---------------------|---------------------|---------------------|-------------|
| DJ         | Comentar (opc)    | Sugerir (opc)       | Crear/editar/propio | Subir mixes/vídeos (propios) | Comentar   |
| Promotor   | Enviar nota (opc) | Crear/editar/eventos| Comentar            | Subir aftermovies   | Moderar (en sus eventos) |
| Clubber    | Comentar          | Confirmar asistencia| Comentar            | Subir clips (opc)   | Comentar   |
| Sello      | Nota (opc)        | Comentar            | Crear/editar/sus releases | Subir videoclips | Comentar   |
| Agencia    | Nota (opc)        | Gestionar agenda    | Comentar            | Gestionar contenidos de artistas | Moderar (en su scope) |
| Editor     | Aprobar/publicar  | Aprobar/publicar    | Aprobar/publicar    | Aprobar/publicar    | Moderar    |
| Moderador  | Eliminar/editar   | Eliminar/editar     | Eliminar/editar     | Eliminar/editar     | Moderar    |

Las opciones “opc” se activan según políticas definidas. La moderación de comentarios es transversal, pero el alcance de cada rol se limita a su ámbito: promotores en sus eventos, agencias en contenidos de sus artistas.

### 6.1 Perfiles por rol

Cada rol define un conjunto de campos de perfil orientados a su función en la plataforma. A continuación, se detalla la especificación de campos por rol. Esta matriz permite construir formularios consistentes y validaciones adecuadas.

Tabla 13. Campos de perfil por rol

| Rol     | Campo                      | Tipo     | Obligatorio | Validación                   | Ejemplo                 |
|---------|----------------------------|----------|------------:|------------------------------|-------------------------|
| DJ      | Nombre artístico           | Texto    |           Sí| No vacío                     | “DJ [Nombre]”           |
| DJ      | Género(s) preferidos       | Taxonomía|          Opc| Lista controlada             | “Techno/Hypnotic”       |
| DJ      | Sello principal            | Relación |          Opc| Sello existe                 | “[Sello]”               |
| DJ      | Enlaces (RA/SoundCloud)    | URL[]    |          Opc| Enlaces válidos              | “RA: …”                 |
| Promotor| Nombre comercial           | Texto    |           Sí| No vacío                     | “[Promoter]”            |
| Promotor| Portfolio                  | Texto    |          Opc| Longitud moderada            | “Eventos 2024–2025”     |
| Promotor| Verificación de identidad  | Bool     |           Sí| Estado verificado            | true                    |
| Clubber | Ciudad                     | Texto    |           Sí| Lista controlada             | “Madrid”                |
| Clubber | Tipos de eventos           | Taxonomía|          Opc| Lista controlada             | “Club night/Workshop”   |
| Clubber | Preferencias musicales     | Taxonomía|          Opc| Lista controlada             | “Hard/Hypnotic”         |
| Sello   | Nombre legal               | Texto    |           Sí| No vacío                     | “[Label]”               |
| Sello   | Contacto                   | Texto    |           Sí| Email/teléfono válido        | “contacto@label.com”    |
| Sello   | Catálogo                   | Texto    |          Opc| Descripción                  | “20 releases/año”       |
| Agencia | Nombre                     | Texto    |           Sí| No vacío                     | “[Agency]”              |
| Agencia | Artistas representados     | Relación[]|          Opc| Artistas válidos             | “DJ [A], [B]”           |
| Agencia | Región operativa           | Texto    |          Opc| Lista controlada             | “ES/PT/LATAM”           |

Este diseño de perfiles potencia el descubrimiento y la verificación, a la vez que respeta privacidad y control de datos.

### 6.2 Permisos y moderación

Los estados de contenido guían la moderación. Por tipo, se definen permisos y roles que pueden ejecutar cada transición. La trazabilidad de cambios es obligatoria, con registro de quién, cuándo y qué modificó. Este registro es fundamental para responsabilidad editorial y resolución de conflictos.

Tabla 14. Permisos por estado de contenido

| Tipo           | Estado          | Puede aprobar | Puede publicar | Puede editar | Puede eliminar |
|----------------|-----------------|---------------|----------------|--------------|----------------|
| Noticias       | review          | Editor        | Editor         | Autor/Editor | Moderador/Editor |
| Noticias       | approved        | Editor        | Editor         | Editor       | Editor         |
| Noticias       | published       | —             | Editor         | Editor       | Editor         |
| Eventos        | draft           | Editor        | —              | Promotor/Editor | Editor       |
| Eventos        | approved        | Editor        | Editor         | Editor       | Editor         |
| Eventos        | published       | —             | Editor         | Editor       | Editor         |
| Lanzamientos   | rights-pending  | Editor        | —              | Sello/Editor | Editor         |
| Lanzamientos   | approved        | Editor        | Editor         | Editor       | Editor         |
| Lanzamientos   | published       | —             | Editor         | Editor       | Editor         |
| Videos         | draft           | Editor        | —              | Autor/Editor | Moderador/Editor |
| Videos         | approved        | Editor        | Editor         | Editor       | Editor         |
| Videos         | published       | —             | Editor         | Editor       | Editor         |

La moderación debe permitir comentarios bloqueados en caso de incumplimientos, con un flujo claro de resolución.

## 7. Taxonomías y metadatos comunes

Las taxonomías permiten clasificar y relacionar contenido. Las principales incluyen: género musical y subgénero, ciudad/país, moods, sellos, eventos, agencies, tipos de eventos, tipo de release, tipo de video, estado de publicación y etiquetas libres. Los metadatos transversales cubren título, slug, resumen, autor, fecha de creación y actualización, idioma y derechos/licencia de uso. La consistencia en estos metadatos habilita búsqueda, filtros y recomendaciones.

Tabla 15. Catálogo de taxonomías

| Taxonomía         | Descripción                         | Cardinalidad | Ejemplos                          |
|-------------------|-------------------------------------|--------------|-----------------------------------|
| Género/Subgénero  | Clasificación musical               | N:M          | “Techno/Hypnotic”, “Industrial”   |
| Ciudad/País       | Ubicación geográfica                | N:1          | “Madrid/ES”, “Berlin/DE”          |
| Moods             | Estado anímico/estético             | N:M          | “Dark”, “Uptempo”, “Hypnotic”     |
| Sellos            | Editorial de música                 | N:M          | “[Sello A]”, “[Sello B]”          |
| Agencias          | Management de artistas              | N:M          | “[Agency X]”, “[Agency Y]”        |
| Tipos de evento   | Categoría del evento                | N:1          | “Club night”, “Festival”          |
| Tipo de release   | Categoría del lanzamiento           | N:1          | “Single”, “EP”, “Álbum”           |
| Tipo de video     | Formato de video                    | N:1          | “Aftermovie”, “Live”              |
| Estado            | Ciclo de vida del contenido         | N:1          | “Draft”, “Published”              |
| Etiquetas libres  | Palabras clave ad-hoc               | N:M          | “hardtechno”, “acid”              |

Un catálogo consistente reduce la ambigüedad y facilita la curación.

## 8. Flujos de trabajo editorial

El flujo de publicación debe ser claro para minimizar ciclos de revisión y acelerar el time-to-publish, preservando la calidad. Los estados y transiciones por tipo de contenido están definidos, con validaciones específicas en cada paso: por ejemplo, un lanzamiento en “rights-pending” no puede publicarse sin verificar créditos; un evento no debe publicarse sin venue y fecha coherentes. La estrategia de etiquetado y curación garantiza consistencia y evita duplicados. Las integraciones previstas —ticketing, plataformas de video, redes sociales y analítica— deben activarse en hitos controlados.

Tabla 16. Estados x Transiciones x Validaciones

| Tipo           | Estado           | Transiciones                        | Validaciones clave                                |
|----------------|------------------|-------------------------------------|---------------------------------------------------|
| Noticias       | draft            | → review                            | Campos obligatorios completos                     |
| Noticias       | review           | → approved/archived                 | Verificación editorial                            |
| Noticias       | approved         | → published                         | Fecha y permisos listos                           |
| Eventos        | draft            | → approved/cancelled                | Venue, fechas, ciudad                             |
| Eventos        | approved         | → published                         | Ticketing (si existe)                             |
| Lanzamientos   | draft            | → rights-pending                    | Créditos, sello                                   |
| Lanzamientos   | rights-pending   | → approved/published                | Derechos verificados                              |
| Videos         | draft            | → approved                          | Licencias, duración, URL                          |
| Videos         | approved         | → published                         | Estado y permisos                                 |

Las validaciones deben devolver mensajes claros al usuario, explicando qué falta y cómo corregirlo.

## 9. Interfaz y experiencia de usuario (UX)

La navegación global debe poner en primer plano las cinco secciones y ofrecer búsquedas con filtros por tipo de contenido, ciudad, fecha, género y etiqueta. En móvil, los componentes se adaptan con patrones claros: cards para listas, fichas con tabs para detalles, módulos de destacados, formularios con validación inline y estados de carga con retroalimentación visual. En el detail view de eventos, la ficha debe concentrar información esencial: fecha y hora, venue, lineup, precios y disponibilidad de entradas, políticas y accesibilidad, CTAs a ticketing y recordatorios. En releases, se prioriza tracklist, créditos, enlaces a tiendas y streaming, y contenido multimedia. En videos, la reproducción debe integrar créditos y licencias.

Tabla 17. Mapa de componentes por sección

| Sección         | Componentes clave                           | Props principales                              | Acciones disponibles                 |
|-----------------|---------------------------------------------|------------------------------------------------|--------------------------------------|
| Inicio          | Hero, Carruseles, Módulos destacados        | Tipo, Prioridad, Fecha                         | Ver más, Seguir, Compartir           |
| Noticias        | Lista, Filtros, Ficha                       | Título, Fecha, Categoría, Etiquetas            | Leer, Compartir, Comentar            |
| Eventos         | Calendario, Lista, Filtros, Ficha           | Ciudad, Fecha, Venue, Estado, Ticketing        | Comprar entradas, Confirmar, Seguir  |
| Lanzamientos    | Lista, Filtros, Ficha                       | Artista, Sello, Tracklist, Enlaces             | Escuchar, Comprar, Pre-save          |
| Videos          | Lista, Filtros, Reproductor                 | Tipo, Artista/Evento, Licencia                  | Reproducir, Compartir, Comentar      |

La coherencia de componentes facilita aprendizaje y reduce tiempo de interacción, clave en contextos móviles.

## 10. Localización e idiomas

La plataforma debe soportar internacionalización (i18n) y localización (l10n) de contenido y metadatos. Esto incluye traducciones para títulos, resúmenes y cuerpo, formatos de fecha/hora por región, moneda y moneda local para precios de eventos, y una política clara de contenido por mercado. Para escalabilidad, se recomienda una estrategia de multidioma por edición, manteniendo alineación entre taxonomías y metadatos.

Tabla 18. Campos que requieren traducción por tipo

| Tipo           | Campos a traducir                         | Nota de implementación                  |
|----------------|--------------------------------------------|------------------------------------------|
| Noticias       | Título, Resumen, Cuerpo                    | Revisarlinks y subtítulos                |
| Eventos        | Nombre, Descripción, Políticas             | Fechas/hora según zona                   |
| Lanzamientos   | Título, Créditos, Descripción              | Tracklist y títulos por idioma           |
| Videos         | Título, Créditos, Subtítulos               | Idiomas de audio y SRT                   |
| Perfiles       | Biografía, Descripción                     | Consistencia de nombre artístico         |
| Taxonomías     | Etiquetas (si se localizan)                | Mapeo entre idiomas                      |

La localización potencia el alcance sin sacrificar coherencia editorial.

## 11. Analítica y medición

La medición debe alinear producto y editorial: alcance, engagement y conversión. Los KPIs incluyen visitas por sección, CTR en módulos, tiempo de lectura, inscripciones a eventos, reproducciones de video y seguimiento de artistas/sellos/promotores. El tablero por rol ofrece vistas específicas: DJs ven métricas de lanzamientos y videos, promotores analizan ventas y cobertura, editores supervisan flujos y estados, administradores observan agregados por ciudad y sección.

Tabla 19. KPIs por tipo de contenido

| Tipo          | KPI                        | Definición                                        | Fórmula                                  |
|---------------|----------------------------|---------------------------------------------------|-------------------------------------------|
| Noticias      | Visitas                    | Páginas vistas                                    | Total vistas                              |
| Noticias      | Tiempo de lectura          | Duración promedio                                  | Σ tiempo / nº lecturas                    |
| Eventos       | CTR a ticketing            | Clicks en CTA de entradas                         | Clicks CTA / impresiones                  |
| Eventos       | Confirmaciones             | Usuarios que confirman asistencia                 | nº confirmaciones                         |
| Lanzamientos  | Plays/Streams              | Reproducciones/Streams                            | nº plays                                  |
| Lanzamientos  | Clicks a tiendas           | Clicks en enlaces a tiendas/streaming             | Clicks tiendas / impresiones              |
| Videos        | Retención                  | Tiempo visto vs duración                           | Σ tiempo visto / duración total           |
| Global        | Follows                    | Nuevos follows por entidad                         | Δ follows por período                     |
| Global        | Engagement                 | Comentarios + compartidos                         | nº comentarios + compartidos              |

Las métricas deben integrarse en los flujos para permitir optimización editorial y de producto.

## 12. Riesgos, supuestos y vacíos de información

La implementación requiere decidir sobre aspectos aún no definidos. Entre los riesgos: incoherencias taxonomias si no se gobiernan con listas controladas; duplicidad de datos si faltan validaciones; escalabilidad limitada si el modelo no soporta multidioma y roles complejos. Supuestos operativos: habrá un equipo editorial y de moderación, los perfiles básicos existen y se pueden verificar, y se cuenta con integraciones de ticketing y video. Los vacíos de información deben documentarse y resolverse antes de avanzar a producción.

Tabla 20. Registro de vacíos de información

| Tema                        | Impacto                                      | Acción requerida                            | Dueño        |
|----------------------------|----------------------------------------------|---------------------------------------------|-------------|
| Objetivos de negocio       | Priorización y métricas                      | Definir metas y KPIs por rol                | Dirección   |
| Mercados/idiomas           | i18n y localización                          | Seleccionar mercados iniciales               | Producto    |
| Política de derechos       | Publicación de audio/video                   | Documentar licencias y acuerdos              | Legal       |
| Lineamientos de marca      | Tono editorial y diseño                      | Manual de estilo y UI kit                    | Marketing   |
| ModeraciónComentarios      | Salud de comunidad                           | Definir reglas y sanciones                   | Editorial   |
| Integraciones externas     | TICKETING/Video/Social/Analytics             | Lista de integraciones y SLAs                | Producto/Dev|
| Privacidad/RGPD            | Datos personales                             | Políticas y consentimientos                  | Legal       |
| Versionado de contenidos   | Trazabilidad editorial                       | Reglas de versiones y responsables           | Editorial   |
| Taxonomías definitivas     | Curación y descubrimiento                    | Aprobación de listas controladas             | Producto    |
| Lineamientos de anuncios   | Monetización y separación editorial          | Formatos y posiciones                        | Marketing   |
| Criterios de verificación  | Confianza en perfiles                        | Proceso de verificación por rol              | Operaciones |

Este registro sirve como punto de partida para completar requisitos antes de la fase de implementación.

---

Este blueprint ofrece una estructura integral y accionable que conecta estrategia editorial, diseño de datos y ejecución de producto. La combinación de modelos claros por tipo de contenido, roles y permisos, taxonomías gobernadas y flujos de publicación robustos posiciona a Techno Experience Magazine para crecer con calidad, coherencia y escala, al tiempo que responde a las necesidades reales de DJs, promotores, clubbers, sellos y agencias. La próxima etapa es cerrar los vacíos identificados y validar esta arquitectura con pruebas de uso en mercado, asegurando que cada decisión —desde un campo en el formulario hasta el módulo de la Home— tenga impacto en la experiencia y el valor de la comunidad.
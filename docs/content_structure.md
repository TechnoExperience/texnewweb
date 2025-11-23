# Blueprint editorial y técnico de Techno Experience Magazine

## Resumen ejecutivo y objetivos del producto

Techno Experience Magazine es una plataforma digital orientada a la cultura techno que articula tres vectores estratégicos: comunidad, contenidos y negocio. En la comunidad, favorece la conexión entre DJs, promotores, sellos, agencias y clubbers a través de perfiles enriquecidos, señales sociales y eventos. En contenidos, soporta formatos editoriales y multimedia (noticias, reseñas, críticas, entrevistas, fotogalería, mixes y videos musicales). En negocio, habilita monetización por contenidos destacados, agenda de eventos,listados de sellos y agencias, así como oportunidades de patrocinio y formatos de branded content.

El proyecto persigue cuatro objetivos: primero, aumentar el alcance orgánico mediante una estructura SEO clara, taxonomías robustas y páginas de entidad optimizadas; segundo, mejorar el engagement a través de módulos de inicio personalizables, señales sociales y recomendaciones; tercero, ordenar la operación editorial con flujos de trabajo (workflow) y un sistema de roles y permisos granular; y cuarto, viabilizar la monetización con espacios comerciales, integración nativa de sellos/agencias y un CMS que permita administrar contenidos, eventos y relaciones comerciales.

Los principios editoriales que guían el diseño son: claridad y consistencia de datos, modularidad y reusabilidad de componentes, y accesibilidad y SEO como requisitos de primera clase. La plataforma se apoya en un modelo de entidades (usuarios, eventos, contenidos, taxonomías) que permite relaciones ricas y control de versiones, con especial atención a eventos y lanzamientos como motores de descubrimiento.

Este blueprint se alinea con los requerimientos del comando: definir la arquitectura completa de contenido para las secciones de Inicio, Noticias, Eventos, Lanzamientos de DJs, Videos, Perfiles de usuario y CMS; especificar tipos de contenido, campos, relaciones, taxonomías y SEO; e incluir un sistema de roles y permisos para DJs, Promotores, Clubbers, Sellos y Agencias. Se incorporan, además, módulos comerciales, internacionalización y un esquema de estados y transiciones editoriales.

Para orientar el diseño, la Tabla 1 resume los objetivos por pilar y su traducción a métricas operativas. Este mapa será el contrato de éxito entre Producto, Contenido y Desarrollo, y guiará la priorización funcional.

Tabla 1. Mapa de objetivos por pilar (Comunidad, Contenidos, Negocio) y métricas asociadas

| Pilar      | Objetivo principal                                      | Métricas clave                                                                 | Sección implicated |
|------------|----------------------------------------------------------|---------------------------------------------------------------------------------|--------------------|
| Comunidad  | Conectar actores y fomentar la red                      | Registros por segmento,Completion de perfil, interacciones por perfil, growth mensual | Perfiles, Inicio, Relaciones |
| Contenidos | Escalar producción y descubrimiento                      | Artículos/mes, tiempo de producción, CTR orgánico, dwell time, cobertura taxonomías | Noticias, Videos, Lanzamientos, SEO |
| Negocio    | Activar inventario comercial y patrocinio                | Impresiones y CTR de módulos, tasa de respuesta de formularios, leads/semana    | Agenda, CMS, Inicio |
| Operación  | Estandarizar flujos y permisos                           | Tiempos de aprobación, tasa de conflictos de edición, retrabajos                | CMS, Roles, Workflow |
| Calidad    | Asegurar SEO, accesibilidad, consistencia                | Core Web Vitals, validaciones, control de versiones, duplicados                 | SEO, CMS, Eventos |

Interpretación: los objetivos de comunidad y negocio se alcanzan mediante estructuras que incentivan la permanencia y la conversión: perfiles ricos, eventos con entradas y relación de artistas, y espacios comerciales integrados. En contenidos, la combinación de taxonomías, pautas de resumen SEO y versiones garantiza escalabilidad y rendimiento orgánico.

## Alcance y apartados a definir

La arquitectura debe cubrir de forma coherente Inicio, Noticias, Eventos, Lanzamientos de DJs, Videos, Perfiles de usuario y el sistema CMS. Cada sección tiene una finalidad, público objetivo y componentes editoriales y multimedia propios. La estrategia SEO se integra de forma transversal mediante slugs canónicos, metaetiquetas, schema y sitemaps.

Antes de detallar cada sección, la Tabla 2 resume propósito, audiencia, componentes y prioridades SEO. Esta panorámica sirve como contrato de diseño y ayuda a alinear decisiones de UX y contenido.

Tabla 2. Matriz Sección x Propósito x Audiencia x Componentes clave x Prioridades SEO

| Sección                | Propósito                                           | Audiencia                                | Componentes clave                                                                 | Prioridades SEO                                     |
|------------------------|------------------------------------------------------|-------------------------------------------|-----------------------------------------------------------------------------------|-----------------------------------------------------|
| Inicio                 | Descubrimiento y conversión                          | Clubbers, DJs, Promotores, Sellos/Agencias | Hero, carruseles temáticos, destacados agenda/editorial, módulos comerciales       | Título y descripción canónicos, categorías y tags   |
| Noticias               | Informar y opinar sobre la escena                    | Clubbers, medios, DJs                     | Cabecera, autor, taxonomías, resumen SEO, galería, mixto de bloques               | ArtículoSchema, NewsArticle, breadcrumbs, enlaces internos |
| Eventos                | Agendar y promocionar música en vivo                 | Clubbers, promotores, agencias            | Datos esenciales (fecha, ciudad), lineup, venue, tickets, estados, schema Event    | SearchAction, FAQPage, indexación selectiva         |
| Lanzamientos de DJs    | Dicos, singles, EPs, remixes                         | Clubbers, sellos, DJs                     | Tracklist, créditos, sello, BuyLinks, embedplayers, ArtistReleaseSchema           | Rich results de música, enlaces a eventos           |
| Videos                 | Clips oficiales, lives, AFTERMOVIE                   | Clubbers, artistas                         | Mux/Vimeo/YouTube embeds, subtítulos, capítulos, miniatura                        | VideoObject + capítulos, sitemap de videos          |
| Perfiles de usuario    | Identidad y reputación                               | DJs, promotores, sellos, agencias, clubbers | Metadatos, señales sociales, vínculos cruzados a eventos/lanzamientos             | Persona/Organization schema, enlaces a propiedades  |
| CMS                    | Operación editorial y de datos                       | Editores, revisores, administradores       | Tipos de contenido, taxonomías, relaciones, workflows, permisos, respaldos        | Slugs canónicos, programaciones, validaciones       |

Análisis: las secciones con mayor potencial de tráfico orgánico son Noticias, Eventos y Lanzamientos, por su semántica fuerte y capacidad de generar enlaces internos. Inicio concentra señales de descubrimiento y conversión; Perfiles y Videos sostienen autoridad de entidad y engagement profundo.

## Arquitectura de información global

La arquitectura de información se organiza por entidades y relaciones. Las entidades principales incluyen: Usuario, Perfil, Evento, Noticia, Video, Lanzamiento, Track, Artista, Venue, Ciudad, Label (sello), Agencia, Tag y Categoría. La relación entre entidades es polivalente: los eventos contienen artistas y venues; los lanzamientos referencian sellos y artistas; las noticias enlazan eventos, lanzamientos y videos; los perfiles agregan señales de actividad (eventos organizados, lanzamientos, mixes, follows, reseñas).

La navegación combina rutas por taxonomías (categorías, etiquetas, ciudades, estilos musicales), por entidades (perfiles de artistas y venues) y por tiempo (agenda y archivo cronológico). La navegación contextual incluye módulos de “Relacionados”, “Próximos en tu ciudad” y “Más de este sello/agencia”, que nutren el SEO mediante enlaces internos significativos.

Para fijar el lenguaje común, la Tabla 3 describe cada entidad y su propósito. Este inventario evita ambigüedades y sirve de referencia a los equipos de datos y desarrollo.

Tabla 3. Catálogo de entidades y propósito

| Entidad   | Propósito principal                                                  |
|-----------|-----------------------------------------------------------------------|
| Usuario   | Identidad de autenticación y acceso                                   |
| Perfil    | Metadatos públicos de actor (DJ, promotor, sello, agencia, clubber)   |
| Artista   | Identidad de músico/DJ; puede coincidir con Perfil                     |
| Evento    | Fiesta, festival, showcase; motor de agenda                           |
| Venue     | Recinto, club,露天舞台, festival grounds                              |
| Ciudad    | Geografía para agenda y perfil de venue                               |
| Label     | Sello discográfico                                                    |
| Agencia   | Representación de artistas                                            |
| Noticia   | Contenido editorial (news, reseñas, críticas, entrevistas)            |
| Video     | Contenido audiovisual embebido                                        |
| Lanzamiento | Dico, single, EP, remixes                                            |
| Track     | Pista dentro de un lanzamiento                                        |
| Tag       | Etiqueta libre de estilo/tema                                         |
| Categoría | Taxonomía editorial jerárquica                                        |

Complementariamente, la Tabla 4 resume las cardinalidades entre entidades. Esta matriz guía los esquemas de datos y los endpoints del CMS.

Tabla 4. Matriz de relaciones y cardinalidades

| Relación                          | Tipo                  | Cardinalidad | Dirección                    | Uso principal                         |
|-----------------------------------|-----------------------|--------------|------------------------------|---------------------------------------|
| Evento–Artista                    | N:N                   | muchos a muchos | Evento ←→ Artista            | Lineup                                |
| Evento–Venue                      | 1:N                   | uno a muchos | Venue → Evento               | Sede                                  |
| Evento–Ciudad                     | N:1                   | muchos a uno | Evento → Ciudad              | Geolocalización                       |
| Evento–Label                      | N:N                   | muchos a muchos | Evento ←→ Label              | Patrocinios/releases asociados        |
| Evento–Agencia                    | N:N                   | muchos a muchos | Evento ←→ Agencia            | Representación/booking                 |
| Lanzamiento–Artista               | N:N                   | muchos a muchos | Lanzamiento ←→ Artista       | Créditos                              |
| Lanzamiento–Label                 | N:1                   | muchos a uno | Lanzamiento → Label          | Sello                                 |
| Lanzamiento–Track                 | 1:N                   | uno a muchos | Lanzamiento → Track          | Tracklist                             |
| Noticia–Evento                    | N:N                   | muchos a muchos | Noticia ←→ Evento            | Cobertura                             |
| Noticia–Lanzamiento               | N:N                   | muchos a muchos | Noticia ←→ Lanzamiento       | Reseñas/entrevistas                   |
| Noticia–Video                     | N:N                   | muchos a muchos | Noticia ←→ Video             | Embebidos                             |
| Perfil–Evento                     | N:N                   | muchos a muchos | Perfil ←→ Evento             | Organización/participación            |
| Perfil–Lanzamiento                | N:N                   | muchos a muchos | Perfil ←→ Lanzamiento        | Publicaciones/miembros                |
| Perfil–Seguidor (Clubber)         | N:N                   | muchos a muchos | Perfil ←→ Clubber            | Seguimiento                           |
| Perfil–Video                      | N:N                   | muchos a muchos | Perfil ←→ Video              | Publicación/autoría                   |
| Noticia–Tag/Categoría             | N:N                   | muchos a muchos | Noticia ←→ Tag/Categoría     | Clasificación                         |
| Evento–Tag/Categoría              | N:N                   | muchos a muchos | Evento ←→ Tag/Categoría      | Estilos/segmentación                  |

Claves foráneas (FK) sugeridas: Evento.venue_id → Venue.id; Evento.ciudad_id → Ciudad.id; Lanzamiento.label_id → Label.id; Perfil.type ∈ {DJ, Promotor, Sello, Agencia, Clubber}.

### Entidades y atributos clave

Para asegurar consistencia y escalabilidad, los campos deben ser explícitos, con tipos, obligatoriedad y validaciones. La Tabla 5 define los principales por entidad. Este esquema es la base para el diseño de formularios del CMS y la indexación en buscadores.

Tabla 5. Campos por entidad (nombre, tipo, requerido, validación, ejemplo)

| Entidad     | Campo                    | Tipo                | Req | Validación/Regla                             | Ejemplo                              |
|-------------|--------------------------|---------------------|-----|----------------------------------------------|--------------------------------------|
| Usuario     | id                       | UUID                | S   | PK                                           | 9b1d...                              |
|             | email                    | Email               | S   | Único, normalizado                           | dj@label.com                         |
|             | hash_password            | Hash                | S   | Algoritmo seguro                             | —                                    |
|             | estado                   | Enum                | S   | activo, pendiente, bloqueado                 | activo                                |
| Perfil      | id                       | UUID                | S   | PK                                           | c2f1...                              |
|             | usuario_id               | UUID                | S   | FK → Usuario.id                              | 9b1d...                              |
|             | tipo                     | Enum                | S   | DJ, Promotor, Sello, Agencia, Clubber        | DJ                                    |
|             | nombre_display           | String              | S   | 2–80 chars                                   | NinaCode                             |
|             | slug                     | Slug                | S   | Único, kebab-case                            | nina-code                            |
|             | bio                      | Rich Text           | O   | 0–2 000 chars                                | Bio...                               |
|             | avatar_id                | UUID                | O   | FK → MediaAsset.id                           | e5a7...                              |
|             | links                    | JSON                | O   | URLs válidas                                 | {web, ig, sc}                        |
|             | ciudad_preferida_id      | UUID                | O   | FK → Ciudad.id                               | 2b9c...                              |
| Artista     | id                       | UUID                | S   | PK                                           | a1d3...                              |
|             | nombre                   | String              | S   | 2–80 chars                                   | Rhea Squel    |
|             | alias_de                 | UUID                | O   | FK → Perfil.id (si coincide)                 | c2f1...                              |
| Venue       | id                       | UUID                | S   | PK                                           | v1x2...                              |
|             | nombre                   | String              | S   | 2–80 chars                                   | Berghain                             |
|             | ciudad_id                | UUID                | S   | FK → Ciudad.id                               | 2b9c...                              |
|             | direccion                | String              | O   | 0–120 chars                                  | Am Wriezener Bahnhof...              |
|             | capacidad                | Integer             | O   | ≥0                                           | 1500                                 |
| Ciudad      | id                       | UUID                | S   | PK                                           | 2b9c...                              |
|             | nombre                   | String              | S   | 2–60 chars                                   | Berlín                               |
|             | country_code             | String              | S   | ISO 3166-1 alpha-2                           | DE                                   |
| Label       | id                       | UUID                | S   | PK                                           | l9z8...                              |
|             | nombre                   | String              | S   | 2–80 chars                                   | Syndex Records                       |
|             | slug                     | Slug                | S   | Único                                        | syndex-records                       |
| Agencia     | id                       | UUID                | S   | PK                                           | g7y2...                              |
|             | nombre                   | String              | S   | 2–80 chars                                   | Frontline Agency                     |
|             | contacto                 | String              | O   | Email o WhatsApp                             | booking@frontline.io                 |
| Evento      | id                       | UUID                | S   | PK                                           | e4c7...                              |
|             | nombre                   | String              | S   | 2–120 chars                                  | Nacht im Klub                        |
|             | slug                     | Slug                | S   | Único                                        | nacht-im-klub-2025-11-30            |
|             | fecha_inicio             | Datetime TZ         | S   | ISO 8601, futuro o pasado                    | 2025-11-30T23:00:00+01:00            |
|             | fecha_fin                | Datetime TZ         | O   | ≥ fecha_inicio                               | 2025-12-01T05:00:00+01:00            |
|             | venue_id                 | UUID                | S   | FK → Venue.id                                | v1x2...                              |
|             | ciudad_id                | UUID                | S   | FK → Ciudad.id                               | 2b9c...                              |
|             | estados                  | Enum                | S   | borrador, pendiente, publicado, cancelado    | publicado                            |
|             | lineup                   | Array<UUID>         | O   | FK → Perfiles tipo Artista                   | [a1d3,...]                           |
|             | labels                   | Array<UUID>         | O   | FK → Label.id                                | [l9z8,...]                           |
|             | agencias                 | Array<UUID>         | O   | FK → Agencia.id                              | [g7y2,...]                           |
| Lanzamiento | id                       | UUID                | S   | PK                                           | r3m1...                              |
|             | tipo                     | Enum                | S   | dico, single, EP, remixes                    | single                               |
|             | titulo                   | String              | S   | 2–120 chars                                  | Meridian Echo                        |
|             | slug                     | Slug                | S   | Único                                        | meridian-echo-single                 |
|             | fecha_publicacion        | Date                | S   | ISO 8601                                     | 2025-11-20                           |
|             | label_id                 | UUID                | S   | FK → Label.id                                | l9z8...                              |
|             | artistas                 | Array<UUID>         | O   | FK → Perfiles tipo Artista                   | [c2f1,...]                           |
|             | buy_links                | Array<URL>          | O   | Dominios verificados                         | [spotify, beatport, bandcamp]        |
| Track       | id                       | UUID                | S   | PK                                           | t9k4...                              |
|             | lanzamiento_id           | UUID                | S   | FK → Lanzamiento.id                          | r3m1...                              |
|             | titulo                   | String              | S   | 2–120 chars                                  | Nightdrive                           |
|             | duracion_seg             | Integer             | O   | ≥0                                           | 385                                  |
| Noticia     | id                       | UUID                | S   | PK                                           | n2p5...                              |
|             | titulo                   | String              | S   | 2–120 chars                                  | Novo Rumor en Berlín                 |
|             | slug                     | Slug                | S   | Único                                        | novo-rumor-berlin-2025               |
|             | autor_id                 | UUID                | S   | FK → Perfil (tipo Editor/Redactor)           | c2f1...                              |
|             | cuerpo                   | Rich Text           | S   | Sin JS inseguro                              | Cuerpo...                            |
|             | resumen_seo              | String              | O   | 140–160 chars                                | El sello berlín...                   |
|             | imagen_destacada_id      | UUID                | O   | FK → MediaAsset.id                           | e5a7...                              |
| Video       | id                       | UUID                | S   | PK                                           | v0d1...                              |
|             | titulo                   | String              | S   | 2–120 chars                                  | Live at Berghain                     |
|             | provider                 | Enum                | S   | mux, vimeo, youtube                          | vimeo                                |
|             | video_id                 | String              | S   | ID del provider                              | 123456789                            |
|             | subtitulos               | Array<URL>          | O   | Formatos WebVTT                              | [en.vtt, es.vtt]                     |
| MediaAsset  | id                       | UUID                | S   | PK                                           | e5a7...                              |
|             | tipo                     | Enum                | S   | imagen, audio, video, documento              | imagen                               |
|             | url_storage              | String              | S   | URL válida                                   | https://cdn.../img.jpg               |
|             | alt_text                 | String              | S   | Accesibilidad                                | Portada del single                   |

Interpretación: los campos “slug”, “resumen_seo”, “links” y referencias cruzadas son críticos para SEO y descubrimiento. Validaciones y unicidad de slugs previenen canónicas conflictivas. El uso de Rich Text con saneo protege la seguridad.

### Relaciones y cardinalidades

Las relaciones se implementan mediante tablas de unión cuando la cardinalidad es muchos a muchos. Las consultas más frecuentes (p. ej., “próximos eventos por ciudad” o “lanzamientos por sello”) deben estar soportadas por índices sobre FK y fecha. El versionado de eventos y lanzamientos es obligatorio: cada edición de evento (nueva fecha o cambio de lineup) crea una versión; cambios en lanzamiento (p. ej., actualización de créditos) generan revisión con autor, fecha y razón.

La Tabla 6 detalla la cardinalidad por relación, FK y estrategia de borrado.

Tabla 6. Relaciones y cardinalidades con claves foráneas y estrategia de borrado

| Relación                 | Tabla puente         | FKs                                    | Borrado en cascada | Índices recomendados                       |
|--------------------------|----------------------|----------------------------------------|--------------------|--------------------------------------------|
| Evento–Artista           | evento_artista       | evento_id, artista_perfil_id           | No (preservar historia) | (evento_id), (artista_perfil_id)           |
| Evento–Agencia           | evento_agencia       | evento_id, agencia_perfil_id           | No                 | (evento_id), (agencia_perfil_id)           |
| Evento–Label             | evento_label         | evento_id, label_perfil_id             | No                 | (evento_id), (label_perfil_id)             |
| Lanzamiento–Artista      | lanzamiento_artista  | lanzamiento_id, artista_perfil_id      | No                 | (lanzamiento_id), (artista_perfil_id)      |
| Noticia–Evento           | noticia_evento       | noticia_id, evento_id                  | No                 | (noticia_id), (evento_id)                  |
| Noticia–Lanzamiento      | noticia_lanzamiento  | noticia_id, lanzamiento_id             | No                 | (noticia_id), (lanzamiento_id)             |
| Perfil–Seguidor (Clubber)| perfil_seguidor      | seguido_id, seguidor_id (Perfiles)     | Sí (orphan rows)   | (seguido_id), (seguidor_id), (seguidor_id, seguido_id) UNIQUE |
| Video–Perfil             | video_perfil         | video_id, perfil_id                    | No                 | (video_id), (perfil_id)                    |
| Evento–Tag               | evento_tag           | evento_id, tag_id                      | No                 | (evento_id), (tag_id)                      |
| Noticia–Tag              | noticia_tag          | noticia_id, tag_id                     | No                 | (noticia_id), (tag_id)                     |

Estrategia de borrado: el borrado duro se limita a entidades sin histórico (p. ej., MediaAsset no referenciado). Relaciones históricas usan borrado lógico o preservación con “archived=true” para proteger la integridad del archivo.

### Taxonomías y etiquetas

Las taxonomías permiten descubrir y segmentar. La estructura debe incluir Categorías jerárquicas (máx. 2–3 niveles) y Tags libres. Además, taxonomías específicas: Género/Subgénero, Ciudad/País, Época/Decada, tipo de Evento (fiesta, festival, showcase), tipo de Lanzamiento (dico, single, EP, remixes), Estilo de Video (clip oficial, live, aftermovie), y Rol (promotor, sello, agencia).

La Tabla 7 propone la jerarquía de Categorías y reglas de uso. Esta guía reduce ambigüedad y mejora la consistencia.

Tabla 7. Jerarquía de Categorías (niveles, ejemplos, reglas de uso)

| Nivel 0   | Nivel 1                     | Nivel 2 (opcional) | Reglas de uso                                                             |
|-----------|------------------------------|--------------------|---------------------------------------------------------------------------|
| Noticias  | Breves, Entrevistas, Reseñas, Críticas | —                  | “Breves” ≤ 200 palabras; entrevistas con autor confirmada                 |
| Eventos   | Fiesta, Festival, Showcase, Night | —                  | “Showcase” ligado a un sello; “Festival” requiere ciudad y fechas múltiples |
| Lanzamientos | Dico, Single, EP, Remixes | —                  | “Remixes” requiere artista original; EP: 3–6 tracks                       |
| Videos    | Clip oficial, Live, AFTERMOVIE | —                  | “Live” requiere venue o festival; AFTERMOVIE enlaza Evento                |
| Perfiles  | DJ, Promotor, Sello, Agencia, Clubber | —                  | Clubber no público por defecto; etiquetas secundarias para skills/intereses |

Glosario de Tags: se aceptan tags libres con frecuencia mínima (≥3 usos) y sinónimos mapeados (p. ej., “hardtechno” → “hard techno”). Listas bloqueadas evitan spam y contenido fuera de tema.

### Estructura SEO y URLs

La consistencia de slugs y la canonicidad es crítica. Se recomienda patrón base: /noticias/slug, /eventos/slug, /lanzamientos/slug, /videos/slug, /dj/[slug], /promotor/[slug], /sello/[slug], /agencia/[slug]. Los slugs son kebab-case, únicos, y no se reutilizan tras borrado. Metaetiquetas: title (≤60 caracteres), description (≤155), og:title, og:description, og:image, twitter:card. Schema.org: Article (NewsArticle), Event, VideoObject, Person/Organization, MusicRelease/ArtistRelease.

La Tabla 8 estandariza patrones de URL por sección. Esta referencia se usa en CMS y validaciones.

Tabla 8. Patrones de URL por sección

| Sección         | Plantilla                         | Ejemplo                                     | Canónica                         | Notas SEO                                           |
|-----------------|-----------------------------------|---------------------------------------------|----------------------------------|-----------------------------------------------------|
| Inicio          | /                                 | /                                           | /                                | Título y descripción globales                       |
| Noticias        | /noticias/{YYYY}/{MM}/{slug}      | /noticias/2025/11/novo-rumor-berlin-2025   | Sí (Self-Referencing)            | Breadcrumbs por categoría                           |
| Eventos         | /eventos/{slug}                   | /eventos/nacht-im-klub-2025-11-30          | Sí                               | SearchAction y FAQPage cuando aplique               |
| Lanzamientos    | /lanzamientos/{slug}              | /lanzamientos/meridian-echo-single          | Sí                               | Enlaces a artistas y sello                          |
| Videos          | /videos/{slug}                    | /videos/live-at-berghain                    | Sí                               | VideoObject con capítulos y transcripciones         |
| Perfiles DJ     | /dj/{slug}                        | /dj/nina-code                               | Sí                               | Person schema; enlaces a eventos/lanzamientos       |
| Perfiles Promotor| /promotor/{slug}                 | /promotor/klangform                         | Sí                               | Organization schema                                 |
| Perfiles Sello  | /sello/{slug}                     | /sello/syndex-records                       | Sí                               | MusicRelease/ArtistRelease cuando aplique           |
| Perfiles Agencia| /agencia/{slug}                   | /agencia/frontline-agency                   | Sí                               | Organization + sameAs links                         |

Interpretación: los slugs con fecha en Noticias mejoran archivo cronológico; Eventos y Lanzamientos usan slugs estables, sin fechas, para evitar duplicidad si hay reediciones o nuevas ediciones de evento.

## Roles, permisos y operación editorial

La operación editorial se estructura sobre roles y permisos: DJ, Promotor, Clubber, Sello, Agencia, Editor, Revisor, Administrador y Super Admin. Las acciones se controlan a nivel de entidad: crear, editar, publicar, eliminar, archivar y moderar. Los estados de contenido siguen un workflow: Borrador → En Revisión → Aprobado → Publicado → Archivado/Cancelado. Eventos incluyen estados adicionales (p. ej., “sold out” o “cancelado”). Las notificaciones se activan en cambios de estado y menciones.

Para dimensionar responsabilidades, la Tabla 9 establece la matriz Roles x Acciones. Esta tabla se implementa en el CMS como autorización basada en roles (RBAC).

Tabla 9. Matriz de Roles (DJ, Promotor, Clubber, Sello, Agencia) x Acciones

| Rol        | Crear | Editar (propios) | Publicar | Eliminar | Archivar | Moderar | Comentar | Reaccionar |
|------------|-------|------------------|----------|----------|----------|---------|----------|------------|
| DJ         | Sí    | Sí               | No       | No       | No       | No      | Sí       | Sí         |
| Promotor   | Sí    | Sí               | No (salvo pauta) | No | Sí (propios) | No | Sí | Sí |
| Clubber    | No    | No               | No       | No       | No       | No      | Sí       | Sí         |
| Sello      | Sí    | Sí               | No       | No       | No       | No      | Sí       | Sí         |
| Agencia    | Sí    | Sí               | No       | No       | No       | No      | Sí       | Sí         |
| Editor     | Sí    | Sí               | Sí       | Sí       | Sí       | Sí      | Sí       | Sí         |
| Revisor    | No    | Sí (sugerencias) | No       | No       | No       | Sí      | Sí       | Sí         |
| Admin      | Sí    | Sí               | Sí       | Sí       | Sí       | Sí      | Sí       | Sí         |
| Super Admin| Sí    | Sí               | Sí       | Sí       | Sí       | Sí      | Sí       | Sí         |

Nota: “Publicar” para DJs/Promotores/Sellos/Agencias solo aplica a ciertos módulos de alto nivel definidos por pauta comercial (ver Módulos comerciales). Moderar implica approve/reject de comentarios y reportes.

La Tabla 10 define el flujo de estados y transiciones. Este workflow evita saltos no autorizados y mantiene integridad editorial.

Tabla 10. Estados y transiciones (Borrador → En Revisión → Aprobado → Publicado → Archivado)

| Estado actual | Acción            | Rol permitido    | Estado siguiente | Reglas/Validaciones                                 |
|---------------|-------------------|------------------|------------------|-----------------------------------------------------|
| Borrador      | Enviar a revisión | Autor, Editor    | En Revisión      | Slug único, campos requeridos completos             |
| En Revisión   | Aprobar           | Revisor, Editor  | Aprobado         | Checklist de calidad,taxonomías asignadas           |
| Aprobado      | Publicar          | Editor, Admin    | Publicado        | Programación opcional, canónica definida            |
| Publicado     | Archivar          | Editor, Admin    | Archivado        | Mantiene URL histórica; redirección si aplica       |
| Cualquiera    | Cancelar          | Admin            | Cancelado        | Solo eventos; visibilidad reducida                  |
| Publicado     | Editar            | Autor, Editor    | Publicado (nueva versión) | Versionado con changelog                      |

Las reglas de publicación varían según entidad y rol. La Tabla 11 las resume.

Tabla 11. Reglas de publicación (quién puede publicar qué)

| Entidad      | Roles que pueden iniciar | Roles que pueden publicar | Observaciones                                                  |
|--------------|--------------------------|---------------------------|----------------------------------------------------------------|
| Noticia      | Redactor, Editor         | Editor, Admin             | Autor debe tener Perfil de Editor                             |
| Evento       | Promotor, Editor         | Editor, Admin             | Promotores crean borradores; publicación requiere revisión     |
| Lanzamiento  | Sello, Editor            | Editor, Admin             | Sello envía borrador; Editor valida buy_links                  |
| Video        | Editor, Agencia (si pauta), Perfil artista | Editor, Admin | Embebidos verificados; subtítulos recomendados                |
| Perfil       | Todos los actores        | Editor (para destacado), Admin | Cambios de tipo de perfil requieren aprobación               |

Interpretación: el esquema preserva la calidad editorial y evita abusos, delegando la aprobación final a Editor/Admin. El versionado asegura trazabilidad y protección contra pérdida de información.

## Sección Inicio

La página de Inicio es la puerta de entrada al descubrimiento. Debe presentar hero dinámico, destacados editoriales y de agenda, carruseles por taxonomías (géneros, ciudades, sellos), widgets de eventos próximos y novedades. La personalización por ubicación y preferencias (p. ej., “DJs que sigues”, “ciudad preferida”) aumenta relevancia. Módulos comerciales incluyen banners y content slots de alto impacto para sellos/agencias.

La Tabla 12 inventaría los bloques y su lógica. La combinación de módulos fijos (hero, destacados) y dinámicos (recomendaciones) equilibra estabilidad SEO y frescura.

Tabla 12. Inventario de bloques en Inicio

| Bloque                 | Descripción                                        | Fuente de datos                   | Criterios de prioridad                                |
|------------------------|----------------------------------------------------|-----------------------------------|-------------------------------------------------------|
| Hero                   | Carrusel de 3–5 piezas destacadas                 | Noticia, Evento, Lanzamiento      | Época, engagement, canónica                           |
| Destacados editoriales | 6–8 tarjetas de Noticias                          | Noticia                           | Novedad, autoridad, cobertura taxonomías              |
| Agenda destacada       | 6–8 Eventos próximos                              | Evento                            | Ciudad preferida, tickets disponibles, lineup         |
| Lanzamientos recientes | 6–8 Tarjetas de Lanzamientos                      | Lanzamiento                       | Fecha publicación, sello, artista                     |
| Carrusel por género    | Género/tema                                        | Noticia, Evento, Lanzamiento      | Interés del usuario, tendencia                        |
| Carrusel por ciudad    | Ciudad seleccionada                                | Evento                            | Geolocalización, proximidad                           |
| Carrusel sellos/agencias | Listados de sellos/agencias                      | Perfiles tipo Sello/Agencia       | Patrocinios, actividad reciente                       |
| Comercial A (leaderboard) | Banner 970x250                                   | Inventario comercial              | CPM, prioridad por campaña                            |
| Comercial B (MPU)      | Banner 300x250                                     | Inventario comercial              | CPM, rotación                                         |
| Newsletter             | Suscripción                                        | Formulario                        | Incentivo (playlist exclusiva)                        |

Análisis: la página de Inicio combina piezas evergreen (carruseles por taxonomías) con señales de fraîcheur (Lanzamientos recientes). El SEO se beneficia de enlaces internos contextuales desde estos bloques hacia secciones específicas.

### SEO de Inicio

La canónica de Inicio apunta a /. Meta title y description globales se revisan trimestralmente. Se incluyen enlaces internos principales a categorías y taxonomía de géneros/ciudades. Los datos estructurados para Inicio incluyen WebSite (con SearchAction si se habilita buscador), Organization y breadcrumb.

La Tabla 13 estandariza metadatos.

Tabla 13. Metadatos SEO para Inicio

| Campo         | Valor recomendado                         | Longitud     | Observaciones                             |
|---------------|-------------------------------------------|--------------|-------------------------------------------|
| Título        | Techno Experience Magazine                | ≤ 60 chars   | Marca y foco editorial                     |
| Description   | La cultura techno en noticias, eventos y lanzamientos | ≤ 155 chars | Incluye palabras clave principales         |
| Canonical     | /                                         | —            | Auto-referenciado                          |
| og:title      | Techno Experience Magazine                | —            | Coherente con title                        |
| og:description| Descubre la escena techno...              | —            | Coherente con meta description             |
| twitter:card  | summary_large_image                       | —            | Imagen hero por defecto                    |
| Schema        | WebSite, Organization, BreadcrumbList     | —            | SearchAction opcional                      |

Interpretación: la página de Inicio, por su naturaleza generalista, requiere metadatos concisos y estables. La capa de datos estructurados refuerza la entidad “site” y habilita resultados enriquecidos en buscadores.

## Sección Noticias

La sección Noticias agrupa formatos: news, reseñas, críticas, entrevistas, reportajes y breves. La estructura del artículo incluye cabecera (título, autor, fecha), taxonomías (categoría, tags, género musical), resumen SEO, galería multimedia, mixto de bloques de texto, citas y embebidos. Se requiere versionado de contenido y opciones de corrección. El diseño debe favorecer imágenes optimizadas y un excerpt claro que pueda usarse en listados.

La Tabla 14 define campos del tipo de contenido Noticia.

Tabla 14. Campos del tipo de contenido Noticia

| Campo                  | Tipo         | Req | Validaciones/Notas                                  |
|------------------------|--------------|-----|-----------------------------------------------------|
| Título                 | String       | S   | 2–120 chars                                         |
| Slug                   | Slug         | S   | Único; patrón con fecha opcional                    |
| Autor                  | UUID         | S   | FK → Perfil (tipo Redactor/Editor)                  |
| Fecha de publicación   | Datetime TZ  | S   | ISO 8601; programable                               |
| Categoría              | UUID         | S   | FK → Categoría                                      |
| Tags                   | Array<UUID>  | O   | FK → Tag                                            |
| Género/Subgénero       | UUID         | O   | FK → Taxonomía específica                           |
| Resumen SEO            | String       | O   | 140–160 chars                                       |
| Imagen destacada       | UUID         | O   | FK → MediaAsset.id; alt_text obligatorio            |
| Cuerpo                 | Rich Text    | S   | Bloques: párrafo, cita, galería, embed, mix         |
| Galería                | Array<UUID>  | O   | FK → MediaAsset.id (imágenes)                       |
| Embebidos (Video/Mix)  | Array<UUID>  | O   | FK → Video.id                                       |
| Estado                 | Enum         | S   | borrador, en revisión, aprobado, publicado, archivado |
| Notas de corrección    | Rich Text    | O   | Registro de cambios                                 |
| Enlaces internos       | Array<UUID>  | O   | FK → Evento/Lanzamiento/Video                       |
| Créditos               | String       | O   | Agradecimientos, fuentes                            |

Análisis: la separación de resumen SEO y cuerpo facilita snippets limpios. El control de enlaces internos es clave para SEO y navegación contextual; se recomienda un recomendador de enlaces basado en taxonomías.

La Tabla 15 mapea datos estructurados de artículos.

Tabla 15. Mapeo de datos estructurados para Artículo/NewsArticle

| Propiedad       | Fuente                             | Notas                                      |
|-----------------|------------------------------------|--------------------------------------------|
| headline        | Noticia.título                     | Coincide con H1                            |
| author          | Perfil.autor.nombre_display        | Person                                    |
| datePublished   | Noticia.fecha_publicacion          | ISO 8601                                   |
| dateModified    | Noticia.última_modificación        | Versionado                                |
| image           | MediaAsset.url_storage             | Mínimo 1200x630                            |
| articleSection  | Categoría.nombre                   | —                                          |
| keywords        | Tags.nombres                        | Coma-separated                            |
| mainEntityOfPage| Noticia.canonical                   | URL canónica                               |

Interpretación: NewsArticle habilita elegibilidad para resultados enriquecidos de noticias. El uso correcto de author, fechas e imágenes mejora la credibilidad y CTR.

### Taxonomías y etiquetas en Noticias

Las categorías editoriales se muestran en la Tabla 16. Se define una profundidad máxima de dos niveles para evitar complejidad excesiva.

Tabla 16. Lista de Categorías y Subcategorías (con ejemplos de slugs)

| Categoría   | Subcategoría | Slug                         | Ejemplo de uso                                    |
|-------------|--------------|------------------------------|---------------------------------------------------|
| Noticias    | Breves       | noticias/breves              | Anuncio de próxima fecha                          |
| Noticias    | Entrevistas  | noticias/entrevistas         | Perfil de artista/sello                           |
| Noticias    | Reseñas      | noticias/resenas             | Lanzamiento de single                             |
| Noticias    | Críticas     | noticias/criticas            | Opinion sobre festival                            |
| Eventos     | Fiesta       | eventos/fiesta               | Club night                                        |
| Eventos     | Festival     | eventos/festival             | Festival multi-día                                |
| Eventos     | Showcase     | eventos/showcase             | Presentación de sello                             |
| Lanzamientos| Dico         | lanzamientos/dico            | Álbum de artista                                  |
| Lanzamientos| Single       | lanzamientos/single          | Nuevo tema                                        |
| Lanzamientos| EP           | lanzamientos/ep              | 3–6 pistas                                        |
| Lanzamientos| Remixes      | lanzamientos/remixes         | Reinterpretaciones                                |
| Videos      | Clip oficial | videos/clip-oficial          | videoclip                                         |
| Videos      | Live         | videos/live                  | Grabación en venue                                |
| Videos      | AFTERMOVIE   | videos/aftermovie            | Recap de evento                                   |

La asignación de tags evita duplicidades y spam. La Tabla 17 resume reglas.

Tabla 17. Reglas de asignación de Tags (máx. por artículo, listas bloqueadas, sinónimos)

| Regla                         | Valor recomendado          | Razón                                         |
|------------------------------|----------------------------|-----------------------------------------------|
| Máx. tags por noticia        | 8                          | Precisión y evitar ruido                      |
| Listas bloqueadas            | Sí                         | Prevenir spam                                 |
| Sinónimos                    | Mapeo manual               | Unificar variantes (“hardtechno” vs “hard techno”) |
| Frecuencia mínima            | ≥3 usos                    | Mantener vocabulario útil                     |

Interpretación: categorías y tags se usan en carruseles y listados. Los tags, por su naturaleza libre, requieren curaduría y normalización.

## Sección Eventos

La sección Eventos es el corazón de la agenda. Debe incluir título del evento, fechas y horarios, lineup, venue y ubicación, organizadores, tipo (fiesta, festival, showcase), etiquetas, imágenes y descripción. Funcionalidades clave: búsqueda por ciudad/fecha/género, filtros, tickets (URLs de compra) y estados (borrador, publicado, cancelado, postergado). La indexación debe priorizar eventos próximos; eventos pasados se archivan con schema Event para preservación.

La Tabla 18 define el esquema de Evento.

Tabla 18. Esquema del contenido Eventos

| Campo                  | Tipo           | Req | Validaciones/Notas                                      |
|------------------------|----------------|-----|---------------------------------------------------------|
| Título                 | String         | S   | 2–120 chars                                             |
| Slug                   | Slug           | S   | Único                                                   |
| Fecha inicio           | Datetime TZ    | S   | ISO 8601                                                |
| Fecha fin              | Datetime TZ    | O   | ≥ fecha inicio                                          |
| Ciudad                 | UUID           | S   | FK → Ciudad.id                                          |
| Venue                  | UUID           | S   | FK → Venue.id                                           |
| Tipo                   | Enum           | S   | fiesta, festival, showcase                              |
| Lineup (artistas)      | Array<UUID>    | O   | FK → Perfiles tipo Artista                              |
| Labels                 | Array<UUID>    | O   | FK → Perfiles tipo Sello                                |
| Agencias               | Array<UUID>    | O   | FK → Perfiles tipo Agencia                              |
| Descripción            | Rich Text      | S   | —                                                       |
| Imágenes               | Array<UUID>    | O   | FK → MediaAsset.id                                      |
| Tickets (URLs)         | Array<URL>     | O   | Dominios verificados                                    |
| Estados                | Enum           | S   | borrador, pendiente, publicado, cancelado, postergado   |
| FAQs                   | JSON           | O   | Preguntas frecuentes                                    |
| Capacidad              | Integer        | O   | ≥0; para schema                                         |
| Precios (mín/máx)      | Integer        | O   | Para schema Offer                                       |

Interpretación: la combinación de fechas, ciudad y venue habilita filtrado por ubicación. La integración de labels/agencias apoya descubrimiento cruzado y oportunidades comerciales.

La Tabla 19 define propiedades schema Event y su mapeo.

Tabla 19. Propiedades schema Event y mapeo

| Propiedad        | Fuente                          | Notas                                         |
|------------------|----------------------------------|-----------------------------------------------|
| name             | Evento.título                    | —                                             |
| startDate        | Evento.fecha_inicio              | ISO 8601                                      |
| endDate          | Evento.fecha_fin                 | ISO 8601                                      |
| eventStatus      | Evento.estados                   | Enum (p. ej., “EventCancelled”)               |
| eventAttendanceMode | Evento.tipo                   | offline/online/mixed (según datos)            |
| location         | Venue + Ciudad                   | Place schema                                  |
| performer        | Lineup (Perfiles tipo Artista)   | Person/Organization                           |
| organizer        | Perfiles tipo Promotor           | Organization                                  |
| offers           | Tickets URLs                     | Offer/Price/PriceCurrency                     |
| image            | MediaAsset.url_storage           | Imagen principal                              |
| description      | Evento.descripción               | Extracto                                      |

La búsqueda y filtros son determinantes para UX. La Tabla 20 define índices para performance.

Tabla 20. Definición de filtros de búsqueda e índices

| Filtro           | Campo indexado             | Tipo índice | Consideraciones                            |
|------------------|----------------------------|------------|--------------------------------------------|
| Ciudad           | evento.ciudad_id           | B-Tree     | Alta selectividad                          |
| Fecha (rango)    | evento.fecha_inicio        | B-Tree     | Rangos optimizados                         |
| Género/Tag       | evento_tag.tag_id          | Índice compuesto | Unión con evento_tag                  |
| Venue            | evento.venue_id            | B-Tree     | Alta cardinalidad                          |
| Tipo             | evento.tipo                | B-Tree     | Pocos valores                              |
| Estado           | evento.estado              | B-Tree     | Publicado priorizado                       |

Interpretación: índices simples y compuestos soportan las consultas principales. La estrategia de indexación se revisa trimestralmente según logs de consultas.

### Lineup y relaciones

El lineup se gestiona como lista de artistas (FK a Perfiles tipo Artista) con orden y roles (headliner, support). Un artista puede estar vinculado a su Perfil público. La Tabla 21 define el modelo.

Tabla 21. Modelo de lineup (artistas, orden, roles)

| Campo           | Tipo       | Req | Notas                                      |
|-----------------|------------|-----|--------------------------------------------|
| evento_id       | UUID       | S   | FK → Evento.id                             |
| artista_perfil_id| UUID      | S   | FK → Perfil.id (tipo Artista)              |
| orden           | Integer    | S   | 1..N (headliner primero)                   |
| rol             | String     | O   | headliner, support, guest                  |
| notas           | String     | O   | —                                          |

Análisis: la normalización de lineup simplifica agregaciones (“próximos de este artista”), generación de páginas de artista y enlaces contextuales en noticias.

### Eventos recurrentes y series

Se admite relacional “serie” para eventos recurrentes con patrón: RecurringEvent + exceptions. La Tabla 22 define el esquema.

Tabla 22. Esquema de serie de eventos (recurrence_id, patrón, excepciones)

| Campo          | Tipo      | Req | Validaciones/Notas                           |
|----------------|-----------|-----|----------------------------------------------|
| serie_id       | UUID      | S   | PK                                           |
| nombre         | String    | S   | 2–80 chars                                   |
| patrón         | String    | S   | RFC 5545 (RRULE)                             |
| excepciones    | JSON      | O   | Fechas excluidas y sustituciones             |
| instancia_base | UUID      | S   | FK → Evento.id (plantilla)                   |
| timezone       | String    | S   | Zona estándar                                |

Interpretación: las series reducen duplicidad y mantienen coherencia SEO. La página de serie agrupa sus instancias y mejora navegación.

## Sección Lanzamientos de DJs

Los lanzamientos abarcan dicos, singles, EPs y remixes. Contienen título, artista(s), sello, fecha, portada, tracklist y créditos, enlaces de compra (streaming y tiendas), y soporte de múltiples artistas (featurings). La vinculación con eventos (p. ej., showcase de sello en una fecha) amplía contexto y descubrimiento.

La Tabla 23 define el esquema de Lanzamiento.

Tabla 23. Esquema de Lanzamiento (campos, FKs, validaciones)

| Campo                 | Tipo         | Req | Validaciones/Notas                                     |
|-----------------------|--------------|-----|--------------------------------------------------------|
| Título                | String       | S   | 2–120 chars                                            |
| Slug                  | Slug         | S   | Único                                                  |
| Tipo                  | Enum         | S   | dico, single, EP, remixes                              |
| Fecha publicación     | Date         | S   | ISO 8601                                               |
| Label                 | UUID         | S   | FK → Perfiles tipo Sello                               |
| Artistas              | Array<UUID>  | O   | FK → Perfiles tipo Artista                             |
| Portada               | UUID         | O   | FK → MediaAsset.id; alt_text obligatorio               |
| Buy Links             | Array<URL>   | O   | Dominios verificados                                   |
| Créditos              | Rich Text    | O   | Producción, masterización, artwork                     |
| Estado                | Enum         | S   | borrador, pendiente, publicado, archivado              |

Análisis: la estandarización de Buy Links habilita módulos comerciales y widgets de streaming. Créditos refuerzan autoridad y relación con sellos/agencias.

La Tabla 24 mapea propiedades schema de MusicRelease/ArtistRelease.

Tabla 24. Propiedades schema MusicRelease/ArtistRelease

| Propiedad        | Fuente                         | Notas                                          |
|------------------|---------------------------------|-----------------------------------------------|
| name             | Lanzamiento.titulo              | Coincide con título                            |
| by               | Artistas (Perfiles)             | Person/Organization                            |
| datePublished    | Lanzamiento.fecha_publicacion   | ISO 8601                                       |
| image            | MediaAsset.url_storage          | Portada                                        |
| recordLabel      | Label.nombre                    | Organization                                   |
| url              | Lanzamiento.canonical           | —                                              |

La Tabla 25 define el esquema de Track (detalle de pistas).

Tabla 25. Esquema Track (título, duración, remix, ISRC opcional)

| Campo            | Tipo      | Req | Validaciones/Notas                 |
|------------------|-----------|-----|------------------------------------|
| lanzamiento_id   | UUID      | S   | FK → Lanzamiento.id                |
| título           | String    | S   | 2–120 chars                        |
| duración_seg     | Integer   | O   | ≥0                                 |
| remix            | String    | O   | Si aplica                           |
| isrc             | String    | O   | Patrón ISRC                         |
| track_number     | Integer   | S   | 1..N                               |

### Múltiples artistas y variantes

Los lanzamientos con múltiples artistas (featurings) y versiones (remixes, radio edit) requieren manejo explícito. La Tabla 26 define ArtistRelease y variante.

Tabla 26. Esquema ArtistRelease (rol, orden) y variantes

| Campo        | Tipo      | Req | Validaciones/Notas                            |
|--------------|-----------|-----|-----------------------------------------------|
| lanzamiento_id| UUID     | S   | FK → Lanzamiento.id                           |
| artista_id   | UUID      | S   | FK → Perfiles tipo Artista                    |
| rol          | String    | O   | main, featured, remix                         |
| orden        | Integer   | O   | 1..N                                          |

Interpretación: variantes se modelan como lanzamientos distintos enlazados por “variante_de” cuando sea útil para SEO. Los remixes mantienen créditos y roles explícitos.

### Enlaces de compra y distribución

Los buy links incluyen plataformas de streaming y tiendas. La Tabla 27 define una lista sugerida.

Tabla 27. Lista de buy links y campos requeridos

| Plataforma | Campo URL | Verificación | Notas                               |
|------------|-----------|--------------|-------------------------------------|
| Spotify    | url       | Dominio      | Previsualizar player                 |
| Apple Music| url       | Dominio      | —                                   |
| Beatport   | url       | Dominio      | Tienda específica                    |
| Bandcamp   | url       | Dominio      | —                                   |
| SoundCloud | url       | Dominio      | Limitado a previews                  |

Interpretación: la verificación de dominios evita enlaces maliciosos. Los embebidos deben respetar políticas de terceros.

## Sección Videos

Los videos pueden ser oficiales, lives o aftermovies. La integración se realiza vía embeds (Mux, Vimeo, YouTube) y soporta subtítulos (WebVTT), capítulos y miniaturas personalizadas. La taxonomía incluye género/tema, evento asociado y sello/artista. La publicación puede ser pública o no listada, y se programa.

La Tabla 28 define el esquema de Video.

Tabla 28. Esquema Video (provider, video_id, subtítulos, capítulos)

| Campo          | Tipo        | Req | Validaciones/Notas                          |
|----------------|-------------|-----|---------------------------------------------|
| Título         | String      | S   | 2–120 chars                                 |
| Slug           | Slug        | S   | Único                                       |
| Provider       | Enum        | S   | mux, vimeo, youtube                         |
| video_id       | String      | S   | ID del provider                             |
| Duración       | Integer     | O   | Segundos                                    |
| Subtítulos     | Array<URL>  | O   | WebVTT                                      |
| Capítulos      | JSON        | O   | [{inicio, título}]                          |
| Miniatura      | UUID        | O   | FK → MediaAsset.id                          |
| Estado         | Enum        | S   | borrador, pendiente, publicado, archivado   |
| Taxonomías     | Array<UUID> | O   | Genre, Evento, Artista, Sello               |

La Tabla 29 mapea VideoObject con sus propiedades.

Tabla 29. Propiedades schema VideoObject

| Propiedad     | Fuente            | Notas                                        |
|---------------|-------------------|----------------------------------------------|
| name          | Video.título      | Coincide con título                          |
| description   | Video.descripción | —                                            |
| thumbnailUrl  | MediaAsset.url    | Miniatura                                    |
| uploadDate    | Video.fecha       | ISO 8601                                     |
| duration      | Video.duración    | ISO 8601 PT#H#M#S                            |
| embedUrl      | Provider embed    | —                                            |
| interactionStatistic | Módulo interno | Views, likes                              |
| partOfSeason  | Opcional          | Si aplica                                    |

### Gestión de derechos y embebidos

La plataforma debe respetar derechos de autor, privacidad y políticas de embed. La Tabla 30 define estados de visibilidad.

Tabla 30. Estados de visibilidad y reglas de embed

| Estado       | Regla                                | Notas                                 |
|--------------|--------------------------------------|----------------------------------------|
| Público      | Indexable y embebible                | Sitemap de videos                     |
| No listado   | Embebible, no indexable              | Compartir directo                      |
| Privado      | Solo autenticado                     | Sin embed público                      |

Interpretación: el estado “no listado” permite difusión controlada sin competir en buscadores. “Privado” para contenidos exclusivos de comunidad.

## Sección Perfiles de usuario

Los perfiles soportan cinco tipos: DJ, Promotor, Clubber, Sello y Agencia. Cada tipo tiene campos específicos y públicos: biografías, discografías, agenda, habilidades, redes sociales, mixes y logros. La privacidad se controla mediante preferencias de perfil. La moderación previene usurpación de identidad. La vinculación con eventos, lanzamientos y videos es clave para autoridad.

La Tabla 31 define metadatos por tipo de perfil.

Tabla 31. Metadatos por tipo de perfil

| Tipo     | Campos específicos                                                                                       |
|----------|-----------------------------------------------------------------------------------------------------------|
| DJ       | Alias, géneros, equipamiento, discografía, mixes, reseñas, eventos de performance                         |
| Promotor | Empresa, eventos organizados, ciudades activas, equipo, portfolio                                          |
| Sello    | Catálogo, artistas firmados, lanzamientos, Buy Links, ubicación                                            |
| Agencia  | Artistas representados, servicios (booking, PR), ciudades y contactos                                     |
| Clubber  | Intereses (géneros, venues), eventos asistidos, listas, seguidos                                          |

Interpretación: cada perfil concentra señales que alimentan listados y carruseles. El cruce con eventos y lanzamientos crea una red de descubrimiento rica.

La Tabla 32 define el esquema de relaciones de seguimiento.

Tabla 32. Esquema de relaciones (seguir, gustar, reseñar)

| Relación          | Campos                      | Notas                                     |
|-------------------|-----------------------------|-------------------------------------------|
| Seguir            | seguido_id, seguidor_id     | N:N; unicidad por par                     |
| Favorito          | usuario_id, entidad_id      | Entidad: Evento/Lanzamiento/Video         |
| Reseña            | autor_id, entidad_id, texto, rating | Rating 1–5; moderación previa |

Privacidad: Clubber puede limitar visibilidad y desactivar índice público. Sellos y Agencias requieren validación (p. ej., verificación de dominio o documento) para badge de confianza.

### Tipos de perfil y campos específicos

La Tabla 33 detalla campos por tipo.

Tabla 33. Campos específicos por tipo (DJ, Promotor, Sello, Agencia, Clubber)

| Tipo     | Campo             | Tipo         | Req | Validaciones/Notas                          |
|----------|-------------------|--------------|-----|---------------------------------------------|
| DJ       | alias             | String       | S   | 2–40 chars                                  |
|          | géneros           | Array<UUID>  | O   | FK → Tag (géneros)                          |
|          | equipamiento      | Rich Text    | O   | 0–500 chars                                 |
|          | mixes             | Array<UUID>  | O   | FK → Video/MediaAsset.audio                 |
| Promotor | empresa           | String       | S   | 2–80 chars                                  |
|          | eventos organizados| Array<UUID> | O   | FK → Evento.id                              |
| Sello    | catálogo          | Array<UUID>  | O   | FK → Lanzamiento.id                         |
|          | artistas_firmados | Array<UUID>  | O   | FK → Perfiles tipo Artista                  |
| Agencia  | artistas_representados| Array<UUID> | O | FK → Perfiles tipo Artista                  |
|          | servicios         | Array<String>| O   | booking, pr, management                      |
| Clubber  | intereses         | Array<UUID>  | O   | FK → Tag/Genre                              |
|          | eventos_asistidos | Array<UUID>  | O   | FK → Evento.id                              |

### Señales sociales y reputación

Las señales sociales incrementan autoridad y descubrimiento. La Tabla 34 define un cuadro de métricas.

Tabla 34. Métricas de interacción (follows, likes, comentarios, reseñas)

| Métrica             | Descripción                         | Uso                                           |
|---------------------|-------------------------------------|-----------------------------------------------|
| Follows             | Número de seguidores                | Carruseles “DJs que sigues”                   |
| Likes               | Reacciones por entidad              | Ranking de relevancia                         |
| Comentarios         | Comentarios moderados               | Conversación y señal de calidad               |
| Reseñas             | Reseñas con rating                  | Prueba social en lanzamientos                 |

Interpretación: las señales deben pesarse en recomendadores para evitar spam y burbujas. La moderación de reseñas protege integridad.

## CMS: diseño editorial y operativo

El CMS orquesta tipos de contenido, taxonomías, relaciones, workflows y permisos. Debe ofrecer formularios con validaciones, estados, versionado y auditoría, así como respaldo y recuperación. Funcionalidades como importación/exportación y programación (publicación futura) son imprescindibles. La moderación de contenido generado por usuarios (UGC) controla comentarios y reportes.

La Tabla 35 inventaría tipos de contenido y sus campos clave.

Tabla 35. Inventario de tipos de contenido y campos clave

| Tipo           | Campos clave                                                                              |
|----------------|-------------------------------------------------------------------------------------------|
| Noticia        | título, slug, autor, fecha, categoría, tags, resumen, cuerpo, galería, embebidos, estado |
| Evento         | título, slug, fechas, ciudad, venue, lineup, tipo, tickets, estado                        |
| Lanzamiento    | título, slug, tipo, fecha, label, artistas, portada, buy links, créditos, estado         |
| Track          | lanzamiento_id, título, duración, remix, isrc, track_number                              |
| Video          | título, slug, provider, video_id, subtítulos, capítulos, estado                          |
| Perfil         | usuario_id, tipo, nombre_display, bio, avatar, links, ciudad_preferida                   |
| Tag            | nombre, slug                                                                              |
| Categoría      | nombre, slug, parent_id                                                                   |
| MediaAsset     | tipo, url_storage, alt_text                                                               |

La Tabla 36 detalla el flujo editorial con roles, estados y validaciones.

Tabla 36. Flujo editorial: estados y validaciones

| Estado         | Validaciones                               | Acción siguiente   | Roles               |
|----------------|--------------------------------------------|--------------------|---------------------|
| Borrador       | Slug, campos requeridos                    | En Revisión        | Autor, Editor       |
| En Revisión    | Checklist de calidad, taxonomías           | Aprobado           | Revisor, Editor     |
| Aprobado       | Programación                               | Publicado          | Editor, Admin       |
| Publicado      | Canónica, schema                           | Archivado          | Editor, Admin       |
| Archivado      | —                                          | —                  | Editor, Admin       |

La Tabla 37 establece la matriz de permisos.

Tabla 37. Matriz de permisos por rol y entidad

| Rol        | Entidad     | Acciones permitidas                                      |
|------------|-------------|-----------------------------------------------------------|
| DJ         | Perfil      | Crear, editar (propios), enviar a revisión               |
| Promotor   | Evento      | Crear, editar (propios), enviar a revisión               |
| Sello      | Lanzamiento | Crear, editar (propios), enviar a revisión               |
| Clubber    | Comentario  | Crear, editar (propios 15 min), reportar                 |
| Editor     | Noticia/Event/Lanzamiento/Video | Publicar, editar, archivar, moderar          |
| Revisor    | Noticia/Video | Sugerir cambios, aprobar/rechazar                     |
| Admin      | Todas       | Publicar, eliminar, gestionar permisos, respaldos        |
| Super Admin| Todas       | Configuración, roles, auditoría                          |

Interpretación: el CMS prioriza la integridad editorial y reduce riesgos mediante validaciones y permisos explícitos.

### Taxonomías en CMS

El CMS debe gestionar categorías, tags, géneros/ciudades/estilos. La Tabla 38 define la jerarquía y reglas de uso.

Tabla 38. Jerarquía y reglas de uso de taxonomías

| Taxonomía   | Estructura    | Reglas de uso                                           |
|-------------|---------------|----------------------------------------------------------|
| Categoría   | Jerárquica    | Máx. 2–3 niveles; slugs únicos                          |
| Tag         | Plana         | Frecuencia mínima; sinónimos mapeados                   |
| Género/Sub  | Plana/jerárquica | Basado en escena techno; control editorial              |
| Ciudad/País | Plana         | ISO country_code recomendado                            |

### Workflow y moderación

El workflow se detalla en la Tabla 39.

Tabla 39. Diagrama de estados (texto) y reglas

| Desde        | Acción        | A           | Reglas                                          |
|--------------|---------------|-------------|-------------------------------------------------|
| Borrador     | Enviar        | En Revisión | Checklist base                                  |
| En Revisión  | Aprobar       | Aprobado    | Revisor/Editor; notas de revisión               |
| Aprobado     | Publicar      | Publicado   | Programación; canónica; schema                  |
| Publicado    | Archivar      | Archivado   | Mantiene URL; indexación removida               |
| Cualquiera   | Rechazar      | Borrador    | Comentarios obligatorios                        |

Moderación de UGC: comentarios y reportes requieren ventana de edición, aprobación y bloqueo de usuarios.

### Permisos

La Tabla 40 profundiza en permisos por acción.

Tabla 40. Permisos por rol (crear, editar, publicar, eliminar, moderar)

| Rol       | Crear | Editar | Publicar | Eliminar | Moderar |
|-----------|-------|--------|----------|----------|---------|
| DJ        | Sí    | Sí     | No       | No       | No      |
| Promotor  | Sí    | Sí     | No       | Sí (propios) | No  |
| Sello     | Sí    | Sí     | No       | No       | No      |
| Agencia   | Sí    | Sí     | No       | No       | No      |
| Clubber   | No    | No     | No       | No       | No      |
| Editor    | Sí    | Sí     | Sí       | Sí       | Sí      |
| Revisor   | No    | Sí (sugerir) | No   | No       | Sí      |
| Admin     | Sí    | Sí     | Sí       | Sí       | Sí      |
| Super Admin| Sí   | Sí     | Sí       | Sí       | Sí      |

Interpretación: el modelo evita que perfiles no editoriales publiquen sin revisión, manteniendo calidad y coherencia del sitio.

## SEO transversal y rendimiento orgánico

Las pautas de resumen SEO (excerpts) son esenciales: máximo 155 caracteres, con llamadas a la acción orientadas al clic, evitando keyword stuffing. Las imágenes deben tener alt text descriptivo y tamaños optimizados (responsive, WebP/AVIF), y los videos incluir subtítulos para accesibilidad y SEO (transcripciones). El enlazado interno se organiza con bloques “Relacionados” por taxonomía, entidad y comportamiento.

La Tabla 41 define una checklist SEO transversal.

Tabla 41. Checklist SEO por tipo de contenido

| Tipo        | Slug | Title | Description | Canonical | Schema | Enlaces internos |
|-------------|------|-------|-------------|-----------|--------|------------------|
| Noticia     | Sí   | Sí    | Sí          | Sí        | Sí     | Sí               |
| Evento      | Sí   | Sí    | Sí          | Sí        | Sí     | Sí               |
| Lanzamiento | Sí   | Sí    | Sí          | Sí        | Sí     | Sí               |
| Video       | Sí   | Sí    | Sí          | Sí        | Sí     | Sí               |
| Perfil      | Sí   | Sí    | Sí          | Sí        | Sí     | Sí               |

Interpretación: la checklist se automatiza en el CMS con validadores y banners de calidad antes de publicar.

Sitemaps y robots: se generan sitemaps por secciones (/sitemap.xml), con prioridad ajustada a calendario editorial. Robots.txt permite o bloquea indexación de páginas internas de baja utilidad (p. ej., perfiles privados de clubbers).

### Internacionalización y multilingüe (opcional)

Si se habilita soporte multiidioma, se mantienen versiones de contenido con hreflang, traducciones de metadatos (título, descripción) y slugs localizados. La Tabla 42 define campos por idioma.

Tabla 42. Campos de contenido por idioma

| Campo            | Tipo    | Req | Notas                               |
|------------------|---------|-----|-------------------------------------|
| títuloLocalized  | String  | O   | Por idioma                          |
| slugLocalized    | Slug    | O   | Único por idioma                    |
| descriptionLocalized | String | O | Localizada                          |
| cuerpoLocalized  | Rich Text | O | Bloques traducidos                  |

Interpretación: slugs localizados mejoran relevancia local. Hreflang evita canónicas conflictivas entre idiomas.

## Módulos comerciales y monetización

Los formatos comerciales incluyen banners (leaderboard, MPU), contenido patrocinado (artículos, eventos destacados), listados de sellos/agencias con highlights y módulos “Agenda de...” con prioridad de posicionamiento. La gestión de inventario comercial define espacios y reglas de prioridad por campaña.

La Tabla 43 inventaría espacios comerciales.

Tabla 43. Inventario de espacios comerciales

| Espacio         | Tamaño        | Prioridad | Condiciones                       |
|-----------------|---------------|-----------|-----------------------------------|
| Inicio Leaderboard | 970x250     | Alta      | CPM; rotación por sesiones        |
| Inicio MPU      | 300x250       | Media     | CPM; CTR mínimo                   |
| Noticias Skins  | Skin adaptativo| Alta     | Acuerdos puntuales                |
| Agenda Destacados | Card especial | Alta     | Campañas de eventos               |
| Perfiles Sello/Agencia | Card | Media     | Patrocinios mensuales             |

Interpretación: los módulos en Inicio y Agenda tienen alto impacto; skins requieren cuidado de rendimiento y accesibilidad.

La Tabla 44 define targeting por espacio.

Tabla 44. Reglas de targeting por espacio

| Espacio        | Segmentación              | Triggers                      | Limitaciones                        |
|----------------|---------------------------|-------------------------------|-------------------------------------|
| Inicio Leaderboard | Género, ciudad          | Geolocalización, interés      | Máx. impresiones por usuario/día    |
| Agenda Destacados | Tipo de evento, sello    | Evento próximo, tickets       | No competir con eventos propios     |
| Perfiles Sello   | Sector, género          | Actividad reciente            | Máximo por mes                       |

Las métricas de rendimiento se definen en la Tabla 45.

Tabla 45. Métricas de rendimiento por módulo

| Métrica     | Descripción                            | Uso                                     |
|-------------|----------------------------------------|-----------------------------------------|
| Impresiones | Cargas del módulo                      | Alcance                                |
| CTR         | Clics/Impresiones                      | Efectividad creativa                    |
| Tiempo en página | Dwell time en landing             | Calidad de tráfico                     |
| Leads       | Formularios completados                | Valor comercial                         |

### Inventario y targeting

La Tabla 46 define políticas de rotación y exclusividades.

Tabla 46. Políticas de rotación, exclusividades y límites por usuario

| Política            | Valor                          | Razón                                   |
|---------------------|--------------------------------|-----------------------------------------|
| Rotación leaderboard| Session-based                  | Evitar fatiga                           |
| Exclusividad        | Sector-género por periodo      | Evitar conflicto de marca               |
| Límite por usuario  | 10 impresiones/día de MPU      | UX y rendimiento                        |

Interpretación: equilibrar inventario y UX protege engagement sin sacrificar monetización.

## Eventos: relaciones y estados avanzados

Profundizando en la gestión de eventos, el diseño debe contemplar series y excepciones, cambios de fecha y venue, así como políticas de visibilidad para entradas agotadas o eventos cancelados. La indexación prioriza eventos futuros; los pasados conservan schema pero reducen visibilidad.

La Tabla 47 define reglas de cambios y versiones.

Tabla 47. Reglas para cambios de fecha/venue y versionado

| Cambio           | Acción                  | Regla                                   | SEO                                     |
|------------------|-------------------------|-----------------------------------------|------------------------------------------|
| Cambio de fecha  | Nueva versión           | No reusar slug; append de versión       | Redirección 301 a nueva instancia        |
| Cambio de venue  | Nueva versión           | Actualizar location schema              | Actualizar canónica                      |
| Cancelación      | Estado “cancelado”      | Reducir visibilidad; nota obligatoria   | Mantener histórico                       |
| Postergación     | Estado “postergado”     | Nueva fecha obligatoria                 | Igual que cambio de fecha                |

Interpretación: la política de “no reusar slugs” evita canónicas conflictivas y pérdida de señales.

La Tabla 48 define visibilidad por estado.

Tabla 48. Estados de visibilidad de eventos y reglas de indexación

| Estado         | Visibilidad           | Indexación | Notas                                  |
|----------------|-----------------------|-----------|-----------------------------------------|
| Publicado      | Completa              | Sí        | Sitemap actualizado                     |
| Postergado     | Reducida              | Sí        | Nota de nueva fecha                     |
| Cancelado      | Muy reducida          | No        | Mensaje y posibles referencias          |
| Borrador       | Solo autores          | No        | —                                       |

Interpretación: la indexación selectiva mejora experiencia de usuario y evita frustración por eventos no disponibles.

## Casos de uso y journeys

Los journeys típicos incluyen: publicar un evento (Promotor), subir un lanzamiento (Sello), crear un perfil (DJ/Agencia) y cubrir una noticia (Editor). Estos flujos deben ser claros, con validadores y pasos mínimos.

La Tabla 49 detalla pasos por caso de uso.

Tabla 49. Diagrama de pasos por caso de uso

| Caso de uso           | Pasos principales                                                        |
|-----------------------|--------------------------------------------------------------------------|
| Publicar Evento       | Crear borrador → Completar campos → Enviar a revisión → Aprobado → Publicado |
| Subir Lanzamiento     | Crear borrador → Añadir tracks → Añadir buy links → Revisión → Publicado     |
| Crear Perfil (DJ)     | Completar datos → Verificar identidad → Habilitar público                  |
| Cubrir Noticia        | Redactar → Asignar taxonomías → Revisión → Publicado                        |

Interpretación: reducir fricción en creación y revisión acelera producción de contenido.

## Riesgos y mitigaciones

Riesgos principales: contenido duplicado (p. ej., reusar slugs), SEO canónico conflictivo, abuso de etiquetas, permisos excesivos y problemas de accesibilidad (imágenes sin alt, videos sin subtítulos). La mitigación se basa en validadores de slugs, checklist SEO, moderación, revisión de roles y auditorías de accesibilidad.

La Tabla 50 inventaría riesgos y respuestas.

Tabla 50. Registro de riesgos y respuestas

| Riesgo                    | Impacto       | Probabilidad | Mitigación                                           |
|--------------------------|---------------|--------------|------------------------------------------------------|
| Duplicado de slugs       | Alto          | Media        | Unicidad en CMS; validadores de slugs                |
| Canónicas conflictivas   | Alto          | Media        | Reglas de canónica; auditorías SEO                   |
| Abuso de tags            | Medio         | Alta         | Frecuencia mínima; listas bloqueadas                 |
| Permisos excesivos       | Alto          | Baja         | RBAC; revisión trimestral de roles                   |
| Accesibilidad deficiente | Alto          | Media        | Alt obligatorio; subtítulos; auditorías              |

Interpretación: la prevención reduce costos de retrabajo y protege reputación y tráfico orgánico.

## Métricas y KPIs

Los KPIs se alinean con objetivos de comunidad, contenidos y negocio. Se miden engagement (tiempo en página, scroll depth, CTR de enlaces internos), alcance orgánico (impresiones y clicks en buscadores), producción editorial (tiempos de producción, tasa de publicación vs borrador) y rendimiento de módulos comerciales (CTR, conversiones). La instrumentación incluye eventos en frontend, logs en CMS y paneles.

La Tabla 51 define KPIs por sección.

Tabla 51. KPIs por sección (objetivos y umbrales)

| Sección       | KPI                     | Objetivo/Umbral               |
|---------------|-------------------------|-------------------------------|
| Inicio        | CTR carruseles          | ≥ 3%                          |
| Noticias      | Tiempo en página        | ≥ 2:30 min                    |
| Eventos       | % eventos con tickets   | ≥ 60%                         |
| Lanzamientos  | CTR buy links           | ≥ 5%                          |
| Videos        | Retención 30s           | ≥ 50%                         |
| Perfiles      | Completitud de perfil   | ≥ 80% campos clave            |
| Comercial     | CTR leaderboard         | ≥ 0.8%                        |

Interpretación: los umbrales se revisan trimestralmente. El equipo define alertas para caídas por debajo del umbral.

## Roadmap de implementación por fases

La implementación se organiza en tres fases para minimizar riesgo y permitir aprendizaje iterativo.

Fase 1: Base editorial y SEO. Se entregan tipos de contenido (Noticia, Evento, Lanzamiento, Video, Perfil), taxonomías, slugs y metadatos, schema básico (Article, Event, VideoObject, Person/Organization), workflows y permisos, más el sitemap/robots y checklist SEO.

Fase 2: Relaciones, agenda avanzada, videos y perfiles. Se implementan tablas de unión (lineup, sellos, agencias), series de eventos, embebidos y subtítulos, señales sociales y recomendaciones.

Fase 3: Módulos comerciales, internacionalización y analítica. Se habilitan espacios comerciales y targeting, multiidioma con hreflang y slugs localizados, y panel de KPIs.

La Tabla 52 detalla entregables por fase.

Tabla 52. Plan por fase: entregables, dependencias, riesgos y criterios de aceptación

| Fase | Entregables                                               | Dependencias               | Riesgos                        | Criterios de aceptación                               |
|------|-----------------------------------------------------------|----------------------------|--------------------------------|--------------------------------------------------------|
| 1    | Tipos, taxonomías, slugs, schema básico, workflow, permisos | Infraestructura CMS        | Validadores incompletos        | Publicación de noticia/evento/lanzamiento con checklist SEO |
| 2    | Relaciones, series, embebidos, señales, recomendaciones    | Fase 1 completada          | Complejidad de consultas       | Listados por ciudad/género con lineup y recomendaciones |
| 3    | Comercial, multiidioma, analítica                          | Fase 2 completada          | Rotación y rendimiento         | Módulos activos con CTR objetivo y hreflang operativo   |

Interpretación: el enfoque incremental permite validar SEO y UX antes de escalar con monetización y multilingüe.

## Cierre y próximos pasos

Este blueprint establece la arquitectura completa de contenido, las relaciones entre entidades, taxonomías, SEO, roles y flujos operativos para Techno Experience Magazine. La combinación de estructuras sólidas (slugs, metadatos, schema) con workflows y permisos robustos asegura calidad editorial, descubrimiento orgánico y operación eficiente.

### Lagunas de información y decisiones pendientes

Para completar la implementación, se requieren definiciones y decisiones aún pendientes que impactan diseño y operación:

- Stack tecnológico del CMS y base de datos (p. ej., Headless CMS vs monolith, tipos de índices y replicación).
- Política de idiomas y alcance geográfico (solo español, multiidioma, países objetivo).
- Lineamientos de marca editorial: tono, estilo, pautas de imágenes y licencias.
- Estrategia de monetización: formatos y pricing (CPM, patrocinios, contenidos premium).
- Alcance de UGC: comentarios, reseñas, foros, límites de moderación.
- Integraciones con ticketing/entradas y proveedores (Ifeel, Eventbrite, enlaces profundos).
- Política de derechos de autor para mixes, lives y videos de terceros.
- Estándares de accesibilidad (WCAG) y mínimos de rendimiento.
- Calendario editorial y frecuencia de publicación por sección.
- Requisitos de almacenamiento/hosting de medios (imágenes, videos, subtítulos).
- Requisitos de analítica y herramientas (tagging, panel de métricas).

Estas lagunas deben resolverse antes de cerrar el diseño técnico detallado, especialmente en Fase 1 y Fase 2, donde se definen las estructuras base y relaciones.

### Próximos pasos

1) Validar el blueprint con stakeholders de Producto, Contenido y Legal/Compliance para cerrar lagunas de información. 2) Aprobar la jerarquía de taxonomías, patrones de URL y checklist SEO. 3) Seleccionar el stack tecnológico y definir el esquema de base de datos con índices. 4) Diseñar y construir formularios y validadores del CMS. 5) Implementar Fase 1 con pruebas de publicación y validadores SEO. 6) Activar instrumentación de analítica básica y preparar panel de KPIs. 7) Plan de contenidos: calendario editorial, series de eventos y pipeline de lanzamientos. 8) Revisión de roles y permisos con Administradores y Super Admin; auditoría de accesos. 9) Iniciar Fase 2 con lineup, series y embebidos; activar recomendaciones. 10) Diseñar inventario comercial y políticas de rotación; preparar acuerdos con sellos/agencias. 11) Definir estrategia multiidioma y hreflang si aplica; preparar slugs localizados. 12) Auditoría de accesibilidad y rendimiento; ajustes finales antes de lanzamiento público.

Con esta hoja de ruta, Techno Experience Magazine estará en posición de iniciar operaciones con un núcleo editorial sólido, escalabilidad por entidades y monetización integrada, preservando los principios de claridad, consistencia y SEO.
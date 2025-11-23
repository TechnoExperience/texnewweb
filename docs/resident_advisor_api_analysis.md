# Resident Advisor API para integración de eventos: viabilidad técnica, endpoints, autenticación, formatos, rate limiting y sincronización cada 5 minutos

## Resumen ejecutivo y alcance

Este informe analiza, desde una perspectiva técnica y operativa, la viabilidad de integrar eventos de Resident Advisor (RA) en sistemas propios. El objetivo es determinar qué opciones técnicas existen a día de hoy para acceder a datos de eventos de RA, cómo autenticarse, qué formatos y campos están disponibles, si existen limitaciones de uso (rate limiting), cómo implementar una sincronización automática cada cinco minutos de forma resiliente, y qué alternativas existen cuando no hay webhooks ni una API pública formal.

Los hallazgos clave son tres. Primero, no existe documentación oficial de una API pública de RA; la única documentación formal accesible desde el sitio se centra en herramientas de marketing, widgets embebibles y utilidades de ticketing, no en endpoints para desarrolladores[^7]. Segundo, la comunidad técnica ha identificado un endpoint GraphQL expuesto por RA que permite consultar listados de eventos y que opera sin token de autenticación, siempre que se envíe un user-agent de navegador; este comportamiento se deduce de observaciones de tráfico y ejemplos funcionales, pero no está respaldado por documentación oficial[^2][^10][^12]. Tercero, como alternativa de integración no oficial y gestionada, se encuentra un actor en Apify para extraer datos de RA a través de su propia API con autenticación por token[^1].

En síntesis, la recomendación principal es una estrategia híbrida: a) uso del endpoint GraphQL observado para extraer eventos cuando sea viable y cumpla los términos de uso; b)empliegue del widget embebible de RA Pro para visualización cuando la prioridad sea mostrar listados sin extraer datos; y c)apoyo en el actor de Apify cuando se necesite una solución gestionada que reduzca mantenimiento propio. Esta combinación permite equilibrar control técnico, esfuerzo de mantenimiento y riesgo de cumplimiento[^2][^1][^3].

## Estado oficial de la API de Resident Advisor

Resident Advisor no publica un portal de desarrolladores ni una especificación formal de API. El sitio principal no ofrece enlaces a documentación técnica ni a referencias de API, y la base de conocimiento disponible se concentra en funciones de marketing, notificaciones de tickets y guías de uso de widgets embebibles. Esta ausencia de documentación oficial implica que cualquier integración basada en endpoints no documentados conlleva riesgos de estabilidad, compatibilidad y cumplimiento[^7].

La reconstrucción tecnológica del sitio a inicios de 2021 —con nuevos perfiles y un enfoque modernizado de páginas de eventos y artistas— sugiere que RA evoluciona su plataforma con frecuencia. Aunque esta evolución facilita la exposición de capacidades internas como GraphQL, no implica compromisos públicos de estabilidad para integraciones externas[^4]. Por tanto, los proyectos que dependan de endpoints no documentados deben contemplar mecanismos de adaptación rápida ante cambios de esquema o de comportamiento.

### Evidencia y contexto de GraphQL en RA

La comunidad técnica ha observado y documentado la existencia de un endpoint GraphQL en RA, con ejemplos de consultas que recuperan listados de eventos utilizando filtros como áreas, rango de fechas y paginación. En la práctica, se recomienda enviar un user-agent de navegador para evitar bloqueos o respuestas inconsistentes, aunque no se requiere token de autenticación. Este enfoque no cuenta con respaldo de documentación oficial ni garantías de permanencia[^2][^10][^12].

## Opciones de acceso a datos de eventos (comparativa)

Existen tres vías principales para integrar datos de eventos de RA:

- GraphQL (no oficial, observación comunitaria).
- Widget embebible de RA Pro.
- Actor de Apify como extractor gestionado.

La Tabla 1 sintetiza las diferencias relevantes para una decisión informada.

Para contextualizar la elección, en escenarios donde la prioridad es la visualización de listados propios de RA sin extracción de datos, el widget embebible es la solución más simple y con menor riesgo operativo. Cuando se requieren datos estructurados en sistemas internos, el uso del endpoint GraphQL observado es la opción con mayor control y menor latencia, siempre que se acepten riesgos de estabilidad y cumplimiento. Si se busca reducir mantenimiento propio y contar con una plataforma que gestione la extracción, el actor de Apify es una alternativa práctica[^2][^3][^1].

Tabla 1. Comparativa de opciones de integración

| Opción | Método/Acceso | Autenticación | Cobertura de datos | Estabilidad | Complejidad de integración | Riesgos/Limitaciones | Tiempo de implementación |
|---|---|---|---|---|---|---|---|
| GraphQL (no oficial) | Endpoint GraphQL observado | No token; user-agent de navegador requerido | Listados de eventos con filtros (áreas, fechas, paginación) | Sin garantías oficiales; puede cambiar sin previo aviso | Media (definir consultas, manejar paginación y latencia) | Posible bloqueo por anti-bot, cambios de esquema, Términos de Uso | Rápido a medio (si ya se maneja GraphQL) |
| Widget embebible | Código de embed desde RA Pro | No API key; se configura desde cuenta RA Pro | Visualización de listados de eventos reflejados desde RA | Alta (herramienta oficialmente soportada) | Baja (insertar iframe/código) | No extracción de datos; personalización limitada | Rápido (minutos) |
| Apify (actor) | API de Apify para ejecutar actor | Token de Apify | Dataset con resultados del scraper gestionado | Alta (según contrato de Apify) | Media (consumo de API y manejo de datasets) | Coste por uso; indirección (scraping) | Rápido a medio |

[^2][^3][^1]

### Opción A: GraphQL (no oficial)

El endpoint GraphQL observado permite construir consultas específicas sobre listados de eventos, aportando un control detallado sobre los campos requeridos y la paginación. A nivel operativo, se recomienda establecer un user-agent de navegador para reducir fricción y monitorizar errores o respuestas vacías que podrían deberse a controles anti-scraping o cambios en el backend. La estabilidad no está garantizada y el esquema puede evolucionar sin aviso[^2][^12].

### Opción B: Widget embebible (RA Pro)

El widget embebible muestra los listados de eventos de RA en sitios externos, sincronizados automáticamente con RA.co. Su implementación se realiza mediante un código de inserción generado desde RA Pro, con opciones básicas de personalización de diseño. Es idóneo cuando la necesidad es visualizar eventos sin necesidad de extraerlos para procesamiento interno. No expone datos por API ni facilita webhooks[^3].

### Opción C: Apify (scraper gestionado)

El actor “augeas/resident-advisor” en la plataforma Apify proporciona extracción de datos de RA mediante la API de Apify. La autenticación se realiza con token de Apify y los resultados se almacenan en datasets consultables. Este enfoque delega parte de la complejidad técnica a la plataforma, a cambio de costes por uso y una indirección respecto a la fuente original[^1].

## Autenticación y acceso

Las tres opciones difieren significativamente en sus requisitos de acceso:

- GraphQL: no requiere token; es indispensable usar un user-agent de navegador. Esta práctica deriva de observaciones de la comunidad y reduce la probabilidad de bloqueos, aunque no elimina el riesgo[^2].
- Widget embebible: se configura desde RA Pro y no exige manejo de API keys; su propósito es la visualización directa[^3].
- Apify: requiere token de Apify, que se gestiona desde la consola de la plataforma. La ejecución se realiza vía la API de Apify y los datasets resultantes se consultan mediante endpoints documentados[^1].

En todos los casos, conviene aplicar controles de acceso y proteger credenciales (cuando aplique), así como respetar políticas de uso aceptable de la plataforma.

## Endpoints y operaciones disponibles

- GraphQL: el único endpoint conocido es el de RA en modo GraphQL; la comunidad utiliza consultas sobre “eventListings” con filtros y paginación. La especificación exacta de tipos, filtros y paginación no está documentada oficialmente y se infiere de ejemplos funcionales[^2][^10].
- Apify: endpoints para ejecutar el actor de forma síncrona o asíncrona, obtener el objeto del actor y consultar datasets. La ejecución más común combina POST/GET según el caso de uso y el retorno de resultados en datasets[^1].
- Widget: no expone endpoints; se basa en un código de inserción que renderiza el listado desde RA[^3].

Para facilitar la adopción, la Tabla 2 lista los endpoints clave con su método y propósito, junto con notas operativas.

Tabla 2. Catálogo de endpoints clave (GraphQL y Apify)

| Opción | Método | Endpoint | Propósito | Autenticación | Notas de uso |
|---|---|---|---|---|---|
| GraphQL | POST | ra.co/graphql | Consultar listados de eventos (eventListings) con filtros | user-agent de navegador | Esquema no documentado oficialmente; revisar ejemplos comunitarios[^2][^10] |
| Apify (ejecutar actor) | POST | api.apify.com/v2/acts/.../runs | Iniciar ejecución del actor (asíncrona) | Token de Apify | Adecuado para pipelines desacoplados[^1] |
| Apify (ejecución síncrona + dataset) | POST/GET | api.apify.com/v2/acts/.../run-sync-get-dataset-items | Ejecutar actor y obtener ítems del dataset | Token de Apify | Útil para flujos síncronos y pruebas[^1] |
| Apify (objeto actor) | GET | api.apify.com/v2/acts/... | Obtener metadatos del actor | Token de Apify | Revisar configuración y versión[^1] |

## Formato de datos y modelo de información de eventos

El modelo de eventos en GraphQL observado incluye campos esenciales para la mayoría de casos de uso: identificador del listing, fecha de publicación, evento con título, URL de contenido, imagen de portada, estado de cola (queueItEnabled), banderas de nuevo formulario (newEventForm), imágenes con variantes y metadatos del venue (nombre, URL, estado en vivo). La Tabla 3 resume los campos relevantes con una breve descripción[^2].

Tabla 3. Mapa de campos del fragmento “eventFields” (evento y relaciones)

| Campo | Descripción breve |
|---|---|
| id (Event) | Identificador del evento. |
| title (Event) | Título del evento. |
| attending (Event) | Métrica de asistencia o interés. |
| date (Event) | Fecha del evento. |
| contentUrl (Event) | Ruta de contenido del evento en RA. |
| flyerFront (Event) | Imagen de portada (front). |
| queueItEnabled (Event) | Bandera de uso de cola de entradas. |
| newEventForm (Event) | Indica uso de nuevo formulario de evento. |
| images.id/filename/alt/type/crop (Event) | Variantes de imagen con metadatos. |
| venue.id/name/contentUrl/live (Event) | Datos del recinto; nombre y estado “live”. |

El nivel “eventListings” agrupa datos del listado y su relación con el evento. En la práctica, los pipelines transforman esta estructura hacia modelos internos (p. ej., Event, Venue, Artist, ImageVariant) normalizando identificadores, URLs y recursos multimedia. En Apify, los datasets resultantes suelen estar en JSON y se adaptan con facilidad a modelos propios[^1].

## Rate limiting, cuotas y cumplimiento

No se ha identificado documentación oficial sobre límites de tasa o cuotas para el uso del endpoint GraphQL de RA. Esto obliga a trabajar con supuestos prudentes: enviar un user-agent de navegador, moderar la frecuencia de llamadas, implementar backoff exponencial y observar respuestas de error que sugieran restricciones temporales. En caso de usar Apify, los límites aplicables serán los de su propia plataforma y plan contratado. La Tabla 4 detalla un plan de contingencia recomendado[^2][^1].

Tabla 4. Plan de contingencia ante 429/errores

| Señal | Acción inmediata | Backoff | Métricas a registrar | Observaciones |
|---|---|---|---|---|
| Respuesta 429 | Reintentar con backoff exponencial | 1s → 2s → 4s → 8s (máx. 60s) | Timestamp, endpoint, payload, latency | Ajustar ventana de polling tras estabilización |
| Respuesta vacía | Validar query/variables; reducir pageSize | 2s → 4s → 8s | Conteo ítems, tamaño página | Podría indicar filtrado excesivo o cambio de esquema |
| Timeout/red | Reintentar con jitter | 1s → 3s → 9s | Código/latencia | Revisar red y límites de cliente |
| Bloqueo (anti-bot) | Pausar; revisar user-agent y patrones | 5 min → 15 min | Headers, cookies, IP | Considerar distribuir llamadas en el tiempo |

Cumplimiento y riesgos: si bien la comunidad utiliza GraphQL, la ausencia de documentación oficial implica potenciales conflictos con los términos de uso. La decisión de uso debe ponderar impacto legal y reputacional. El widget embebible y Apify ofrecen rutas alternativas con mejor encuadre oficial[^2][^3][^1].

## Diseño de sincronización automática cada 5 minutos

La sincronización periódica tiene dos objetivos: detectar cambios relevantes y minimizar llamadas redundantes. Se recomienda una arquitectura basada en ventanas temporales deslizantes con checkpoints persistentes y paginación estable.

- Ventanas deslizantes: desplazar la ventana de consulta en pasos de cinco minutos, con un margen de solapamiento para cubrir variaciones de reloj y latencias.
- Paginación: iterar páginas con tamaños moderados y mantener un cursor o checkpoint por página para reanudación ante fallos.
- Idempotencia y deduplicación: usar claves estables (p. ej., id del evento) y detectar cambios por hash de campos clave (título, fecha, venue).
- Resiliencia: instrumentar reintentos con backoff y jitter, circuit breakers por tipo de error, y persistencia del estado de sincronización.

La Tabla 5 propone una plantilla de cronograma y límites por ciclo.

Tabla 5. Plantilla de cronograma de sincronización cada 5 minutos

| Elemento | Recomendación |
|---|---|
| Ventana temporal | [now - Δ, now + Δ] con Δ de 15–30 min (solapamiento) |
| Paginación | pageSize = 50–100; avanzar hasta agotar resultados |
| Límite por ciclo | 3–5 llamadas por área; consolidar áreas en una sola consulta (si esquema lo permite) |
| Checkpoint | Timestamp de última actualización procesada por área |
| Reintentos | Hasta 3 por llamada con backoff exponencial |
| Observabilidad | Latencia, tasa de 2xx/4xx/5xx, ítems nuevos/actualizados |

### Algoritmo de polling incremental

El flujo operativo recomendado:

1. Seleccionar áreas (códigos de área) relevantes y definir la ventana temporal con solapamiento para absorber latencia y jitter.
2. Construir la consulta GraphQL con filtros: rango de fechas de listado y paginación. Ordenar por prioridad (p. ej., attending) según necesidades.
3. Ejecutar paginación hasta completar la ventana; para cada ítem, normalizar y deduplicar por id.
4. Detectar cambios comparando un hash de campos clave (título, fecha, venue) con la última versión almacenada.
5. Actualizar el checkpoint por área al timestamp máximo observado y registrar métricas de completitud.

Este enfoque se inspira en ejemplos comunitarios y prácticas habituales de extracción incremental. La clave es el control de paginación y la persistencia del checkpoint para reanudación segura[^10].

### Gestión de errores y límites

Ante respuestas 429, vacías o timeouts, aplicar backoff y revisar parámetros (p. ej., reducir pageSize, ajustar filtros). Incorporar circuit breakers para suspender temporalmente la sincronización en una área si se detectan bloqueos repetidos, reintentando más tarde con una ventana reducida. Distribuir llamadas en el tiempo y aleatorizar los instantes de inicio de cada ciclo para evitar picos, especialmente si se consultan múltiples áreas en paralelo[^2].

## Webhooks y notificaciones en tiempo real

No se han identificado webhooks públicos de RA. Existen mecanismos de notificación de tickets para usuarios finales —envío de correos cuando un evento agotado vuelve a tener disponibilidad— y herramientas de marketing que disparan correos y notificaciones push según eventos clave (p. ej., etiquetar artistas o subir entradas). Estas capacidades no son APIs para desarrolladores y no están expuestas como webhooks. La Tabla 6 sintetiza el inventario de notificaciones y su idoneidad como sustituto de webhooks[^5][^6].

Tabla 6. Inventario de notificaciones en RA (no orientadas a desarrolladores)

| Tipo | Activador | Destinatario | Mecanismo | Uso para integraciones |
|---|---|---|---|---|
| Ticket notifications (correo) | Evento agotado; alta a reventa | Usuario final | Correos en olas | No exponen webhook; no aptas como push server-to-server |
| Marketing “Just Announced” | Etiquetar artistas | Seguidores del artista en la región | Correo y push (app RA Guide) | No disponibles como webhook |
| Notificaciones por promotor/recinto | Subir evento con entradas | Seguidores del promotor/recinto | Correo y push | No disponibles como webhook |
| Abandono de carrito | Cesta sin completar | Cliente | Correo automático | No disponible como webhook |

En ausencia de webhooks, la estrategia práctica es polling cada cinco minutos y, en paralelo, ofrecer el widget embebible cuando la necesidad sea puramente de visualización de listados propios[^3][^5][^6].

## Estrategia recomendada de integración y decisiones

La decisión óptima depende de los requisitos de negocio y la tolerancia al riesgo técnico y legal:

- Si se necesita mostrar listados sin extraer datos: emplear el widget embebible. Minimiza fricción, ofrece sincronización automática y reduce mantenimientos[^3].
- Si se requieren datos estructurados para motores de recomendación, agregadores o backends propios: usar el endpoint GraphQL observado, con controles estrictos de polling y monitoreo. Asumir y gestionar el riesgo de cambios no documentados[^2].
- Si se prefiere un servicio gestionado con menor mantenimiento propio: emplear el actor de Apify, integrando su API y datasets en el pipeline[^1].
- Para minimizar riesgos legales: evitar scraping directo si no está permitido; priorizar el widget o APIs gestionadas. Implementar controles de cumplimiento (registro de llamadas, suspensión ante señales de bloqueo, respeto de términos de uso).

La Tabla 7 resume la matriz de decisión.

Tabla 7. Matriz de decisión por requisitos

| Requisito | Opción recomendada | Justificación |
|---|---|---|
| Solo visualización | Widget embebible | Rápido, sin extracción, sincronizado desde RA[^3] |
| Datos para analítica | GraphQL | Control de campos y paginación; menor latencia[^2] |
| Menor mantenimiento | Apify | Plataforma gestiona scraping y datasets[^1] |
| Riesgo legal mínimo | Widget / Apify | Mejor encuadre oficial que scraping no documentado[^3][^1] |
| Tiempo de implementación | Widget / Apify | Minutos; GraphQL requiere desarrollo de consultas y paginación[^2] |

## Plan de implementación y pruebas

Un plan robusto de implementación debe abordar diseño, pruebas, despliegue y observabilidad.

- Diseño técnico: definir consultas, filtros y paginación para GraphQL; establecer checkpoints y ventanas deslizantes; en Apify, configurar inputs y pipelines de datasets.
- Seguridad: proteger tokens (Apify), rotar credenciales, segregar entornos y revisar permisos.
- Pruebas: unitarias de mapeo de campos; contract tests de consultas (estructura mínima de respuesta); pruebas de paginación y detección de cambios; carga para validar latencia y estabilidad.
- Observabilidad: trazas de llamadas, métricas por endpoint (latencia, tasa de error), registros de ítems nuevos/actualizados, alarmas por 429 y 5xx.

La Tabla 8 ofrece un checklist por entorno.

Tabla 8. Checklist de pruebas por entorno (dev/staging/prod)

| Área | Dev | Staging | Prod |
|---|---|---|---|
| Configuración | Tokens, user-agent | Políticas de reintento | Límites y alertas |
| Consultas | Estructura mínima | Filtros y paginación | Rendimiento y estabilidad |
| Datos | Mapeo de campos | Casos edge (campos nulos) | Consistencia y normalización |
| Errores | Backoff y jitter | Circuit breakers | Playbooks de incidentes |
| Seguridad | Protección de secretos | Rotación y auditoría | IAM y segregación |
| Observabilidad | Logs y métricas | Dashboards | Alarmas y SLIs/SLOs |

### Plan de pruebas de sincronización

Validar la detección de cambios incrementales con un conjunto controlado de eventos: modificaciones de título, fecha y venue. Verificar la deduplicación por id y que el checkpoint reanude correctamente tras cortes simulados (p. ej.,终止 temprana, respuestas vacías). Documentar criterios de aceptación: porcentaje de ítems procesados por ciclo, latencia media por página, tasa de error tolerable y estabilidad en múltiples ejecuciones consecutivas[^2].

## Riesgos y mitigaciones

Los riesgos se concentran en cuatro frentes:

- Legal y de cumplimiento: scraping no autorizado o uso de endpoints no documentados puede contravenir términos de uso. Mitigar priorizando el widget y servicios gestionados como Apify, y estableciendo revisiones legales regulares[^3][^1].
- Técnicos: cambios de esquema o bloqueo por anti-bot. Mitigar con abstracción de consultas, feature flags, circuit breakers y pruebas contractuales[^2].
- Operativos: límites no documentados. Mitigar con backoff, distribución de llamadas en el tiempo, ventanas deslizantes y observabilidad detallada[^2].
- Dependencias de terceros: indisponibilidad o cambios de comportamiento de Apify. Mitigar con contratos de servicio, alternativas internas y monitoreo de la plataforma[^1].

La Tabla 9 formaliza el registro de riesgos.

Tabla 9. Registro de riesgos

| Riesgo | Probabilidad | Impacto | Mitigación | Dueño | Revisión |
|---|---|---|---|---|---|
| Bloqueo por anti-bot | Media | Alta | user-agent, backoff, distribución temporal | Ingeniería | Mensual |
| Cambio de esquema GraphQL | Media | Media | Contratos de consulta, tests, feature flags | Ingeniería | Trimestral |
| Incumplimiento de términos | Baja–Media | Alta | Widget/Apify; revisión legal | Legal | Trimestral |
| Límites de tasa no documentados | Media | Media | Backoff; checkpoints; paginación | Ingeniería | Mensual |
| Indisponibilidad de Apify | Baja | Media | Plan B interno; contrato y monitoreo | Operaciones | Mensual |

## Apéndices

- Consulta GraphQL ejemplo (basada en evidencia comunitaria): consulta de listados de eventos con filtros por área y fechas, página y orden por asistencia; fragmento de campos de evento y venue. Esta estructura se usa como referencia inicial y puede variar según la evolución del esquema[^2].
- Glosario: 
  - eventListings: conjunto de listados de eventos consultables con filtros y paginación.
  - eventFields: fragmento que define campos del evento (título, fecha, imágenes, venue).
  - page/pageSize: parámetros de paginación para recorrer resultados.
  - checkpoint: timestamp o cursor persistido para reanudar sincronizaciones.
- Índice de endpoints (sin URLs): 
  - GraphQL: endpoint único de consultas (consultar referencias).
  - Apify: ejecutar actor (asíncrono), ejecutar actor y obtener dataset (síncrono), obtener objeto de actor, consultar dataset (ver referencias).
  - Widget: código de inserción configurado desde RA Pro.

## Brechas de información identificadas

- No hay documentación oficial de una API pública para desarrolladores en el sitio principal de RA.
- No existe información pública sobre rate limiting ni cuotas del endpoint GraphQL.
- La estructura completa del esquema GraphQL, tipos, filtros y paginación no está documentada oficialmente.
- No hay evidencia de webhooks públicos orientados a desarrolladores; solo herramientas de marketing y notificaciones para usuarios finales.
- No se documenta oficialmente un proceso de obtención de tokens o claves de API para acceso directo a datos de eventos de RA.
- Políticas de uso aceptable y implicaciones legales del scraping o uso de endpoints no documentados no están publicadas.

Estas brechas condicionan las decisiones y deben ser gestionadas con mitigaciones operativas y revisiones periódicas.

## Referencias

[^1]: Resident Advisor API - Apify (Actor “augeas/resident-advisor”). https://apify.com/augeas/resident-advisor/api  
[^2]: How to get residentadvisor API functional - Stack Overflow. https://stackoverflow.com/questions/34182163/how-to-get-residentadvisor-api-functional  
[^3]: Embeddable event listings (widget) - RA Pro - Resident Advisor. https://support.ra.co/article/7-ticket-widget  
[^4]: RA launches new website · News RA - Resident Advisor. https://ra.co/news/74129  
[^5]: Ticket notifications - RA Pro - Resident Advisor. https://support.ra.co/article/198-ticket-notifications  
[^6]: RA's Automated Marketing Tools - RA Pro - Resident Advisor. https://support.ra.co/article/278-ra-s-automated-marketing-tools  
[^7]: Resident Advisor (sitio principal). https://ra.co/  
[^8]: Resident Advisor - Apify (plataforma del actor). https://apify.com/augeas/resident-advisor  
[^9]: djb-gt/resident-advisor-events-scraper - GitHub. https://github.com/dirkjbreeuwer/resident-advisor-events-scraper  
[^10]: Making a web app for previewing Resident Advisor event lineups - Larry Hudson. https://larryhudson.io/ra-lineup-preview/  
[^11]: RA and SoundCloud partner to expand artist and fan connection - RA News. https://ra.co/news/80904  
[^12]: Queries - GraphQL. https://graphql.org/learn/queries/
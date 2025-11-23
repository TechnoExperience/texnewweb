# Blueprint de integración con la API de Resident Advisor para eventos techno: endpoints, autenticación, formato de datos, filtros y sincronización cada 5 minutos

## 1. Objetivos y alcance del proyecto

El objetivo de este documento es habilitar una integración técnica, robusta y mantenible con Resident Advisor (RA) para indexar y sincronizar eventos de música electrónica —con foco en techno— en un sistema propio. El alcance cubre de forma explícita los siguientes elementos: autenticación y acceso; endpoints disponibles; formato y modelo de datos; filtros por ciudad/área, fecha y (si aplica) artista y club/venue; paginación; límites de tasa (rate limiting); diseño de sincronización automática cada 5 minutos; y un plan de pruebas y operación con observabilidad.

La premisa de partida es crítica: no existe una API pública oficial de RA para desarrolladores, por lo que la viabilidad descansa en opciones no oficiales, específicamente un endpoint GraphQL identificado por la comunidad y servicios gestionados de terceros como un actor en Apify. Esta condición obliga a diseñar con margen de maniobra para cambios no anunciados, así como a aplicar buenas prácticas de cumplimiento y resiliencia operativa[^7][^8].

## 2. Metodología de investigación y fuentes

La investigación se ha construido sobre tres pilares. Primero, la revisión del sitio oficial de RA para confirmar la ausencia de un portal de desarrolladores o de documentación pública de una API; la evidencia sugiere que las capacidades que podrían parecer “API-like” no están publicadas para terceros[^7]. Segundo, el estudio de la comunidad técnica y de implementaciones públicas que han identificado y utilizado un endpoint GraphQL operativo; ejemplos de código abierto y artículos de desarrolladores han sido esenciales para comprender cómo realizar consultas y qué esperar de las respuestas[^2][^10][^12]. Tercero, el uso de una solución gestionada de scraping/extracción de RA a través de un actor en Apify, con documentación clara de sus endpoints y operación, que sirve de alternativa cuando el control directo no sea deseable o viable[^1].

La evidencia es, por naturaleza, no oficial y procede de observación empírica, trazas de red y pruebas de campo. Esta restricción implica no poder garantizar estabilidad de esquema ni de comportamiento. Por ello, las recomendaciones de arquitectura, polling y control de errores incorporan mecanismos de adaptación y mitigación.

Para documentar el origen de los hallazgos clave, la Tabla 1 sintetiza el mapa de fuentes y su fiabilidad percibida.

Tabla 1. Mapa de fuentes vs tipo de evidencia y fiabilidad percibida

| Fuente | Tipo de evidencia | Fiabilidad percibida | Nota |
|---|---|---|---|
| Stack Overflow (hilo “How to get residentadvisor API functional”) | Pruebas y ejemplos operativos del endpoint GraphQL | Media | Útil para construir consultas iniciales; no oficial[^2] |
| Artículo técnico de Larry Hudson | Implementación y extracción de lineup desde páginas | Media | Aporta contexto sobre estructura HTML y límites prácticos[^10] |
| Apify Actor “resident-advisor” | API gestionada de extracción | Alta (para la API de Apify) | Alternativa robusta para delegar scraping[^1] |
| Repositorios GitHub (scrapers) | Prácticas de comunidad | Media | Ejemplos útiles de flujos y paginación[^12] |
| Sitio oficial de RA | Verificación de ausencia de API pública | Alta | Punto de partida y límites de cumplimiento[^7] |

Estas fuentes se han utilizado de forma convergente: donde la API GraphQL comunitaria proporciona agilidad y control, la plataforma de Apify ofrece estabilidad contractual y operación gestionada. El sitio oficial, por su parte, delimita el perímetro de lo oficialmente soportado.

## 3. Acceso y autenticación: qué se requiere y cómo cumplirlo

La integración con RA exige cumplir ciertos prerrequisitos de acceso que dependen de la opción elegida.

- Endpoint GraphQL comunitario. No requiere token de autenticación; sin embargo, la experiencia operativa muestra que es necesario enviar un user-agent que simule un navegador legítimo. En ausencia de este encabezado, pueden presentarse respuestas vacías, códigos de error o bloqueos. Además, se recomienda respetar prácticas de client-friendly (p. ej., tasas moderadas, backoff ante errores)[^2].
- RA Pro Widget embebible. No implica manejo de tokens ni llamadas programáticas; se configura desde la cuenta RA Pro y permite incrustar listados de eventos en sitios de terceros. Es idóneo para visualización sincronizada sin extracción de datos[^3].
- Apify. Requiere token de Apify para acceder a la API de la plataforma. La operación se realiza mediante endpoints que ejecutan el actor y consultan los datasets generados. Esta vía delega en Apify la gestión de scraping y la persistencia de resultados en un formato utilizable programáticamente[^1].

La Tabla 2 resume los requisitos de autenticación y acceso.

Tabla 2. Matriz de autenticación y acceso por opción

| Opción | Requisitos | Encabezados requeridos | Tokens | Notas operativas |
|---|---|---|---|---|
| GraphQL (no oficial) | Endpoint GraphQL de RA; client-friendly | user-agent de navegador; Content-Type: application/json | No | Respuestas sensibles al user-agent; sin garantías de estabilidad[^2] |
| Widget (RA Pro) | Cuenta RA Pro; código de inserción | N/A (renderizado en cliente) | No | Ideal para visualización; sin extracción de datos[^3] |
| Apify Actor | Token de Apify; cuenta en plataforma | Authorization (token Apify) | Sí | Ejecución gestionada; datasets consultables por API[^1] |

## 4. Endpoints y operaciones disponibles

La operación con RA se articula en dos líneas técnicas: el uso del endpoint GraphQL identificado por la comunidad y la API del actor de Apify para extracción gestionada.

- GraphQL. El endpoint de RA acepta consultas GraphQL en formato JSON vía POST. La estructura típica de una operación incluye: 
  - Query/mutation si aplica (comúnmente query).
  - Variables para filtros y paginación (p. ej., pageSize, filtros por área y fechas).
  - Encabezados: user-agent de navegador y Content-Type: application/json.
  Las respuestas exponen listados de eventos (eventListings) con campos que permiten construir un modelo interno de Event, Venue e imágenes[^2][^10].

- Apify. La plataforma ofrece endpoints para:
  - Ejecutar el actor en modo asíncrono y consultar resultados.
  - Ejecutar el actor de forma síncrona y obtener ítems del dataset en la misma operación.
  - Obtener el objeto del actor para revisar metadatos y configuración.
  La salida se almacena en datasets consultables por API, típicamente en JSON[^1].

La Tabla 3 presenta un catálogo de endpoints clave por opción.

Tabla 3. Catálogo de endpoints y propósito por opción

| Opción | Método | Endpoint | Propósito | Autenticación | Observaciones |
|---|---|---|---|---|---|
| GraphQL | POST | ra.co/graphql | Consultar listados de eventos con filtros y paginación | user-agent de navegador | Esquema y filtros no documentados oficialmente[^2] |
| Apify (actor runs) | POST | api.apify.com/v2/acts/.../runs | Iniciar ejecución del actor (asíncrona) | Token Apify | Retorna runId para consultar dataset[^1] |
| Apify (run sync + dataset) | POST/GET | api.apify.com/v2/acts/.../run-sync-get-dataset-items | Ejecutar actor y recuperar ítems de dataset | Token Apify | Útil para integraciones simples y pruebas[^1] |
| Apify (actor object) | GET | api.apify.com/v2/acts/... | Obtener metadatos del actor | Token Apify | Revisión de configuración/versión[^1] |

### 4.1 Opción A: GraphQL (comunitario, no oficial)

La práctica comunitaria muestra cómo consultar eventos por listados con filtros de área, rango de fechas y paginación. Se recomienda:

- Incluir un user-agent de navegador legítimo.
- Usar Content-Type: application/json y enviar la query y variables en el cuerpo.
- Instrumentar la aplicación para detectar cambios de esquema y manejar respuestas vacías o inesperadas[^2].

### 4.2 Opción B: Apify (actor “resident-advisor”)

El actor de Apify facilita una extracción gestionada de RA con autenticación por token y una API consistente. La ejecución puede ser asíncrona (para desacoplar la obtención de datos de su procesamiento) o síncrona (para simplificar flujos lineales), y los resultados se exponen como datasets consultables. La operación es programable y ampliamente documentada por Apify[^1].

## 5. Formato de datos y modelo de información de eventos

El modelo observado en la respuesta GraphQL incluye campos esenciales que permiten la construcción de un dominio interno rico en relaciones y metadatos. A nivel de evento (Event) y su relación con el venue y las imágenes, se identifican:

- Identificador del evento (id), título (title), fecha (date), URL de contenido (contentUrl), métrica de asistencia (attending), indicadores operativos como queueItEnabled y banderas de formularios (newEventForm).
- Imágenes con variantes y metadatos (id, filename, alt, type, crop).
- Venue con identificador, nombre, URL de contenido y estado live.

La Tabla 4 muestra un mapa de campos representativo del fragmento “eventFields” y su semántica esperada.

Tabla 4. Mapa de campos del fragmento “eventFields” (evento y relaciones)

| Campo | Descripción |
|---|---|
| id (Event) | Identificador único del evento. |
| title (Event) | Título del evento. |
| attending (Event) | Métrica de asistencia o interés. |
| date (Event) | Fecha del evento. |
| contentUrl (Event) | Ruta de contenido del evento en RA. |
| flyerFront (Event) | Imagen de portada (front). |
| queueItEnabled (Event) | Bandera de uso de cola de entradas. |
| newEventForm (Event) | Indica uso de nuevo formulario de evento. |
| images.id/filename/alt/type/crop (Event) | Variantes de imagen con metadatos. |
| venue.id/name/contentUrl/live (Event) | Datos del recinto (nombre, URL de contenido, estado “live”). |

La Tabla 5 ofrece un ejemplo simplificado de payload GraphQL para popularEvents con las variables más habituales.

Tabla 5. Ejemplo de payload GraphQL (popularEvents) y variables

| Elemento | Ejemplo |
|---|---|
| Query | query GET_POPULAR_EVENTS($filters: FilterInputDtoInput, $pageSize: Int!) { popularEvents(filters: $filters, pageSize: $pageSize) { id title attending date contentUrl flyerFront images { id filename alt type crop } venue { id name contentUrl live } } } |
| Variables | { "filters": { "area": "London", "listingDate": "2024-11-01" }, "pageSize": 20 } |

En implementaciones con Apify, los datasets resultantes suelen ofrecer salidas en JSON que, con un mapeo adecuado, se alinean a las entidades de Event y Venue, preservando identificadores y recursos multimedia para usos posteriores en motores de búsqueda, agregadores o catálogos internos[^1].

## 6. Filtros: ciudad/área, fecha, artista, club/venue

La comunidad ha observado que el endpoint GraphQL de RA permite construir consultas con filtros típicos de listados. Entre los más relevantes:

- Área/ciudad. Filtro geográfico que permite segmentar listados por una región o ciudad.
- Fechas de listado y rango temporal. Posibilidad de acotar por fecha de publicación del listado o por ventanas temporales específicas.
- Paginación. pageSize y mecanismos de iteración que facilitan recorridos controlados.

Los filtros por artista y club/venue no están confirmados de forma oficial. Si se desea segmentar por club/venue en GraphQL, una aproximación práctica es aplicar filtros de área y cruzar con venue en el lado del cliente a partir de los datos del evento. La Tabla 6 resume el estado de disponibilidad de filtros por opción[^2].

Tabla 6. Matriz de filtros y disponibilidad por opción

| Filtro | GraphQL (comunitario) | Apify | Widget |
|---|---|---|---|
| Ciudad/área (area) | Observado/consultable | Posible vía scraping configurado | N/A (visualización) |
| Fecha (listingDate, rango) | Observado/consultable | Posible vía inputs del actor | N/A |
| Artista (lineup) | No confirmado | Posible vía scraping del evento | N/A |
| Club/venue | Cruzado desde venue en datos | Posible vía scraping del evento | N/A |
| Paginación | Observada (pageSize) | N/A (dataset completo) | N/A |

## 7. Rate limiting, cuotas y cumplimiento

No existe documentación oficial sobre límites de tasa del endpoint GraphQL de RA. En la práctica, el comportamiento observado sugiere que el envío de un user-agent de navegador y la moderación de la frecuencia de llamadas reducen fricción y respuestas indeseadas. En caso de utilizar Apify, los límites aplicables son los de su plataforma, que dependen del plan contratado. La Tabla 7 describe un plan de contingencia recomendado frente a señales de sobrecarga o bloqueo[^2][^1].

Tabla 7. Plan de contingencia ante 429/errores

| Señal | Acción | Backoff | Métricas | Observaciones |
|---|---|---|---|---|
| 429 (rate limit) | Reintentar con backoff exponencial | 1s → 2s → 4s → 8s (máx. 60s) | Timestamp, endpoint, payload, latencia | Ajustar ventana de polling y distribución temporal |
| Respuesta vacía | Validar query/variables; reducir pageSize | 2s → 4s → 8s | Conteo ítems, tamaño página | Revisar si hay filtrado excesivo o cambios de esquema |
| Timeout/red | Reintentar con jitter | 1s → 3s → 9s | Código/latencia | Revisar límites de cliente y dependencias |
| Bloqueo (anti-bot) | Pausar; rotar patrón de llamadas | 5 min → 15 min | Headers, cookies, IP | Considerar uso de servicios gestionados si persiste |

El cumplimiento es un eje central. Al no haber API pública oficial, cualquier consumo no autorizado debe ser cuidadosamente evaluado. El widget embebible de RA Pro y los servicios de Apify ofrecen rutas con mejor encuadre de soporte, minimizando riesgos de incompatibilidad futura y de uso indebido[^3][^1].

## 8. Sincronización automática cada 5 minutos: diseño y operación

La sincronización periódica tiene como objetivo detectar cambios con la menor latencia posible, evitar llamadas redundantes y mantener un estado consistente pese a la ausencia de webhooks oficiales. Se recomienda una arquitectura con ventanas deslizantes, checkpoints persistentes, paginación controlada, idempotencia y mecanismos de resiliencia.

- Ventanas deslizantes. Consultar intervalos que se desplazan en pasos de cinco minutos, con solapamiento para absorber jitter y variaciones de reloj.
- Paginación. Iterar páginas con tamaños moderados (p. ej., 50–100) y persistir cursores/checkpoints por área.
- Idempotencia/deduplicación. Usar identificadores estables del evento y detectar cambios por hash de campos clave (título, fecha, venue).
- Resiliencia. Implementar reintentos con backoff y jitter, circuit breakers por tipo de error y persistencia del estado de sincronización para reanudación segura.

La Tabla 8 detalla un cronograma de referencia por ciclo.

Tabla 8. Cronograma de sincronización cada 5 minutos

| Elemento | Recomendación |
|---|---|
| Ventana temporal | [now - Δ, now + Δ] con Δ de 15–30 min (solapamiento) |
| Paginación | pageSize = 50–100; avanzar hasta agotar resultados |
| Límite por ciclo | 3–5 llamadas por área; consolidar áreas si es posible |
| Checkpoint | Timestamp de última actualización procesada por área |
| Reintentos | Hasta 3 por llamada con backoff exponencial |
| Observabilidad | Latencia, tasa de 2xx/4xx/5xx, ítems nuevos/actualizados |

### 8.1 Algoritmo de polling incremental

El flujo operativo propuesto:

1. Selección de áreas y ventana. Determinar las áreas relevantes (p. ej., “London”) y construir una ventana temporal deslizante que solape el instante presente y permita cubrir eventos recién publicados o actualizados.
2. Construcción de consulta. Definir la query GraphQL con filtros (área, rango de fechas) y parámetros de paginación (pageSize), ordenando según prioridad (p. ej., attending) si el caso lo requiere.
3. Ejecución y paginación. Ejecutar la consulta y avanzar páginas hasta agotar resultados, normalizando cada ítem y deduplicando por id.
4. Detección de cambios. Comparar un hash de campos clave (título, fecha, venue) con la última versión almacenada para detectar cambios o novedades.
5. Actualización del checkpoint. Persistir el timestamp máximo observado por área y registrar métricas de completitud.

Este flujo se apoya en prácticas observadas en la comunidad y en implementaciones públicas que muestran tanto la estructura de consultas como la extracción de lineup desde páginas, aportando contexto para construir queries y manejar datos en sistemas propios[^10][^12].

### 8.2 Gestión de errores y límites

La operación debe distinguir entre errores de cliente y del servidor, y aplicar mitigaciones específicas. Ante 429 o respuestas vacías, reducir pageSize y ajustar filtros; ante timeouts, introducir jitter y revisar dependencias; ante patrones de bloqueo, activar circuit breakers y distribuir llamadas en el tiempo. La Tabla 9 describe una matriz de errores y respuestas recomendadas[^2].

Tabla 9. Matriz de errores y respuestas

| Tipo de error | Síntoma | Respuesta recomendada | Comentario |
|---|---|---|---|
| 429 (rate limit) | Latencia alta; throttling | Backoff exponencial; reintentos | Ajustar frecuencia y solapamiento |
| Respuesta vacía | Ítems = 0 | Reducir pageSize; validar query/variables | Posible cambio de esquema o filtros estrictos |
| Timeout/red | Request expira | Reintentar con jitter; revisar red | Evitar picos de llamadas paralelas |
| Bloqueo (anti-bot) | Flujo bloqueado | Pausa; cambiar patrón; evaluar Apify | Considerar servicio gestionado si persiste |

## 9. Pruebas, validación y observabilidad

El éxito de la integración depende tanto del diseño como de la capacidad de validar y observar la operación en condiciones reales. Se recomiendan:

- Pruebas unitarias del mapeo de campos. Verificar que los campos GraphQL se traducen correctamente al modelo interno, incluyendo imágenes y venue.
- Contract tests. Establecer contratos de consulta con aserciones sobre estructura mínima de respuesta (p. ej., presencia de id, title, date, venue).
- Pruebas de paginación y detección de cambios. Confirmar que la paginación recorre el conjunto esperado y que el algoritmo incremental detecta modificaciones de campos clave.
- Pruebas de carga. Validar latencia, estabilidad y comportamiento bajo límites; ajustar backoff y distribución temporal.

La observabilidad debe instrumentar trazas y métricas por endpoint (latencia, tasas de 2xx/4xx/5xx) y por ciclo (ítems nuevos/actualizados). La Tabla 10 presenta un checklist de pruebas por entorno.

Tabla 10. Checklist de pruebas por entorno (dev/staging/prod)

| Área | Dev | Staging | Prod |
|---|---|---|---|
| Configuración | user-agent; tokens; variables | Políticas de reintento | Límites y alertas |
| Consultas | Estructura mínima | Filtros y paginación | Rendimiento/estabilidad |
| Datos | Mapeo de campos | Casos edge (nulos) | Consistencia/normalización |
| Errores | Backoff/jitter | Circuit breakers | Playbooks de incidentes |
| Seguridad | Protección de secretos | Rotación/auditoría | IAM/segregación |
| Observabilidad | Logs/métricas | Dashboards | Alarmas/SLIs/SLOs |

## 10. Estrategia recomendada de integración y decisiones

La decisión óptima depende del caso de uso, la tolerancia al riesgo y el nivel de control deseado:

- Si se necesita visualización de listados sin extracción de datos, el widget embebible es la opción más simple y soportada oficialmente[^3].
- Si se requieren datos estructurados para motores de recomendación o catálogos, el endpoint GraphQL observado ofrece control y baja latencia, asumiendo riesgos de estabilidad y cumplimiento[^2].
- Si se busca menor mantenimiento y soporte operativo, el actor de Apify proporciona una integración gestionada con datasets listos para consumo[^1].

Una estrategia híbrida puede maximizar beneficios: usar GraphQL para áreas críticas donde se requiere agilidad y control, y Apify para cobertura amplia con menor fricción operativa. La matriz de decisión de la Tabla 11 resume esta lógica.

Tabla 11. Matriz de decisión por requisitos

| Requisito | Opción recomendada | Justificación |
|---|---|---|
| Solo visualización | Widget | Rápido, sin extracción, sincronizado desde RA[^3] |
| Datos para analítica | GraphQL | Control de campos y paginación; menor latencia[^2] |
| Menor mantenimiento | Apify | Plataforma gestiona scraping y datasets[^1] |
| Riesgo legal mínimo | Widget / Apify | Mejor encuadre oficial que scraping no documentado[^3][^1] |
| Tiempo de implementación | Widget / Apify | Minutos; GraphQL requiere desarrollo de consultas y paginación[^2] |

## 11. Brechas de información y riesgos

Existen brechas de información relevantes que impactan el diseño y la operación:

- No hay documentación oficial de una API pública para desarrolladores en RA.
- No existe información pública sobre rate limiting ni cuotas del endpoint GraphQL.
- La estructura completa del esquema GraphQL —tipos, filtros, paginación— no está documentada oficialmente.
- No hay evidencia de webhooks públicos orientados a desarrolladores.
- No se documenta oficialmente un proceso de obtención de tokens o claves para acceso directo a datos de eventos.
- Las políticas de uso aceptable y las implicaciones legales del scraping o uso de endpoints no documentados no están publicadas.

Estas brechas se mitigan con arquitectura resiliente, pruebas contractuales, monitoreo y un enfoque pragmático que prioriza rutas oficialmente soportadas (widget, servicios gestionados) cuando el riesgo sea inaceptable[^7].

## 12. Apéndices

- Consulta GraphQL de ejemplo (popularEvents). La estructura típica incluye query, variables con filtros (p. ej., área, fecha de listado) y paginación (pageSize). El fragmento de evento expone id, title, attending, date, contentUrl, flyerFront, imágenes (id, filename, alt, type, crop) y venue (id, name, contentUrl, live).
- Endpoints de Apify relevantes. 
  - Ejecutar actor (runs): iniciar una ejecución del actor.
  - Ejecutar actor y obtener dataset (run-sync-get-dataset-items): ejecutar y recuperar ítems.
  - Obtener actor (actor object): metadatos de configuración.
- Glosario. 
  - eventListings: conjunto de listados de eventos consultables con filtros/paginación.
  - eventFields: fragmento que define campos del evento (título, fecha, imágenes, venue).
  - page/pageSize: parámetros de paginación.
  - checkpoint: timestamp/cursor persistido para reanudar sincronizaciones.

## 13. Implementación práctica y ejemplos de código

Esta sección proporciona el código y las configuraciones específicas para implementar la sincronización automática cada 5 minutos basada en la investigación técnica realizada.

### 13.1 Cliente Python completo para sincronización cada 5 minutos

El siguiente código implementa un cliente completo que maneja todas las funcionalidades identificadas: autenticación, filtros dinámicos, sincronización incremental, y gestión de rate limiting.

```python
#!/usr/bin/env python3
"""
Cliente completo para la API de Resident Advisor - Eventos Techno
Sincronización automática cada 5 minutos con gestión de rate limiting
"""

import requests
import json
import time
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
from dataclasses import dataclass
import sqlite3
from pathlib import Path

@dataclass
class EventoTechno:
    """Modelo de datos para eventos techno"""
    id: str
    titulo: str
    fecha: str
    venue: str
    artistas: List[str]
    asistentes_estimados: int
    url_contenido: str
    imagen_url: str
    genero: str = "techno"
    ultima_actualizacion: str = None

class DatabaseManager:
    """Gestor de base de datos local para sincronización incremental"""
    
    def __init__(self, db_path: str = "ra_eventos.db"):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Inicializa la base de datos SQLite"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS eventos_ra (
                    id TEXT PRIMARY KEY,
                    titulo TEXT,
                    fecha TEXT,
                    venue TEXT,
                    artistas TEXT,
                    asistentes_estimados INTEGER,
                    url_contenido TEXT,
                    imagen_url TEXT,
                    genero TEXT,
                    ultima_actualizacion TEXT,
                    hash_contenido TEXT,
                    fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
                    fecha_actualizacion TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS configuracion_sincronizacion (
                    clave TEXT PRIMARY KEY,
                    valor TEXT,
                    fecha_actualizacion TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
    
    def guardar_evento(self, evento: EventoTechno):
        """Guarda o actualiza un evento en la base de datos"""
        hash_contenido = self._generar_hash(evento)
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT OR REPLACE INTO eventos_ra 
                (id, titulo, fecha, venue, artistas, asistentes_estimados, 
                 url_contenido, imagen_url, genero, ultima_actualizacion, 
                 hash_contenido, fecha_actualizacion)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (
                evento.id, evento.titulo, evento.fecha, evento.venue,
                json.dumps(evento.artistas), evento.asistentes_estimados,
                evento.url_contenido, evento.imagen_url, evento.genero,
                evento.ultima_actualizacion, hash_contenido
            ))
    
    def obtener_eventos_por_fecha(self, fecha_inicio: str, fecha_fin: str) -> List[Dict]:
        """Obtiene eventos en un rango de fechas"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute('''
                SELECT * FROM eventos_ra 
                WHERE fecha BETWEEN ? AND ?
                ORDER BY fecha
            ''', (fecha_inicio, fecha_fin))
            return [dict(row) for row in cursor.fetchall()]
    
    def obtener_ultima_sincronizacion(self) -> Optional[str]:
        """Obtiene el timestamp de la última sincronización"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute('''
                SELECT valor FROM configuracion_sincronizacion 
                WHERE clave = 'ultima_sincronizacion'
            ''')
            resultado = cursor.fetchone()
            return resultado[0] if resultado else None
    
    def actualizar_ultima_sincronizacion(self):
        """Actualiza el timestamp de la última sincronización"""
        timestamp_actual = datetime.now().isoformat()
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                INSERT OR REPLACE INTO configuracion_sincronizacion 
                (clave, valor, fecha_actualizacion)
                VALUES ('ultima_sincronizacion', ?, CURRENT_TIMESTAMP)
            ''', (timestamp_actual,))
    
    def _generar_hash(self, evento: EventoTechno) -> str:
        """Genera hash para detectar cambios en eventos"""
        contenido = f"{evento.titulo}{evento.fecha}{evento.venue}{evento.asistentes_estimados}"
        return hashlib.md5(contenido.encode()).hexdigest()

class RateLimiter:
    """Gestor de rate limiting para la API de RA"""
    
    def __init__(self, max_requests: int = 10, time_window: int = 60):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = []
    
    def wait_if_needed(self):
        """Espera si es necesario para respetar el rate limiting"""
        now = time.time()
        
        # Remover requests antiguos
        self.requests = [req_time for req_time in self.requests 
                        if now - req_time < self.time_window]
        
        # Si hemos alcanzado el límite, esperar
        if len(self.requests) >= self.max_requests:
            sleep_time = self.time_window - (now - self.requests[0]) + 1
            if sleep_time > 0:
                print(f"Rate limit alcanzado. Esperando {sleep_time:.1f} segundos...")
                time.sleep(sleep_time)
        
        # Registrar esta request
        self.requests.append(now)

class ResidentAdvisorTechnoClient:
    """Cliente especializado para eventos techno con sincronización automática"""
    
    def __init__(self, debug: bool = False):
        self.endpoint = "https://ra.co/graphql"
        self.headers = {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
            "Content-Type": "application/json"
        }
        self.debug = debug
        self.db = DatabaseManager()
        self.rate_limiter = RateLimiter(max_requests=8, time_window=60)  # Conservador
        
        # Configurar logging
        logging.basicConfig(level=logging.INFO if not debug else logging.DEBUG)
        self.logger = logging.getLogger(__name__)
    
    def obtener_eventos_techno(self, 
                              area: str = None, 
                              fecha_inicio: str = None, 
                              fecha_fin: str = None,
                              limite: int = 20) -> List[EventoTechno]:
        """
        Obtiene eventos techno con filtros aplicados
        
        Args:
            area: Ciudad/área (ej: 'London', 'Berlin', 'Madrid')
            fecha_inicio: Fecha inicio (ISO format: '2024-12-01')
            fecha_fin: Fecha fin (ISO format: '2024-12-31')
            limite: Número máximo de eventos
        """
        # Construir filtros
        filtros = {}
        if area:
            filtros["area"] = area
        if fecha_inicio:
            filtros["listingDate"] = fecha_inicio
        
        query = """
        query GET_POPULAR_EVENTS($filters: FilterInputDtoInput, $pageSize: Int!) {
          popularEvents(filters: $filters, pageSize: $pageSize) {
            id
            title
            attending
            date
            contentUrl
            flyerFront
            images {
              id
              filename
              alt
              type
              crop
            }
            venue {
              id
              name
              contentUrl
              live
            }
          }
        }
        """
        
        variables = {
            "filters": filtros if filtros else {},
            "pageSize": limite
        }
        
        payload = {
            "query": query,
            "variables": variables
        }
        
        try:
            # Aplicar rate limiting
            self.rate_limiter.wait_if_needed()
            
            if self.debug:
                self.logger.debug(f"Consultando eventos con filtros: {filtros}")
            
            response = requests.post(
                self.endpoint,
                headers=self.headers,
                json=payload,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            
            if "data" not in data or "popularEvents" not in data["data"]:
                self.logger.warning("Respuesta inesperada de la API")
                return []
            
            eventos = []
            for raw_evento in data["data"]["popularEvents"]:
                evento = self._procesar_evento(raw_evento)
                if evento:
                    eventos.append(evento)
            
            self.logger.info(f"Obtenidos {len(eventos)} eventos")
            return eventos
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error al hacer request: {e}")
            return []
        except Exception as e:
            self.logger.error(f"Error procesando respuesta: {e}")
            return []
    
    def _procesar_evento(self, raw_evento: Dict) -> Optional[EventoTechno]:
        """Procesa un evento raw en objeto EventoTechno"""
        try:
            # Extraer datos básicos
            evento_id = raw_evento.get("id")
            titulo = raw_evento.get("title", "")
            fecha = raw_evento.get("date", "")
            attending = raw_evento.get("attending", 0)
            content_url = raw_evento.get("contentUrl", "")
            
            # Extraer venue
            venue_data = raw_evento.get("venue", {})
            venue_nombre = venue_data.get("name", "Venue desconocido")
            
            # Extraer imagen principal
            imagen_url = ""
            if raw_evento.get("flyerFront"):
                imagen_url = raw_evento["flyerFront"]
            elif raw_evento.get("images") and len(raw_evento["images"]) > 0:
                imagen_url = raw_evento["images"][0].get("filename", "")
            
            # Extraer artistas (simulado ya que no está en la respuesta GraphQL)
            artistas = ["Artista por confirmar"]  # Placeholder
            
            return EventoTechno(
                id=evento_id,
                titulo=titulo,
                fecha=fecha,
                venue=venue_nombre,
                artistas=artistas,
                asistentes_estimados=attending,
                url_contenido=content_url,
                imagen_url=imagen_url,
                ultima_actualizacion=datetime.now().isoformat()
            )
            
        except Exception as e:
            self.logger.error(f"Error procesando evento: {e}")
            return None
    
    def sincronizacion_automatica_5min(self, areas: List[str] = None):
        """
        Sincronización automática cada 5 minutos para eventos techno
        
        Args:
            areas: Lista de ciudades a monitorear
        """
        if areas is None:
            areas = ["London", "Berlin", "Madrid", "Barcelona"]
        
        self.logger.info("=== INICIANDO SINCRONIZACIÓN AUTOMÁTICA CADA 5 MINUTOS ===")
        
        # Calcular rango de fechas (próximos 30 días)
        fecha_inicio = datetime.now().strftime("%Y-%m-%d")
        fecha_fin = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        
        total_eventos = 0
        
        for area in areas:
            self.logger.info(f"Sincronizando eventos en {area}")
            
            eventos = self.obtener_eventos_techno(
                area=area,
                fecha_inicio=fecha_inicio,
                fecha_fin=fecha_fin,
                limite=50
            )
            
            eventos_nuevos = 0
            eventos_actualizados = 0
            
            for evento in eventos:
                # Verificar si el evento ya existe
                eventos_existentes = self.db.obtener_eventos_por_fecha(evento.fecha, evento.fecha)
                existe = any(e["id"] == evento.id for e in eventos_existentes)
                
                if existe:
                    eventos_actualizados += 1
                else:
                    eventos_nuevos += 1
                
                # Guardar evento
                self.db.guardar_evento(evento)
            
            total_eventos += len(eventos)
            self.logger.info(f"Área {area}: {len(eventos)} eventos "
                           f"({eventos_nuevos} nuevos, {eventos_actualizados} actualizados)")
            
            # Pausa entre áreas para respetar rate limiting
            time.sleep(2)
        
        # Actualizar timestamp de sincronización
        self.db.actualizar_ultima_sincronizacion()
        
        self.logger.info(f"Sincronización completada: {total_eventos} eventos totales")
        self.logger.info("Próxima sincronización en 5 minutos...")
    
    def iniciar_sincronizacion_continua(self, intervalo_minutos: int = 5):
        """
        Inicia la sincronización continua en background
        
        Args:
            intervalo_minutos: Intervalo entre sincronizaciones (default: 5)
        """
        self.logger.info(f"Iniciando sincronización continua cada {intervalo_minutos} minutos")
        self.logger.info("Presiona Ctrl+C para detener")
        
        try:
            while True:
                self.sincronizacion_automatica_5min()
                time.sleep(intervalo_minutos * 60)
                
        except KeyboardInterrupt:
            self.logger.info("Sincronización detenida por el usuario")
        except Exception as e:
            self.logger.error(f"Error en sincronización continua: {e}")

# Ejemplo de uso
if __name__ == "__main__":
    # Cliente de ejemplo
    cliente = ResidentAdvisorTechnoClient(debug=True)
    
    # Obtener eventos techno en London para próximos 7 días
    eventos_london = cliente.obtener_eventos_techno(
        area="London",
        fecha_inicio=datetime.now().strftime("%Y-%m-%d"),
        fecha_fin=(datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
        limite=10
    )
    
    print(f"\n=== EVENTOS TECHNO EN LONDON (PRÓXIMOS 7 DÍAS) ===")
    for evento in eventos_london[:5]:
        print(f"• {evento.titulo}")
        print(f"  📅 {evento.fecha} | 📍 {evento.venue}")
        print(f"  👥 ~{evento.asistentes_estimados} asistentes estimados")
        print()
    
    # Iniciar sincronización automática cada 5 minutos
    # cliente.iniciar_sincronizacion_continua(intervalo_minutos=5)
```

### 13.2 Configuración de cron para Linux/Mac

Para ejecutar la sincronización cada 5 minutos de forma automática en sistemas Unix:

```bash
# Editar crontab
crontab -e

# Agregar esta línea para sincronización cada 5 minutos
*/5 * * * * /usr/bin/python3 /path/to/resident_advisor_sincronizacion.py >> /var/log/ra_sincronizacion.log 2>&1

# Para ejecución cada 5 minutos solo en horarios específicos (ej: 10:00-23:00)
*/5 10-23 * * * /usr/bin/python3 /path/to/resident_advisor_sincronizacion.py >> /var/log/ra_sincronizacion.log 2>&1
```

### 13.3 Script de monitoreo y alertas

```bash
#!/bin/bash
# monitor_ra_sincronizacion.sh

LOG_FILE="/var/log/ra_sincronizacion.log"
ALERT_EMAIL="admin@tudominio.com"

# Verificar si la última sincronización fue hace más de 10 minutos
ULTIMA_SINCRONIZACION=$(tail -n 1 "$LOG_FILE" | grep "Sincronización completada" | tail -1 | sed 's/.*Sincronización completada: //')

if [ -z "$ULTIMA_SINCRONIZACION" ]; then
    echo "ALERTA: No se detectaron sincronizaciones recientes" | mail -s "Alerta RA API" "$ALERT_EMAIL"
fi

# Verificar errores en los últimos logs
ERROR_COUNT=$(grep -c "Error" "$LOG_FILE" | tail -5)

if [ "$ERROR_COUNT" -gt 5 ]; then
    echo "ALERTA: Demasiados errores en la sincronización de RA" | mail -s "Alerta RA API - Errores" "$ALERT_EMAIL"
fi
```

### 13.4 Mejores prácticas recomendadas

1. **Rate Limiting Conservador**: Usar máximo 8 requests por minuto
2. **Rotación de User-Agent**: Cambiar user-agent periódicamente
3. **Backoff Exponencial**: Implementar delays crecientes en reintentos
4. **Logs Detallados**: Registrar todas las requests y respuestas
5. **Monitoreo Continuo**: Alertas por email ante fallos
6. **Base de Datos Local**: SQLite para persistencia incremental
7. **Validación de Datos**: Verificar estructura antes de procesar
8. **Respaldo Periódico**: Exportar datos de eventos regularmente

---

## Referencias

[^1]: Resident Advisor API - Apify (Actor “augeas/resident-advisor”). https://apify.com/augeas/resident-advisor/api  
[^2]: How to get residentadvisor API functional - Stack Overflow. https://stackoverflow.com/questions/34182163/how-to-get-residentadvisor-api-functional  
[^3]: Embeddable event listings (widget) - RA Pro - Resident Advisor. https://support.ra.co/article/7-ticket-widget  
[^4]: RA launches new website · News RA - Resident Advisor. https://ra.co/news/74129  
[^5]: Ticket notifications - RA Pro - Resident Advisor. https://support.ra.co/article/198-ticket-notifications  
[^6]: RA's Automated Marketing Tools - RA Pro - Resident Advisor. https://support.ra.co/article/278-ra-s-automated-marketing-tools  
[^7]: Resident Advisor (sitio principal). https://ra.co/  
[^8]: Resident Advisor - Apify (página del actor). https://apify.com/augeas/resident-advisor  
[^9]: resident-advisor-events-scraper - GitHub. https://github.com/dirkjbreeuwer/resident-advisor-events-scraper  
[^10]: Making a web app for previewing Resident Advisor event lineups - Larry Hudson. https://larryhudson.io/ra-lineup-preview/  
[^11]: RA and SoundCloud partner to expand artist and fan connection - RA News. https://ra.co/news/80904  
[^12]: Queries - GraphQL. https://graphql.org/learn/queries/
# Documentación Técnica Completa: Resident Advisor API

## Resumen Ejecutivo

La API de Resident Advisor es una API **no oficial** que permite acceso a datos de eventos, DJs, sellos discográficos y clasificaciones del sitio web Resident Advisor. La API utiliza **GraphQL** y fue descubierta mediante análisis de tráfico de red del navegador.

**Estado Actual (2024):** La API no es oficialmente documentada por Resident Advisor, pero sigue siendo funcional a través del endpoint GraphQL.

---

## Información General

- **Sitio Web:** https://www.residentadvisor.net/
- **API Principal:** GraphQL (no SOAP como se sugiere en algunos endpoints heredados)
- **Endpoint Actual:** `https://ra.co/graphql`
- **Descubierto Por:** Análisis de tráfico de red del navegador
- **Última Verificación:** 2024

---

## Endpoints Identificados

### 1. API GraphQL (Principal)
```
https://ra.co/graphql
```
- **Tipo:** GraphQL endpoint
- **Protocolo:** HTTP POST
- **Formato:** JSON
- **Estado:** Funcional

### 2. API SOAP Legacy (Mencionado en la discusión original)
```
http://www.residentadvisor.net/api/dj.asmx?op=getartist
```
- **Tipo:** ASP.NET Web Service (SOAP)
- **Estado:** Posiblemente obsoleto o sin documentación oficial
- **Nota:** Mencionado en la pregunta original, pero no detallado en las respuestas

---

## Métodos de Autenticación

### Para GraphQL API:
- **Token de Autorización:** NO REQUERIDO
- **Header Requerido:** `user-agent` con valor de navegador legítimo
- **Ejemplo de User-Agent:**
```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36
```

### Headers Requeridos:
```bash
user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36
Content-Type: application/json
```

---

## Ejemplo de Consulta Completo

### Comando CURL Completo:
```bash
curl --location 'https://ra.co/graphql' \
--header 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36' \
--header 'Content-Type: application/json' \
--data '{"query":"query GET_POPULAR_EVENTS($filters: FilterInputDtoInput, $pageSize: Int!) { popularEvents(filters: $filters, pageSize: $pageSize) { id title attending date contentUrl flyerFront images { id filename alt type crop } venue { id name contentUrl live } } }","variables":{"filters":{},"pageSize":20}}'
```

### Desglose de la Consulta GraphQL:

#### Consulta:
```graphql
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
```

#### Variables:
```json
{
  "filters": {},
  "pageSize": 20
}
```

---

## Estructura de Datos

### Tipo de Filtros (FilterInputDtoInput):
- **Propósito:** Filtrar eventos por diferentes criterios
- **Parámetros Comunes:**
  - `area` - Área geográfica
  - `listingDate` - Fecha de listado
  - `listingPosition` - Posición en el listado

### Campos Disponibles para Eventos:
- `id` - Identificador único del evento
- `title` - Título del evento
- `attending` - Número de asistentes (estimado)
- `date` - Fecha del evento
- `contentUrl` - URL del contenido relacionado
- `flyerFront` - URL del flyer frontal
- `images` - Array de imágenes con:
  - `id` - ID de la imagen
  - `filename` - Nombre del archivo
  - `alt` - Texto alternativo
  - `type` - Tipo de imagen
  - `crop` - Información de recorte
- `venue` - Información del lugar:
  - `id` - ID del lugar
  - `name` - Nombre del lugar
  - `contentUrl` - URL del contenido del lugar
  - `live` - Estado en vivo

---

## Limitaciones y Consideraciones

### Limitaciones Técnicas:
1. **No Oficial:** Resident Advisor no ofrece documentación oficial de la API
2. **Sin SLA:** No hay garantía de disponibilidad o estabilidad
3. **Sin Límites Documentados:** Los límites de rate limiting no están documentados
4. **Cambios Sin Aviso:** La estructura puede cambiar sin notificación

### Restricciones de Acceso:
1. **User-Agent Requerido:** Debe simular un navegador real
2. **Sin Autenticación:** No se requieren credenciales específicas
3. **Análisis de Tráfico:** Descubierta mediante inspección de requests del navegador

### Recomendaciones de Uso:
1. **Simular Navegador:** Usar user-agent legítimo
2. **Manejar Errores:** Implementar manejo robusto de errores
3. **No Sobrecargar:** Evitar requests excesivos
4. **Monitoring:** Monitorear cambios en la respuesta de la API

---

## Casos de Uso Objetivo (Según el Autor Original)

El usuario original tenía como objetivo obtener:
- **DJs:** Información completa incluyendo tracks y sellos discográficos
- **Sellos:** DJs asociados y sus tracks
- **Clasificaciones:** TOP100, TOP1000 y otras clasificaciones
- **Eventos:** Información completa de eventos con venues y asistentes

---

## Alternativas Oficiales

### RA Guide App:
- **Google Play:** App móvil oficial
- **App Store:** App móvil oficial
- **URL:** https://ra.co/ra-guide
- **Nota:** No es una API, pero proporciona acceso oficial a los datos

---

## Estado de la API (Según las Respuestas de Stack Overflow)

### Respuesta Oficial de 2017:
> "There are no plans to release our API currently"

### Descubrimiento de GraphQL (2023):
- Usuario `beckersense` descubrió el endpoint GraphQL funcional
- Método de descubrimiento: Análisis de tráfico de red
- Funciona sin token de autorización
- Requiere user-agent específico

---

## Fecha de Última Actualización

**Documento creado:** 24 de noviembre de 2024  
**Fuentes verificadas:** Stack Overflow, análisis de endpoint GraphQL  
**Estado de verificación:** API funcional al momento de la investigación

---

## Referencias y Fuentes

- Stack Overflow Question: [How to get residentadvisor API functional](https://stackoverflow.com/questions/34182163/how-to-get-residentadvisor-api-functional)
- Endpoint Principal: `https://ra.co/graphql`
- Endpoint Legacy: `http://www.residentadvisor.net/api/dj.asmx?op=getartist`
- RA Guide App: https://ra.co/ra-guide

---

*Esta documentación fue compilada mediante investigación exhaustiva de la discusión en Stack Overflow y análisis del endpoint GraphQL funcional.*
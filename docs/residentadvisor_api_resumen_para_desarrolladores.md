# Resident Advisor API - Resumen para Desarrolladores

## 🚀 Inicio Rápido

### Endpoint Principal
```
https://ra.co/graphql
```

### Header Mínimo Requerido
```bash
user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36
Content-Type: application/json
```

### ⚠️ Importante
- **NO requiere autenticación**
- **NO es oficial** - use bajo su propio riesgo
- **Requiere user-agent de navegador legítimo**

---

## 📋 Comandos Lista para Usar

### 1. Comando CURL Básico (Copiar y Pegar)
```bash
curl --location 'https://ra.co/graphql' \
--header 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36' \
--header 'Content-Type: application/json' \
--data '{"query":"query GET_POPULAR_EVENTS($filters: FilterInputDtoInput, $pageSize: Int!) { popularEvents(filters: $filters, pageSize: $pageSize) { id title attending date contentUrl flyerFront images { id filename alt type crop } venue { id name contentUrl live } } }","variables":{"filters":{},"pageSize":20}}'
```

### 2. Python (Simple)
```python
import requests

headers = {
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
    "Content-Type": "application/json"
}

data = {
    "query": "query GET_POPULAR_EVENTS($filters: FilterInputDtoInput, $pageSize: Int!) { popularEvents(filters: $filters, pageSize: $pageSize) { id title attending date venue { name } } }",
    "variables": {"filters": {}, "pageSize": 10}
}

response = requests.post('https://ra.co/graphql', headers=headers, json=data)
print(response.json())
```

### 3. JavaScript/Node.js
```javascript
const axios = require('axios');

const headers = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
    'Content-Type': 'application/json'
};

const data = {
    query: "query GET_POPULAR_EVENTS($filters: FilterInputDtoInput, $pageSize: Int!) { popularEvents(filters: $filters, pageSize: $pageSize) { id title attending date venue { name } } }",
    variables: { filters: {}, pageSize: 10 }
};

axios.post('https://ra.co/graphql', data, { headers })
    .then(response => console.log(response.data))
    .catch(error => console.error(error));
```

---

## 🔍 Filtros Disponibles

### Filtrar por Área
```json
{
  "variables": {
    "filters": {
      "area": "London"
    },
    "pageSize": 10
  }
}
```

### Filtrar por Fecha de Listado
```json
{
  "variables": {
    "filters": {
      "listingDate": "2024-12-01"
    },
    "pageSize": 10
  }
}
```

### Filtrar por Posición en Listado
```json
{
  "variables": {
    "filters": {
      "listingPosition": 100
    },
    "pageSize": 10
  }
}
```

---

## 📊 Estructura de Respuesta

Cada evento contiene:
```json
{
  "id": "12345",
  "title": "Nombre del Evento",
  "attending": 1500,
  "date": "2024-12-01T20:00:00",
  "contentUrl": "https://ra.co/events/12345",
  "flyerFront": "https://cdn.residentadvisor.net/images/flyer/12345.jpg",
  "images": [
    {
      "id": "img1",
      "filename": "event1.jpg",
      "alt": "Flyer del evento",
      "type": "flyer",
      "crop": "portrait"
    }
  ],
  "venue": {
    "id": "venue123",
    "name": "Nombre del Venue",
    "contentUrl": "https://ra.co/venues/123",
    "live": true
  }
}
```

---

## ⚡ Casos de Uso Comunes

### 1. Obtener TOP Eventos en Londres
```json
{
  "query": "query GET_POPULAR_EVENTS($filters: FilterInputDtoInput, $pageSize: Int!) { popularEvents(filters: $filters, pageSize: $pageSize) { id title attending date venue { name } } }",
  "variables": {
    "filters": {"area": "London"},
    "pageSize": 50
  }
}
```

### 2. Obtener Eventos por Fecha Específica
```json
{
  "query": "query GET_POPULAR_EVENTS($filters: FilterInputDtoInput, $pageSize: Int!) { popularEvents(filters: $filters, pageSize: $pageSize) { id title date venue { name } } }",
  "variables": {
    "filters": {"listingDate": "2024-12-01"},
    "pageSize": 20
  }
}
```

### 3. Obtener Solo Info del Venue
```json
{
  "query": "query GET_POPULAR_EVENTS($filters: FilterInputDtoInput, $pageSize: Int!) { popularEvents(filters: $filters, pageSize: $pageSize) { venue { id name contentUrl } } }",
  "variables": {
    "filters": {},
    "pageSize": 100
  }
}
```

---

## 🛠️ Mejores Prácticas

### ✅ Hacer:
- Usar user-agent legítimo
- Implementar manejo de errores
- Agregar delays entre requests
- Manejar rate limiting
- Cachear respuestas cuando sea posible

### ❌ No Hacer:
- No usar user-agent genérico o vacío
- No hacer requests masivos sin delays
- No depender de la estabilidad de la API
- No almacenar datos sensibles

---

## 🔧 Resolución de Problemas

### Error 403/401
- **Causa:** User-agent no válido o faltante
- **Solución:** Usar user-agent de navegador legítimo

### Respuestas Vacías
- **Causa:** Filtros muy restrictivos o fecha futura
- **Solución:** Verificar filtros o usar fecha presente/pasado

### Error de Conexión
- **Causa:** API temporalmente no disponible
- **Solución:** Implementar retry con backoff exponencial

---

## 📚 Documentación Completa

Para información técnica completa, consultar:
- **Documentación detallada:** [`residentadvisor_api_technical_documentation.md`](/workspace/docs/residentadvisor_api_technical_documentation.md)
- **Ejemplos de código:** [`residentadvisor_api_examples.py`](/workspace/code/residentadvisor_api_examples.py), [`residentadvisor_api_examples.js`](/workspace/code/residentadvisor_api_examples.js)

---

## 🔗 Enlaces Útiles

- **Stack Overflow Original:** https://stackoverflow.com/questions/34182163/how-to-get-residentadvisor-api-functional
- **RA Guide App:** https://ra.co/ra-guide
- **Resident Advisor:** https://www.residentadvisor.net/

---

**Última actualización:** 24 de noviembre de 2024
**Estado:** API funcional verificada
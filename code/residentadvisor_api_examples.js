/**
 * Ejemplos de código para Resident Advisor API
 * Incluye ejemplos en JavaScript/Node.js y Bash
 */

// ============================================
// JAVAScript/NODE.js
// ============================================

const axios = require('axios');

class ResidentAdvisorAPI {
    constructor() {
        this.endpoint = 'https://ra.co/graphql';
        this.headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
            'Content-Type': 'application/json'
        };
    }

    /**
     * Obtiene eventos populares
     */
    async getPopularEvents(filters = {}, pageSize = 20) {
        const query = `
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
        `;

        const variables = {
            filters,
            pageSize
        };

        try {
            const response = await axios.post(this.endpoint, {
                query,
                variables
            }, {
                headers: this.headers
            });

            return response.data;
        } catch (error) {
            console.error('Error al hacer request:', error.message);
            return null;
        }
    }

    /**
     * Obtiene eventos por área específica
     */
    async getEventsByArea(area, pageSize = 20) {
        const filters = { area };
        return this.getPopularEvents(filters, pageSize);
    }

    /**
     * Obtiene eventos por fecha de listado
     */
    async getEventsByListingDate(listingDate, pageSize = 20) {
        const filters = { listingDate };
        return this.getPopularEvents(filters, pageSize);
    }
}

// Ejemplo de uso
async function ejemploJavaScript() {
    console.log('=== EJEMPLO JAVASCRIPT/NODE.js ===');
    
    const raApi = new ResidentAdvisorAPI();
    
    try {
        // Obtener eventos populares
        const eventos = await raApi.getPopularEvents({}, 10);
        
        if (eventos && eventos.data && eventos.data.popularEvents) {
            console.log(`Se encontraron ${eventos.data.popularEvents.length} eventos:`);
            
            eventos.data.popularEvents.forEach((evento, index) => {
                console.log(`${index + 1}. ${evento.title}`);
                console.log(`   Fecha: ${evento.date}`);
                console.log(`   Asistentes: ${evento.attending}`);
                console.log(`   Lugar: ${evento.venue.name}`);
                console.log('');
            });
        }
        
        // Ejemplo con filtros
        console.log('=== EJEMPLO CON FILTROS ===');
        const eventosLondon = await raApi.getEventsByArea('London', 5);
        
        if (eventosLondon && eventosLondon.data) {
            console.log(`Eventos en London: ${eventosLondon.data.popularEvents?.length || 0}`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// ============================================
// BASH/CURL
// ============================================

const ejemplosBash = {
    /**
     * Ejemplo básico de CURL
     */
    comandoCurlBasico: `curl --location 'https://ra.co/graphql' \\
--header 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36' \\
--header 'Content-Type: application/json' \\
--data '{
  "query": "query GET_POPULAR_EVENTS($filters: FilterInputDtoInput, $pageSize: Int!) { popularEvents(filters: $filters, pageSize: $pageSize) { id title attending date contentUrl flyerFront images { id filename alt type crop } venue { id name contentUrl live } } }",
  "variables": {
    "filters": {},
    "pageSize": 20
  }
}'`,

    /**
     * CURL con filtros por área
     */
    comandoCurlConFiltros: `curl --location 'https://ra.co/graphql' \\
--header 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36' \\
--header 'Content-Type: application/json' \\
--data '{
  "query": "query GET_POPULAR_EVENTS($filters: FilterInputDtoInput, $pageSize: Int!) { popularEvents(filters: $filters, pageSize: $pageSize) { id title attending date contentUrl flyerFront images { id filename alt type crop } venue { id name contentUrl live } } }",
  "variables": {
    "filters": {"area": "London"},
    "pageSize": 10
  }
}'`,

    /**
     * CURL con formato legible
     */
    comandoCurlFormateado: `curl --location 'https://ra.co/graphql' \\
  --header 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36' \\
  --header 'Content-Type: application/json' \\
  --data '{
    "query": "query GET_POPULAR_EVENTS($filters: FilterInputDtoInput, $pageSize: Int!) { popularEvents(filters: $filters, pageSize: $pageSize) { id title attending date contentUrl flyerFront images { id filename alt type crop } venue { id name contentUrl live } } }",
    "variables": {
      "filters": {
        "area": "Berlin",
        "listingDate": "2024-12-01"
      },
      "pageSize": 15
    }
  }'`
};

/**
 * Función para mostrar todos los ejemplos bash
 */
function mostrarEjemplosBash() {
    console.log('=== EJEMPLOS BASH/CURL ===');
    console.log('');
    console.log('1. Comando básico:');
    console.log(ejemplosBash.comandoCurlBasico);
    console.log('');
    console.log('2. Con filtros por área:');
    console.log(ejemplosBash.comandoCurlConFiltros);
    console.log('');
    console.log('3. Con formato legible y múltiples filtros:');
    console.log(ejemplosBash.comandoCurlFormateado);
    console.log('');
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Función para hacer requests con retry
 */
async function makeRequestWithRetry(api, query, variables, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await api.getPopularEvents(variables);
            return response;
        } catch (error) {
            console.log(`Intento ${i + 1} falló: ${error.message}`);
            if (i === maxRetries - 1) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

/**
 * Función para procesar múltiples requests con delays
 */
async function processMultipleRequests(api, requests, delayMs = 1000) {
    const results = [];
    
    for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        console.log(`Procesando request ${i + 1}/${requests.length}`);
        
        try {
            const result = await api.getPopularEvents(request.filters, request.pageSize);
            results.push({
                request: request,
                result: result,
                success: true
            });
        } catch (error) {
            results.push({
                request: request,
                error: error.message,
                success: false
            });
        }
        
        // Delay entre requests para evitar rate limiting
        if (i < requests.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    
    return results;
}

// ============================================
// EJECUCIÓN DE EJEMPLOS
// ============================================

// Si se ejecuta directamente (no como módulo)
if (require.main === module) {
    console.log('Resident Advisor API - Ejemplos de Código');
    console.log('=' .repeat(60));
    
    // Mostrar ejemplos bash
    mostrarEjemplosBash();
    
    // Ejecutar ejemplo JavaScript
    ejemploJavaScript().catch(console.error);
}

// Exportar para uso como módulo
module.exports = {
    ResidentAdvisorAPI,
    ejemplosBash,
    makeRequestWithRetry,
    processMultipleRequests,
    mostrarEjemplosBash,
    ejemploJavaScript
};
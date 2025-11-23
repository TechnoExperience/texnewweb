#!/usr/bin/env python3
"""
Ejemplos de código para interactuar con la API de Resident Advisor
Basado en la investigación de Stack Overflow
"""

import requests
import json
from typing import Dict, Any, Optional

class ResidentAdvisorAPI:
    """Cliente para la API de Resident Advisor GraphQL"""
    
    def __init__(self):
        self.endpoint = "https://ra.co/graphql"
        self.headers = {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
            "Content-Type": "application/json"
        }
    
    def get_popular_events(self, filters: Optional[Dict] = None, page_size: int = 20) -> Dict[str, Any]:
        """
        Obtiene eventos populares usando GraphQL
        
        Args:
            filters: Diccionario con filtros (ej: {'area': 'London', 'listingDate': '2024-01-01'})
            page_size: Número de eventos a obtener
            
        Returns:
            Dict con la respuesta de la API
        """
        if filters is None:
            filters = {}
            
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
            "filters": filters,
            "pageSize": page_size
        }
        
        payload = {
            "query": query,
            "variables": variables
        }
        
        try:
            response = requests.post(
                self.endpoint,
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error al hacer request: {e}")
            return {}
    
    def get_dj_info(self, dj_id: str) -> Dict[str, Any]:
        """
        Obtiene información de un DJ específico (ejemplo genérico)
        Nota: Esta consulta requiere adaptación según los campos disponibles en GraphQL
        """
        query = """
        query GET_DJ_INFO($id: ID!) {
          dj(id: $id) {
            id
            name
            tracks {
              id
              title
              label {
                id
                name
              }
            }
            charts {
              id
              title
              position
            }
          }
        }
        """
        
        variables = {"id": dj_id}
        
        payload = {
            "query": query,
            "variables": variables
        }
        
        try:
            response = requests.post(
                self.endpoint,
                headers=self.headers,
                json=payload
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error al hacer request: {e}")
            return {}


def ejemplo_curl_completo():
    """Ejemplo de comando CURL completo para obtener eventos populares"""
    print("=== EJEMPLO COMANDO CURL COMPLETO ===")
    curl_command = """curl --location 'https://ra.co/graphql' \\
--header 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36' \\
--header 'Content-Type: application/json' \\
--data '{
  "query": "query GET_POPULAR_EVENTS($filters: FilterInputDtoInput, $pageSize: Int!) { popularEvents(filters: $filters, pageSize: $pageSize) { id title attending date contentUrl flyerFront images { id filename alt type crop } venue { id name contentUrl live } } }",
  "variables": {
    "filters": {},
    "pageSize": 20
  }
}'"""
    print(curl_command)
    print("\n")


def ejemplo_python_completo():
    """Ejemplo completo de uso en Python"""
    print("=== EJEMPLO PYTHON COMPLETO ===")
    
    # Inicializar cliente
    ra_api = ResidentAdvisorAPI()
    
    # Obtener eventos populares
    print("Obteniendo eventos populares...")
    eventos = ra_api.get_popular_events(page_size=10)
    
    if eventos and 'data' in eventos and 'popularEvents' in eventos['data']:
        print(f"Se encontraron {len(eventos['data']['popularEvents'])} eventos:")
        for evento in eventos['data']['popularEvents'][:3]:  # Solo los primeros 3
            print(f"- {evento['title']} ({evento['date']})")
            print(f"  Asistentes estimados: {evento['attending']}")
            print(f"  Lugar: {evento['venue']['name']}")
            print()
    else:
        print("No se pudieron obtener eventos o la respuesta no tiene la estructura esperada")


def ejemplo_filtros():
    """Ejemplo con filtros específicos"""
    print("=== EJEMPLO CON FILTROS ===")
    
    ra_api = ResidentAdvisorAPI()
    
    # Filtros por área
    filtros_london = {
        "area": "London"
    }
    
    print("Buscando eventos en London...")
    eventos_london = ra_api.get_popular_events(filters=filtros_london, page_size=5)
    
    if eventos_london and 'data' in eventos_london:
        print(f"Eventos en London: {len(eventos_london['data'].get('popularEvents', []))}")
    
    # Filtros por fecha de listado
    filtros_fecha = {
        "listingDate": "2024-11-01"
    }
    
    print("Buscando eventos listados después del 1 de noviembre...")
    eventos_fecha = ra_api.get_popular_events(filters=filtros_fecha, page_size=5)
    
    if eventos_fecha and 'data' in eventos_fecha:
        print(f"Eventos después de la fecha: {len(eventos_fecha['data'].get('popularEvents', []))}")


if __name__ == "__main__":
    print("=" * 60)
    print("EJEMPLOS DE USO - RESIDENT ADVISOR API")
    print("=" * 60)
    
    # Mostrar ejemplo CURL
    ejemplo_curl_completo()
    
    # Ejemplo Python básico
    print("Ejecutando ejemplo Python...")
    ejemplo_python_completo()
    
    print("\n" + "=" * 60)
    print("EJEMPLOS DE FILTROS")
    print("=" * 60)
    ejemplo_filtros()
    
    print("\n" + "=" * 60)
    print("NOTAS IMPORTANTES:")
    print("- Esta API no es oficial")
    print("- No requiere autenticación")
    print("- Usa user-agent de navegador legítimo")
    print("- Respeta límites de rate limiting")
    print("- La estructura puede cambiar sin aviso")
    print("=" * 60)
import requests

def query_isc_sans_api(query_type, query_value, api_key=None):
    """
    Funzione per interrogare l'API di ISC SANS con un'opzione di chiave API.
    
    query_type: Tipo di query (es. 'ip', 'port', 'handler')
    query_value: Valore della query (es. '8.8.8.8' per un IP)
    api_key: (opzionale) La tua chiave API, se richiesta.
    """
    base_url = f"https://isc.sans.edu/api/{query_type}/{query_value}?json"
    headers = {}

    if api_key:
        headers['Authorization'] = f'Bearer {api_key}'
    
    try:
        response = requests.get(base_url, headers=headers)
        response.raise_for_status()  # Verifica che la richiesta sia andata a buon fine
        return response.json()  # Restituisce la risposta come JSON
    except requests.exceptions.HTTPError as http_err:
        print(f"Errore HTTP: {http_err}")
    except requests.exceptions.RequestException as err:
        print(f"Errore di connessione: {err}")
    return None
    

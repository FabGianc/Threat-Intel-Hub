import requests

# Funzione per interrogare OSINT.industries e salvare la risposta come PDF
def query_osint_industries_pdf(query_type, query_value, api_key, filename='osint_results.pdf', timeout=60):
    """
    query_type: 'email', 'phone', etc.
    query_value: Il valore da cercare (es. 'example@example.com').
    timeout: Tempo massimo di attesa (max 150 secondi).
    """
    url = f'https://api.osint.industries/v2/request?type={query_type}&query={query_value}&timeout={timeout}'
    headers = {
        'accept': 'application/pdf',  # Richiedi il formato PDF
        'api-key': api_key
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            # Salva direttamente il PDF
            with open(filename, 'wb') as f:
                f.write(response.content)
            print(f"Risultato salvato come {filename}")
        elif response.status_code == 451:
            raise Exception("Errore 451: La richiesta è bloccata per motivi legali o restrizioni geografiche.")
        else:
            raise Exception(f"Errore nella richiesta a OSINT Industries: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Errore nella connessione: {e}")

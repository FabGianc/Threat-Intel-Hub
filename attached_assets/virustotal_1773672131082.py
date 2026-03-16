import requests

# Funzione per interrogare VirusTotal
def query_virustotal(domain, api_key):
    url = 'https://www.virustotal.com/vtapi/v2/domain/report'
    params = {'apikey': api_key, 'domain': domain}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Errore nella richiesta a VirusTotal: {response.status_code}")

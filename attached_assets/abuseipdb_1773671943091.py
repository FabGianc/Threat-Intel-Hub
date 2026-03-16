import requests

# Funzione per interrogare AbuseIPDB (per gli IP)
def query_abuseipdb(ip, api_key):
    url = 'https://api.abuseipdb.com/api/v2/check'
    headers = {'Key': api_key, 'Accept': 'application/json'}
    params = {'ipAddress': ip, 'maxAgeInDays': '90'}
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Errore nella richiesta a AbuseIPDB: {response.status_code}")

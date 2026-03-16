import requests

# Funzione per interrogare URLScan.io
def query_urlscan(domain, api_key):
    url = 'https://urlscan.io/api/v1/search/'
    headers = {'API-Key': api_key}
    params = {'q': domain}
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Errore nella richiesta a URLScan.io: {response.status_code}")

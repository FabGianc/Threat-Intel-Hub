import requests
import sys
import json
import os

def query_abuseipdb(ip, api_key):
    url = 'https://api.abuseipdb.com/api/v2/check'
    headers = {'Key': api_key, 'Accept': 'application/json'}
    params = {'ipAddress': ip, 'maxAgeInDays': '90'}
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Errore nella richiesta a AbuseIPDB: {response.status_code}")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else None
    if not target:
        print("Errore: nessun target specificato.", file=sys.stderr)
        sys.exit(1)

    api_key = os.environ.get("ABUSEIPDB_API_KEY")
    if not api_key:
        print("Errore: ABUSEIPDB_API_KEY non impostata.", file=sys.stderr)
        sys.exit(1)

    try:
        result = query_abuseipdb(target, api_key)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)

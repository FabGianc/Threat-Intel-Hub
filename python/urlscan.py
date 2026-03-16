import requests
import sys
import json
import os

def query_urlscan(domain, api_key):
    url = 'https://urlscan.io/api/v1/search/'
    headers = {'API-Key': api_key}
    params = {'q': domain}
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Errore nella richiesta a URLScan.io: {response.status_code}")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else None

    if not target:
        print("Errore: nessun target specificato.", file=sys.stderr)
        sys.exit(1)

    api_key = os.environ.get("URLSCAN_API_KEY")
    if not api_key:
        print("Errore: URLSCAN_API_KEY non impostata.", file=sys.stderr)
        sys.exit(1)

    try:
        result = query_urlscan(target, api_key)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)

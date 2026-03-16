import requests
import sys
import json
import os

def query_isc_sans_api(query_type, query_value, api_key=None):
    base_url = f"https://isc.sans.edu/api/{query_type}/{query_value}?json"
    headers = {}
    if api_key:
        headers['Authorization'] = f'Bearer {api_key}'
    try:
        response = requests.get(base_url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as http_err:
        print(f"Errore HTTP: {http_err}", file=sys.stderr)
    except requests.exceptions.RequestException as err:
        print(f"Errore di connessione: {err}", file=sys.stderr)
    return None

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else None
    if not target:
        print("Errore: nessun target specificato.", file=sys.stderr)
        sys.exit(1)

    api_key = os.environ.get("ISC_SANS_API_KEY")

    result = query_isc_sans_api("ip", target, api_key)
    if result:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(f"Nessun risultato da ISC SANS per: {target}", file=sys.stderr)
        sys.exit(1)

import requests
import sys
import json
import os

def query_virustotal(domain, api_key):
    url = 'https://www.virustotal.com/vtapi/v2/domain/report'
    params = {'apikey': api_key, 'domain': domain}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Errore nella richiesta a VirusTotal: {response.status_code}")

def query_virustotal_ip(ip, api_key):
    url = 'https://www.virustotal.com/vtapi/v2/ip-address/report'
    params = {'apikey': api_key, 'ip': ip}
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Errore nella richiesta a VirusTotal (IP): {response.status_code}")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else None
    analysis_type = sys.argv[2] if len(sys.argv) > 2 else "url"

    if not target:
        print("Errore: nessun target specificato.", file=sys.stderr)
        sys.exit(1)

    api_key = os.environ.get("VIRUSTOTAL_API_KEY")
    if not api_key:
        print("Errore: VIRUSTOTAL_API_KEY non impostata.", file=sys.stderr)
        sys.exit(1)

    try:
        if analysis_type == "ip":
            result = query_virustotal_ip(target, api_key)
        else:
            result = query_virustotal(target, api_key)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)

import requests
import sys
import os
import base64

def query_osint_industries_pdf(query_type, query_value, api_key, timeout=60):
    url = f'https://api.osint.industries/v2/request?type={query_type}&query={query_value}&timeout={timeout}'
    headers = {
        'accept': 'application/pdf',
        'api-key': api_key
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.content
    elif response.status_code == 451:
        raise Exception("Errore 451: Richiesta bloccata per motivi legali o restrizioni geografiche.")
    else:
        raise Exception(f"Errore OSINT Industries: {response.status_code} - {response.text}")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else None
    analysis_type = sys.argv[2] if len(sys.argv) > 2 else "email"

    if not target:
        print("Errore: nessun target specificato.", file=sys.stderr)
        sys.exit(1)

    api_key = os.environ.get("OSINT_INDUSTRIES_API_KEY")
    if not api_key:
        print("Errore: OSINT_INDUSTRIES_API_KEY non impostata.", file=sys.stderr)
        sys.exit(1)

    try:
        pdf_bytes = query_osint_industries_pdf(analysis_type, target, api_key)
        encoded = base64.b64encode(pdf_bytes).decode('utf-8')
        print(f"PDF_BASE64:{encoded}")
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)

import urllib.request
import json
import sys
import os

class IPtoGeo:
    def __init__(self, ip_address, access_token):
        self.ip_address = ip_address
        self.access_token = access_token
        self.data = self._get_location()

    def _get_location(self):
        url = f'https://ipinfo.io/{self.ip_address}/json?token={self.access_token}'
        try:
            with urllib.request.urlopen(url) as response:
                data = response.read().decode('utf-8')
                return json.loads(data)
        except urllib.error.HTTPError as e:
            print(f"Errore nell'accesso all'API: {e}", file=sys.stderr)
            return {}
        except urllib.error.URLError as e:
            print(f"Errore di connessione: {e}", file=sys.stderr)
            return {}

    def get_formatted_data(self):
        return json.dumps(self.data, indent=4)

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else None
    if not target:
        print("Errore: nessun target specificato.", file=sys.stderr)
        sys.exit(1)

    access_token = os.environ.get("IPINFO_ACCESS_TOKEN")
    if not access_token:
        print("Errore: IPINFO_ACCESS_TOKEN non impostata.", file=sys.stderr)
        sys.exit(1)

    geo = IPtoGeo(target, access_token)
    if geo.data:
        print(geo.get_formatted_data())
    else:
        print(f"Nessun risultato da IPinfo per: {target}", file=sys.stderr)
        sys.exit(1)

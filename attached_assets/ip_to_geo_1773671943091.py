"""
Modulo che produce un dizionario con le informazioni di geolocalizzazione per gli IP forniti.

"""

import urllib.request
import json

class IPtoGeo:
    def __init__(self, ip_address, access_token):
        self.ip_address = ip_address
        self.access_token = access_token
        self.data = self._get_location()

    def _get_location(self):
        """
        Retrieve detailed location data from ipinfo.io using an access token
        """
        url = f'https://ipinfo.io/{self.ip_address}/json?token={self.access_token}'
        
        try:
            with urllib.request.urlopen(url) as response:
                data = response.read().decode('utf-8')
                json_data = json.loads(data)
                return json_data
        except urllib.error.HTTPError as e:
            print(f"Errore nell'accesso all'API: {e}")
            return {}
        except urllib.error.URLError as e:
            print(f"Errore di connessione: {e}")
            return {}

    def get_formatted_data(self):
        """
        Return the fetched data in formatted JSON
        """
        return json.dumps(self.data, indent=4)

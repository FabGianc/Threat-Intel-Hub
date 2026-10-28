# Moduli di analisi

Ogni script interroga un servizio esterno e viene eseguito dal backend come:

    python3 <modulo>.py <target> <tipo_analisi>

- il target arriva come argomento letterale (nessuna shell coinvolta);
- la chiave API si legge da una variabile d'ambiente (vedi README principale);
- il risultato va stampato su stdout; per restituire un PDF stampare `PDF_BASE64:<base64>`;
- gli errori vanno scritti su stderr.

| Script | Servizio | Variabile |
|--------|----------|-----------|
| `virustotal.py` | VirusTotal | `VIRUSTOTAL_API_KEY` |
| `urlscan.py` | URLScan.io | `URLSCAN_API_KEY` |
| `abuseipdb.py` | AbuseIPDB | `ABUSEIPDB_API_KEY` |
| `ip_to_geo.py` | IPinfo | `IPINFO_ACCESS_TOKEN` |
| `isc_sans.py` | SANS ISC | `ISC_SANS_API_KEY` (facoltativa) |
| `osint_indistries.py` | OSINT Industries | `OSINT_INDUSTRIES_API_KEY` |

Il nome `osint_indistries.py` è mantenuto così perché referenziato dal backend.

Dipendenze: `pip install -r requirements.txt`

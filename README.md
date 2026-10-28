# Threat Intel Hub

Applicazione web per analisi **OSINT e threat intelligence**: si inserisce un indicatore (IP, URL, email, telefono, wallet…) e il sistema interroga in parallelo i servizi di intelligence pertinenti, mostrando i risultati in un'unica schermata e salvando lo storico delle analisi.

## Cosa analizza

| Tipo di indicatore | Servizi interrogati |
|--------------------|---------------------|
| Indirizzo IP | VirusTotal, AbuseIPDB, IPinfo (geolocalizzazione), ISC SANS |
| URL / dominio | VirusTotal, URLScan.io |
| Email, telefono, account, persona | OSINT Industries (report PDF scaricabile) |
| Wallet ETH, BTC, TRC | OSINT Industries (report PDF scaricabile) |

Ogni analisi viene salvata in PostgreSQL ed è consultabile dallo storico nella barra laterale.

## Architettura

```
Browser (React)  ──/api──▶  Backend Express  ──▶  script Python (uno per servizio)  ──▶  API esterne
  porta 23825                 porta 8080      └─▶  PostgreSQL (storico analisi)
```

Monorepo **pnpm**:

| Percorso | Contenuto |
|----------|-----------|
| `artifacts/intel-app/` | Frontend React + Vite + Tailwind |
| `artifacts/api-server/` | Backend Express 5 (TypeScript) |
| `python/` | Moduli di analisi, uno per servizio esterno |
| `lib/db/` | Schema database (Drizzle ORM) |
| `lib/api-spec/` | Specifica OpenAPI, da cui sono generati client e validazione |
| `lib/api-client-react/`, `lib/api-zod/` | Codice generato da Orval |

Il backend esegue ogni modulo come `python3 python/<modulo>.py <target> <tipo>` e ne raccoglie l'output; i moduli dello stesso tipo girano in parallelo con un timeout di 90 secondi.

## Requisiti

- Node.js 22+ e [pnpm](https://pnpm.io) (`npm install -g pnpm`)
- Python 3.10+
- PostgreSQL 14+
- Le chiavi API dei servizi che si intendono usare (vedi sotto)

## Installazione

**1. Dipendenze**

```bash
pnpm install
pip install -r python/requirements.txt
```

**2. Database**

```bash
# Ubuntu
sudo -u postgres psql -c "CREATE DATABASE intel_app;"
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'scegli_una_password';"
```

Su Windows creare il database `intel_app` con pgAdmin o `psql`.

**3. Configurazione** — creare il file `artifacts/api-server/.env`:

```ini
DATABASE_URL=postgresql://postgres:scegli_una_password@localhost:5432/intel_app
PORT=8080

VIRUSTOTAL_API_KEY=
URLSCAN_API_KEY=
ABUSEIPDB_API_KEY=
IPINFO_ACCESS_TOKEN=
OSINT_INDUSTRIES_API_KEY=
ISC_SANS_API_KEY=
```

Il file viene letto automaticamente all'avvio del backend ed è escluso dal repository tramite `.gitignore`. Le chiavi vengono passate agli script Python come variabili d'ambiente; un servizio senza chiave restituisce un errore solo per il proprio modulo, gli altri funzionano normalmente.

**4. Schema del database**

```bash
# Linux / macOS
DATABASE_URL=postgresql://postgres:scegli_una_password@localhost:5432/intel_app pnpm --filter @workspace/db run push

# Windows (PowerShell)
$env:DATABASE_URL="postgresql://postgres:scegli_una_password@localhost:5432/intel_app"; pnpm --filter @workspace/db run push
```

**5. Avvio** (due terminali)

```bash
pnpm --filter @workspace/api-server run dev    # backend
pnpm --filter @workspace/intel-app run dev     # frontend
```

Aprire <http://localhost:23825>. In sviluppo il frontend inoltra automaticamente le chiamate `/api` al backend.

## Chiavi API

| Variabile | Servizio | Note |
|-----------|----------|------|
| `VIRUSTOTAL_API_KEY` | [VirusTotal](https://www.virustotal.com) | Piano gratuito disponibile |
| `URLSCAN_API_KEY` | [URLScan.io](https://urlscan.io) | Piano gratuito disponibile |
| `ABUSEIPDB_API_KEY` | [AbuseIPDB](https://www.abuseipdb.com) | Piano gratuito disponibile |
| `IPINFO_ACCESS_TOKEN` | [IPinfo](https://ipinfo.io) | Piano gratuito disponibile |
| `OSINT_INDUSTRIES_API_KEY` | [OSINT Industries](https://www.osint.industries) | A pagamento |
| `ISC_SANS_API_KEY` | [SANS ISC](https://isc.sans.edu) | Facoltativa |

## Altre variabili d'ambiente

| Variabile | Predefinito | Descrizione |
|-----------|-------------|-------------|
| `HOST` | `127.0.0.1` in sviluppo, `0.0.0.0` in produzione e su Replit | Interfaccia su cui ascolta il backend |
| `CORS_ORIGINS` | *(vuoto: CORS disattivato)* | Origini web esterne autorizzate, separate da virgola |
| `PYTHON_SCRIPTS_DIR` | `<radice>/python` | Cartella dei moduli Python |
| `PYTHON_BIN` | `python3` (Windows: `python`) | Interprete Python da usare |
| `API_URL` | `http://127.0.0.1:8080` | Indirizzo del backend per il proxy del frontend |

## API

| Metodo | Percorso | Descrizione |
|--------|----------|-------------|
| GET | `/api/healthz` | Stato del servizio |
| POST | `/api/analyze` | Avvia un'analisi — `{"type": "ip", "target": "8.8.8.8"}` |
| GET | `/api/analyze/history?limit=20` | Ultime analisi |
| GET | `/api/analyze/{id}/pdf/{modulo}` | Scarica il report PDF di un modulo |

Tipi ammessi: `ip`, `url`, `email`, `phone`, `account`, `person`, `eth`, `btc`, `trc`. La specifica completa è in `lib/api-spec/openapi.yaml`.

## Aggiungere un servizio

1. Creare `python/<nome>.py` che legga il target da `sys.argv[1]`, il tipo da `sys.argv[2]` e la chiave da una variabile d'ambiente, e stampi il risultato su stdout (per un PDF: `PDF_BASE64:<contenuto in base64>`).
2. Aggiungere il nome del modulo ai tipi pertinenti in `MODULE_MAP` in `artifacts/api-server/src/routes/analyze.ts`.

## Note d'uso e sicurezza

- Il backend **non ha autenticazione**: in sviluppo ascolta solo su `127.0.0.1`. Non esporlo su Internet senza un livello di autenticazione davanti (reverse proxy, VPN).
- Gli indicatori analizzati vengono inviati a servizi di terze parti e salvati nel database locale: valutare la riservatezza dei dati prima di analizzare indicatori legati a indagini in corso.
- Rispettare i termini d'uso e i limiti di richieste di ciascun servizio.

## Sviluppo

```bash
pnpm --filter @workspace/api-spec run codegen   # rigenera client e schemi dalla specifica OpenAPI
pnpm --filter @workspace/db run push            # applica modifiche allo schema
pnpm --filter @workspace/intel-app run build    # build del frontend
pnpm --filter @workspace/api-server run build   # build del backend (dist/index.cjs)
```

Il progetto è nato su [Replit](https://replit.com) e funziona sia lì (`replit.md`, `.replit`) sia in locale.

## Licenza

Distribuito con licenza [GNU General Public License v3.0](LICENSE).
Copyright (C) 2026 Pierfabrizio Giancola.

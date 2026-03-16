# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Intelligence Analyzer web application for OSINT/threat intelligence analysis.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite (artifacts/intel-app)
- **Python scripts**: python/ directory (called via child_process from Express)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── intel-app/          # React+Vite frontend (OSINT Intelligence Analyzer)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── python/                 # Python analysis scripts (replace placeholders with real scripts)
│   ├── virustotal.py
│   ├── urlscan.py
│   ├── abuseipdb.py
│   ├── ip_to_geo.py
│   ├── isc_sans.py
│   └── osint_indistries.py
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Intelligence Analyzer App

### Analysis Type → Module Mapping
- **IP**: VirusTotal + AbuseIPDB + IPinfo (ip_to_geo) + ISC SANS
- **URL**: VirusTotal + URLScan.io
- **Email**: osint.industries
- **Phone**: osint.industries

### Python Scripts
Place scripts in `python/` directory. Each script is called as:
```
python3 python/<module>.py <target> <analysis_type>
```
Output is captured from stdout. API keys should be set as environment variables inside each script.

### API Routes
- `POST /api/analyze` — run analysis, returns results with per-module output
- `GET /api/analyze/history` — recent analysis history

### Database
- Table: `analyses` — stores all analysis results (type, target, modules JSON, timestamp)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API types from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes

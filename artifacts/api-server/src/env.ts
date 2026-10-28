// Importato per primo da index.ts: gli import ESM vengono valutati in ordine,
// quindi le variabili sono disponibili prima che @workspace/db legga DATABASE_URL.
// Carica artifacts/api-server/.env se presente (in locale); su Replit le
// variabili arrivano dai Secrets e il file non esiste.
try {
  process.loadEnvFile();
} catch {
  // nessun file .env: si usano le variabili d'ambiente già impostate
}

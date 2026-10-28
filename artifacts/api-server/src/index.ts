import "./env";
import app from "./app";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// In sviluppo locale ascolta solo su 127.0.0.1; su Replit e nella build
// di produzione (deploy) su 0.0.0.0. Sovrascrivibile con HOST.
const host =
  process.env["HOST"] ??
  (process.env["REPL_ID"] !== undefined ||
  process.env["NODE_ENV"] === "production"
    ? "0.0.0.0"
    : "127.0.0.1");

app.listen(port, host, () => {
  console.log(`Server listening on ${host}:${port}`);
});

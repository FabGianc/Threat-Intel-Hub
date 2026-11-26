import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Su Replit PORT e BASE_PATH sono forniti dall'ambiente; in locale si usano i default
const isReplit = process.env.REPL_ID !== undefined;

const rawPort = process.env.PORT ?? "23825";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

// In locale il dev server inoltra /api al backend Express
const apiTarget = process.env.API_URL ?? "http://127.0.0.1:8080";
const host = isReplit ? "0.0.0.0" : "localhost";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host,
    allowedHosts: isReplit ? true : undefined,
    proxy: isReplit ? undefined : { "/api": apiTarget },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host,
    allowedHosts: isReplit ? true : undefined,
    proxy: isReplit ? undefined : { "/api": apiTarget },
  },
});

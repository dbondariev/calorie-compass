import "dotenv/config";

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? process.env.BFF_PORT ?? 3001);
const configuredBackendUrl = process.env.BACKEND_URL ?? "http://localhost:5001";
const backendUrl = configuredBackendUrl.includes("://")
  ? configuredBackendUrl
  : `http://${configuredBackendUrl}`;
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const productionAssets = fileURLToPath(new URL("../../frontend/dist", import.meta.url));
const staticDirectory = process.env.NODE_ENV === "production" && existsSync(productionAssets)
  ? productionAssets
  : undefined;

const server = createApp({ backendUrl, allowedOrigins, staticDirectory }).listen(port, () => {
  console.log(`BFF listening on http://localhost:${port}`);
});

const shutdown = (signal: string) => {
  console.log(`${signal} received; closing BFF.`);
  server.close((error) => {
    process.exitCode = error ? 1 : 0;
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

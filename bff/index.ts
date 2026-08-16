/** Vercel entry point for the serverless Express BFF. */

import express from "express";
import { createApp } from "./src/app.js";

// Keep a direct Express import so Vercel recognizes this service as Express.
void express;
const configuredBackendUrl = process.env.BACKEND_URL ?? "http://localhost:5001";
const backendUrl = configuredBackendUrl.includes("://")
  ? configuredBackendUrl
  : `http://${configuredBackendUrl}`;
const configuredTimeout = Number(process.env.REQUEST_TIMEOUT_MS ?? 30_000);
const requestTimeoutMs = Number.isFinite(configuredTimeout) && configuredTimeout > 0
  ? configuredTimeout
  : 30_000;
const app = createApp({ backendUrl, requestTimeoutMs });

export default app;

/**
 * DOC OS — Fastify API
 * Port 4000 — all BD service routes.
 */
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { healthRoutes } from "./routes/health.js";
import { participantsRoutes } from "./routes/participants.js";
import { complianceRoutes } from "./routes/compliance.js";
import { dealsRoutes } from "./routes/deals.js";
import { agentsRoutes } from "./routes/agents.js";
import { communicationsRoutes } from "./routes/communications.js";
import { compensationRoutes } from "./routes/compensation.js";
import { intakeRoutes } from "./routes/intake.js";
import { workflowsRoutes } from "./routes/workflows.js";
import { reportsRoutes } from "./routes/reports.js";

const PORT = Number(process.env["PORT"] ?? 4000);
const JWT_SECRET = process.env["JWT_SECRET"];
const CORS_ORIGINS = (process.env["CORS_ORIGINS"] ?? "http://localhost:3000,http://localhost:3001").split(",");

if (!JWT_SECRET) throw new Error("JWT_SECRET env var is required");

const app = Fastify({
  logger: {
    level: process.env["LOG_LEVEL"] ?? "info",
    serializers: {
      req(req) { return { method: req.method, url: req.url, reqId: req.id }; },
    },
  },
});

// ─── Plugins ──────────────────────────────────────────────────────────────────
await app.register(helmet, { contentSecurityPolicy: false });
await app.register(cors, { origin: CORS_ORIGINS, credentials: true });
await app.register(jwt, { secret: JWT_SECRET });
await app.register(rateLimit, { max: 200, timeWindow: "1 minute" });

// ─── Auth hook ────────────────────────────────────────────────────────────────
app.addHook("onRequest", async (req, reply) => {
  // Skip auth for health + intake (public webhook)
  if (req.url === "/health" || req.url.startsWith("/intake")) return;
  try {
    await req.jwtVerify();
  } catch {
    return reply.status(401).send({ ok: false, error: "Unauthorized" });
  }
});

// ─── Routes ───────────────────────────────────────────────────────────────────
await app.register(healthRoutes, { prefix: "/" });
await app.register(participantsRoutes, { prefix: "/participants" });
await app.register(complianceRoutes, { prefix: "/compliance" });
await app.register(dealsRoutes, { prefix: "/deals" });
await app.register(agentsRoutes, { prefix: "/agents" });
await app.register(communicationsRoutes, { prefix: "/communications" });
await app.register(compensationRoutes, { prefix: "/compensation" });
await app.register(intakeRoutes, { prefix: "/intake" });
await app.register(workflowsRoutes, { prefix: "/workflows" });
await app.register(reportsRoutes, { prefix: "/reports" });

// ─── Global error handler ─────────────────────────────────────────────────────
app.setErrorHandler((err, _req, reply) => {
  app.log.error(err);
  const status = err.statusCode ?? 500;
  return reply.status(status).send({ ok: false, error: err.message ?? "Internal Server Error" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`[api] DOC OS API running on port ${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

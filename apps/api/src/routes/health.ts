import type { FastifyInstance } from "fastify";
import { SERVICE_PORTS } from "@doc/domain";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    ok: true,
    service: "doc-api",
    version: "0.1.0",
    ports: SERVICE_PORTS,
    timestamp: new Date().toISOString(),
  }));
}

import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple PrismaClient instances in dev (hot-reload)
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log:
      process.env["NODE_ENV"] === "production"
        ? ["error"]
        : ["query", "warn", "error"],
  });

if (process.env["NODE_ENV"] !== "production") {
  global.__prisma = prisma;
}

export * from "@prisma/client";
export default prisma;

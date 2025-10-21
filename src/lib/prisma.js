// src/lib/prisma.js
import "server-only";
import { PrismaClient } from "@prisma/client";

const GLOBAL_KEY = "__PRISMA_CLIENT__";

const prisma =
  globalThis[GLOBAL_KEY] ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis[GLOBAL_KEY] = prisma;
}

export { prisma };

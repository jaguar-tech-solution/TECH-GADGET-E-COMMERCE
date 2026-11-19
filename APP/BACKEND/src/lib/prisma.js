
import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// Enable WebSockets in Node.js for Neon Serverless
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is missing in .env file.");
}

// Pass the config object directly to PrismaNeon 
const adapter = new PrismaNeon({ connectionString });

const createPrismaClient = () => {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

const prisma = globalThis.prismaGlobal || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export { prisma };
import dotenv from 'dotenv';
import app from './app.js';

import { prisma } from './lib/prisma.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3780;
const SHOUTDOWN_TIMEOUT_MS = 10_000;

let server;
let isShuttingDown = false;


// Graceful Shutdown
const shutdown = async (reason, exitCode = 0) => {
  if (isShuttingDown) return;

  isShuttingDown = true;

  console.log(`Shutting down (${reason})`);

  //Hard stop if connection refuse to drain
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, SHOUTDOWN_TIMEOUT_MS).unref();

  try {
    if (server) {
      server.closeIdleConnections();
      await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()))

      })
    }

    await prisma.$disconnect();
    console.log("Shutdown complete.")
    process.exit(exitCode)
  } catch (error) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }

};

const start = async () => {
  await prisma.$connect();
  console.log("Database connected.");

const server =  app.listen(PORT, () => {
    console.log(`🚀 Backend API listening on http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/v1/health`);
  });

  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;

  
  server.on("error", (err) =>{
    console.error(
        err.code === "EADDRINUSE" ? `Port ${PORT} is already in use.` : "Server error:",
      err.code === "EADDRINUSE" ? "" : err
    );
    shutdown("listen errr", 1)
  })

}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", shutdown("SIGTERM"));


process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  shutdown("uncaughtException", 1);
});


start().catch((err) =>{
  console.error("Failed to start server:", err);
  process.exit(1)
})
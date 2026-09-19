import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from './app.js';
import { initDatabase } from './database/init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Ensure database schema is initialized
await initDatabase();

const PORT = Number.parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`[X MART SERVER] Running at http://${HOST}:${PORT}`);
  console.log(`[X MART SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown handling for Cloud container lifecycle
const shutdown = (signal) => {
  console.log(`[X MART SERVER] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[X MART SERVER] HTTP server closed.');
    process.exit(0);
  });
  // Force exit if connections take too long to close
  setTimeout(() => {
    console.error('[X MART SERVER] Forced shutdown after timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default server;

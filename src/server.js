import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from './app.js';
import { initDatabase } from './database/init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Ensure database schema is initialized
initDatabase();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`[X MART SERVER] Running at http://localhost:${PORT}`);
  console.log(`[X MART SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default server;

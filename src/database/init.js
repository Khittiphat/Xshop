import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db, { getDbPath } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function initDatabase() {
  console.log(`[DB INIT] Initializing SQLite database at: ${getDbPath()}`);
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Execute DDL schema within a transaction
  db.exec(schema);
  console.log('[DB INIT] Database schema applied successfully (tables & indexes created).');
}

// Run directly if invoked from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    initDatabase();
    process.exit(0);
  } catch (err) {
    console.error('[DB INIT ERROR] Failed to initialize database:', err.message);
    process.exit(1);
  }
}

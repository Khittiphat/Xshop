import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db, { getDbPath } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initDatabase() {
  console.log(`[DB INIT] Initializing SQLite database at: ${getDbPath()}`);
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // Check if products table exists and ensure icon column exists
  const tableCheck = await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='products'").get();
  if (tableCheck) {
    const columns = (await db.prepare("PRAGMA table_info(products)").all()).map(c => c.name);
    if (!columns.includes('icon')) {
      console.log('[DB MIGRATION] Adding icon column to products table...');
      await db.exec("ALTER TABLE products ADD COLUMN icon TEXT;");
    }
  }

  // Execute DDL schema within a transaction
  await db.exec(schema);
  console.log('[DB INIT] Database schema applied successfully (tables & indexes created).');
}

// Run directly if invoked from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await initDatabase();
    process.exit(0);
  } catch (err) {
    console.error('[DB INIT ERROR] Failed to initialize database:', err.message);
    process.exit(1);
  }
}

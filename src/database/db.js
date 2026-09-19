import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded from root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Support DATABASE_URL, DATA_DIR, or DB_PATH for Cloud volumes
let dbPathConfig = process.env.DATABASE_URL || process.env.DB_PATH;

if (process.env.DATA_DIR && process.env.DATA_DIR.trim()) {
  dbPathConfig = path.join(process.env.DATA_DIR.trim(), 'xmart.db');
} else if (dbPathConfig && dbPathConfig.trim()) {
  // Strip optional sqlite:// or file: prefix if passed in DATABASE_URL
  dbPathConfig = dbPathConfig.trim().replace(/^sqlite:\/\//i, '').replace(/^file:/i, '');
} else {
  dbPathConfig = './data/xmart.db';
}

const resolvedDbPath = path.isAbsolute(dbPathConfig)
  ? path.resolve(dbPathConfig)
  : path.resolve(__dirname, '../../', dbPathConfig);

// Ensure target directory exists (safely creates nested folders on cloud volumes)
const dbDir = path.dirname(resolvedDbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(resolvedDbPath, {
  // verbose: console.log // uncomment for SQL query logging
});

// Configure SQLite pragmas for safety and performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

export const getDbPath = () => resolvedDbPath;

export default db;

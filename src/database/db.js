import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded from root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbPathConfig = process.env.DB_PATH || './data/xmart.db';
const resolvedDbPath = path.isAbsolute(dbPathConfig)
  ? dbPathConfig
  : path.resolve(__dirname, '../../', dbPathConfig);

// Ensure target directory exists
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

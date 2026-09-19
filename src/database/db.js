import sqlite3 from 'sqlite3';
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

// Instantiate standard sqlite3 Database (non-native compilation, zero segfault)
export const rawDb = new sqlite3.Database(resolvedDbPath);

// Enable foreign keys and WAL mode
rawDb.serialize(() => {
  rawDb.run('PRAGMA foreign_keys = ON');
  rawDb.run('PRAGMA journal_mode = WAL');
});

/**
 * Format named parameters for sqlite3 based on SQL prefixes (@, $, :)
 */
function formatNamedParams(sql, obj) {
  const result = {};
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('@') || key.startsWith('$') || key.startsWith(':')) {
      result[key] = val;
    } else {
      if (sql.includes(`@${key}`)) result[`@${key}`] = val;
      else if (sql.includes(`:${key}`)) result[`:${key}`] = val;
      else if (sql.includes(`$${key}`)) result[`$${key}`] = val;
      else result[`@${key}`] = val;
    }
  }
  return result;
}

/**
 * Normalize params passed to query functions
 */
function normalizeParams(sql, params) {
  if (!params || params.length === 0) return [];
  if (params.length === 1 && typeof params[0] === 'object' && params[0] !== null && !Array.isArray(params[0])) {
    return formatNamedParams(sql, params[0]);
  }
  if (params.length === 1 && Array.isArray(params[0])) {
    return params[0];
  }
  return params;
}

export const db = {
  raw: rawDb,

  all(sql, ...params) {
    const norm = normalizeParams(sql, params);
    return new Promise((resolve, reject) => {
      rawDb.all(sql, norm, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  get(sql, ...params) {
    const norm = normalizeParams(sql, params);
    return new Promise((resolve, reject) => {
      rawDb.get(sql, norm, (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  },

  run(sql, ...params) {
    const norm = normalizeParams(sql, params);
    return new Promise((resolve, reject) => {
      rawDb.run(sql, norm, function (err) {
        if (err) reject(err);
        else {
          resolve({
            lastInsertRowid: this.lastID,
            lastID: this.lastID,
            changes: this.changes
          });
        }
      });
    });
  },

  exec(sql) {
    return new Promise((resolve, reject) => {
      rawDb.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },

  pragma(str) {
    return new Promise((resolve, reject) => {
      rawDb.all(`PRAGMA ${str}`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  transaction(fn) {
    return async (...args) => {
      await this.exec('BEGIN IMMEDIATE');
      try {
        const result = await fn(...args);
        await this.exec('COMMIT');
        return result;
      } catch (err) {
        await this.exec('ROLLBACK');
        throw err;
      }
    };
  },

  prepare(sql) {
    return {
      all: (...params) => db.all(sql, ...params),
      get: (...params) => db.get(sql, ...params),
      run: (...params) => db.run(sql, ...params)
    };
  }
};

export const getDbPath = () => resolvedDbPath;

export default db;

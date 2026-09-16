import { initDatabase } from './init.js';
import { seedDatabase } from './seed.js';
import { verifyDatabase } from './verify.js';

console.log('[SETUP] Running database setup pipeline (Init -> Seed -> Verify)...\n');

try {
  initDatabase();
  seedDatabase();
  const ok = verifyDatabase();
  if (!ok) {
    process.exit(1);
  }
} catch (err) {
  console.error('[SETUP ERROR] Database setup failed:', err);
  process.exit(1);
}

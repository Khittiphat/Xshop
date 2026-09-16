// Root convenience entry point for: node seed.js
import { seedDatabase } from './src/database/seed.js';

try {
  seedDatabase();
  console.log('[SUCCESS] Root seed.js completed successfully.');
  process.exit(0);
} catch (err) {
  console.error('[ERROR] Root seed.js failed:', err);
  process.exit(1);
}

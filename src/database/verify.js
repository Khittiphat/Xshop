import db, { getDbPath } from './db.js';
import { fileURLToPath } from 'node:url';

export function verifyDatabase() {
  console.log('====================================================');
  console.log('           X MART DATABASE VERIFICATION             ');
  console.log('====================================================');
  console.log(`Database File: ${getDbPath()}\n`);

  // 1. Check Tables
  const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name;
  `).all().map(r => r.name);

  console.log(`Discovered Tables (${tables.length}): ${tables.join(', ')}`);

  const expectedTables = ['categories', 'order_items', 'orders', 'products', 'users'];
  const missingTables = expectedTables.filter(t => !tables.includes(t));

  if (missingTables.length > 0) {
    console.error(`[FAIL] Missing tables: ${missingTables.join(', ')}`);
    return false;
  }

  // 2. Check Foreign Key Integrity
  const fkCheck = db.prepare('PRAGMA foreign_key_check').all();
  if (fkCheck.length > 0) {
    console.error('[FAIL] Foreign key integrity violations found:', fkCheck);
    return false;
  } else {
    console.log('[OK] Foreign key integrity: PASSED (No constraint violations)');
  }

  // 3. Row Counts
  const counts = {
    categories: db.prepare('SELECT COUNT(*) as count FROM categories').get().count,
    products: db.prepare('SELECT COUNT(*) as count FROM products').get().count,
    users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
    orders: db.prepare('SELECT COUNT(*) as count FROM orders').get().count,
    order_items: db.prepare('SELECT COUNT(*) as count FROM order_items').get().count,
  };

  console.log('\n--- Table Record Counts ---');
  console.table(counts);

  // 4. Sample Products Listing with Category Join
  console.log('\n--- Sample Products in Catalog ---');
  const sampleProducts = db.prepare(`
    SELECT 
      p.id, 
      p.name, 
      c.name AS category, 
      printf('$%.2f', p.price) AS price,
      p.description
    FROM products p
    JOIN categories c ON p.category_id = c.id
    ORDER BY p.id ASC
    LIMIT 6
  `).all();
  console.table(sampleProducts);

  // 5. Sample Orders with Items
  console.log('\n--- Sample Orders ---');
  const sampleOrders = db.prepare(`
    SELECT 
      o.id AS order_id,
      o.customer_name,
      o.payment_method,
      o.status,
      printf('$%.2f', o.total_amount) AS total,
      o.created_at
    FROM orders o
    ORDER BY o.id ASC
  `).all();
  console.table(sampleOrders);

  console.log('====================================================');
  console.log(' [SUCCESS] Database is verified and ready for use!  ');
  console.log('====================================================\n');
  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ok = verifyDatabase();
  process.exit(ok ? 0 : 1);
}

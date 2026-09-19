import db from './db.js';
import { initDatabase } from './init.js';
import { fileURLToPath } from 'node:url';

export async function seedDatabase() {
  console.log('[DB SEED] Starting database seeding...');

  // Ensure tables exist
  await initDatabase();

  const seedTransaction = db.transaction(async () => {
    // 1. Seed Categories
    const categories = [
      { name: 'Snacks' },
      { name: 'Drinks' },
      { name: 'Household Essentials' },
      { name: 'Instant Foods & Ready Meals' },
      { name: 'Personal Care' }
    ];

    const insertCategory = db.prepare(`
      INSERT OR IGNORE INTO categories (name) VALUES (@name)
    `);

    for (const cat of categories) {
      await insertCategory.run(cat);
    }

    // Retrieve category IDs
    const categoryRows = await db.prepare('SELECT id, name FROM categories').all();
    const catMap = Object.fromEntries(categoryRows.map(c => [c.name, c.id]));

    // 2. Seed Products (15+ realistic convenience store products with emoji icons)
    const products = [
      // Snacks
      {
        name: "Lay's Classic Potato Chips 50g",
        category_id: catMap['Snacks'],
        price: 1.50,
        icon: '🥔',
        description: 'Crispy, golden-fried potato chips lightly seasoned with sea salt.'
      },
      {
        name: 'Pringles Sour Cream & Onion 107g',
        category_id: catMap['Snacks'],
        price: 2.40,
        icon: '🥫',
        description: 'Iconic stackable potato crisps bursting with savory sour cream and herb flavor.'
      },
      {
        name: 'Oreo Original Chocolate Sandwich Cookies 133g',
        category_id: catMap['Snacks'],
        price: 1.80,
        icon: '🍪',
        description: 'Rich cocoa wafers sandwiched around smooth vanilla cream.'
      },
      {
        name: 'Doritos Nacho Cheese Tortilla Chips 140g',
        category_id: catMap['Snacks'],
        price: 2.60,
        icon: '🧀',
        description: 'Bold, crunchy corn tortilla chips packed with tangy melted nacho cheese.'
      },

      // Drinks
      {
        name: 'Coca-Cola Original Taste 330ml Can',
        category_id: catMap['Drinks'],
        price: 1.20,
        icon: '🥤',
        description: 'The world-famous refreshing carbonated soft drink served ice-cold.'
      },
      {
        name: 'Pokka Japanese Green Tea No Sugar 500ml',
        category_id: catMap['Drinks'],
        price: 1.60,
        icon: '🍵',
        description: 'Authentic 100% real brewed Japanese green tea with zero calories and zero sugar.'
      },
      {
        name: 'Red Bull Energy Drink 250ml',
        category_id: catMap['Drinks'],
        price: 2.50,
        icon: '⚡',
        description: 'Vitalizes body and mind with caffeine, taurine, and B-group vitamins.'
      },
      {
        name: 'Evian Natural Mineral Water 500ml',
        category_id: catMap['Drinks'],
        price: 1.90,
        icon: '💧',
        description: 'Naturally pure spring water sourced directly from the French Alps.'
      },
      {
        name: 'Nescafe Gold Iced Latte 240ml Can',
        category_id: catMap['Drinks'],
        price: 1.95,
        icon: '☕',
        description: 'Smooth and milky chilled coffee crafted with premium roasted Arabica beans.'
      },
      {
        name: 'Organic Fresh Whole Milk 1L',
        category_id: catMap['Drinks'],
        price: 2.80,
        icon: null, // Tests fallback colored CSS letter avatar
        description: 'Fresh pasteurized farm milk rich in calcium and natural proteins.'
      },

      // Household essentials
      {
        name: 'Kleenex Ultra Soft Facial Tissues 3-Pack',
        category_id: catMap['Household Essentials'],
        price: 4.20,
        icon: '🧻',
        description: '3-ply gentle and highly absorbent facial tissues for everyday family care.'
      },
      {
        name: 'Scotch-Brite Heavy Duty Scrub Sponge 3-Pack',
        category_id: catMap['Household Essentials'],
        price: 3.50,
        icon: '🧽',
        description: 'Tough scourer pad combined with high-foam sponge for easy dishwashing.'
      },
      {
        name: 'Clorox Disinfecting Wipes Fresh Scent 35-Count',
        category_id: catMap['Household Essentials'],
        price: 3.90,
        icon: '🧼',
        description: 'Multi-surface sanitizing wipes killing 99.9% of viruses and bacteria.'
      },

      // Instant Foods & Ready Meals
      {
        name: 'Nongshim Shin Ramyun Gourmet Spicy 120g',
        category_id: catMap['Instant Foods & Ready Meals'],
        price: 1.75,
        icon: '🍜',
        description: 'Famous spicy Korean instant ramen featuring chewy noodles and a rich beef broth.'
      },
      {
        name: 'Nissin Cup Noodles Seafood 75g',
        category_id: catMap['Instant Foods & Ready Meals'],
        price: 1.65,
        icon: '🍲',
        description: 'Classic quick meal filled with calamari, crab stick, egg, and cabbage in savory broth.'
      },
      {
        name: 'CP Teriyaki Chicken with Rice 250g',
        category_id: catMap['Instant Foods & Ready Meals'],
        price: 4.50,
        icon: '🍗',
        description: 'Microwaveable ready meal with tender grilled chicken glazed in sweet teriyaki sauce.'
      },

      // Personal Care
      {
        name: 'Colgate Total Clean Mint Toothpaste 100g',
        category_id: catMap['Personal Care'],
        price: 2.90,
        icon: '🪥',
        description: '12-hour antibacterial protection for teeth, tongue, cheeks, and gums.'
      }
    ];

    const insertProduct = db.prepare(`
      INSERT INTO products (name, category_id, price, icon, description)
      VALUES (@name, @category_id, @price, @icon, @description)
    `);

    const updateProduct = db.prepare(`
      UPDATE products 
      SET icon = @icon, price = @price, description = @description, category_id = @category_id
      WHERE name = @name
    `);

    for (const prod of products) {
      const res = await updateProduct.run(prod);
      if (res.changes === 0) {
        await insertProduct.run(prod);
      }
    }

    // 3. Seed Sample Users
    const users = [
      {
        name: 'Store Manager Alice',
        phone: '+1-555-0100',
        email: 'alice.manager@xmart.local',
        password_hash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W6dpvOQvC4zUoZce', // hashed 'Admin@123'
        role: 'admin'
      },
      {
        name: 'Bob Express Rider',
        phone: '+1-555-0199',
        email: 'rider.bob@xmart.local',
        password_hash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W6dpvOQvC4zUoZce',
        role: 'staff'
      },
      {
        name: 'John Doe',
        phone: '+1-555-0144',
        email: 'john.doe@example.com',
        password_hash: '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQmG6W6dpvOQvC4zUoZce',
        role: 'customer'
      }
    ];

    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (name, phone, email, password_hash, role)
      VALUES (@name, @phone, @email, @password_hash, @role)
    `);

    for (const u of users) {
      await insertUser.run(u);
    }

    // 4. Seed Sample Orders and Items (demonstrating guest & customer checkout)
    const existingOrdersCount = (await db.prepare('SELECT COUNT(*) as count FROM orders').get()).count;
    if (existingOrdersCount === 0) {
      const customer = await db.prepare('SELECT id FROM users WHERE email = ?').get('john.doe@example.com');
      const allProducts = await db.prepare('SELECT id, price FROM products LIMIT 5').all();

      if (allProducts.length >= 4) {
        // Order 1: Registered Customer Order
        const order1Stmt = db.prepare(`
          INSERT INTO orders (
            user_id, customer_name, customer_phone, delivery_address,
            total_amount, payment_method, status, driver_name, driver_phone
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const order1Total = (allProducts[0].price * 2) + (allProducts[1].price * 1);
        const order1Result = await order1Stmt.run(
          customer ? customer.id : null,
          'John Doe',
          '+1-555-0144',
          '742 Evergreen Terrace, Apt 4B',
          order1Total,
          'CASH',
          'DELIVERED',
          'Bob Express Rider',
          '+1-555-0199'
        );

        const insertItem = db.prepare(`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price)
          VALUES (?, ?, ?, ?)
        `);

        await insertItem.run(order1Result.lastInsertRowid, allProducts[0].id, 2, allProducts[0].price);
        await insertItem.run(order1Result.lastInsertRowid, allProducts[1].id, 1, allProducts[1].price);

        // Order 2: Guest Checkout Order
        const order2Total = (allProducts[2].price * 1) + (allProducts[3].price * 2);
        const order2Result = await order1Stmt.run(
          null, // Guest user (no account)
          'Sarah Connor (Guest)',
          '+1-555-0177',
          '100 Cyberdyne Way, Suite 12',
          order2Total,
          'QR',
          'OUT_FOR_DELIVERY',
          'Bob Express Rider',
          '+1-555-0199'
        );

        await insertItem.run(order2Result.lastInsertRowid, allProducts[2].id, 1, allProducts[2].price);
        await insertItem.run(order2Result.lastInsertRowid, allProducts[3].id, 2, allProducts[3].price);
      }
    }
  });

  await seedTransaction();
  console.log('[DB SEED] Sample data populated successfully.');
}

// Run directly if invoked from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await seedDatabase();
    process.exit(0);
  } catch (err) {
    console.error('[DB SEED ERROR] Failed to seed database:', err.message);
    process.exit(1);
  }
}

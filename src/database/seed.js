import db from './db.js';
import { initDatabase } from './init.js';
import { fileURLToPath } from 'node:url';

export function seedDatabase() {
  console.log('[DB SEED] Starting database seeding...');

  // Ensure tables exist
  initDatabase();

  const seedTransaction = db.transaction(() => {
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
      insertCategory.run(cat);
    }

    // Retrieve category IDs
    const categoryRows = db.prepare('SELECT id, name FROM categories').all();
    const catMap = Object.fromEntries(categoryRows.map(c => [c.name, c.id]));

    // 2. Seed Products (15+ realistic convenience store products)
    const products = [
      // Snacks
      {
        name: "Lay's Classic Potato Chips 50g",
        category_id: catMap['Snacks'],
        price: 1.50,
        image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=60',
        description: 'Crispy, golden-fried potato chips lightly seasoned with sea salt.'
      },
      {
        name: 'Pringles Sour Cream & Onion 107g',
        category_id: catMap['Snacks'],
        price: 2.40,
        image_url: 'https://images.unsplash.com/photo-1527842891421-42eec6e703ea?w=500&auto=format&fit=crop&q=60',
        description: 'Iconic stackable potato crisps bursting with savory sour cream and herb flavor.'
      },
      {
        name: 'Oreo Original Chocolate Sandwich Cookies 133g',
        category_id: catMap['Snacks'],
        price: 1.80,
        image_url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&auto=format&fit=crop&q=60',
        description: 'Rich cocoa wafers sandwiched around smooth vanilla cream.'
      },
      {
        name: 'Doritos Nacho Cheese Tortilla Chips 140g',
        category_id: catMap['Snacks'],
        price: 2.60,
        image_url: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=500&auto=format&fit=crop&q=60',
        description: 'Bold, crunchy corn tortilla chips packed with tangy melted nacho cheese.'
      },

      // Drinks
      {
        name: 'Coca-Cola Original Taste 330ml Can',
        category_id: catMap['Drinks'],
        price: 1.20,
        image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=60',
        description: 'The world-famous refreshing carbonated soft drink served ice-cold.'
      },
      {
        name: 'Pokka Japanese Green Tea No Sugar 500ml',
        category_id: catMap['Drinks'],
        price: 1.60,
        image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=60',
        description: 'Authentic 100% real brewed Japanese green tea with zero calories and zero sugar.'
      },
      {
        name: 'Red Bull Energy Drink 250ml',
        category_id: catMap['Drinks'],
        price: 2.50,
        image_url: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=500&auto=format&fit=crop&q=60',
        description: 'Vitalizes body and mind with caffeine, taurine, and B-group vitamins.'
      },
      {
        name: 'Evian Natural Mineral Water 500ml',
        category_id: catMap['Drinks'],
        price: 1.90,
        image_url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=60',
        description: 'Naturally pure spring water sourced directly from the French Alps.'
      },
      {
        name: 'Nescafe Gold Iced Latte 240ml Can',
        category_id: catMap['Drinks'],
        price: 1.95,
        image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=60',
        description: 'Smooth and milky chilled coffee crafted with premium roasted Arabica beans.'
      },

      // Household essentials
      {
        name: 'Kleenex Ultra Soft Facial Tissues 3-Pack',
        category_id: catMap['Household Essentials'],
        price: 4.20,
        image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
        description: '3-ply gentle and highly absorbent facial tissues for everyday family care.'
      },
      {
        name: 'Scotch-Brite Heavy Duty Scrub Sponge 3-Pack',
        category_id: catMap['Household Essentials'],
        price: 3.50,
        image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&auto=format&fit=crop&q=60',
        description: 'Tough scourer pad combined with high-foam sponge for easy dishwashing.'
      },
      {
        name: 'Clorox Disinfecting Wipes Fresh Scent 35-Count',
        category_id: catMap['Household Essentials'],
        price: 3.90,
        image_url: 'https://images.unsplash.com/photo-1584483766114-2cea6facdf57?w=500&auto=format&fit=crop&q=60',
        description: 'Multi-surface sanitizing wipes killing 99.9% of viruses and bacteria.'
      },

      // Instant Foods & Ready Meals
      {
        name: 'Nongshim Shin Ramyun Gourmet Spicy 120g',
        category_id: catMap['Instant Foods & Ready Meals'],
        price: 1.75,
        image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&auto=format&fit=crop&q=60',
        description: 'Famous spicy Korean instant ramen featuring chewy noodles and a rich beef broth.'
      },
      {
        name: 'Nissin Cup Noodles Seafood 75g',
        category_id: catMap['Instant Foods & Ready Meals'],
        price: 1.65,
        image_url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=60',
        description: 'Classic quick meal filled with calamari, crab stick, egg, and cabbage in savory broth.'
      },
      {
        name: 'CP Teriyaki Chicken with Rice 250g',
        category_id: catMap['Instant Foods & Ready Meals'],
        price: 4.50,
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
        description: 'Microwaveable ready meal with tender grilled chicken glazed in sweet teriyaki sauce.'
      },

      // Personal Care
      {
        name: 'Colgate Total Clean Mint Toothpaste 100g',
        category_id: catMap['Personal Care'],
        price: 2.90,
        image_url: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=500&auto=format&fit=crop&q=60',
        description: '12-hour antibacterial protection for teeth, tongue, cheeks, and gums.'
      }
    ];

    const insertProduct = db.prepare(`
      INSERT INTO products (name, category_id, price, image_url, description)
      VALUES (@name, @category_id, @price, @image_url, @description)
    `);

    // Check existing products count to prevent duplicate accumulation
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    if (existingCount === 0) {
      for (const prod of products) {
        insertProduct.run(prod);
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
      insertUser.run(u);
    }

    // 4. Seed Sample Orders and Items (demonstrating guest & customer checkout)
    const existingOrdersCount = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    if (existingOrdersCount === 0) {
      const customer = db.prepare('SELECT id FROM users WHERE email = ?').get('john.doe@example.com');
      const allProducts = db.prepare('SELECT id, price FROM products LIMIT 5').all();

      if (allProducts.length >= 4) {
        // Order 1: Registered Customer Order
        const order1Stmt = db.prepare(`
          INSERT INTO orders (
            user_id, customer_name, customer_phone, delivery_address,
            total_amount, payment_method, status, driver_name, driver_phone
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const order1Total = (allProducts[0].price * 2) + (allProducts[1].price * 1);
        const order1Result = order1Stmt.run(
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

        insertItem.run(order1Result.lastInsertRowid, allProducts[0].id, 2, allProducts[0].price);
        insertItem.run(order1Result.lastInsertRowid, allProducts[1].id, 1, allProducts[1].price);

        // Order 2: Guest Checkout Order
        const order2Total = (allProducts[2].price * 1) + (allProducts[3].price * 2);
        const order2Result = order1Stmt.run(
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

        insertItem.run(order2Result.lastInsertRowid, allProducts[2].id, 1, allProducts[2].price);
        insertItem.run(order2Result.lastInsertRowid, allProducts[3].id, 2, allProducts[3].price);
      }
    }
  });

  seedTransaction();
  console.log('[DB SEED] Sample data populated successfully.');
}

// Run directly if invoked from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    seedDatabase();
    process.exit(0);
  } catch (err) {
    console.error('[DB SEED ERROR] Failed to seed database:', err.message);
    process.exit(1);
  }
}

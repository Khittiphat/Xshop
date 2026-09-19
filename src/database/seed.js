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

    // Migrate legacy English products if any exist to prevent duplicate catalog entries
    const legacyNameMap = {
      "Lay's Classic Potato Chips 50g": "เลย์คลาสสิค รสมันฝรั่งแท้ 50g (Lay's Classic Potato Chips)",
      "Pringles Sour Cream & Onion 107g": "พริงเกิลส์ รสซาวครีมและหัวหอม 107g (Pringles Sour Cream & Onion)",
      "Oreo Original Chocolate Sandwich Cookies 133g": "โอรีโอ คุกกี้แซนวิชรสช็อกโกแลต 133g (Oreo Original Cookies)",
      "Doritos Nacho Cheese Tortilla Chips 140g": "ดอริโทส นาโชชีส 140g (Doritos Nacho Cheese Tortilla Chips)",
      "Coca-Cola Original Taste 330ml Can": "โค้ก ออริจินัล 325ml กระป๋อง (Coca-Cola Original Can)",
      "Pokka Japanese Green Tea No Sugar 500ml": "ชาเขียวโออิชิ รสต้นตำรับ 500ml (Oishi Green Tea Original)",
      "Red Bull Energy Drink 250ml": "กระทิงแดง เรดบูล 250ml (Red Bull Energy Drink)",
      "Evian Natural Mineral Water 500ml": "น้ำดื่มสิงห์ 600ml (Singha Drinking Water)",
      "Nescafe Gold Iced Latte 240ml Can": "เนสกาแฟ เอสเปรสโซ โรสต์ 180ml กระป๋อง (Nescafe Espresso Roast)",
      "Organic Fresh Whole Milk 1L": "นมสดเมจิ พาสเจอร์ไรส์ 200ml (Meiji Fresh Milk)",
      "Kleenex Ultra Soft Facial Tissues 3-Pack": "ทิชชู่พรีเมียม สก๊อตต์ 3 ม้วน (Scott Facial & Toilet Tissue 3-Pack)",
      "Scotch-Brite Heavy Duty Scrub Sponge 3-Pack": "ฟองน้ำล้างจาน สก๊อตช์-ไบรต์ แพ็ก 3 ชิ้น (Scotch-Brite Scrub Sponge 3-Pack)",
      "Clorox Disinfecting Wipes Fresh Scent 35-Count": "สเปรย์แอลกอฮอล์ทำความสะอาด 100ml (Alcohol Sanitizing Spray)",
      "Nongshim Shin Ramyun Gourmet Spicy 120g": "มาม่า รสต้มยำกุ้ง 60g (Mama Instant Noodles Tom Yum Kung)",
      "Nissin Cup Noodles Seafood 75g": "มาม่าคัพ รสต้มยำกุ้งน้ำข้น 60g (Mama Cup Noodles Creamy Tom Yum)",
      "CP Teriyaki Chicken with Rice 250g": "ข้าวกล่องกะเพราไก่ไข่ดาว (CP Stir-Fried Basil Chicken with Rice)",
      "Colgate Total Clean Mint Toothpaste 100g": "ยาสีฟันคอลเกต โททอล 100g (Colgate Total Clean Mint Toothpaste)"
    };

    for (const [oldName, newName] of Object.entries(legacyNameMap)) {
      const oldProd = await db.prepare('SELECT id FROM products WHERE name = ?').get(oldName);
      const newProd = await db.prepare('SELECT id FROM products WHERE name = ?').get(newName);
      if (oldProd && newProd) {
        await db.prepare('UPDATE order_items SET product_id = ? WHERE product_id = ?').run(newProd.id, oldProd.id);
        await db.prepare('DELETE FROM products WHERE id = ?').run(oldProd.id);
      } else if (oldProd && !newProd) {
        await db.prepare('UPDATE products SET name = ? WHERE id = ?').run(newName, oldProd.id);
      }
    }

    // 2. Seed Products (24+ realistic Thai convenience store products with emoji icons)
    const products = [
      // Drinks
      {
        name: "น้ำดื่มสิงห์ 600ml (Singha Drinking Water)",
        category_id: catMap['Drinks'],
        price: 10.00,
        icon: '💧',
        description: 'น้ำดื่มสะอาดบริสุทธิ์ ตราสิงห์ ขนาดพกพา 600 มล.'
      },
      {
        name: "โค้ก ออริจินัล 325ml กระป๋อง (Coca-Cola Original Can)",
        category_id: catMap['Drinks'],
        price: 16.00,
        icon: '🥤',
        description: 'เครื่องดื่มน้ำอัดลมรสชาติยอดนิยม เย็นซ่าชื่นใจ (Cola / Soda)'
      },
      {
        name: "ชาเขียวโออิชิ รสต้นตำรับ 500ml (Oishi Green Tea Original)",
        category_id: catMap['Drinks'],
        price: 20.00,
        icon: '🍵',
        description: 'ชาเขียวแท้สกัดจากใบชาคุณภาพ รสชาติกลมกล่อม หอมสดชื่น (Green Tea)'
      },
      {
        name: "นมสดเมจิ พาสเจอร์ไรส์ 200ml (Meiji Fresh Milk)",
        category_id: catMap['Drinks'],
        price: 13.00,
        icon: '🥛',
        description: 'นมโคแท้ 100% สดใหม่ อุดมด้วยแคลเซียมและโปรตีนธรรมชาติ'
      },
      {
        name: "เนสกาแฟ เอสเปรสโซ โรสต์ 180ml กระป๋อง (Nescafe Espresso Roast)",
        category_id: catMap['Drinks'],
        price: 17.00,
        icon: '☕',
        description: 'กาแฟปรุงสำเร็จพร้อมดื่มรสเข้มข้น หอมกลิ่นอาราบิก้า (Iced Coffee)'
      },
      {
        name: "กระทิงแดง เรดบูล 250ml (Red Bull Energy Drink)",
        category_id: catMap['Drinks'],
        price: 20.00,
        icon: '⚡',
        description: 'เครื่องดื่มชูกำลัง เพิ่มพลังและความสดชื่น พร้อมทำงานตลอดวัน'
      },

      // Snacks
      {
        name: "เลย์คลาสสิค รสมันฝรั่งแท้ 50g (Lay's Classic Potato Chips)",
        category_id: catMap['Snacks'],
        price: 30.00,
        icon: '🥔',
        description: 'มันฝรั่งทอดกรอบแผ่นเรียบ คัดสรรจากมันฝรั่งแท้คุณภาพดี กรอบอร่อย (Chips)'
      },
      {
        name: "พริงเกิลส์ รสซาวครีมและหัวหอม 107g (Pringles Sour Cream & Onion)",
        category_id: catMap['Snacks'],
        price: 55.00,
        icon: '🥫',
        description: 'มันฝรั่งทอดกรอบรูปทรงอานม้า กรอบอร่อย รสชาติเข้มข้น (Pringles Chips)'
      },
      {
        name: "เบนโตะ ปลาหมึกอบทรงเครื่อง 20g (Bento Spicy Squid Snack)",
        category_id: catMap['Snacks'],
        price: 20.00,
        icon: '🦑',
        description: 'ปลาหมึกอบทรงเครื่องรสเผ็ดจัดจ้าน อร่อยเคี้ยวเพลิน'
      },
      {
        name: "โอรีโอ คุกกี้แซนวิชรสช็อกโกแลต 133g (Oreo Original Cookies)",
        category_id: catMap['Snacks'],
        price: 32.00,
        icon: '🍪',
        description: 'คุกกี้รสช็อกโกแลตสอดไส้ครีมวานิลลา บิด ชิมครีม จุ่มนม (Cookies)'
      },
      {
        name: "ทาโร่ ปลาสวรรค์ รสบาร์บีคิว 30g (Taro Fish Snack BBQ)",
        category_id: catMap['Snacks'],
        price: 20.00,
        icon: '🐟',
        description: 'เส้นปลาสวรรค์กรอบอร่อย ไขมันต่ำ มีโปรตีนจากเนื้อปลาแท้'
      },
      {
        name: "ดอริโทส นาโชชีส 140g (Doritos Nacho Cheese Tortilla Chips)",
        category_id: catMap['Snacks'],
        price: 45.00,
        icon: '🧀',
        description: 'แผ่นข้าวโพดทอดกรอบรสชีสเข้มข้น หอมมัน กรอบถึงใจ (Chips)'
      },

      // Instant Foods & Ready Meals
      {
        name: "มาม่า รสต้มยำกุ้ง 60g (Mama Instant Noodles Tom Yum Kung)",
        category_id: catMap['Instant Foods & Ready Meals'],
        price: 7.00,
        icon: '🍜',
        description: 'บะหมี่กึ่งสำเร็จรูปรสต้มยำกุ้งยอดนิยม แซ่บถึงใจรสต้มยำแท้ (Noodles)'
      },
      {
        name: "มาม่าคัพ รสต้มยำกุ้งน้ำข้น 60g (Mama Cup Noodles Creamy Tom Yum)",
        category_id: catMap['Instant Foods & Ready Meals'],
        price: 15.00,
        icon: '🍲',
        description: 'บะหมี่ถ้วยกึ่งสำเร็จรูป สะดวก รวดเร็ว พร้อมทานทันที เพียงเติมน้ำร้อน'
      },
      {
        name: "ข้าวสารหอมมะลิแท้ 1 กก. (Thai Jasmine Rice 1kg)",
        category_id: catMap['Instant Foods & Ready Meals'],
        price: 65.00,
        icon: '🌾',
        description: 'ข้าวหอมมะลิแท้เกรดพรีเมียม หุงขึ้นหม้อ นุ่ม หอม อร่อย (Rice)'
      },
      {
        name: "ไข่ไก่สดคละไซซ์ แพ็ก 10 ฟอง (Fresh Chicken Eggs 10-Pack)",
        category_id: catMap['Instant Foods & Ready Meals'],
        price: 60.00,
        icon: '🥚',
        description: 'ไข่ไก่สดจากฟาร์ม สะอาด ปลอดภัย อุดมด้วยคุณค่าทางอาหาร (Eggs)'
      },
      {
        name: "ข้าวกล่องกะเพราไก่ไข่ดาว (CP Stir-Fried Basil Chicken with Rice)",
        category_id: catMap['Instant Foods & Ready Meals'],
        price: 45.00,
        icon: '🍛',
        description: 'อาหารพร้อมทานไมโครเวฟ รสชาติจัดจ้าน หอมใบกะเพรา เสิร์ฟพร้อมข้าวสวย'
      },
      {
        name: "แซนวิชอบร้อน แฮมชีส (Ham & Cheese Toasted Sandwich)",
        category_id: catMap['Instant Foods & Ready Meals'],
        price: 29.00,
        icon: '🥪',
        description: 'แซนวิชอบร้อน กรอบนอกนุ่มใน ไส้แฮมและชีสเยิ้มๆ ร้อนๆ'
      },

      // Household Essentials
      {
        name: "ทิชชู่พรีเมียม สก๊อตต์ 3 ม้วน (Scott Facial & Toilet Tissue 3-Pack)",
        category_id: catMap['Household Essentials'],
        price: 39.00,
        icon: '🧻',
        description: 'กระดาษทิชชู่หนานุ่ม 3 ชั้น ซึมซับดีเยี่ยม อ่อนโยนต่อผิว (Tissue)'
      },
      {
        name: "น้ำยาล้างจาน ซันไลต์ เลมอนเทอร์โบ 500ml (Sunlight Dishwashing Liquid)",
        category_id: catMap['Household Essentials'],
        price: 32.00,
        icon: '🍋',
        description: 'ขจัดคราบมันและกลิ่นคาวได้อย่างสะอาดหมดจด พร้อมกลิ่นเลมอนสดชื่น'
      },
      {
        name: "ฟองน้ำล้างจาน สก๊อตช์-ไบรต์ แพ็ก 3 ชิ้น (Scotch-Brite Scrub Sponge 3-Pack)",
        category_id: catMap['Household Essentials'],
        price: 35.00,
        icon: '🧽',
        description: 'ใยขัดพร้อมฟองน้ำคุณภาพสูง ทำความสะอาดคราบฝังแน่นได้อย่างง่ายดาย'
      },
      {
        name: "สเปรย์แอลกอฮอล์ทำความสะอาด 100ml (Alcohol Sanitizing Spray)",
        category_id: catMap['Household Essentials'],
        price: 29.00,
        icon: '🧴',
        description: 'แอลกอฮอล์ 75% ฆ่าเชื้อแบคทีเรียและไวรัส แห้งไว ไม่เหนียวเหนอะหนะ'
      },

      // Personal Care
      {
        name: "สบู่ก้อน โพรเทคส์ 65g (Protex Antibacterial Bar Soap)",
        category_id: catMap['Personal Care'],
        price: 18.00,
        icon: '🧼',
        description: 'สบู่ก้อนชำระล้างแบคทีเรีย 99.9% กลิ่นหอมสะอาดสดชื่น (Soap)'
      },
      {
        name: "ยาสีฟันคอลเกต โททอล 100g (Colgate Total Clean Mint Toothpaste)",
        category_id: catMap['Personal Care'],
        price: 49.00,
        icon: '🪥',
        description: 'ปกป้องแบคทีเรียนาน 12 ชั่วโมง เพื่อลมหายใจสดชื่นและฟันแข็งแรง'
      },
      {
        name: "แชมพูสระผม ซันซิล 120ml (Sunsilk Hair Shampoo)",
        category_id: catMap['Personal Care'],
        price: 35.00,
        icon: '💆',
        description: 'บำรุงผมให้นุ่มลื่น เงางาม จัดทรงง่ายตลอดวัน'
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

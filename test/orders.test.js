import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import db from '../src/database/db.js';
import { seedDatabase } from '../src/database/seed.js';
import { dispatchedOrdersLog } from '../src/services/logisticsService.js';

describe('X Mart Order & Checkout API Endpoints (Business Rules)', () => {
  let sampleProduct1;
  let sampleProduct2;
  let registeredUser;

  before(async () => {
    await seedDatabase();
    sampleProduct1 = await db.prepare('SELECT id, name, price FROM products LIMIT 1').get();
    sampleProduct2 = await db.prepare('SELECT id, name, price FROM products LIMIT 1 OFFSET 1').get();
    registeredUser = await db.prepare("SELECT id, name, email FROM users WHERE role = 'customer' LIMIT 1").get();
    assert.ok(sampleProduct1, 'Sample product 1 must exist');
    assert.ok(sampleProduct2, 'Sample product 2 must exist');
    assert.ok(registeredUser, 'Registered customer must exist');
  });

  describe('POST /api/orders - Rule 1: Guest & Registered Checkout & Contact Info', () => {
    test('should allow guest checkout (user_id: null) with valid contact info', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          user_id: null,
          customer_name: 'Somchai Guest',
          customer_phone: '+66-89-111-2233',
          delivery_address: '88 Sukhumvit Soi 55, Bangkok',
          payment_method: 'CASH',
          items: [{ product_id: sampleProduct1.id, quantity: 2 }]
        })
        .expect(201);

      assert.equal(res.body.success, true);
      assert.equal(res.body.data.is_guest, true);
      assert.equal(res.body.data.user_id, null);
      assert.equal(res.body.data.customer_name, 'Somchai Guest');
    });

    test('should allow registered member checkout with valid user_id', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          user_id: registeredUser.id,
          customer_name: registeredUser.name,
          customer_phone: '+66-81-999-8877',
          delivery_address: '123 Rama 9 Road, Bangkok',
          payment_method: 'QR',
          items: [{ product_id: sampleProduct2.id, quantity: 1 }]
        })
        .expect(201);

      assert.equal(res.body.success, true);
      assert.equal(res.body.data.is_guest, false);
      assert.equal(res.body.data.user_id, registeredUser.id);
    });

    test('should reject checkout if user_id does not exist', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          user_id: 999999,
          customer_name: 'Ghost User',
          customer_phone: '+66-81-000-0000',
          delivery_address: 'Nowhere',
          payment_method: 'CASH',
          items: [{ product_id: sampleProduct1.id, quantity: 1 }]
        })
        .expect(400);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /does not exist/i);
    });

    test('should reject checkout with missing or empty customer contact info', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          user_id: null,
          customer_name: '',
          customer_phone: '+66-81-222-3333',
          delivery_address: 'Some Address',
          payment_method: 'CASH',
          items: [{ product_id: sampleProduct1.id, quantity: 1 }]
        })
        .expect(400);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /customer_name/i);
    });
  });

  describe('POST /api/orders - Rule 2: Minimum Order Quantity & No Upper Limit', () => {
    test('should reject orders with empty items array', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          customer_name: 'Anna Lee',
          customer_phone: '+66-82-333-4444',
          delivery_address: '42 Phra Khanong, Bangkok',
          payment_method: 'CASH',
          items: []
        })
        .expect(400);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /at least 1 item/i);
    });

    test('should reject item with zero or negative quantity', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          customer_name: 'Anna Lee',
          customer_phone: '+66-82-333-4444',
          delivery_address: '42 Phra Khanong, Bangkok',
          payment_method: 'CASH',
          items: [{ product_id: sampleProduct1.id, quantity: 0 }]
        })
        .expect(400);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /minimum quantity/i);
    });

    test('should allow bulk order with no upper limit on quantity', async () => {
      const largeQty = 500;
      const res = await request(app)
        .post('/api/orders')
        .send({
          customer_name: 'Event Organizer',
          customer_phone: '+66-83-555-6666',
          delivery_address: 'BITEC Bangna, Hall 1',
          payment_method: 'QR',
          items: [{ product_id: sampleProduct1.id, quantity: largeQty }]
        })
        .expect(201);

      assert.equal(res.body.success, true);
      const expectedTotal = Math.round(sampleProduct1.price * largeQty * 100) / 100;
      assert.equal(res.body.data.pricing.total_amount, expectedTotal);
      assert.equal(res.body.data.items[0].quantity, largeQty);
    });
  });

  describe('POST /api/orders - Rule 3: Free Delivery (Shipping Fee strictly 0)', () => {
    test('shipping fee is strictly 0 and total equals item subtotal', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          customer_name: 'Single Item Buyer',
          customer_phone: '+66-84-123-9999',
          delivery_address: '15 Thonglor Soi 10, Bangkok',
          payment_method: 'CASH',
          items: [{ product_id: sampleProduct1.id, quantity: 1 }]
        })
        .expect(201);

      assert.equal(res.body.success, true);
      assert.equal(res.body.data.pricing.shipping_fee, 0);
      assert.equal(res.body.data.pricing.subtotal, sampleProduct1.price);
      assert.equal(res.body.data.pricing.total_amount, sampleProduct1.price);
    });
  });

  describe('POST /api/orders - Rule 4: Accepted Payment Methods (CASH and QR ONLY)', () => {
    test('should accept CASH payment method', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          customer_name: 'Cash Customer',
          customer_phone: '+66-85-001-1122',
          delivery_address: '77 Silom Road, Bangkok',
          payment_method: 'CASH',
          items: [{ product_id: sampleProduct1.id, quantity: 1 }]
        })
        .expect(201);

      assert.equal(res.body.data.payment_method, 'CASH');
    });

    test('should accept QR payment method (PromptPay)', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          customer_name: 'QR Customer',
          customer_phone: '+66-85-001-1133',
          delivery_address: '88 Sathorn Road, Bangkok',
          payment_method: 'QR',
          items: [{ product_id: sampleProduct1.id, quantity: 1 }]
        })
        .expect(201);

      assert.equal(res.body.data.payment_method, 'QR');
    });

    test('should strictly reject CREDIT_CARD, STRIPE, or VISA options', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          customer_name: 'Card Customer',
          customer_phone: '+66-85-001-1144',
          delivery_address: '99 Ploenchit Road, Bangkok',
          payment_method: 'CREDIT_CARD',
          items: [{ product_id: sampleProduct1.id, quantity: 1 }]
        })
        .expect(400);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /credit cards and other payment methods are not supported/i);
    });
  });

  describe('POST /api/orders - Rule 6: Simulated Dispatch & Mock Logistics Webhook', () => {
    test('should assign mock driver details and record simulated logistics webhook', async () => {
      const initialLogCount = dispatchedOrdersLog.length;

      const res = await request(app)
        .post('/api/orders')
        .send({
          customer_name: 'Express Delivery Tester',
          customer_phone: '+66-86-555-7777',
          delivery_address: 'CentralWorld Office Tower, Fl 24',
          payment_method: 'CASH',
          items: [{ product_id: sampleProduct1.id, quantity: 2 }]
        })
        .expect(201);

      assert.equal(res.body.success, true);
      // Driver details assigned
      assert.ok(res.body.data.driver.name);
      assert.ok(res.body.data.driver.phone);
      assert.equal(res.body.data.status, 'OUT_FOR_DELIVERY');

      // Logistics webhook dispatch verified
      assert.ok(res.body.data.logistics_dispatch);
      assert.ok(res.body.data.logistics_dispatch.tracking_number.startsWith('TRK-'));
      assert.equal(res.body.data.logistics_dispatch.webhook_status, 'DISPATCHED_TO_EXTERNAL_LOGISTICS');

      // Verified in simulated dispatch log
      assert.equal(dispatchedOrdersLog.length, initialLogCount + 1);
      const lastLogged = dispatchedOrdersLog[dispatchedOrdersLog.length - 1];
      assert.equal(lastLogged.order.id, res.body.data.id);
      assert.equal(lastLogged.event, 'order.dispatched');
    });
  });

  describe('Rule 5: Cart Immutability Post-Checkout', () => {
    test('should reject PUT or PATCH attempts to modify order items', async () => {
      // Create an order first
      const orderRes = await request(app)
        .post('/api/orders')
        .send({
          customer_name: 'Immutable Test',
          customer_phone: '+66-81-777-8899',
          delivery_address: '10 Ari Soi 2, Bangkok',
          payment_method: 'CASH',
          items: [{ product_id: sampleProduct1.id, quantity: 1 }]
        })
        .expect(201);

      const orderId = orderRes.body.data.id;

      // Attempt to modify order items via PUT
      const putRes = await request(app)
        .put(`/api/orders/${orderId}/items`)
        .send({ items: [{ product_id: sampleProduct2.id, quantity: 10 }] })
        .expect(405);

      assert.equal(putRes.body.success, false);
      assert.match(putRes.body.error, /strictly immutable post-checkout/i);

      // Attempt to modify order items via PATCH
      const patchRes = await request(app)
        .patch(`/api/orders/${orderId}`)
        .send({ items: [] })
        .expect(405);

      assert.equal(patchRes.body.success, false);
      assert.match(patchRes.body.error, /strictly immutable post-checkout/i);
    });
  });

  describe('GET /api/orders/:id', () => {
    test('should retrieve order status, item breakdown, and driver contact info', async () => {
      // Create an order to retrieve
      const createRes = await request(app)
        .post('/api/orders')
        .send({
          customer_name: 'Detail Test Buyer',
          customer_phone: '+66-89-000-1111',
          delivery_address: '55 Ladprao Soi 15, Bangkok',
          payment_method: 'QR',
          items: [
            { product_id: sampleProduct1.id, quantity: 2 },
            { product_id: sampleProduct2.id, quantity: 1 }
          ]
        })
        .expect(201);

      const orderId = createRes.body.data.id;

      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      assert.equal(res.body.success, true);
      assert.equal(res.body.data.id, orderId);
      assert.equal(res.body.data.customer_name, 'Detail Test Buyer');
      assert.equal(res.body.data.status, 'OUT_FOR_DELIVERY');
      assert.ok(res.body.data.driver.name);
      assert.ok(res.body.data.driver.phone);
      assert.equal(res.body.data.pricing.shipping_fee, 0);
      assert.equal(res.body.data.items.length, 2);

      const item1 = res.body.data.items[0];
      assert.equal(item1.product_id, sampleProduct1.id);
      assert.equal(item1.quantity, 2);
      assert.equal(item1.subtotal, Math.round(sampleProduct1.price * 2 * 100) / 100);
    });

    test('should return 404 for non-existent order ID', async () => {
      const res = await request(app)
        .get('/api/orders/999999')
        .expect(404);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /not found/i);
    });

    test('should return 400 for invalid non-integer order ID', async () => {
      const res = await request(app)
        .get('/api/orders/not-an-id')
        .expect(400);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /invalid order id/i);
    });
  });

  describe('GET /api/orders/user/:userId - Registered Member Order History', () => {
    test('should return order history for registered member', async () => {
      // Place an order for registeredUser
      await request(app)
        .post('/api/orders')
        .send({
          user_id: registeredUser.id,
          customer_name: registeredUser.name,
          customer_phone: '+66-81-999-8877',
          delivery_address: 'Member Residence, Bangkok',
          payment_method: 'CASH',
          items: [{ product_id: sampleProduct1.id, quantity: 1 }]
        })
        .expect(201);

      const res = await request(app)
        .get(`/api/orders/user/${registeredUser.id}`)
        .expect(200);

      assert.equal(res.body.success, true);
      assert.equal(res.body.user.id, registeredUser.id);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.count >= 1);

      // Verify each order in history belongs to registeredUser
      for (const order of res.body.data) {
        assert.equal(order.user_id, registeredUser.id);
        assert.ok(Array.isArray(order.items));
      }
    });

    test('should return 404 when userId is not found in database', async () => {
      const res = await request(app)
        .get('/api/orders/user/999999')
        .expect(404);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /not found/i);
    });

    test('should return 400 when userId is not a valid number', async () => {
      const res = await request(app)
        .get('/api/orders/user/invalid-user-id')
        .expect(400);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /invalid user id/i);
    });
  });
});

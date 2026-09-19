import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import db from '../src/database/db.js';
import { seedDatabase } from '../src/database/seed.js';

describe('X Mart Order Tracking, Cancellation, and Analytics Reports', () => {
  let sampleProduct;

  before(async () => {
    await seedDatabase();
    sampleProduct = await db.prepare('SELECT id, name, price FROM products LIMIT 1').get();
    assert.ok(sampleProduct, 'Sample product must exist');
  });

  describe('POST /api/orders/:id/cancel - Cancellation Logic', () => {
    test('should allow cancelling an order in OUT_FOR_DELIVERY status', async () => {
      // Create an order
      const createRes = await request(app)
        .post('/api/orders')
        .send({
          customer_name: 'Cancel Test Customer',
          customer_phone: '+66-81-111-2222',
          delivery_address: '123 Sukhumvit, Bangkok',
          payment_method: 'CASH',
          items: [{ product_id: sampleProduct.id, quantity: 1 }]
        })
        .expect(201);

      const orderId = createRes.body.data.id;
      assert.equal(createRes.body.data.status, 'OUT_FOR_DELIVERY');

      // Cancel the order
      const cancelRes = await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .expect(200);

      assert.equal(cancelRes.body.success, true);
      assert.equal(cancelRes.body.data.status, 'CANCELLED');
      assert.equal(cancelRes.body.data.previous_status, 'OUT_FOR_DELIVERY');

      // Verify in database
      const updatedInDb = await db.prepare('SELECT status FROM orders WHERE id = ?').get(orderId);
      assert.equal(updatedInDb.status, 'CANCELLED');
    });

    test('should reject cancellation if order has already been DELIVERED (no refunds once delivered)', async () => {
      // Create an order
      const createRes = await request(app)
        .post('/api/orders')
        .send({
          customer_name: 'Delivered Customer',
          customer_phone: '+66-81-333-4444',
          delivery_address: '456 Silom, Bangkok',
          payment_method: 'QR',
          items: [{ product_id: sampleProduct.id, quantity: 1 }]
        })
        .expect(201);

      const orderId = createRes.body.data.id;

      // Update status to DELIVERED
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'DELIVERED' })
        .expect(200);

      // Attempt to cancel DELIVERED order
      const cancelRes = await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .expect(400);

      assert.equal(cancelRes.body.success, false);
      assert.match(cancelRes.body.error, /already been DELIVERED/i);
      assert.match(cancelRes.body.error, /no refunds once delivered/i);
    });

    test('should reject cancellation if order is already CANCELLED', async () => {
      // Create an order
      const createRes = await request(app)
        .post('/api/orders')
        .send({
          customer_name: 'Double Cancel Customer',
          customer_phone: '+66-81-555-6666',
          delivery_address: '789 Sathorn, Bangkok',
          payment_method: 'CASH',
          items: [{ product_id: sampleProduct.id, quantity: 1 }]
        })
        .expect(201);

      const orderId = createRes.body.data.id;

      // Cancel once
      await request(app).post(`/api/orders/${orderId}/cancel`).expect(200);

      // Cancel again
      const secondCancelRes = await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .expect(400);

      assert.equal(secondCancelRes.body.success, false);
      assert.match(secondCancelRes.body.error, /already CANCELLED/i);
    });

    test('should return 404 when cancelling non-existent order ID', async () => {
      const res = await request(app)
        .post('/api/orders/999999/cancel')
        .expect(404);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /not found/i);
    });

    test('should return 400 when cancelling invalid order ID', async () => {
      const res = await request(app)
        .post('/api/orders/invalid-id/cancel')
        .expect(400);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /invalid order id/i);
    });
  });

  describe('PATCH /api/orders/:id/status - Status Transitions', () => {
    test('should transition status from OUT_FOR_DELIVERY to DELIVERED', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .send({
          customer_name: 'Transition Customer',
          customer_phone: '+66-81-777-8888',
          delivery_address: '100 Rama 4, Bangkok',
          payment_method: 'CASH',
          items: [{ product_id: sampleProduct.id, quantity: 1 }]
        })
        .expect(201);

      const orderId = createRes.body.data.id;

      const patchRes = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'DELIVERED' })
        .expect(200);

      assert.equal(patchRes.body.success, true);
      assert.equal(patchRes.body.data.status, 'DELIVERED');
      assert.equal(patchRes.body.data.previous_status, 'OUT_FOR_DELIVERY');
    });

    test('should reject transitions from DELIVERED terminal status', async () => {
      const createRes = await request(app)
        .post('/api/orders')
        .send({
          customer_name: 'Terminal Status Customer',
          customer_phone: '+66-81-888-9999',
          delivery_address: '200 Rama 9, Bangkok',
          payment_method: 'QR',
          items: [{ product_id: sampleProduct.id, quantity: 1 }]
        })
        .expect(201);

      const orderId = createRes.body.data.id;

      // Deliver
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'DELIVERED' })
        .expect(200);

      // Try to revert to PENDING
      const revertRes = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'PENDING' })
        .expect(400);

      assert.equal(revertRes.body.success, false);
      assert.match(revertRes.body.error, /already DELIVERED/i);
    });

    test('should reject invalid status strings', async () => {
      const res = await request(app)
        .patch('/api/orders/1/status')
        .send({ status: 'FLYING_TO_MARS' })
        .expect(400);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /invalid status/i);
    });
  });

  describe('GET /api/admin/reports/sales - Sales Analytics Dashboard', () => {
    test('should return total sales revenue and breakdown by product category', async () => {
      const today = new Date().toISOString().slice(0, 10);
      const res = await request(app)
        .get(`/api/admin/reports/sales?startDate=2026-01-01&endDate=${today}`)
        .expect('Content-Type', /json/)
        .expect(200);

      assert.equal(res.body.success, true);
      assert.ok(res.body.summary);
      assert.ok(typeof res.body.summary.total_revenue === 'number');
      assert.ok(typeof res.body.summary.total_orders === 'number');
      assert.ok(typeof res.body.summary.average_order_value === 'number');

      assert.ok(Array.isArray(res.body.category_breakdown));
      assert.ok(res.body.category_breakdown.length >= 3);

      const firstCat = res.body.category_breakdown[0];
      assert.ok(firstCat.category_name);
      assert.ok(typeof firstCat.units_sold === 'number');
      assert.ok(typeof firstCat.category_revenue === 'number');
      assert.ok(firstCat.percentage_of_sales);
    });

    test('should exclude cancelled orders from total sales revenue', async () => {
      const today = new Date().toISOString().slice(0, 10);

      // Fetch initial revenue
      const initialReport = await request(app)
        .get(`/api/admin/reports/sales?startDate=2026-01-01&endDate=${today}`)
        .expect(200);

      const initialRevenue = initialReport.body.summary.total_revenue;

      // Create an order
      const createRes = await request(app)
        .post('/api/orders')
        .send({
          customer_name: 'Excluded Cancel Test',
          customer_phone: '+66-81-000-1111',
          delivery_address: 'Bangkok',
          payment_method: 'CASH',
          items: [{ product_id: sampleProduct.id, quantity: 1 }]
        })
        .expect(201);

      const orderId = createRes.body.data.id;
      const orderAmount = createRes.body.data.pricing.total_amount;

      // Revenue increases with active order
      const activeReport = await request(app)
        .get(`/api/admin/reports/sales?startDate=2026-01-01&endDate=${today}`)
        .expect(200);

      assert.equal(
        Math.round(activeReport.body.summary.total_revenue * 100) / 100,
        Math.round((initialRevenue + orderAmount) * 100) / 100
      );

      // Now cancel the order
      await request(app).post(`/api/orders/${orderId}/cancel`).expect(200);

      // Cancelled order should now be excluded from total sales revenue
      const postCancelReport = await request(app)
        .get(`/api/admin/reports/sales?startDate=2026-01-01&endDate=${today}`)
        .expect(200);

      assert.equal(
        Math.round(postCancelReport.body.summary.total_revenue * 100) / 100,
        Math.round(initialRevenue * 100) / 100
      );
    });

    test('should reject invalid date format in sales report query', async () => {
      const res = await request(app)
        .get('/api/admin/reports/sales?startDate=2026/01/01&endDate=2026-01-10')
        .expect(400);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /invalid startDate parameter/i);
    });

    test('should reject when startDate is later than endDate', async () => {
      const res = await request(app)
        .get('/api/admin/reports/sales?startDate=2026-12-31&endDate=2026-01-01')
        .expect(400);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /cannot be later than endDate/i);
    });
  });

  describe('GET /api/admin/reports/peak-hours - Peak Traffic Analytics', () => {
    test('should aggregate order counts grouped by hour of the day (24 hours)', async () => {
      const res = await request(app)
        .get('/api/admin/reports/peak-hours')
        .expect('Content-Type', /json/)
        .expect(200);

      assert.equal(res.body.success, true);
      assert.ok(typeof res.body.total_orders_analyzed === 'number');
      assert.ok(res.body.total_orders_analyzed > 0);
      assert.ok(res.body.traffic_analysis);
      assert.ok(res.body.recommendations);
      assert.ok(res.body.recommendations.auto_scale_up_target);

      // Verify all 24 hours are represented
      assert.equal(res.body.data.length, 24);
      assert.equal(res.body.data[0].hour, '00:00');
      assert.equal(res.body.data[23].hour, '23:00');

      for (const h of res.body.data) {
        assert.ok(typeof h.hour_number === 'number');
        assert.ok(typeof h.order_count === 'number');
        assert.ok(typeof h.percentage === 'string');
        assert.ok(['LOW', 'NORMAL', 'PEAK'].includes(h.traffic_level));
      }
    });
  });
});

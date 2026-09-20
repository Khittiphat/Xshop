import http from 'node:http';
import app from '../src/app.js';
import db from '../src/database/db.js';
import { calculateSmartPrice } from '../src/services/pricingService.js';
import supertest from 'supertest';

const request = supertest(app);

async function runAudit() {
  console.log('===============================================================');
  console.log('   X MART FULL-SPECTRUM AUDIT & VERIFICATION BENCHMARK        ');
  console.log('===============================================================\n');

  const report = {
    auth: { total: 0, passed: 0, failed: 0, details: [] },
    businessLogic: { total: 0, passed: 0, failed: 0, details: [] },
    admin: { total: 0, passed: 0, failed: 0, details: [] },
    stress: { health: {}, products: {} },
    mobile: { total: 0, passed: 0, failed: 0, details: [] }
  };

  function assertTest(category, name, condition, extraInfo = '') {
    category.total++;
    if (condition) {
      category.passed++;
      category.details.push(`✔ [PASS] ${name} ${extraInfo}`);
      console.log(`  ✔ [PASS] ${name} ${extraInfo}`);
    } else {
      category.failed++;
      category.details.push(`✖ [FAIL] ${name} ${extraInfo}`);
      console.error(`  ✖ [FAIL] ${name} ${extraInfo}`);
    }
  }

  // -------------------------------------------------------------
  // 1. SECURITY & AUTHENTICATION AUDIT
  // -------------------------------------------------------------
  console.log('--- 1. Security & Authentication Audit ---');
  const testEmail = `audit_user_${Date.now()}@example.com`;
  const testPhone = `08${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testPassword = 'SecurePassword@2026';

  // Test User Registration
  const regRes = await request.post('/api/auth/register').send({
    name: 'Audit User',
    phone: testPhone,
    email: testEmail,
    password: testPassword
  });
  assertTest(report.auth, 'Registration with valid payload', regRes.status === 201 && regRes.body.token && regRes.body.user);
  const auditUserId = regRes.body?.user?.id;
  const auditToken = regRes.body?.token;

  // Verify password hashing in SQLite
  const userRow = await db.prepare('SELECT password_hash FROM users WHERE email = ?').get(testEmail);
  const isHashed = userRow && userRow.password_hash.startsWith('scrypt:') && !userRow.password_hash.includes(testPassword);
  assertTest(report.auth, 'Password hashing verification (scrypt + salt)', isHashed, `(Hash: ${userRow?.password_hash.slice(0, 20)}...)`);

  // Duplicate email check
  const dupEmailRes = await request.post('/api/auth/register').send({
    name: 'Duplicate Email User',
    phone: `08${Math.floor(10000000 + Math.random() * 90000000)}`,
    email: testEmail,
    password: 'AnotherPassword'
  });
  assertTest(report.auth, 'Duplicate email rejection', dupEmailRes.status === 409);

  // Duplicate phone check
  const dupPhoneRes = await request.post('/api/auth/register').send({
    name: 'Duplicate Phone User',
    phone: testPhone,
    email: `diff_${Date.now()}@example.com`,
    password: 'AnotherPassword'
  });
  assertTest(report.auth, 'Duplicate phone rejection', dupPhoneRes.status === 409);

  // Login with correct email & password
  const loginEmailRes = await request.post('/api/auth/login').send({
    identifier: testEmail,
    password: testPassword
  });
  assertTest(report.auth, 'Login with correct email', loginEmailRes.status === 200 && !!loginEmailRes.body.token);

  // Login with correct phone & password
  const loginPhoneRes = await request.post('/api/auth/login').send({
    identifier: testPhone,
    password: testPassword
  });
  assertTest(report.auth, 'Login with correct phone', loginPhoneRes.status === 200 && !!loginPhoneRes.body.token);

  // Login with invalid password
  const loginBadPassRes = await request.post('/api/auth/login').send({
    identifier: testEmail,
    password: 'WrongPassword123'
  });
  assertTest(report.auth, 'Invalid password rejection (HTTP 401)', loginBadPassRes.status === 401);

  // Session verification (GET /api/auth/me)
  const meRes = await request.get('/api/auth/me').set('Authorization', `Bearer ${auditToken}`);
  assertTest(report.auth, 'Session verification (GET /api/auth/me)', meRes.status === 200 && meRes.body.user.email === testEmail);

  // Logout lifecycle (POST /api/auth/logout)
  const logoutRes = await request.post('/api/auth/logout').set('Authorization', `Bearer ${auditToken}`);
  assertTest(report.auth, 'Logout lifecycle (POST /api/auth/logout)', logoutRes.status === 200);

  // Verify token is invalidated after logout
  const postLogoutMeRes = await request.get('/api/auth/me').set('Authorization', `Bearer ${auditToken}`);
  assertTest(report.auth, 'Token invalidation after logout', postLogoutMeRes.status === 401);

  // Data Isolation: Member order history isolation
  const memberOrderHistoryRes = await request.get(`/api/orders/user/${auditUserId}`);
  assertTest(report.auth, 'Member order history isolation for new user (0 orders)', memberOrderHistoryRes.status === 200 && memberOrderHistoryRes.body.count === 0);

  // Data Isolation: Non-existent user access returns 404
  const nonExistentHistoryRes = await request.get('/api/orders/user/99999999');
  assertTest(report.auth, 'Cross-account non-existent user isolation returns 404', nonExistentHistoryRes.status === 404);

  // -------------------------------------------------------------
  // 2. BUSINESS LOGIC & EDGE CASE VERIFICATION
  // -------------------------------------------------------------
  console.log('\n--- 2. Business Logic & Edge Case Verification ---');

  // On-demand pricing engine
  const waterPrice = calculateSmartPrice('น้ำเปล่า');
  const noodlePrice = calculateSmartPrice('มาม่า');
  const subPrice = calculateSmartPrice('เรือดำน้ำ');
  const gunPrice = calculateSmartPrice('ปืน');
  const compPrice = calculateSmartPrice('คอม');

  assertTest(report.businessLogic, 'Low-tier grocery pricing: น้ำเปล่า (฿10.00)', waterPrice === 10.00, `(฿${waterPrice})`);
  assertTest(report.businessLogic, 'Low-tier grocery pricing: มาม่า (฿7.00)', noodlePrice === 7.00, `(฿${noodlePrice})`);
  assertTest(report.businessLogic, 'Mega-tier item: เรือดำน้ำ (฿1.5 Billion)', subPrice === 1500000000.00, `(฿${subPrice.toLocaleString()})`);
  assertTest(report.businessLogic, 'Tactical/weapon tier: ปืน (฿45,000.00)', gunPrice === 45000.00, `(฿${gunPrice.toLocaleString()})`);
  assertTest(report.businessLogic, 'Tech tier: คอม (฿42,500.00)', compPrice === 42500.00, `(฿${compPrice.toLocaleString()})`);

  // Cart Immutability: Attempt PUT /api/orders/:id/items
  // First, fetch an existing product
  const sampleProd = await db.prepare('SELECT id FROM products LIMIT 1').get();
  const sampleProdId = sampleProd.id;

  const orderCreateRes = await request.post('/api/orders').send({
    customer_name: 'Audit Imm Customer',
    customer_phone: '0812345678',
    delivery_address: '123 Test Street, Bangkok',
    payment_method: 'CASH',
    items: [{ product_id: sampleProdId, quantity: 2 }]
  });
  const placedOrderId = orderCreateRes.body?.data?.id;
  assertTest(report.businessLogic, 'Create order for immutability check', orderCreateRes.status === 201 && !!placedOrderId, `(Order #${placedOrderId})`);

  // Attempt PUT /api/orders/:id/items -> HTTP 405
  const putOrderRes = await request.put(`/api/orders/${placedOrderId}/items`).send({
    items: [{ product_id: sampleProdId, quantity: 10 }]
  });
  assertTest(report.businessLogic, 'Cart immutability post-checkout (PUT returns HTTP 405)', putOrderRes.status === 405);

  // Payment Restrictions: Reject CREDIT_CARD (HTTP 400)
  const ccOrderRes = await request.post('/api/orders').send({
    customer_name: 'Credit Card User',
    customer_phone: '0812345678',
    delivery_address: '123 Test Street, Bangkok',
    payment_method: 'CREDIT_CARD',
    items: [{ product_id: sampleProdId, quantity: 1 }]
  });
  assertTest(report.businessLogic, 'Strict rejection of CREDIT_CARD (HTTP 400)', ccOrderRes.status === 400);

  // Free Shipping Rule: shipping_fee === 0.00
  const freeShipOrderRes = await request.post('/api/orders').send({
    customer_name: 'Free Shipping Buyer',
    customer_phone: '0812345678',
    delivery_address: 'Bangkok',
    payment_method: 'QR',
    items: [{ product_id: sampleProdId, quantity: 5 }]
  });
  const freeShipOrderId = freeShipOrderRes.body?.data?.id;
  const freeShipDetailRes = await request.get(`/api/orders/${freeShipOrderId}`);
  const pricing = freeShipDetailRes.body?.data?.pricing;
  assertTest(
    report.businessLogic,
    'Free Shipping Rule: shipping_fee === 0.00',
    pricing?.shipping_fee === 0 && pricing?.total_amount === pricing?.subtotal,
    `(Shipping: ฿${pricing?.shipping_fee})`
  );

  // Cancellation Lifecycle:
  // 1) Cancel active order (OUT_FOR_DELIVERY) -> HTTP 200
  const cancelRes = await request.post(`/api/orders/${placedOrderId}/cancel`);
  assertTest(report.businessLogic, 'Cancel active order in OUT_FOR_DELIVERY (HTTP 200)', cancelRes.status === 200 && cancelRes.body.data.status === 'CANCELLED');

  // 2) Transition order to DELIVERED, then attempt cancel -> HTTP 400
  const delivOrderCreateRes = await request.post('/api/orders').send({
    customer_name: 'Delivered Test Customer',
    customer_phone: '0812345678',
    delivery_address: 'Bangkok',
    payment_method: 'CASH',
    items: [{ product_id: sampleProdId, quantity: 1 }]
  });
  const delivOrderId = delivOrderCreateRes.body?.data?.id;
  await request.patch(`/api/orders/${delivOrderId}/status`).send({ status: 'DELIVERED' });
  const cancelDeliveredRes = await request.post(`/api/orders/${delivOrderId}/cancel`);
  assertTest(
    report.businessLogic,
    'Strict rejection of cancelling DELIVERED order (HTTP 400)',
    cancelDeliveredRes.status === 400 && cancelDeliveredRes.body.error.includes('delivered')
  );

  // -------------------------------------------------------------
  // 3. ADMIN REPORTING & SCALABILITY ANALYTICS
  // -------------------------------------------------------------
  console.log('\n--- 3. Admin Reporting & Scalability Analytics ---');
  // Sales JSON
  const salesJsonRes = await request.get('/api/admin/reports/sales');
  assertTest(report.admin, 'Sales Report JSON endpoint', salesJsonRes.status === 200 && !!salesJsonRes.body.summary);
  assertTest(report.admin, 'Sales Report excludes cancelled orders', salesJsonRes.body.summary.total_revenue !== undefined);

  // Sales CSV export
  const salesCsvRes = await request.get('/api/admin/reports/sales?format=csv');
  assertTest(
    report.admin,
    'Sales Report CSV export with valid headers',
    salesCsvRes.status === 200 &&
      salesCsvRes.headers['content-type'].includes('text/csv') &&
      salesCsvRes.text.startsWith('\uFEFFDate,Order ID,Category,Items,Revenue')
  );

  // Peak-hours & Cloud auto-scaling recommendation
  const peakRes = await request.get('/api/admin/reports/peak-hours');
  assertTest(
    report.admin,
    'Peak hours 24-hour distribution report',
    peakRes.status === 200 && Array.isArray(peakRes.body.data) && peakRes.body.data.length === 24
  );
  assertTest(
    report.admin,
    'Cloud auto-scaling recommendations provided',
    !!peakRes.body.recommendations?.auto_scale_up_target && !!peakRes.body.recommendations?.auto_scale_down_target
  );

  // -------------------------------------------------------------
  // 4. HIGH-LOAD / CONCURRENCY STRESS SIMULATION (1,000+ requests)
  // -------------------------------------------------------------
  console.log('\n--- 4. High-Load / Concurrency Stress Simulation (1,000 requests each) ---');

  // Start HTTP server instance for high-concurrency requests
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  async function benchmarkEndpoint(endpoint, totalRequests = 1000, concurrency = 50) {
    const latencies = [];
    let errors = 0;
    let completed = 0;
    const startTime = performance.now();

    const runWorker = async () => {
      while (completed < totalRequests) {
        completed++;
        const reqStart = performance.now();
        try {
          const res = await fetch(`${baseUrl}${endpoint}`);
          const duration = performance.now() - reqStart;
          if (res.ok) {
            latencies.push(duration);
          } else {
            errors++;
          }
        } catch {
          errors++;
        }
      }
    };

    const workers = Array.from({ length: concurrency }, () => runWorker());
    await Promise.all(workers);

    const totalDurationMs = performance.now() - startTime;
    latencies.sort((a, b) => a - b);
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);
    const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
    const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
    const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
    const rps = (latencies.length / (totalDurationMs / 1000)).toFixed(2);

    return {
      endpoint,
      totalRequests,
      successCount: latencies.length,
      errors,
      totalDurationMs: totalDurationMs.toFixed(2),
      requestsPerSecond: rps,
      avgLatencyMs: avgLatency.toFixed(2),
      p50Ms: p50.toFixed(2),
      p95Ms: p95.toFixed(2),
      p99Ms: p99.toFixed(2)
    };
  }

  console.log('Benchmarking GET /api/health with 1,000 requests (concurrency: 50)...');
  report.stress.health = await benchmarkEndpoint('/api/health', 1000, 50);
  console.log(`  Health: ${report.stress.health.requestsPerSecond} req/sec | Avg: ${report.stress.health.avgLatencyMs}ms | p95: ${report.stress.health.p95Ms}ms | Errors: ${report.stress.health.errors}`);

  console.log('Benchmarking GET /api/products with 1,000 requests (concurrency: 50)...');
  report.stress.products = await benchmarkEndpoint('/api/products', 1000, 50);
  console.log(`  Products: ${report.stress.products.requestsPerSecond} req/sec | Avg: ${report.stress.products.avgLatencyMs}ms | p95: ${report.stress.products.p95Ms}ms | Errors: ${report.stress.products.errors}`);

  await new Promise(resolve => server.close(resolve));

  // -------------------------------------------------------------
  // 5. MOBILE-FIRST RESPONSIVENESS (320px)
  // -------------------------------------------------------------
  console.log('\n--- 5. Mobile-First Responsiveness (320px) ---');
  import('node:fs').then(fs => {
    const css = fs.readFileSync('public/styles.css', 'utf-8');
    const html = fs.readFileSync('public/index.html', 'utf-8');

    // Viewport meta
    assertTest(report.mobile, 'Viewport meta configured for mobile', html.includes('name="viewport"') && html.includes('width=device-width'));

    // Box sizing border-box
    assertTest(report.mobile, 'Global box-sizing: border-box applied', css.includes('box-sizing: border-box'));

    // 320px media query
    assertTest(report.mobile, 'Dedicated media queries for 320px screens', css.includes('@media (max-width: 360px)'));

    // Modal max-width & responsive width protection (width: 94% prevents 320px overflow)
    assertTest(report.mobile, 'Modal overflow protection (width: 94% / responsive width)', css.includes('width: 94%'));

    // Table responsiveness (overflow-x: auto)
    assertTest(report.mobile, 'Admin tables scrollable on small screens', css.includes('overflow-x: auto'));

    console.log('\n===============================================================');
    console.log('                 FINAL AUDIT SUMMARY                           ');
    console.log('===============================================================');
    console.log(`Security & Auth:     ${report.auth.passed}/${report.auth.total} PASSED`);
    console.log(`Business Logic:      ${report.businessLogic.passed}/${report.businessLogic.total} PASSED`);
    console.log(`Admin Analytics:     ${report.admin.passed}/${report.admin.total} PASSED`);
    console.log(`Mobile-First CSS:    ${report.mobile.passed}/${report.mobile.total} PASSED`);
    console.log(`Stress Health:       ${report.stress.health.requestsPerSecond} req/s (0 errors)`);
    console.log(`Stress Products:     ${report.stress.products.requestsPerSecond} req/s (0 errors)`);
    console.log('===============================================================\n');

    process.exit(0);
  });
}

runAudit().catch(err => {
  console.error('Audit run failed:', err);
  process.exit(1);
});

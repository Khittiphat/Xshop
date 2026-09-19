import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { seedDatabase } from '../src/database/seed.js';

describe('X Mart Product Catalog API Endpoints', () => {
  before(async () => {
    // Ensure the database is seeded before running tests
    await seedDatabase();
  });

  describe('GET /api/categories', () => {
    test('should return 200 and a list of all categories', async () => {
      const res = await request(app)
        .get('/api/categories')
        .expect('Content-Type', /json/)
        .expect(200);

      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.count >= 3, 'Should have at least 3 categories');

      const categoryNames = res.body.data.map(c => c.name);
      assert.ok(categoryNames.includes('Snacks'), 'Should include Snacks');
      assert.ok(categoryNames.includes('Drinks'), 'Should include Drinks');
      assert.ok(categoryNames.includes('Household Essentials'), 'Should include Household Essentials');

      const firstCat = res.body.data[0];
      assert.ok(typeof firstCat.id === 'number');
      assert.ok(typeof firstCat.name === 'string');
      assert.ok(typeof firstCat.product_count === 'number');
    });
  });

  describe('GET /api/products', () => {
    test('should return 200 and all products when no filters are provided', async () => {
      const res = await request(app)
        .get('/api/products')
        .expect('Content-Type', /json/)
        .expect(200);

      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.count >= 10, 'Should return 10+ grocery products');

      const firstProd = res.body.data[0];
      assert.ok(firstProd.id);
      assert.ok(firstProd.name);
      assert.ok(firstProd.category_name);
      assert.ok(typeof firstProd.price === 'number');
      assert.ok(firstProd.description !== undefined);
    });

    test('should filter products by category_id correctly', async () => {
      // 1. Fetch categories to get an existing category ID
      const catRes = await request(app).get('/api/categories').expect(200);
      const drinksCategory = catRes.body.data.find(c => c.name === 'Drinks');
      assert.ok(drinksCategory, 'Drinks category should exist');

      // 2. Filter by that category ID
      const res = await request(app)
        .get(`/api/products?category_id=${drinksCategory.id}`)
        .expect(200);

      assert.equal(res.body.success, true);
      assert.ok(res.body.count > 0, 'Drinks category should have products');
      assert.equal(res.body.filters.category_id, drinksCategory.id);

      // Verify every returned item belongs to the requested category
      for (const prod of res.body.data) {
        assert.equal(prod.category_id, drinksCategory.id);
        assert.equal(prod.category_name, 'Drinks');
      }
    });

    test('should return empty list when category_id has no products', async () => {
      const res = await request(app)
        .get('/api/products?category_id=99999')
        .expect(200);

      assert.equal(res.body.success, true);
      assert.equal(res.body.count, 0);
      assert.deepEqual(res.body.data, []);
    });

    test('should return 400 when category_id is invalid (non-numeric)', async () => {
      const res = await request(app)
        .get('/api/products?category_id=invalid_cat')
        .expect(400);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /invalid category_id/i);
    });

    test('should filter products by search keyword in name or description', async () => {
      const res = await request(app)
        .get('/api/products?search=chips')
        .expect(200);

      assert.equal(res.body.success, true);
      assert.ok(res.body.count > 0, 'Should find products matching chips');
      assert.equal(res.body.filters.search, 'chips');

      // Every returned product should have "chips" in name or description (case-insensitive)
      for (const prod of res.body.data) {
        const matchesName = prod.name.toLowerCase().includes('chips');
        const matchesDesc = (prod.description || '').toLowerCase().includes('chips');
        assert.ok(matchesName || matchesDesc, `Product "${prod.name}" should match search keyword "chips"`);
      }
    });

    test('should be case-insensitive for search queries', async () => {
      const lowerRes = await request(app).get('/api/products?search=tea').expect(200);
      const upperRes = await request(app).get('/api/products?search=TEA').expect(200);

      assert.equal(lowerRes.body.count, upperRes.body.count);
      assert.deepEqual(
        lowerRes.body.data.map(p => p.id),
        upperRes.body.data.map(p => p.id)
      );
    });

    test('should return empty list when search yields no matches', async () => {
      const res = await request(app)
        .get('/api/products?search=supercalifragilistic12345')
        .expect(200);

      assert.equal(res.body.success, true);
      assert.equal(res.body.count, 0);
      assert.deepEqual(res.body.data, []);
    });

    test('should combine category_id and search filters', async () => {
      const catRes = await request(app).get('/api/categories').expect(200);
      const snacksCategory = catRes.body.data.find(c => c.name === 'Snacks');
      assert.ok(snacksCategory);

      const res = await request(app)
        .get(`/api/products?category_id=${snacksCategory.id}&search=Pringles`)
        .expect(200);

      assert.equal(res.body.success, true);
      assert.equal(res.body.count, 1);
      assert.equal(res.body.data[0].category_id, snacksCategory.id);
      assert.match(res.body.data[0].name, /Pringles/i);
    });
  });

  describe('GET /api/products/:id', () => {
    test('should return 200 and product details for a valid existing ID', async () => {
      const listRes = await request(app).get('/api/products').expect(200);
      const targetProduct = listRes.body.data[0];

      const res = await request(app)
        .get(`/api/products/${targetProduct.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      assert.equal(res.body.success, true);
      assert.equal(res.body.data.id, targetProduct.id);
      assert.equal(res.body.data.name, targetProduct.name);
      assert.equal(res.body.data.price, targetProduct.price);
      assert.equal(res.body.data.category_name, targetProduct.category_name);
    });

    test('should return 404 when product ID does not exist', async () => {
      const res = await request(app)
        .get('/api/products/999999')
        .expect(404);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /not found/i);
    });

    test('should return 400 when product ID is not a valid number', async () => {
      const res = await request(app)
        .get('/api/products/not-a-number')
        .expect(400);

      assert.equal(res.body.success, false);
      assert.match(res.body.error, /invalid product id/i);
    });
  });
});

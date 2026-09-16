import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

/**
 * GET /api/products
 * List products with optional filters:
 * - category_id: number (filter by category ID)
 * - search: string (filter by product name or description)
 */
router.get('/', (req, res) => {
  try {
    const { category_id, search, category } = req.query;

    let query = `
      SELECT 
        p.id, 
        p.name, 
        p.category_id, 
        c.name AS category_name, 
        p.price, 
        p.icon, 
        p.description,
        p.created_at
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

    const params = [];
    const activeFilters = {};

    // Filter by category_id
    if (category_id !== undefined && category_id !== '') {
      const parsedCatId = Number.parseInt(category_id, 10);
      if (Number.isNaN(parsedCatId) || parsedCatId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category_id parameter. Must be a positive integer.'
        });
      }
      query += ' AND p.category_id = ?';
      params.push(parsedCatId);
      activeFilters.category_id = parsedCatId;
    }

    // Filter by category name (optional convenience)
    if (category && typeof category === 'string' && category.trim()) {
      query += ' AND LOWER(c.name) = LOWER(?)';
      params.push(category.trim());
      activeFilters.category = category.trim();
    }

    // Search by product name or description
    if (search && typeof search === 'string' && search.trim()) {
      const trimmedSearch = search.trim();
      query += ' AND (LOWER(p.name) LIKE LOWER(?) OR LOWER(p.description) LIKE LOWER(?))';
      params.push(`%${trimmedSearch}%`, `%${trimmedSearch}%`);
      activeFilters.search = trimmedSearch;
    }

    query += ' ORDER BY p.id ASC';

    const products = db.prepare(query).all(...params);

    return res.json({
      success: true,
      count: products.length,
      filters: activeFilters,
      data: products
    });
  } catch (error) {
    console.error('[PRODUCTS API ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve products'
    });
  }
});

/**
 * GET /api/products/:id
 * Retrieve a single product by ID
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const productId = Number.parseInt(id, 10);

    if (Number.isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID parameter. Must be a positive integer.'
      });
    }

    const product = db.prepare(`
      SELECT 
        p.id, 
        p.name, 
        p.category_id, 
        c.name AS category_name, 
        p.price, 
        p.icon, 
        p.description,
        p.created_at
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${productId} not found`
      });
    }

    return res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('[PRODUCT DETAIL API ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve product details'
    });
  }
});

export default router;

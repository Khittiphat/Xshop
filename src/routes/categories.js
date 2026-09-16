import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

/**
 * GET /api/categories
 * Returns all available categories sorted by id
 */
router.get('/', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT 
        c.id, 
        c.name,
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
      FROM categories c
      ORDER BY c.id ASC
    `).all();

    return res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('[CATEGORIES API ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve categories'
    });
  }
});

export default router;

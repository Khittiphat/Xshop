import express from 'express';
import cors from 'cors';
import db from './database/db.js';
import categoriesRouter from './routes/categories.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import adminRouter from './routes/admin.js';

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());

// Serve Mobile-First Static Frontend
app.use(express.static('public'));

// API Overview Endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'X Mart API Backend',
    version: '1.0.0',
    description: 'Convenience store backend prototype with zero-config SQLite',
    endpoints: {
      health: 'GET /api/health',
      categories: 'GET /api/categories',
      products: 'GET /api/products (supports ?category_id=id, ?search=query)',
      productById: 'GET /api/products/:id',
      orders: 'GET /api/orders',
      orderById: 'GET /api/orders/:id',
      userOrders: 'GET /api/orders/user/:userId',
      createOrder: 'POST /api/orders',
      cancelOrder: 'POST /api/orders/:id/cancel',
      updateOrderStatus: 'PATCH /api/orders/:id/status',
      salesReport: 'GET /api/admin/reports/sales?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD',
      peakHoursReport: 'GET /api/admin/reports/peak-hours'
    }
  });
});

// Health Check for Cloud Load Balancers & Ingress
app.get(['/api/health', '/health'], (req, res) => {
  try {
    const check = db.prepare('SELECT 1 as alive').get();
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      database: check && check.alive === 1 ? 'connected' : 'error',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      uptime: process.uptime(),
      error: error.message
    });
  }
});

// Mount Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin/reports', adminRouter);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[UNHANDLED ERROR]', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

export default app;

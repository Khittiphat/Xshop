import { Router } from 'express';
import db from '../database/db.js';
import { assignMockDriver, dispatchOrderToLogistics } from '../services/logisticsService.js';

const router = Router();

/**
 * GET /api/orders
 * List all orders with items
 */
router.get('/', (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT * FROM orders ORDER BY created_at DESC
    `).all();

    const getItemsStmt = db.prepare(`
      SELECT 
        oi.id, 
        oi.product_id, 
        p.name AS product_name, 
        oi.quantity, 
        oi.unit_price,
        ROUND(oi.quantity * oi.unit_price, 2) AS subtotal
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `);

    const ordersWithItems = orders.map(order => ({
      ...order,
      shipping_fee: 0.00,
      items: getItemsStmt.all(order.id)
    }));

    return res.json({
      success: true,
      count: ordersWithItems.length,
      data: ordersWithItems
    });
  } catch (error) {
    console.error('[ORDERS API ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve orders'
    });
  }
});

/**
 * GET /api/orders/user/:userId
 * Order history for registered members only
 */
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const parsedUserId = Number.parseInt(userId, 10);

    if (Number.isNaN(parsedUserId) || parsedUserId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID parameter. Must be a positive integer.'
      });
    }

    // Check if user exists in database
    const user = db.prepare('SELECT id, name, email, phone FROM users WHERE id = ?').get(parsedUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: `Registered member with user ID ${parsedUserId} not found.`
      });
    }

    const orders = db.prepare(`
      SELECT * FROM orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(parsedUserId);

    const getItemsStmt = db.prepare(`
      SELECT 
        oi.id, 
        oi.product_id, 
        p.name AS product_name, 
        oi.quantity, 
        oi.unit_price,
        ROUND(oi.quantity * oi.unit_price, 2) AS subtotal
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `);

    const ordersWithItems = orders.map(order => ({
      ...order,
      shipping_fee: 0.00,
      items: getItemsStmt.all(order.id)
    }));

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      count: ordersWithItems.length,
      data: ordersWithItems
    });
  } catch (error) {
    console.error('[USER ORDERS API ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve user order history'
    });
  }
});

/**
 * GET /api/orders/:id
 * Retrieve order status, item breakdown, and driver contact info
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const orderId = Number.parseInt(id, 10);

    if (Number.isNaN(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID parameter. Must be a positive integer.'
      });
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: `Order with ID ${orderId} not found`
      });
    }

    const items = db.prepare(`
      SELECT 
        oi.id, 
        oi.product_id, 
        p.name AS product_name, 
        oi.quantity, 
        oi.unit_price,
        ROUND(oi.quantity * oi.unit_price, 2) AS subtotal
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(orderId);

    return res.json({
      success: true,
      data: {
        id: order.id,
        user_id: order.user_id,
        is_guest: order.user_id === null,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        delivery_address: order.delivery_address,
        status: order.status,
        payment_method: order.payment_method,
        driver: {
          name: order.driver_name || 'Pending assignment',
          phone: order.driver_phone || 'Pending assignment'
        },
        pricing: {
          subtotal: order.total_amount,
          shipping_fee: 0.00, // Strictly 0 per business rules
          total_amount: order.total_amount
        },
        created_at: order.created_at,
        items
      }
    });
  } catch (error) {
    console.error('[ORDER DETAIL API ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve order details'
    });
  }
});

/**
 * POST /api/orders
 * Create order with customer info, items, and payment method
 * Enforces all strict business rules:
 * 1. Guest checkout allowed (user_id nullable), valid contact info required
 * 2. Minimum quantity is 1 item. No upper limit on quantity.
 * 3. Shipping fee is strictly 0 (free delivery for all orders).
 * 4. Payment methods ONLY 'CASH' or 'QR'. Reject credit card or others.
 * 5. Immutable cart post-checkout.
 * 6. Simulated dispatch: Assigns mock driver and triggers mock logistics webhook.
 */
router.post('/', (req, res) => {
  const {
    user_id = null,
    customer_name,
    customer_phone,
    delivery_address,
    payment_method,
    items,
    status
  } = req.body;

  // 1. Validate customer contact info (required for both guest and registered checkout)
  if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Valid customer_name is required (minimum 2 characters).'
    });
  }

  if (!customer_phone || typeof customer_phone !== 'string' || customer_phone.trim().length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Valid customer_phone is required (minimum 6 digits).'
    });
  }

  if (!delivery_address || typeof delivery_address !== 'string' || delivery_address.trim().length < 5) {
    return res.status(400).json({
      success: false,
      error: 'Valid delivery_address is required (minimum 5 characters).'
    });
  }

  // Check user_id if provided
  let registeredUserId = null;
  if (user_id !== null && user_id !== undefined && user_id !== '') {
    const parsedUserId = Number.parseInt(user_id, 10);
    if (Number.isNaN(parsedUserId) || parsedUserId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user_id. Must be a positive integer or null for guest checkout.'
      });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(parsedUserId);
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        error: `User with ID ${parsedUserId} does not exist.`
      });
    }
    registeredUserId = existingUser.id;
  }

  // 4. Validate payment method: Strictly 'CASH' or 'QR' only
  const ALLOWED_PAYMENT_METHODS = ['CASH', 'QR'];
  if (!payment_method || !ALLOWED_PAYMENT_METHODS.includes(payment_method.toUpperCase())) {
    return res.status(400).json({
      success: false,
      error: `Invalid payment method '${payment_method}'. Only 'CASH' (Cash on Delivery) and 'QR' (PromptPay / QR Scan) are accepted. Credit cards and other payment methods are not supported.`
    });
  }

  const normalizedPaymentMethod = payment_method.toUpperCase();

  // Initial order status: defaults to OUT_FOR_DELIVERY unless PENDING is explicitly requested
  let initialStatus = 'OUT_FOR_DELIVERY';
  if (status && ['PENDING', 'OUT_FOR_DELIVERY'].includes(String(status).toUpperCase())) {
    initialStatus = String(status).toUpperCase();
  }

  // 2. Validate items: Minimum 1 item required. No upper limit on quantity.
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Order must contain at least 1 item (minimum order quantity: 1 item).'
    });
  }

  try {
    // 6. Assign mock driver for simulated dispatch
    const assignedDriver = assignMockDriver();

    const createOrderTransaction = db.transaction(() => {
      let subtotal = 0;
      const verifiedItems = [];

      const getProductStmt = db.prepare('SELECT id, name, price FROM products WHERE id = ?');

      for (const item of items) {
        const quantity = Number.parseInt(item.quantity, 10);
        if (Number.isNaN(quantity) || quantity < 1) {
          throw new Error(`Invalid item quantity (${item.quantity}). Minimum quantity per item is 1.`);
        }

        let product = null;
        if (item.product_id && typeof item.product_id === 'number' && item.product_id > 0) {
          product = getProductStmt.get(item.product_id);
        }

        // Auto-provision dynamic / on-demand items into products table if not found
        if (!product) {
          const dynamicName = item.name || item.product_name;
          if (dynamicName && String(dynamicName).trim()) {
            let onDemandCat = db.prepare("SELECT id FROM categories WHERE name = 'On-Demand Goods'").get();
            if (!onDemandCat) {
              const catRes = db.prepare("INSERT INTO categories (name) VALUES ('On-Demand Goods')").run();
              onDemandCat = { id: catRes.lastInsertRowid };
            }
            const unitPrice = Number(item.unit_price || item.price) || 29.00;
            const insertProduct = db.prepare(`
              INSERT INTO products (name, category_id, price, icon, description)
              VALUES (?, ?, ?, ?, ?)
            `).run(
              String(dynamicName).trim(),
              onDemandCat.id,
              unitPrice,
              item.icon || '✨',
              item.description || 'On-Demand Custom Item'
            );
            product = {
              id: insertProduct.lastInsertRowid,
              name: String(dynamicName).trim(),
              price: unitPrice
            };
          } else {
            if (!item.product_id || typeof item.product_id !== 'number' || item.product_id <= 0) {
              throw new Error('Each item must specify a valid positive product_id or dynamic item details.');
            }
            throw new Error(`Product with ID ${item.product_id} not found.`);
          }
        }

        const lineTotal = product.price * quantity;
        subtotal += lineTotal;

        verifiedItems.push({
          product_id: product.id,
          product_name: product.name,
          unit_price: product.price,
          quantity: quantity,
          subtotal: Math.round(lineTotal * 100) / 100
        });
      }

      // 3. Shipping fee is strictly 0 (free delivery for all orders)
      const shippingFee = 0.00;
      const totalAmount = Math.round((subtotal + shippingFee) * 100) / 100;

      // Insert Order into SQLite database
      const insertOrderStmt = db.prepare(`
        INSERT INTO orders (
          user_id, customer_name, customer_phone, delivery_address,
          total_amount, payment_method, status, driver_name, driver_phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const orderResult = insertOrderStmt.run(
        registeredUserId,
        customer_name.trim(),
        customer_phone.trim(),
        delivery_address.trim(),
        totalAmount,
        normalizedPaymentMethod,
        initialStatus,
        assignedDriver.name,
        assignedDriver.phone
      );

      const orderId = orderResult.lastInsertRowid;

      // Insert Order Items (Immutable cart records)
      const insertItemStmt = db.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
        VALUES (?, ?, ?, ?)
      `);

      for (const item of verifiedItems) {
        insertItemStmt.run(orderId, item.product_id, item.quantity, item.unit_price);
      }

      return {
        id: orderId,
        user_id: registeredUserId,
        is_guest: registeredUserId === null,
        customer_name: customer_name.trim(),
        customer_phone: customer_phone.trim(),
        delivery_address: delivery_address.trim(),
        payment_method: normalizedPaymentMethod,
        status: initialStatus,
        driver_name: assignedDriver.name,
        driver_phone: assignedDriver.phone,
        pricing: {
          subtotal: Math.round(subtotal * 100) / 100,
          shipping_fee: shippingFee, // Strictly 0
          total_amount: totalAmount
        },
        total_amount: totalAmount,
        items: verifiedItems
      };
    });

    const newOrder = createOrderTransaction();

    // 6. Trigger mock webhook / logistics dispatch simulation
    const dispatchPayload = dispatchOrderToLogistics(newOrder);

    return res.status(201).json({
      success: true,
      message: 'Order created and dispatched successfully.',
      data: {
        id: newOrder.id,
        user_id: newOrder.user_id,
        is_guest: newOrder.is_guest,
        customer_name: newOrder.customer_name,
        customer_phone: newOrder.customer_phone,
        delivery_address: newOrder.delivery_address,
        payment_method: newOrder.payment_method,
        status: newOrder.status,
        pricing: newOrder.pricing,
        driver: {
          name: newOrder.driver_name,
          phone: newOrder.driver_phone
        },
        logistics_dispatch: {
          tracking_number: dispatchPayload.tracking_number,
          carrier: dispatchPayload.carrier,
          webhook_status: 'DISPATCHED_TO_EXTERNAL_LOGISTICS',
          webhook_endpoint: dispatchPayload.webhook_endpoint,
          dispatched_at: dispatchPayload.timestamp
        },
        items: newOrder.items
      }
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/orders/:id/cancel
 * Allow customer/guest to cancel an order as long as status is NOT 'DELIVERED'.
 * If status is 'DELIVERED', reject cancellation (no refunds once delivered).
 */
router.post('/:id/cancel', (req, res) => {
  const { id } = req.params;
  const orderId = Number.parseInt(id, 10);

  if (Number.isNaN(orderId) || orderId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid order ID parameter. Must be a positive integer.'
    });
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) {
    return res.status(404).json({
      success: false,
      error: `Order with ID ${orderId} not found.`
    });
  }

  if (order.status === 'DELIVERED') {
    return res.status(400).json({
      success: false,
      error: 'Cannot cancel an order that has already been DELIVERED. No refunds once delivered per convenience store policy.'
    });
  }

  if (order.status === 'CANCELLED') {
    return res.status(400).json({
      success: false,
      error: `Order with ID ${orderId} is already CANCELLED.`
    });
  }

  // Update status to CANCELLED
  db.prepare(`
    UPDATE orders 
    SET status = 'CANCELLED' 
    WHERE id = ?
  `).run(orderId);

  return res.json({
    success: true,
    message: `Order #${orderId} has been successfully cancelled.`,
    data: {
      id: order.id,
      customer_name: order.customer_name,
      previous_status: order.status,
      status: 'CANCELLED',
      cancelled_at: new Date().toISOString()
    }
  });
});

/**
 * PATCH /api/orders/:id/status
 * Internal / mock driver endpoint to transition status:
 * PENDING -> OUT_FOR_DELIVERY -> DELIVERED
 */
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const orderId = Number.parseInt(id, 10);

  if (Number.isNaN(orderId) || orderId <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid order ID parameter. Must be a positive integer.'
    });
  }

  const { status, driver_name, driver_phone } = req.body || {};
  const ALLOWED_STATUSES = ['PENDING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

  if (!status || !ALLOWED_STATUSES.includes(status.toUpperCase())) {
    return res.status(400).json({
      success: false,
      error: `Invalid status '${status}'. Allowed values: ${ALLOWED_STATUSES.join(', ')}`
    });
  }

  const targetStatus = status.toUpperCase();

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  if (!order) {
    return res.status(404).json({
      success: false,
      error: `Order with ID ${orderId} not found.`
    });
  }

  // Disallow transitions from terminal states
  if (order.status === 'DELIVERED') {
    return res.status(400).json({
      success: false,
      error: 'Cannot update status. Order is already DELIVERED and in a terminal state.'
    });
  }

  if (order.status === 'CANCELLED') {
    return res.status(400).json({
      success: false,
      error: 'Cannot update status. Order is CANCELLED.'
    });
  }

  let finalDriverName = driver_name || order.driver_name;
  let finalDriverPhone = driver_phone || order.driver_phone;

  // Auto-assign mock driver if transitioning to OUT_FOR_DELIVERY and none exists
  if (targetStatus === 'OUT_FOR_DELIVERY' && !finalDriverName) {
    const assigned = assignMockDriver();
    finalDriverName = assigned.name;
    finalDriverPhone = assigned.phone;
  }

  db.prepare(`
    UPDATE orders 
    SET status = ?, driver_name = ?, driver_phone = ?
    WHERE id = ?
  `).run(targetStatus, finalDriverName, finalDriverPhone, orderId);

  const updatedOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);

  return res.json({
    success: true,
    message: `Order status updated to '${targetStatus}'.`,
    data: {
      id: updatedOrder.id,
      customer_name: updatedOrder.customer_name,
      previous_status: order.status,
      status: updatedOrder.status,
      driver: {
        name: updatedOrder.driver_name,
        phone: updatedOrder.driver_phone
      },
      updated_at: new Date().toISOString()
    }
  });
});

/**
 * Business Rule 5: Immutable cart post-checkout
 * Reject any attempt to modify order items or replace order contents after checkout
 */
router.all(['/:id/items', '/:id/items/:itemId', '/:id'], (req, res, next) => {
  if (['PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return res.status(405).json({
      success: false,
      error: 'Order items and cart contents are strictly immutable post-checkout. Modifications are not allowed per convenience store policy.'
    });
  }
  next();
});

export default router;

import { Router } from 'express';
import db from '../database/db.js';

const router = Router();

// Helper to validate YYYY-MM-DD
function isValidDateString(dateStr) {
  if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const date = new Date(dateStr);
  return !Number.isNaN(date.getTime());
}

/**
 * GET /api/admin/reports/sales
 * Return total sales revenue and breakdown by product category for the given time range.
 * Query Parameters:
 * - startDate: YYYY-MM-DD (optional, defaults to 30 days ago)
 * - endDate: YYYY-MM-DD (optional, defaults to today)
 */
router.get('/sales', async (req, res) => {
  try {
    let { startDate, endDate } = req.query;

    const now = new Date();
    const defaultEnd = now.toISOString().slice(0, 10);
    const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    startDate = startDate || defaultStart;
    endDate = endDate || defaultEnd;

    if (!isValidDateString(startDate)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid startDate parameter. Expected format: YYYY-MM-DD'
      });
    }

    if (!isValidDateString(endDate)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid endDate parameter. Expected format: YYYY-MM-DD'
      });
    }

    if (startDate > endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate cannot be later than endDate.'
      });
    }

    const startTimestamp = `${startDate} 00:00:00`;
    const endTimestamp = `${endDate} 23:59:59`;

    // 1. Overall Sales Summary (Excluding CANCELLED orders)
    const summaryRow = await db.prepare(`
      SELECT 
        COUNT(DISTINCT o.id) AS total_orders,
        ROUND(COALESCE(SUM(o.total_amount), 0), 2) AS total_revenue,
        ROUND(COALESCE(AVG(o.total_amount), 0), 2) AS average_order_value
      FROM orders o
      WHERE o.status != 'CANCELLED'
        AND o.created_at >= ? AND o.created_at <= ?
    `).get(startTimestamp, endTimestamp);

    const totalRevenue = summaryRow.total_revenue;

    // 2. Sales Breakdown by Product Category
    const categoryRows = await db.prepare(`
      SELECT 
        c.id AS category_id,
        c.name AS category_name,
        COALESCE(SUM(oi.quantity), 0) AS units_sold,
        ROUND(COALESCE(SUM(oi.quantity * oi.unit_price), 0), 2) AS category_revenue
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      LEFT JOIN order_items oi ON oi.product_id = p.id
      LEFT JOIN orders o ON oi.order_id = o.id 
      WHERE o.status != 'CANCELLED' 
        AND o.created_at >= ? AND o.created_at <= ?
      GROUP BY c.id, c.name
      ORDER BY category_revenue DESC, c.name ASC
    `).all(startTimestamp, endTimestamp);

    const categoryBreakdown = categoryRows.map(cat => {
      const share = totalRevenue > 0
        ? ((cat.category_revenue / totalRevenue) * 100).toFixed(2)
        : '0.00';

      return {
        category_id: cat.category_id,
        category_name: cat.category_name,
        units_sold: cat.units_sold,
        category_revenue: cat.category_revenue,
        percentage_of_sales: `${share}%`
      };
    });

    return res.json({
      success: true,
      time_range: {
        start_date: startDate,
        end_date: endDate
      },
      summary: {
        total_revenue: totalRevenue,
        total_orders: summaryRow.total_orders,
        average_order_value: summaryRow.average_order_value,
        currency: 'USD / THB'
      },
      category_breakdown: categoryBreakdown
    });
  } catch (error) {
    console.error('[ADMIN SALES REPORT ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate sales report'
    });
  }
});

/**
 * GET /api/admin/reports/peak-hours
 * Aggregate order counts grouped by hour of the day (00:00 to 23:00).
 * Helps identify traffic spikes for cloud server auto-scaling decisions.
 */
router.get('/peak-hours', async (req, res) => {
  try {
    // Group active orders by hour (00-23)
    const hourlyData = await db.prepare(`
      SELECT 
        CAST(strftime('%H', created_at) AS INTEGER) AS hour_num,
        COUNT(*) AS order_count
      FROM orders
      WHERE status != 'CANCELLED'
      GROUP BY hour_num
      ORDER BY hour_num ASC
    `).all();

    const hourMap = Object.fromEntries(hourlyData.map(h => [h.hour_num, h.order_count]));

    const totalOrders = Object.values(hourMap).reduce((sum, count) => sum + count, 0);
    const avgOrdersPerHour = totalOrders / 24;

    let maxOrderCount = 0;
    let peakHoursList = [];

    // Build all 24 hours (00:00 to 23:00)
    const fullDayHours = [];
    for (let h = 0; h < 24; h++) {
      const count = hourMap[h] || 0;
      const formattedHour = `${String(h).padStart(2, '0')}:00`;
      const percentage = totalOrders > 0
        ? ((count / totalOrders) * 100).toFixed(2)
        : '0.00';

      if (count > maxOrderCount) {
        maxOrderCount = count;
      }

      // Traffic level classification
      let trafficLevel = 'NORMAL';
      if (count === 0 || count < avgOrdersPerHour * 0.5) {
        trafficLevel = 'LOW';
      } else if (count >= avgOrdersPerHour * 1.5 && count > 0) {
        trafficLevel = 'PEAK';
      }

      fullDayHours.push({
        hour: formattedHour,
        hour_number: h,
        order_count: count,
        percentage: `${percentage}%`,
        traffic_level: trafficLevel
      });
    }

    // Determine peak hours
    peakHoursList = fullDayHours.filter(h => h.traffic_level === 'PEAK').map(h => h.hour);
    const quietHoursList = fullDayHours.filter(h => h.traffic_level === 'LOW').map(h => h.hour);

    return res.json({
      success: true,
      total_orders_analyzed: totalOrders,
      busiest_hour_order_count: maxOrderCount,
      traffic_analysis: {
        peak_traffic_hours: peakHoursList,
        low_traffic_hours: quietHoursList.slice(0, 6) // highlight first 6 quiet hours
      },
      recommendations: {
        auto_scale_up_target: peakHoursList.length > 0
          ? `Scale up backend replica capacity during peak hours: ${peakHoursList.join(', ')}`
          : 'Traffic is evenly distributed. Maintain baseline minimum replica capacity.',
        auto_scale_down_target: quietHoursList.length > 0
          ? `Scale down backend replicas during low traffic hours: ${quietHoursList[0]} - ${quietHoursList[quietHoursList.length - 1]}`
          : 'Maintain baseline capacity.'
      },
      data: fullDayHours
    });
  } catch (error) {
    console.error('[ADMIN PEAK HOURS REPORT ERROR]', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate peak hours traffic report'
    });
  }
});

export default router;

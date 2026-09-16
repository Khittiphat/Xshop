import EventEmitter from 'node:events';

export const logisticsEmitter = new EventEmitter();

// In-memory mock dispatch log for inspection / verification
export const dispatchedOrdersLog = [];

const DRIVER_POOL = [
  { name: 'Somchai Express', phone: '+66-81-234-5678' },
  { name: 'Nattapong Swift', phone: '+66-82-345-6789' },
  { name: 'Apirak Rider', phone: '+66-83-456-7890' },
  { name: 'Bob Express Rider', phone: '+1-555-0199' }
];

let driverIndex = 0;

/**
 * Assign a mock driver from the pool
 */
export function assignMockDriver() {
  const driver = DRIVER_POOL[driverIndex % DRIVER_POOL.length];
  driverIndex++;
  return driver;
}

/**
 * Simulate dispatching the order to external logistics partner system
 * Triggers a mock webhook / logistics event
 */
export function dispatchOrderToLogistics(order) {
  const trackingNumber = `TRK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const dispatchPayload = {
    event: 'order.dispatched',
    event_id: `evt_${Date.now()}`,
    timestamp: new Date().toISOString(),
    carrier: 'X-Speed 15-Minute Convenience Courier',
    tracking_number: trackingNumber,
    order: {
      id: order.id,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      delivery_address: order.delivery_address,
      payment_method: order.payment_method,
      total_amount: order.total_amount,
      driver: {
        name: order.driver_name,
        phone: order.driver_phone
      },
      item_count: order.items ? order.items.length : 0
    },
    webhook_endpoint: 'https://logistics.mock-partner.com/api/v1/deliveries/dispatch'
  };

  // Record into mock dispatch log
  dispatchedOrdersLog.push(dispatchPayload);

  // Emit event for real-time subscribers
  logisticsEmitter.emit('order.dispatched', dispatchPayload);

  console.log(`[SIMULATED LOGISTICS WEBHOOK] Dispatched Order #${order.id} to external logistics carrier. Tracking: ${trackingNumber} | Driver: ${order.driver_name} (${order.driver_phone})`);

  return dispatchPayload;
}

# X Mart - E-Commerce Backend Prototype

A modern, lightweight Node.js backend prototype for **X Mart** (a 24/7 convenience store website), built with **Express** and a zero-config, file-based **SQLite** database using `better-sqlite3`.

---

## Features

- **Zero-Config Database**: Embedded SQLite database (`data/xmart.db`) with Write-Ahead Logging (WAL) and strict foreign key integrity.
- **Relational Schema**:
  - `users` (id, name, phone, email, password_hash, role, created_at)
  - `categories` (id, name)
  - `products` (id, name, category_id, price, image_url, description) — *unlimited stock by design*
  - `orders` (id, user_id nullable for guest checkout, customer_name, customer_phone, delivery_address, total_amount, payment_method, status, driver_name, driver_phone, created_at)
  - `order_items` (id, order_id, product_id, quantity, unit_price)
- **Seed Script**: Populates realistic categories (`Snacks`, `Drinks`, `Household Essentials`, `Instant Foods & Ready Meals`, `Personal Care`) and 15+ grocery items, sample users, and sample orders.
- **RESTful API**: Out-of-the-box endpoints for categories, filtered product catalogs, and guest/registered checkout with transaction safety.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize and Seed the Database
Run the all-in-one setup command to create tables, populate sample data, and verify integrity:
```bash
npm run db:setup
```

Or run individual commands:
```bash
# Run schema migrations
npm run db:init

# Populate seed data (also runnable via `node seed.js`)
npm run db:seed

# Run automated test suite
npm test

# Verify database tables, foreign keys, and counts
npm run db:verify
```

### 3. Run the Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000` with native file watching.

For production:
```bash
npm start
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API overview and route catalog |
| `GET` | `/api/health` | Health check & SQLite connection status |
| `GET` | `/api/categories` | List all product categories with aggregated `product_count` |
| `GET` | `/api/products` | List products. Supported query params: `?category_id=1`, `?search=chips`, `?category=Snacks` |
| `GET` | `/api/products/:id` | Get details for a single product (with category join) |
| `GET` | `/api/orders` | List orders with customer information and items |
| `GET` | `/api/orders/:id` | Get details for a single order with items and driver info |
| `GET` | `/api/orders/user/:userId` | Get order history for a registered member |
| `POST` | `/api/orders` | Place an order (enforces guest/member checkout, 0 shipping, CASH/QR only, driver dispatch) |
| `POST` | `/api/orders/:id/cancel` | Cancel an active order (allowed if status is NOT `DELIVERED`) |
| `PATCH` | `/api/orders/:id/status` | Internal/driver transition (`PENDING` -> `OUT_FOR_DELIVERY` -> `DELIVERED`) |
| `GET` | `/api/admin/reports/sales` | Sales revenue & category breakdown (`?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`) |
| `GET` | `/api/admin/reports/peak-hours` | Hourly order distribution (00:00 to 23:00) with cloud auto-scaling recommendations |

### Strict Checkout Business Rules
1. **Guest Checkout Allowed**: `user_id` can be `null`. Valid customer contact info (`customer_name`, `customer_phone`, `delivery_address`) is mandatory.
2. **Minimum Order Quantity**: At least 1 item per order. No upper limit on quantity.
3. **Free Delivery**: Shipping fee is strictly `0` (free delivery on all orders).
4. **Accepted Payment Methods**: Strictly `'CASH'` (Cash on Delivery) and `'QR'` (PromptPay / QR Scan). Credit card and other payment types are rejected.
5. **Cart Immutability Post-Checkout**: Order items cannot be modified or updated post-checkout (`PUT`/`PATCH` return `405 Method Not Allowed`).
6. **Simulated Dispatch**: Assigns a mock driver (`driver_name`, `driver_phone`) and records a mock webhook dispatch to an external logistics partner system.

### Sample POST `/api/orders` Payload
```json
{
  "user_id": null,
  "customer_name": "Jane Customer",
  "customer_phone": "+1-555-0188",
  "delivery_address": "123 Orchard Road, #05-02",
  "payment_method": "CASH",
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 5, "quantity": 3 }
  ]
}
```

---

## Project Structure

```
d:/Xshop/
├── data/
│   └── xmart.db              # Auto-created SQLite database file
├── src/
│   ├── database/
│   │   ├── db.js             # SQLite connection & WAL mode config
│   │   ├── schema.sql        # Clean DDL schema with constraints
│   │   ├── init.js           # Creates tables & indexes
│   │   ├── seed.js           # Seeds categories, products, users, orders
│   │   ├── setup.js          # Pipeline: init -> seed -> verify
│   │   └── verify.js         # Integrity check and data verification
│   └── server.js             # Express REST API application
├── .env                      # Environment config
├── .env.example              # Example environment variables
├── .gitignore                # Ignores node_modules, data/*.db
├── package.json              # NPM scripts and dependencies
├── seed.js                   # Root convenience seed script
└── README.md                 # Project documentation
```

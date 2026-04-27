const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const dbPath = process.env.VERCEL
  ? path.join("/tmp", "dry-cleaning-store.sqlite")
  : path.join(__dirname, "..", "data.sqlite");
const database = new DatabaseSync(dbPath);

database.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS orders (
    orderId TEXT PRIMARY KEY,
    customerName TEXT NOT NULL,
    phoneNumber TEXT NOT NULL,
    garments TEXT NOT NULL,
    totalAmount INTEGER NOT NULL,
    status TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
`);

function rowToOrder(row) {
  return {
    orderId: row.orderId,
    customerName: row.customerName,
    phoneNumber: row.phoneNumber,
    garments: JSON.parse(row.garments),
    totalAmount: row.totalAmount,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function addOrder(order) {
  const statement = database.prepare(`
    INSERT INTO orders (
      orderId,
      customerName,
      phoneNumber,
      garments,
      totalAmount,
      status,
      createdAt,
      updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  statement.run(
    order.orderId,
    order.customerName,
    order.phoneNumber,
    JSON.stringify(order.garments),
    order.totalAmount,
    order.status,
    order.createdAt,
    order.updatedAt,
  );

  return order;
}

function listOrders() {
  const statement = database.prepare(`SELECT * FROM orders ORDER BY createdAt DESC`);
  return statement.all().map(rowToOrder);
}

function findOrderById(orderId) {
  const statement = database.prepare(`SELECT * FROM orders WHERE orderId = ?`);
  const row = statement.get(orderId);
  return row ? rowToOrder(row) : null;
}

function updateOrderStatus(orderId, status) {
  const now = new Date().toISOString();
  const statement = database.prepare(`
    UPDATE orders
    SET status = ?, updatedAt = ?
    WHERE orderId = ?
  `);

  const result = statement.run(status, now, orderId);
  if (result.changes === 0) {
    return null;
  }

  return findOrderById(orderId);
}

function seedOrders(initialOrders = []) {
  if (!Array.isArray(initialOrders) || initialOrders.length === 0) {
    return;
  }

  const insert = database.prepare(`
    INSERT OR REPLACE INTO orders (
      orderId,
      customerName,
      phoneNumber,
      garments,
      totalAmount,
      status,
      createdAt,
      updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = database.transaction((orders) => {
    for (const order of orders) {
      insert.run(
        order.orderId,
        order.customerName,
        order.phoneNumber,
        JSON.stringify(order.garments),
        order.totalAmount,
        order.status,
        order.createdAt,
        order.updatedAt,
      );
    }
  });

  transaction(initialOrders);
}

module.exports = {
  addOrder,
  listOrders,
  findOrderById,
  updateOrderStatus,
  seedOrders,
};
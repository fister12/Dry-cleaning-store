const path = require("path");

let sqliteDatabase = null;
let useInMemoryStore = false;

const memoryOrders = [];

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
    estimatedDeliveryDate: row.estimatedDeliveryDate || null,
  };
}

function toStoredOrder(order) {
  return {
    orderId: order.orderId,
    customerName: order.customerName,
    phoneNumber: order.phoneNumber,
    garments: JSON.stringify(order.garments),
    totalAmount: order.totalAmount,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    estimatedDeliveryDate: order.estimatedDeliveryDate || null,
  };
}

function loadSQLite() {
  try {
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
        updatedAt TEXT NOT NULL,
        estimatedDeliveryDate TEXT
      );
    `);

    sqliteDatabase = database;
    useInMemoryStore = false;
  } catch (error) {
    sqliteDatabase = null;
    useInMemoryStore = true;
  }
}

loadSQLite();

function addOrder(order) {
  if (useInMemoryStore || !sqliteDatabase) {
    memoryOrders.push({ ...order, estimatedDeliveryDate: order.estimatedDeliveryDate || null });
    return order;
  }

  const statement = sqliteDatabase.prepare(`
    INSERT INTO orders (
      orderId,
      customerName,
      phoneNumber,
      garments,
      totalAmount,
      status,
      createdAt,
      updatedAt,
      estimatedDeliveryDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    order.estimatedDeliveryDate || null,
  );

  return order;
}

function listOrders() {
  if (useInMemoryStore || !sqliteDatabase) {
    return [...memoryOrders].reverse();
  }

  const statement = sqliteDatabase.prepare(`SELECT * FROM orders ORDER BY createdAt DESC`);
  return statement.all().map(rowToOrder);
}

function findOrderById(orderId) {
  if (useInMemoryStore || !sqliteDatabase) {
    return memoryOrders.find((order) => order.orderId === orderId) || null;
  }

  const statement = sqliteDatabase.prepare(`SELECT * FROM orders WHERE orderId = ?`);
  const row = statement.get(orderId);
  return row ? rowToOrder(row) : null;
}

function updateOrderStatus(orderId, status) {
  const now = new Date().toISOString();

  if (useInMemoryStore || !sqliteDatabase) {
    const order = memoryOrders.find((item) => item.orderId === orderId);
    if (!order) {
      return null;
    }

    order.status = status;
    order.updatedAt = now;
    return order;
  }

  const statement = sqliteDatabase.prepare(`
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

  if (useInMemoryStore || !sqliteDatabase) {
    memoryOrders.splice(0, memoryOrders.length, ...initialOrders.map((order) => ({
      ...order,
      estimatedDeliveryDate: order.estimatedDeliveryDate || null,
    })));
    return;
  }

  const insert = sqliteDatabase.prepare(`
    INSERT OR REPLACE INTO orders (
      orderId,
      customerName,
      phoneNumber,
      garments,
      totalAmount,
      status,
      createdAt,
      updatedAt,
      estimatedDeliveryDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = sqliteDatabase.transaction((orders) => {
    for (const order of orders) {
      const stored = toStoredOrder(order);
      insert.run(
        stored.orderId,
        stored.customerName,
        stored.phoneNumber,
        stored.garments,
        stored.totalAmount,
        stored.status,
        stored.createdAt,
        stored.updatedAt,
        stored.estimatedDeliveryDate,
      );
    }
  });

  transaction(initialOrders);
}

function usingSQLite() {
  return !useInMemoryStore && Boolean(sqliteDatabase);
}

module.exports = {
  addOrder,
  listOrders,
  findOrderById,
  updateOrderStatus,
  seedOrders,
  usingSQLite,
};

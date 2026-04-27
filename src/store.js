const orders = [];

function addOrder(order) {
  orders.push(order);
  return order;
}

function listOrders() {
  return orders;
}

function findOrderById(orderId) {
  return orders.find((order) => order.orderId === orderId);
}

function seedOrders(initialOrders) {
  orders.splice(0, orders.length, ...initialOrders);
}

module.exports = {
  addOrder,
  listOrders,
  findOrderById,
  seedOrders,
};

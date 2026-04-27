const express = require("express");
const path = require("path");
const { addOrder, listOrders, findOrderById, updateOrderStatus } = require("./db");
const { ORDER_STATUSES } = require("./config");
const { createOrder, validateStatusTransition, matchesFilters, buildDashboard } = require("./orderService");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

function buildErrorResponse(res, statusCode, message, details) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
}

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Dry cleaning API is running" });
});

app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.post("/orders", (req, res) => {
  const result = createOrder(req.body);

  if (!result.valid) {
    return buildErrorResponse(res, 400, "Validation failed", result.errors);
  }

  const savedOrder = addOrder(result.order);
  return res.status(201).json({ success: true, data: savedOrder });
});

app.get("/orders", (req, res) => {
  const filteredOrders = listOrders().filter((order) => matchesFilters(order, req.query));
  res.json({ success: true, count: filteredOrders.length, data: filteredOrders });
});

app.get("/orders/:orderId", (req, res) => {
  const order = findOrderById(req.params.orderId);
  if (!order) {
    return buildErrorResponse(res, 404, "Order not found");
  }

  return res.json({ success: true, data: order });
});

app.patch("/orders/:orderId/status", (req, res) => {
  const order = findOrderById(req.params.orderId);
  if (!order) {
    return buildErrorResponse(res, 404, "Order not found");
  }

  const nextStatus = req.body.status;
  const validation = validateStatusTransition(order.status, nextStatus);
  if (!validation.valid) {
    return buildErrorResponse(res, 400, validation.error);
  }

  const updatedOrder = updateOrderStatus(order.orderId, validation.status);
  return res.json({ success: true, data: updatedOrder });
});

app.get("/dashboard", (req, res) => {
  const dashboard = buildDashboard(listOrders());
  res.json({ success: true, data: dashboard });
});

app.get("/meta", (req, res) => {
  res.json({
    success: true,
    data: {
      statuses: ORDER_STATUSES,
    },
  });
});

module.exports = app;

const GARMENT_PRICING = {
  shirt: 5,
  pants: 7,
  jacket: 12,
  dress: 10,
  coat: 15,
  saree: 14,
  suit: 18,
};

const ORDER_STATUSES = ["RECEIVED", "PROCESSING", "READY", "DELIVERED"];

const ALLOWED_STATUS_TRANSITIONS = {
  RECEIVED: ["PROCESSING"],
  PROCESSING: ["READY"],
  READY: ["DELIVERED"],
  DELIVERED: [],
};

module.exports = {
  GARMENT_PRICING,
  ORDER_STATUSES,
  ALLOWED_STATUS_TRANSITIONS,
};

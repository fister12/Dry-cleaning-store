const crypto = require("crypto");
const { GARMENT_PRICING, ORDER_STATUSES, ALLOWED_STATUS_TRANSITIONS } = require("./config");

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizePhone(value) {
  return normalizeText(value).replace(/\s+/g, "");
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function isValidDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function addDaysISO(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function validateCreateOrderPayload(payload) {
  const errors = [];
  const customerName = normalizeText(payload.customerName);
  const phoneNumber = normalizePhone(payload.phoneNumber);
  const garments = payload.garments;
  const estimatedDeliveryDate = normalizeText(payload.estimatedDeliveryDate);

  if (!customerName) {
    errors.push("customerName is required");
  }

  if (!phoneNumber) {
    errors.push("phoneNumber is required");
  }

  if (!Array.isArray(garments) || garments.length === 0) {
    errors.push("garments must be a non-empty array");
  } else {
    garments.forEach((garment, index) => {
      if (!garment || typeof garment !== "object") {
        errors.push(`garments[${index}] must be an object`);
        return;
      }

      const type = normalizeText(garment.type).toLowerCase();
      const quantity = garment.quantity;

      if (!type) {
        errors.push(`garments[${index}].type is required`);
      } else if (!Object.prototype.hasOwnProperty.call(GARMENT_PRICING, type)) {
        errors.push(`garments[${index}].type must be one of: ${Object.keys(GARMENT_PRICING).join(", ")}`);
      }

      if (!isPositiveInteger(quantity)) {
        errors.push(`garments[${index}].quantity must be a positive integer`);
      }
    });
  }

  if (estimatedDeliveryDate && !isValidDateString(estimatedDeliveryDate)) {
    errors.push("estimatedDeliveryDate must be a valid date in YYYY-MM-DD format");
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      customerName,
      phoneNumber,
      estimatedDeliveryDate: estimatedDeliveryDate || addDaysISO(3),
      garments: Array.isArray(garments)
        ? garments.map((garment) => ({
            type: normalizeText(garment.type).toLowerCase(),
            quantity: garment.quantity,
          }))
        : [],
    },
  };
}

function calculateOrderTotals(garments) {
  return garments.map((garment) => {
    const unitPrice = GARMENT_PRICING[garment.type];
    const lineTotal = unitPrice * garment.quantity;
    return {
      ...garment,
      unitPrice,
      lineTotal,
    };
  });
}

function createOrder(payload) {
  const validation = validateCreateOrderPayload(payload);
  if (!validation.valid) {
    return validation;
  }

  const lineItems = calculateOrderTotals(validation.data.garments);
  const totalAmount = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const now = new Date().toISOString();

  return {
    valid: true,
    errors: [],
    order: {
      orderId: `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      customerName: validation.data.customerName,
      phoneNumber: validation.data.phoneNumber,
      estimatedDeliveryDate: validation.data.estimatedDeliveryDate,
      garments: lineItems,
      totalAmount,
      status: ORDER_STATUSES[0],
      createdAt: now,
      updatedAt: now,
    },
  };
}

function validateStatusTransition(currentStatus, nextStatus) {
  const normalizedCurrent = normalizeText(currentStatus).toUpperCase();
  const normalizedNext = normalizeText(nextStatus).toUpperCase();

  if (!ORDER_STATUSES.includes(normalizedNext)) {
    return {
      valid: false,
      error: `status must be one of: ${ORDER_STATUSES.join(", ")}`,
    };
  }

  if (normalizedCurrent === normalizedNext) {
    return {
      valid: false,
      error: `order is already in ${normalizedNext} status`,
    };
  }

  const allowed = ALLOWED_STATUS_TRANSITIONS[normalizedCurrent] || [];
  if (!allowed.includes(normalizedNext)) {
    return {
      valid: false,
      error: `invalid transition from ${normalizedCurrent} to ${normalizedNext}`,
    };
  }

  return { valid: true, status: normalizedNext };
}

function matchesFilters(order, filters) {
  const status = normalizeText(filters.status).toUpperCase();
  const customerName = normalizeText(filters.customerName).toLowerCase();
  const phoneNumber = normalizePhone(filters.phoneNumber);
  const garmentType = normalizeText(filters.garmentType).toLowerCase();

  if (status && order.status !== status) {
    return false;
  }

  if (customerName && !order.customerName.toLowerCase().includes(customerName)) {
    return false;
  }

  if (phoneNumber && !normalizePhone(order.phoneNumber).includes(phoneNumber)) {
    return false;
  }

  if (garmentType && !order.garments.some((garment) => garment.type.toLowerCase().includes(garmentType))) {
    return false;
  }

  return true;
}

function buildDashboard(orders) {
  const statusCounts = ORDER_STATUSES.reduce((accumulator, status) => {
    accumulator[status] = 0;
    return accumulator;
  }, {});

  let totalRevenue = 0;
  orders.forEach((order) => {
    totalRevenue += order.totalAmount;
    if (statusCounts[order.status] !== undefined) {
      statusCounts[order.status] += 1;
    }
  });

  return {
    totalOrders: orders.length,
    totalRevenue,
    ordersByStatus: statusCounts,
  };
}

module.exports = {
  createOrder,
  validateStatusTransition,
  matchesFilters,
  buildDashboard,
};

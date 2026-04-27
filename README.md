# Dry Cleaning Backend

Minimal production-like backend for a dry cleaning store. Built with Express and in-memory storage.

## Features

- Create orders with customer name, phone number, and garments
- Hardcoded garment pricing
- Calculate totals automatically
- Update order status with transition validation
- List and filter orders
- Dashboard totals and status counts

## Project Structure

```text
.
├─ package.json
├─ README.md
└─ src
   ├─ app.js
   ├─ config.js
   ├─ index.js
   ├─ orderService.js
   └─ store.js
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run the server:

```bash
npm start
```

3. Optional dev mode:

```bash
npm run dev
```

## API Design

### Health

- `GET /health`

### Create Order

- `POST /orders`

Request:

```json
{
  "customerName": "Amit Sharma",
  "phoneNumber": "9876543210",
  "garments": [
    { "type": "shirt", "quantity": 3 },
    { "type": "pants", "quantity": 2 }
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "orderId": "ORD-1A2B3C4D",
    "customerName": "Amit Sharma",
    "phoneNumber": "9876543210",
    "garments": [
      { "type": "shirt", "quantity": 3, "unitPrice": 5, "lineTotal": 15 },
      { "type": "pants", "quantity": 2, "unitPrice": 7, "lineTotal": 14 }
    ],
    "totalAmount": 29,
    "status": "RECEIVED",
    "createdAt": "2026-04-27T12:00:00.000Z",
    "updatedAt": "2026-04-27T12:00:00.000Z"
  }
}
```

### List Orders

- `GET /orders`

Query filters:

- `status=RECEIVED|PROCESSING|READY|DELIVERED`
- `customerName=amit`
- `phoneNumber=9876`

### Get Single Order

- `GET /orders/:orderId`

### Update Status

- `PATCH /orders/:orderId/status`

Request:

```json
{
  "status": "PROCESSING"
}
```

Allowed transitions:

- RECEIVED -> PROCESSING
- PROCESSING -> READY
- READY -> DELIVERED

### Dashboard

- `GET /dashboard`

Response:

```json
{
  "success": true,
  "data": {
    "totalOrders": 2,
    "totalRevenue": 88,
    "ordersByStatus": {
      "RECEIVED": 1,
      "PROCESSING": 0,
      "READY": 1,
      "DELIVERED": 0
    }
  }
}
```

## Sample Requests

### Create order

```bash
curl -X POST http://localhost:3000/orders ^
  -H "Content-Type: application/json" ^
  -d "{\"customerName\":\"Amit Sharma\",\"phoneNumber\":\"9876543210\",\"garments\":[{\"type\":\"shirt\",\"quantity\":2},{\"type\":\"jacket\",\"quantity\":1}]}"
```

### Update status

```bash
curl -X PATCH http://localhost:3000/orders/ORD-1A2B3C4D/status ^
  -H "Content-Type: application/json" ^
  -d "{\"status\":\"PROCESSING\"}"
```

### Filter orders

```bash
curl "http://localhost:3000/orders?status=RECEIVED&customerName=amit"
```

## Notes

- Storage is in-memory, so data resets when the server restarts.
- Garment prices are hardcoded in `src/config.js`.

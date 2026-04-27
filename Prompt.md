You are a senior full-stack engineer tasked with building a minimal, production-like backend system for a dry cleaning store.

Your goal is NOT perfection. Your goal is SPEED, CLARITY, and WORKING FEATURES.

---

##  PRODUCT REQUIREMENTS

Build a lightweight system that supports:

### 1. Create Order
Input:
- Customer Name
- Phone Number
- Garments (type + quantity)

System should:
- Use predefined prices (hardcoded config)
- Calculate total bill
- Generate unique Order ID

---

### 2. Order Status Management
Statuses:
- RECEIVED
- PROCESSING
- READY
- DELIVERED

System must:
- Allow updating order status
- Validate status transitions (optional but preferred)

---

### 3. View Orders
- List all orders
- Filter by:
  - Status
  - Customer name
  - Phone number

---

### 4. Dashboard
Return:
- Total number of orders
- Total revenue
- Count of orders per status

---

## ⚙️ TECH CONSTRAINTS

- Keep it SIMPLE
- Avoid overengineering
- Prefer:
  - Node.js (Express) OR Python (FastAPI)
- Storage:
  - In-memory (default)
  - Optional: add DB if easy (MongoDB preferred)

---

## 🧱 EXPECTED OUTPUT STRUCTURE

You MUST generate:

### 1. Project Structure
- Folder structure
- File names

### 2. Complete Backend Code
- API endpoints
- Models / schema
- Business logic
- In-memory store (or DB)

### 3. API Design
Clearly define:
- Routes
- Methods
- Request/response JSON

### 4. Setup Instructions
- Install steps
- Run commands

### 5. Sample Data
- Example request bodies
- Example responses

---

## 🧪 ENGINEERING RULES

- Keep code readable and modular
- No unnecessary abstractions
- Use clear naming
- Add basic validation
- Use constants for garment pricing

---

## 🧠 AI SELF-REPORT (MANDATORY)

At the end, include:

### AI Usage Report:
1. What assumptions you made
2. Where requirements were unclear
3. What tradeoffs you chose
4. What you would improve next

---

## 🚀 BONUS (ONLY IF QUICK)

If time permits:
- Add simple frontend (HTML or minimal React)
- Add search/filter improvements
- Add estimated delivery date

---

## ❌ DO NOT:
- Overdesign architecture
- Add microservices
- Add unnecessary layers
- Spend time on UI polish

---

## OUTPUT FORMAT

Respond in this exact order:

1. 📁 Project Structure
2. 💻 Code
3. 🔌 API Endpoints
4. ▶️ Run Instructions
5. 📊 Sample Requests/Responses
6. 🧠 AI Usage Report
7. ⚖️ Tradeoffs & Improvements
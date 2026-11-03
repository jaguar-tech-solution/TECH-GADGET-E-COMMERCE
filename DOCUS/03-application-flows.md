#  Application Workflows

## 1. Overview & Architectural Boundaries

This document defines the movement of data, actions, and security boundaries across the gadget store application. 

### System Participants & Responsibilities

- **Storefront (React + Vite)**: Customer-facing Web Client. Handles product discovery, shopping cart management, checkout forms, account management, and order tracking. Communicates strictly via HTTP REST APIs to the Backend API.
- **Admin Dashboard (React + Vite)**: Internal Operations Interface. Used by store administrators to manage product catalogs, inventory, order fulfillment, and metrics. Communicates strictly via protected HTTP REST APIs.
- **Backend API (Node.js + Express)**: Central Business & Security Authority. Executes validation, authentication, authorization, order creation, transaction locking, rate limiting, and third-party payment integration (M-Pesa API).
- **Database (PostgreSQL — Neon)**: Persistent Source of Truth. Stores accounts, hashed credentials, product definitions, transactional stock counts, orders, fulfillment events, and M-Pesa audit logs.
- **M-Pesa Gateway (Safaricom Daraja API)**: External Payment Service. Sends STK Push prompts to customer mobile devices and transmits async HTTP callback webhooks back to the Backend API.

> **Core Architectural Invariant**: Neither frontend (Storefront nor Admin Dashboard) communicates directly with PostgreSQL. All data queries and mutations must pass through the Node.js/Express Backend API to enforce validation, row-level locks, and security boundaries.

---


### Payment Lifecycle States
- **Pending**: Payment request generated (STK push initiated); awaiting Daraja callback or query verification.
- **Paid**: Payment callback authenticated, verified for exact amount and payload, and recorded in PostgreSQL.
- **Failed**: User declined STK prompt, entered incorrect PIN, had insufficient funds, or the payment window expired.
- **Cancelled**: Order cancelled prior to payment completion (e.g., reservation timed out).
- **Refunded**: Money returned to the customer following a post-payment cancellation or resolution process.

### Fulfillment Lifecycle States
- **Awaiting Payment**: Initial state upon order creation. Order cannot enter fulfillment while in this state.
- **Processing**: Order paid successfully; items being picked, checked, and packed by administrators.
- **Ready for Dispatch**: Order packaged, labeled, and prepared for courier handover.
- **Dispatched**: Order handed to delivery partner/courier.
- **Delivered**: Order delivered and confirmed by customer/admin.
- **Cancelled**: Order halted.

### State Transition Matrix Rules
1. An order **cannot** enter `Processing` status while Payment Status is `Pending` or `Failed`.
2. A status of `Failed` or `Cancelled` in Payment Lifecycle forces Fulfillment status to `Cancelled` (or halts it indefinitely).
3. Administrator status updates affect **only** the Fulfillment Lifecycle. Administrators cannot manually flip payment status to `Paid` without an authenticated M-Pesa transaction reference.

---

## 3. Workflow Specifications

### 01. Customer Registration and Login

- **Purpose**: Authenticate users, manage identity, issue JWT access tokens, and protect user resources.
- **Actors**: Guest Customer, Storefront, Backend API, PostgreSQL, Email Service.
- **Preconditions**: Customer has access to a valid email address and the Storefront interface.

#### Main Steps
1. **Registration Request**: Customer submits Full Name, Email, and Password via Storefront.
2. **Input Validation**: Backend API validates email format, password complexity (min 8 chars, 1 uppercase, 1 number, 1 special char), and sanitizes input.
3. **Uniqueness Check**: Backend queries PostgreSQL for existing active email record.
4. **Credential Hashing**: Backend hashes password using `bcrypt` (work factor 12) or `argon2`.
5. **Account Creation**: Account created in PostgreSQL with `email_verified: false` and standard customer role.
6. **Token Generation & Email Dispatch**: Backend generates a cryptographically secure verification token (stored with expiration) and triggers verification email.
7. **Email Verification**: Customer clicks link; Backend updates account to `email_verified: true`.
8. **Login Request**: Customer submits Email and Password.
9. **Password Verification**: Backend fetches user record by email, compares password against stored hash.
10. **Session Issuance**: Backend issues a signed, short-lived JWT Access Token and an HTTP-Only Refresh Token.

#### Alternative / Failure Scenarios
- **Duplicate Email**: Return `409 Conflict` ("Account already exists"). Do not reveal account details.
- **Invalid Credentials**: Return `401 Unauthorized` ("Invalid email or password") to mitigate user enumeration.
- **Unverified Account Action**: If customer attempts sensitive operations without verification, return `403 Forbidden` with a option to resend verification email.

#### Business & Technical Rules
- Passwords are **never** stored or logged in plain text.
- Rate-limit login endpoints to 5 attempts per IP per minute to block brute-force attacks.

---

### 02. Product Discovery

- **Purpose**: Enable customers to browse, search, filter, and view product details without authentication.
- **Actors**: Guest/Registered Customer, Storefront, Backend API, PostgreSQL.
- **Preconditions**: Product catalog exists in PostgreSQL database.

#### Main Steps
1. Storefront loads and requests catalog snapshot from `/api/v1/products`.
2. Backend queries PostgreSQL for active products (`is_active = true`).
3. Backend returns paginated list containing product title, thumbnail, price, category, and stock availability flag.
4. Customer inputs search queries or toggles filters (e.g., Category, Price Range, In-Stock status).
5. Storefront issues filtered query request (`/api/v1/products?search=watch&minPrice=1000`).
6. Backend sanitizes query params, applies SQL indexes, and returns matching paginated products.
7. Customer clicks a product; Storefront fetches full detail route (`/api/v1/products/:slug`).
8. Backend returns comprehensive specs, high-res image gallery URLs, precise real-time stock count, and price.

#### Alternative / Failure Scenarios
- **Product Draft/Archived**: If customer accesses unlisted product via direct URL, Backend returns `404 Not Found`.
- **Database Downtime**: Backend catches connection errors, returning `503 Service Unavailable` with cached fallback if available.

#### Business & Technical Rules
- Only active products (`is_active = true`) are visible to public catalog queries.
- Unpublished, draft, or soft-deleted products must never be leaked through search auto-complete endpoints.

---

### 03. Shopping Cart

- **Purpose**: Allow customers to assemble intended purchases locally or across devices before placing an order.
- **Actors**: Customer, Storefront, Backend API, PostgreSQL.
- **Preconditions**: Active or out-of-stock products selected from the Storefront.

#### Main Steps
1. **Item Selection**: Customer chooses product quantity and clicks "Add to Cart".
2. **Local Cart Management (Guest)**: Storefront stores line items, variant IDs, and quantities in client `localStorage`.
3. **Persistent Cart Management (Registered User)**: Storefront syncs payload with `/api/v1/cart`. Backend validates items and persists to `cart_items` table in PostgreSQL.
4. **Subtotal Calculation**: Storefront computes client-side indicative subtotal for UI feedback.
5. **Quantity Modifications**: Customer increases, decreases, or removes line items.

#### Alternative / Failure Scenarios
- **Exceeding Current Stock**: Customer requests quantity > current available stock. Storefront displays warning banner ("Maximum available quantity reached").
- **Price Mismatch on Sync**: Price changes on backend while item in cart. UI displays notification banner during cart review.

#### Business & Technical Rules
- Frontend cart amounts are **strictly non-authoritative**. Final totals are calculated solely by the Backend API at checkout.
- Guest carts persist in browser storage until cleared or converted to checkout.

---

### 04. Checkout and Stock Reservation

- **Purpose**: Calculate authoritative order total, capture shipping details, create order record, and lock stock.
- **Actors**: Customer, Storefront, Backend API, PostgreSQL (Neon).
- **Preconditions**: Items in cart; valid customer address and contact details available.

#### Main Steps
1. Customer initiates checkout on Storefront and provides Name, Email, Phone Number (M-Pesa formatted), and Delivery Address.
2. Storefront posts payload to `/api/v1/orders/checkout`.
3. Backend starts PostgreSQL ACID transaction (`BEGIN`).
4. Backend re-fetches target product rows from PostgreSQL using row-level locking (`SELECT ... FOR UPDATE`).
5. Backend verifies active state and checks available stock (`stock_quantity - reserved_quantity >= requested_quantity`).
6. Backend calculates authoritative line totals, fetches delivery fee assigned to destination region, and computes total order cost.
7. Backend inserts Order into database (`status: PENDING`, `fulfillment_status: AWAITING_PAYMENT`).
8. Backend increments `reserved_quantity` for line items and sets a reservation expiry timestamp (`NOW() + INTERVAL '15 minutes'`).
9. Backend commits database transaction (`COMMIT`).
10. Backend returns `order_id`, authoritative total, and M-Pesa payment prompt instructions to Storefront.

#### Alternative / Failure Scenarios
- **Insufficient Stock at Checkout**: If stock check fails during `SELECT ... FOR UPDATE`, Backend rolls back transaction (`ROLLBACK`), returns `409 Conflict`, and specifies out-of-stock items.
- **Expired Reservation**: Customer delays payment past 15 minutes. Background cleanup task or transaction engine releases `reserved_quantity`.

#### Business & Technical Rules
- Backend **must never trust line item prices or totals** sent from client payloads.
- Stock reservation duration is capped strictly at 15 minutes to avoid unfulfilled inventory lockouts.

---

### 05. M-Pesa Payment (Daraja API Integration)

- **Purpose**: Initiate, process, verify, and settle payments using Safaricom M-Pesa STK Push.
- **Actors**: Customer, Backend API, PostgreSQL, M-Pesa (Safaricom Daraja API).
- **Preconditions**: Pending order created with locked stock reservation and valid Safaricom phone number (`2547XXXXXXXX`).

#### Main Steps
1. Customer reviews authoritative total and clicks "Pay with M-Pesa".
2. Backend requests OAuth2 access token from Daraja API endpoint.
3. Backend issues STK Push request (`ExpressSimulate` / `LNMO`) containing `BusinessShortCode`, generated `Password`, `Timestamp`, `Amount`, `PhoneNumber`, `CallBackURL`, and `AccountReference` (`order_id`).
4. Daraja responds synchronously to Backend with `CheckoutRequestID` and `ResponseCode: 0` (Accepted).
5. Backend stores `CheckoutRequestID` in `payments` table associated with `order_id`.
6. Customer receives native STK prompt on phone, enters M-Pesa PIN, and confirms transaction.
7. M-Pesa processes money transfer and sends async HTTP POST Callback payload to Backend `CallBackURL`.
8. **Callback Authentication & Verification**:
   - Backend validates callback source header / IP / token.
   - Backend parses `ResultCode`.
9. **Success Flow (`ResultCode == 0`)**:
   - Backend checks for duplicate transaction ID (`MpesaReceiptNumber`) to ensure **Idempotency**.
   - Backend updates payment record (`status: PAID`, `receipt_number`, `amount_paid`).
   - Backend converts reserved stock to permanent deduction (`stock_quantity = stock_quantity - reserved_quantity`, `reserved_quantity = reserved_quantity - requested_quantity`).
   - Backend updates order fulfillment status to `PROCESSING`.
10. Backend responds to M-Pesa callback endpoint with `{ "ResultCode": 0, "ResultDesc": "Accepted" }`.

#### Alternative / Failure Scenarios
- **Customer Cancels STK Prompt (`ResultCode == 1032`)**: Backend updates payment to `FAILED`, releases reserved stock, sets order status to `CANCELLED`.
- **Late Payment Callback (Post-15-min Expiration)**:
  - If M-Pesa callback arrives **after** 15-min timeout and reservation release:
  - Backend flags transaction as `RECONCILIATION_REQUIRED`.
  - Backend checks if current stock is still available:
    - *If available*: Re-deduct stock, set order to `PAID`, proceed with fulfillment.
    - *If out of stock*: Log to admin reconciliation dashboard for automated/manual refund processing.
- **Network / Callback Dropped**: Client polls backend endpoint `/api/v1/payments/status/:orderId`. Backend performs STK Query (`LIPA NA M-PESA ONLINE QUERY`) to M-Pesa API to confirm transaction state explicitly.

#### Business & Technical Rules
- Client navigation to "Success Page" is **indicative only**. Orders are marked `PAID` **exclusively** upon backend verification of Daraja callback or query.
- Webhook handling must be idempotent: processing the exact same `MpesaReceiptNumber` multiple times must result in zero additional stock updates or duplicate record mutations.

---

### 06. Order Confirmation and Customer Notifications

- **Purpose**: Inform customer of successful payment, provide receipt reference, and issue status updates via email/SMS.
- **Actors**: Backend API, PostgreSQL, Notification Service (SendGrid/Resend/AWS SES), Customer.
- **Preconditions**: Payment status transitions to `PAID` or fulfillment status updates.

#### Main Steps
1. Payment verification worker confirms `PAID` state in PostgreSQL.
2. Backend triggers asynchronous notification event to message queue / worker task.
3. Notification service compiles transactional HTML email containing:
   - Order Reference ID
   - M-Pesa Receipt Number
   - Itemized purchase table
   - Delivery address details
   - Estimated fulfillment date
4. Service transmits email to customer account address.
5. Customer accesses Storefront `/orders/:id` page via authenticated route or secure email access token to track fulfillment status.

#### Alternative / Failure Scenarios
- **Email Service Unavailable**: Notification worker catches error, logs failure in database, and schedules exponential backoff retry without breaking order pipeline.

#### Business & Technical Rules
- The notification system is strictly read-only and event-driven; it **cannot mutate order states**.

---

### 07. Administrator Order Processing

- **Purpose**: Enable store admins to view paid orders, package items, and advance fulfillment statuses.
- **Actors**: Administrator, Admin Dashboard (React + Vite), Backend API, PostgreSQL.
- **Preconditions**: Administrator authenticated with valid JWT carrying `admin` role claim.

#### Main Steps
1. Administrator logs into Admin Dashboard.
2. Dashboard queries `/api/v1/admin/orders?fulfillment_status=PROCESSING`.
3. Backend verifies admin JWT claims and returns list of paid orders requiring action.
4. Administrator selects an order, views delivery manifest, picks inventory items, and packs shipment.
5. Administrator changes status to `READY_FOR_DISPATCH`. Backend records status change and timestamp in `order_audit_logs`.
6. Courier picks up package. Administrator inputs courier tracking metadata (if applicable) and sets status to `DISPATCHED`.

#### Alternative / Failure Scenarios
- **Unauthorized Access Attempt**: Standard customer token used on Admin endpoints returns `403 Forbidden`.
- **Damaged Stock Discovery**: Admin discovers physically damaged stock during packing. Admin triggers "Stock Exception", cancelling order and triggering customer refund workflow.

#### Business & Technical Rules
- Administrators **cannot** manually mark an unpaid M-Pesa order as `PAID` without overriding log approval and entering a valid verified transaction reference.

---

### 08. Delivery and Order Completion

- **Purpose**: Complete order cycle by tracking delivery execution and confirming receipt.
- **Actors**: Administrator / Courier, Customer, Admin Dashboard, Backend API, PostgreSQL.
- **Preconditions**: Order status is `DISPATCHED`.

#### Main Steps
1. Courier executes physical delivery to customer address provided during checkout.
2. Courier confirms successful package handover to customer.
3. Administrator opens order in Admin Dashboard and updates status to `DELIVERED`.
4. Backend writes delivery timestamp to order record in PostgreSQL.
5. Backend issues final "Order Delivered" email notification to customer.
6. Order record is archived into customer's historical profile for lookup.

#### Alternative / Failure Scenarios
- **Failed Delivery Attempt**: Courier unable to reach customer. Admin marks order as `DELIVERY_FAILED`, initiating delivery re-attempt workflow or return-to-base log.

#### Business & Technical Rules
- Delivery processing for MVP is manually managed by Store Administrators; no third-party API integration required.

---

### 09. Product and Inventory Management

- **Purpose**: Manage catalog items, variants, pricing structure, and maintain accurate audit logs of inventory shifts.
- **Actors**: Administrator, Admin Dashboard, Backend API, PostgreSQL.
- **Preconditions**: Admin authenticated into Admin Dashboard.

#### Main Steps
1. Admin opens Product Management tab and submits new product form (Title, Specs, Price, Category, Physical Stock Count).
2. Backend validates payload fields and creates record in `products` and `inventory` tables.
3. **Inventory Adjustment**: Admin updates stock quantity (e.g., received new shipment of +50 units).
4. Backend executes transaction updating physical stock count and appends entry to `inventory_audit_log` with `admin_id`, `quantity_change`, `reason`, and `timestamp`.

#### Alternative / Failure Scenarios
- **Invalid Price/Negative Stock Entry**: Backend validation catches negative value or invalid data type, returning `400 Bad Request`.

#### Business & Technical Rules
- All manual stock alterations **must write an immutable entry to `inventory_audit_log`** for accountability.

---

### 10. Order Cancellation

- **Purpose**: Allow customers or admins to halt unfulfilled orders and safely release locked stock or initiate refunds.
- **Actors**: Customer, Administrator, Backend API, PostgreSQL, M-Pesa/Bank Gateway.
- **Preconditions**: Order status is prior to `DISPATCHED`.

#### Main Steps
1. **Cancellation Request**:
   - *Unpaid Order*: Customer clicks "Cancel" or 15-min reservation expires.
   - *Paid Order (Pre-Dispatch)*: Customer requests cancellation via dashboard or contact form.
2. **State Verification**: Backend checks current `fulfillment_status`.
3. **Unpaid Branch**:
   - Order marked `CANCELLED`.
   - Backend releases `reserved_quantity` back to available stock.
4. **Paid Branch**:
   - Order marked `CANCELLED`.
   - Stock deduction reversed (`stock_quantity = stock_quantity + order_quantity`).
   - Payment status marked `REFUND_PENDING`.
   - Admin triggers manual or automated M-Pesa B2C/Reversal transaction.
   - Upon refund confirmation, payment status updated to `REFUNDED`.

#### Alternative / Failure Scenarios
- **Attempted Cancellation of Dispatched Order**: Customer clicks cancel on `DISPATCHED` order. Backend rejects request with `400 Bad Request` ("Order already dispatched; submit return request post-delivery").

#### Business & Technical Rules
- Refund transactions must be logged in a dedicated `refunds` table separate from initial payment records.

---

### 11. Payment Reconciliation

- **Purpose**: Detect, reconcile, and resolve orphaned, delayed, or missing M-Pesa payment callbacks.
- **Actors**: Cron Worker / System Job, Administrator, Backend API, M-Pesa Daraja API, PostgreSQL.
- **Preconditions**: Orders remaining in `PENDING` payment state longer than 5 minutes.

#### Main Steps
1. **Automated Reconciliation Cron**: Runs every 5 minutes on Backend.
2. Cron queries PostgreSQL for orders where `payment_status = PENDING` and `created_at < NOW() - 5 mins`.
3. For each pending order, Backend issues STK Push Query API request to M-Pesa Daraja API using `CheckoutRequestID`.
4. **M-Pesa Query Response Evaluation**:
   - *If Paid*: Backend invokes Payment Success flow (Mark `PAID`, deduct stock, move to `PROCESSING`).
   - *If Failed / Expired*: Backend invokes Cancellation flow (Mark `FAILED`, release reserved stock).
   - *If Still Processing*: Leave as pending for next cron pass.
5. **Exception Handling Dashboard**: Transactions returning conflicting state mismatches are flagged for Admin manual review.

#### Alternative / Failure Scenarios
- **Daraja Query API Outage**: Cron job logs connection timeout, backs off, and alerts system admin via log threshold alerts.

#### Business & Technical Rules
- Automated payment reconciliation prevents pending orders from blocking inventory indefinitely due to dropped webhooks.

---

## 4. Task 4 Completion Checklist

- [x] Document registration and login workflow
- [x] Document product discovery workflow
- [x] Document shopping cart workflow
- [x] Document checkout and stock reservation workflow
- [x] Document M-Pesa payment workflow
- [x] Document order confirmation and notifications
- [x] Document administrator order processing
- [x] Document delivery workflow
- [x] Document product and inventory management
- [x] Document cancellation workflow
- [x] Document payment reconciliation
- [x] Document payment and fulfillment lifecycles
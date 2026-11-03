
#  User Roles and Permissions

## Current Task Overview

Having defined the system's functional and operational requirements, this task establishes **who** can access each feature and **what actions** they are permitted to perform.

Establishing strict access control is a core backend architectural requirement:

* **Guest:** Browses products; cannot manage inventory.

* **Registered Customer:** Views their own orders; cannot access other customers' orders.

* **Administrator:** Manages products and orders; access is restricted to authorized system operations.

* **M-Pesa Service:** Transmits payment callbacks; possesses zero administrative prSingle administrator role

  One admin role with all approved store-management permissions. Recommended for the MVP.

  Multiple administrator roles

  Separate roles such as Super Admin, Inventory Manager and Order Manager.

  Confirm administrator structure

  After this decision, we'll close Task 3 and proceed to Phase 2, Task 4: Application Workflows. There we'll map the complete journey from product discovery to checkout, M-Pesa payment, stock deduction and delivery. ivileges.

## 1. Authentication vs. Authorization

| Concept | Question | Definition | Example | 
| ----- | ----- | ----- | ----- | 
| **Authentication** | *Who are you?* | The system verifies a user's identity. | A customer signs in using their email and password. | 
| **Authorization** | *What can you do?* | The system determines if an identity can perform an action.Single administrator role  One admin role with all approved store-management permissions. Recommended for the MVP.  Multiple administrator roles  Separate roles such as Super Admin, Inventory Manager and Order Manager.  Confirm administrator structure  After this decision, we'll close Task 3 and proceed to Phase 2, Task 4: Application Workflows. There we'll map the complete journey from product discovery to checkout, M-Pesa payment, stock deduction and delivery.  | An authenticated customer is blocked from accessing the admin product management API endpoint. | 

> **Key Rule:** A user can be authenticated without being authorized to access a specific resource.

## 2. System Actors

1. **Guest Customer:** An unauthenticated visitor who can browse the store and make purchases without creating an account.

2. **Registered Customer:** A verified account holder who can shop, manage their profile, and access their personal order history.

3. **Administrator:** An authenticated operator responsible for store management, inventory control, and order fulfillment.

4. **M-Pesa Payment Service:** An external payment gateway that communicates payment results to the backend via trusted integration mechanisms.

## 3. Permissions Matrix

### Legend

* **Allowed:** Permitted without conditions.

* **Denied:** Not permitted.

* **Conditional:** Permitted only when specific business conditions are satisfied (e.g., resource ownership).

| Capability | Guest | Customer | Admin | M-Pesa | 
| ----- | ----- | ----- | ----- | ----- | 
| **Browse products** | Allowed | Allowed | Allowed | Denied | 
| **Search and filter** | Allowed | Allowed | Allowed | Denied | 
| **Add items to cart** | Allowed | Allowed | Denied | Denied | 
| **Checkout** | Allowed | Allowed | Denied | Denied | 
| **Make M-Pesa payment** | Allowed | Allowed | Denied | Processes | 
| **View order history** | Own verified orders | Own orders | All orders | Denied | 
| **Manage profile** | Denied | Own profile | Limited support access | Denied | 
| **Manage products** | Denied | Denied | Allowed | Denied | 
| **Manage inventory** | Denied | Denied | Allowed | Denied | 
| **Manage orders** | Denied | Own orders (limited) | Allowed | Denied | 
| **Manage delivery** | Denied | View own delivery | Allowed | Denied | 
| **View reports** | Denied | Denied | Allowed | Denied | 
| **Submit payment callback** | Denied | Denied | Denied | Verified service only | 

> **Note:** The M-Pesa service operates strictly as a narrowly scoped integration actor. It can submit payment information, which the backend must verify before updating payment or order records.

## 4. Role Permissions & Responsibilities

### A. Guest Customer

* **Allowed Actions:**

  * Browse and search product catalog.

  * View product details and stock availability.

  * Add products to a temporary session cart.

  * Update or remove cart items.

  * Submit checkout information.

  * Initiate M-Pesa payment.

  * Access their own order via secure verification token/link.

* **Forbidden Actions:**

  * Access customer account pages.

  * View other customers' order details.

  * Access administrative endpoints or functionality.

  * Alter product pricing or stock values.

  * Manually confirm their own payment status.

### B. Registered Customer

Inherits all **Guest Customer** capabilities, plus:

* **Allowed Actions:**

  * Register account and verify email.

  * Log in and log out securely.

  * Update personal profile information.

  * Manage saved delivery addresses.

  * View complete personal order history and track order status.

  * Request order cancellations (subject to order status policy).

  * Access personal wishlist *(Phase 2)*.

  * Submit eligible product reviews *(Phase 2)*.

* **Ownership Rule:** A customer can **only** access or modify records belonging to their authenticated account ID. Changing parameters (e.g., `order_id` in a URL or request body) must be blocked by ownership validation.

### C. Administrator

* **Product Management:**

  * Create, edit, activate, and deactivate products.

  * Upload and manage product media/images.

  * Manage product categories.

* **Inventory Management:**

  * Monitor stock levels and receive low-stock alerts.

  * Adjust and update stock values.

  * Review inventory audit logs.

* **Order Management:**

  * View and search all cu# Phase 2 — Task 3: User Roles and Permissions

## Current Task Overview

Having defined the system's functional and operational requirements, this task establishes **who** can access each feature and **what actions** they are permitted to perform.

Establishing strict access control is a core backend architectural requirement:

* **Guest:** Browses products; cannot manage inventory.

* **Registered Customer:** Views their own orders; cannot access other customers' orders.

* **Administrator:** Manages products and orders; access is restricted to authorized system operations.

* **M-Pesa Service:** Transmits payment callbacks; possesses zero administrative prSingle administrator role

  One admin role with all approved store-management permissions. Recommended for the MVP.

  Multiple administrator roles

  Separate roles such as Super Admin, Inventory Manager and Order Manager.

  Confirm administrator structure

  After this decision, we'll close Task 3 and proceed to Phase 2, Task 4: Application Workflows. There we'll map the complete journey from product discovery to checkout, M-Pesa payment, stock deduction and delivery. ivileges.

## 1. Authentication vs. Authorization

| Concept | Question | Definition | Example | 
| ----- | ----- | ----- | ----- | 
| **Authentication** | *Who are you?* | The system verifies a user's identity. | A customer signs in using their email and password. | 
| **Authorization** | *What can you do?* | The system determines if an identity can perform an action.Single administrator role  One admin role with all approved store-management permissions. Recommended for the MVP.  Multiple administrator roles  Separate roles such as Super Admin, Inventory Manager and Order Manager.  Confirm administrator structure  After this decision, we'll close Task 3 and proceed to Phase 2, Task 4: Application Workflows. There we'll map the complete journey from product discovery to checkout, M-Pesa payment, stock deduction and delivery.  | An authenticated customer is blocked from accessing the admin product management API endpoint. | 

> **Key Rule:** A user can be authenticated without being authorized to access a specific resource.

## 2. System Actors

1. **Guest Customer:** An unauthenticated visitor who can browse the store and make purchases without creating an account.

2. **Registered Customer:** A verified account holder who can shop, manage their profile, and access their personal order history.

3. **Administrator:** An authenticated operator responsible for store management, inventory control, and order fulfillment.

4. **M-Pesa Payment Service:** An external payment gateway that communicates payment results to the backend via trusted integration mechanisms.

## 3. Permissions Matrix

### Legend

* **Allowed:** Permitted without conditions.

* **Denied:** Not permitted.

* **Conditional:** Permitted only when specific business conditions are satisfied (e.g., resource ownership).

| Capability | Guest | Customer | Admin | M-Pesa | 
| ----- | ----- | ----- | ----- | ----- | 
| **Browse products** | Allowed | Allowed | Allowed | Denied | 
| **Search and filter** | Allowed | Allowed | Allowed | Denied | 
| **Add items to cart** | Allowed | Allowed | Denied | Denied | 
| **Checkout** | Allowed | Allowed | Denied | Denied | 
| **Make M-Pesa payment** | Allowed | Allowed | Denied | Processes | 
| **View order history** | Own verified orders | Own orders | All orders | Denied | 
| **Manage profile** | Denied | Own profile | Limited support access | Denied | 
| **Manage products** | Denied | Denied | Allowed | Denied | 
| **Manage inventory** | Denied | Denied | Allowed | Denied | 
| **Manage orders** | Denied | Own orders (limited) | Allowed | Denied | 
| **Manage delivery** | Denied | View own delivery | Allowed | Denied | 
| **View reports** | Denied | Denied | Allowed | Denied | 
| **Submit payment callback** | Denied | Denied | Denied | Verified service only | 

> **Note:** The M-Pesa service operates strictly as a narrowly scoped integration actor. It can submit payment information, which the backend must verify before updating payment or order records.

## 4. Role Permissions & Responsibilities

### A. Guest Customer

* **Allowed Actions:**

  * Browse and search product catalog.

  * View product details and stock availability.

  * Add products to a temporary session cart.

  * Update or remove cart items.

  * Submit checkout information.

  * Initiate M-Pesa payment.

  * Access their own order via secure verification token/link.

* **Forbidden Actions:**

  * Access customer account pages.

  * View other customers' order details.

  * Access administrative endpoints or functionality.

  * Alter product pricing or stock values.

  * Manually confirm their own payment status.

### B. Registered Customer

Inherits all **Guest Customer** capabilities, plus:

* **Allowed Actions:**

  * Register account and verify email.

  * Log in and log out securely.

  * Update personal profile information.

  * Manage saved delivery addresses.

  * View complete personal order history and track order status.

  * Request order cancellations (subject to order status policy).

  * Access personal wishlist *(Phase 2)*.

  * Submit eligible product reviews *(Phase 2)*.

* **Ownership Rule:** A customer can **only** access or modify records belonging to their authenticated account ID. Changing parameters (e.g., `order_id` in a URL or request body) must be blocked by ownership validation.

### C. Administrator

* **Product Management:**

  * Create, edit, activate, and deactivate products.

  * Upload and manage product media/images.

  * Manage product categories.

* **Inventory Management:**

  * Monitor stock levels and receive low-stock alerts.

  * Adjust and update stock values.

  * Review inventory audit logs.

* **Order Management:**

  * View and search all customer orders.

  * Inspect customer order data necessary for fulfillment.

  * Review payment verification statuses.

  * Process eligible order cancellations and refunds.

  * Update order fulfillment and delivery statuses.

  * Assign delivery fees and update delivery logistics.

* **Reporting & Analytics:**

  * Access sales metrics, order counts, pending orders, low-stock reports, and top-selling products.

* **Constraint:** Administrators must **never** manually mark an order as paid based solely on external proof (e.g., a customer screenshot). All payment confirmations must pass through the automated, verified payment mechanism.

### D. M-Pesa Payment Service

* **Responsibilities:**

  * Receive payment initiation requests from the backend.

  * Process transactions with the network.

  * Send payment results via configured webhook/callback mechanisms.

  * Provide transaction status querying for backend reconciliation.

* **Constraints:**

  * The backend must validate the callback payload signature, matching `order_id`, `amount`, `currency`, and `transaction_reference`.

  * Direct access to the application database is strictly prohibited.

## 5. Authorization Architecture Design

We adopt **Role-Based Access Control (RBAC)** alongside **Resource-Based Authorization**.

```
[ Incoming API Request ]
          │
          ▼
┌──────────────────┐
│ Authentication   │ ──(Verify identity)
└──────────────────┘
          │
          ▼
┌──────────────────┐
│ Role Checking    │ ──(Guest / Customer / Admin / Service)
└──────────────────┘
          │
          ▼
┌──────────────────┐
│ Ownership Check  │ ──(Does User ID match Resource Owner ID?)
└──────────────────┘
          │
          ▼
[ Execute Operation ]

```

### Core Architecture Principles

1. **Principle of Least Privilege:** Restrict every actor's permissions strictly to what is required for their defined role.

2. **Server-Side Enforcement:** Do not rely on UI logic (e.g., hiding buttons in React) for security. All operations must be validated on the backend/API level.

3. **Resource Ownership Validation:** Ensure that authenticated requests for user data explicitly match the authenticated identity.

## 6. Implementation Security Rules

| Security Area | System Requirement | 
| ----- | ----- | 
| **Admin Registration** | Public administrator registration endpoints are disabled. | 
| **Admin Account Creation** | Initial admin account creation occurs via seed scripts or controlled CLI operations. | 
| **Admin Authentication** | Dedicated, isolated login interface for administrative users. | 
| **Admin Authorization** | Every administrative API endpoint enforces role verification middleware. | 
| **Customer Isolation** | Strict resource-level security prevents access to cross-customer data. | 
| **Session Security** | Tokens/credentials protected using HTTP-only flags, secure transport (TLS), and proper expiration. | 
| **Audit Logging** | High-privilege administrative actions must generate immutable audit logs with timestamps and user IDs. | 
| **Callback Verification** | M-Pesa callbacks require signature and origin verification prior to processing. | 

## 7. Documentation Updates Required

### Update `docs/01-product-requirements.md`

Add a section titled **User Roles and Permissions** including:

1. System Actors

2. Guest Capabilities

3. Registered Customer Capabilities

4. Administrator Capabilities

5. M-Pesa Service Responsibilities

6. Permissions Matrix

7. Auth & Authorization Rules

8. Resource Ownership Enforcement

9. Administrative Security Policy

### Update `docs/02-technical-requirements.md`

Add explicit specifications for:

* RBAC implementation details.

* Least privilege middleware layer.

* Server-side ownership validation logic.

## 8. Completion Checklist

* \[ \] Documented all four system actors

* \[ \] Defined guest customer permissions

* \[ \] Defined registered customer permissions

* \[ \] Defined administrator permissions

* \[ \] Defined M-Pesa integration permissions

* \[ \] Created the permissions matrix

* \[ \] Documented RBAC and least privilege architecture

* \[ \] Documented customer resource ownership enforcement

* \[ \] Documented administrator security rules

## 9. Key Decisions Needed

Before closing Task 3, choose the administrator model for the MVP:

* \[ \] **Option 1: Single Administrator Role** *(Recommended for MVP)*

  * A single `Admin` role containing all approved store-management capabilities.

* \[ \] **Option 2: Granular Multi-Role Architecture**

  * Distinct roles such as `Super Admin`, `Inventory Manager`, and `Order Manager`.
stomer orders.

  * Inspect customer order data necessary for fulfillment.

  * Review payment verification statuses.

  * Process eligible order cancellations and refunds.

  * Update order fulfillment and delivery statuses.

  * Assign delivery fees and update delivery logistics.

* **Reporting & Analytics:**

  * Access sales metrics, order counts, pending orders, low-stock reports, and top-selling products.

* **Constraint:** Administrators must **never** manually mark an order as paid based solely on external proof (e.g., a customer screenshot). All payment confirmations must pass through the automated, verified payment mechanism.

### D. M-Pesa Payment Service

* **Responsibilities:**

  * Receive payment initiation requests from the backend.

  * Process transactions with the network.

  * Send payment results via configured webhook/callback mechanisms.

  * Provide transaction status querying for backend reconciliation.

* **Constraints:**

  * The backend must validate the callback payload signature, matching `order_id`, `amount`, `currency`, and `transaction_reference`.

  * Direct access to the application database is strictly prohibited.

## 5. Authorization Architecture Design

We adopt **Role-Based Access Control (RBAC)** alongside **Resource-Based Authorization**.

```
[ Incoming API Request ]
          │
          ▼
┌──────────────────┐
│ Authentication   │ ──(Verify identity)
└──────────────────┘
          │
          ▼
┌──────────────────┐
│ Role Checking    │ ──(Guest / Customer / Admin / Service)
└──────────────────┘
          │
          ▼
┌──────────────────┐
│ Ownership Check  │ ──(Does User ID match Resource Owner ID?)
└──────────────────┘
          │
          ▼
[ Execute Operation ]

```

### Core Architecture Principles

1. **Principle of Least Privilege:** Restrict every actor's permissions strictly to what is required for their defined role.

2. **Server-Side Enforcement:** Do not rely on UI logic (e.g., hiding buttons in React) for security. All operations must be validated on the backend/API level.

3. **Resource Ownership Validation:** Ensure that authenticated requests for user data explicitly match the authenticated identity.

## 6. Implementation Security Rules

| Security Area | System Requirement | 
| ----- | ----- | 
| **Admin Registration** | Public administrator registration endpoints are disabled. | 
| **Admin Account Creation** | Initial admin account creation occurs via seed scripts or controlled CLI operations. | 
| **Admin Authentication** | Dedicated, isolated login interface for administrative users. | 
| **Admin Authorization** | Every administrative API endpoint enforces role verification middleware. | 
| **Customer Isolation** | Strict resource-level security prevents access to cross-customer data. | 
| **Session Security** | Tokens/credentials protected using HTTP-only flags, secure transport (TLS), and proper expiration. | 
| **Audit Logging** | High-privilege administrative actions must generate immutable audit logs with timestamps and user IDs. | 
| **Callback Verification** | M-Pesa callbacks require signature and origin verification prior to processing. | 

## 7. Documentation Updates Required

### Update `docs/01-product-requirements.md`

Add a section titled **User Roles and Permissions** including:

1. System Actors

2. Guest Capabilities

3. Registered Customer Capabilities

4. Administrator Capabilities

5. M-Pesa Service Responsibilities

6. Permissions Matrix

7. Auth & Authorization Rules

8. Resource Ownership Enforcement

9. Administrative Security Policy

### Update `docs/02-technical-requirements.md`

Add explicit specifications for:

* RBAC implementation details.

* Least privilege middleware layer.

* Server-side ownership validation logic.

## 8. Completion Checklist

* \[ \] Documented all four system actors

* \[ \] Defined guest customer permissions

* \[ \] Defined registered customer permissions

* \[ \] Defined administrator permissions

* \[ \] Defined M-Pesa integration permissions

* \[ \] Created the permissions matrix

* \[ \] Documented RBAC and least privilege architecture

* \[ \] Documented customer resource ownership enforcement

* \[ \] Documented administrator security rules

## 9. Key Decisions Needed

Before closing Task 3, choose the administrator model for the MVP:

* \[ \] **Option 1: Single Administrator Role** *(Recommended for MVP)*

  * A single `Admin` role containing all approved store-management capabilities.

* \[ \] **Option 2: Granular Multi-Role Architecture**

  * Distinct roles such as `Super Admin`, `Inventory Manager`, and `Order Manager`.

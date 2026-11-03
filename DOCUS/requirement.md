# Task 1: Requirements Audit

## 1. Purpose

The Requirements Audit establishes and validates the functional requirements and business rules for the electronics e-commerce platform.

Its purpose is to ensure that the system addresses the needs of customers, administrators, and external services before implementation begins.

This document defines the approved Minimum Viable Product (MVP), future enhancements, missing requirements, and the business rules that govern important operations.

## 2. Product Overview

The project is a single-vendor electronics e-commerce platform designed for the Kenyan market.

The business owns and manages its inventory. Customers can browse products, add items to their carts, place orders, and pay through M-Pesa.

Administrators manage products, inventory, orders, payments, and deliveries through a separate administration dashboard.

### Target Market

- Primary market: Kenya.
- Currency: Kenyan Shilling (KES).
- Primary payment method: M-Pesa.
- Delivery management: Manually managed by the administrator.
- Business model: Single-vendor e-commerce.

## 3. Functional Requirements

### 3.1 MVP Features

The following features are essential for the first release.

| ID | Feature | Description |
|---|---|---|
| FR-01 | Product Catalog | Customers can browse available electronic products. |
| FR-02 | Product Details | Customers can view product descriptions, images, prices and specifications. |
| FR-03 | Search | Customers can search for products. |
| FR-04 | Filtering | Customers can filter products by relevant attributes such as category, brand and price. |
| FR-05 | Shopping Cart | Customers can add, update and remove products from their carts. |
| FR-06 | Checkout | Customers can submit orders using guest or registered checkout. |
| FR-07 | Customer Accounts | Customers can register, log in and manage basic account information. |
| FR-08 | M-Pesa Payments | Customers can initiate payments through M-Pesa. |
| FR-09 | Inventory Management | Administrators can manage product stock levels. |
| FR-10 | Order Management | Administrators can view and manage customer orders. |
| FR-11 | Admin Dashboard | Administrators can manage the store through a separate dashboard. |
| FR-12 | Delivery Management | Administrators can assign delivery fees and update delivery progress. |
| FR-13 | Basic Reporting | Administrators can view essential sales, order and inventory information. |
| FR-14 | Notifications | Customers receive important order and payment notifications. |

### 3.2 Phase 2 Features

These features are planned for implementation after the MVP.

- Product reviews and ratings.
- Customer wishlist.
- Discounts and promotional campaigns.

### 3.3 Future Enhancements

The following features are outside the initial MVP and Phase 2 scope.

- Advanced business analytics.
- Advanced sales forecasting.
- More sophisticated promotional tools.
- Additional payment providers.
- Automated delivery-provider integrations.

## 4. Additional Requirements Identified

The requirements audit identified several important requirements that must be addressed even though they may not have appeared in the original feature list.

### 4.1 Customer Accounts and Guest Checkout

The platform must support both registered customers and guest customers.

Registered customers must be able to:

- Register using an email address and password.
- Verify their email address.
- Log in and log out.
- View their order history.
- Manage basic profile information.

Guest customers must be able to:

- Browse products.
- Add products to a cart.
- Complete checkout without creating an account.
- Provide their contact and delivery information.
- Access their order information through a secure mechanism.

### 4.2 Payment Integration

M-Pesa is the only payment provider included in the MVP.

The system must:

- Initiate payment requests through the backend.
- Associate each payment with the correct order.
- Verify payment results through trusted M-Pesa communication.
- Record successful and unsuccessful transactions.
- Prevent duplicate payment processing.
- Support payment reconciliation when callbacks are delayed or missed.

### 4.3 Inventory and Stock Management

The system must prevent customers from purchasing unavailable stock.

It must support:

- Product stock quantities.
- Stock availability checks.
- Temporary stock reservations during checkout.
- Stock deduction after successful payment.
- Release of reservations after failed, cancelled or expired payments.
- Protection against overselling when multiple customers attempt to purchase the same stock.

### 4.4 Delivery Management

Delivery is manually managed by the administrator during the MVP.

The system must support:

- Customer delivery details.
- Administrator assignment of delivery fees.
- Displaying the delivery fee before payment.
- Updating delivery progress.
- Recording delivery completion.

### 4.5 Product Information

Products must support:

- Unique product identifiers.
- Product names.
- Descriptions.
- Prices in KES.
- Categories.
- Multiple product images.
- Stock quantities.
- Product specifications.

Gadget-specific specifications may include:

- Brand.
- Model.
- Storage capacity.
- RAM.
- Warranty information.

## 5. Approved Business Rules

These rules define how the platform must behave during normal operations and exceptional situations.

### 5.1 Customer Registration and Authentication

1. Customers register using an email address and password.
2. Email addresses must be unique.
3. Customers must verify their email addresses before accessing account-sensitive features.
4. Guest checkout must remain available.
5. Customer phone numbers must be collected during checkout for M-Pesa and delivery communication.
6. Passwords must never be stored in plaintext.

### 5.2 Shopping Cart and Stock Reservation

1. Customers may add available products to their carts.
2. Cart prices and quantities are not trusted as final checkout values.
3. The backend must retrieve current product prices and verify stock availability during checkout.
4. The system must reserve stock temporarily for 15 minutes during checkout.
5. Stock must be deducted from available inventory after successful payment.
6. Reservations must be released when payment fails, is cancelled or expires.
7. Concurrent checkout attempts must not reserve more stock than is available.
8. The system must safely handle delayed payment confirmations after a reservation expires.

### 5.3 Guest Order Access

1. Guest customers must be able to access their order information after checkout.
2. Guest order access must use a secure, unpredictable access token or link.
3. Sequential order IDs must not be treated as authorization credentials.
4. Sensitive order information must require appropriate verification.
5. Customers must not be able to access another customer's order information.

### 5.4 Delivery Fees

1. Delivery fees are assigned manually by the administrator.
2. The delivery fee must be displayed to the customer before payment.
3. The delivery fee must be included in the final checkout total.
4. Any change to the delivery fee after payment requires explicit customer agreement and an appropriate payment adjustment.

### 5.5 Order Cancellation

1. Unpaid orders must be automatically cancelled after the payment period expires.
2. Customers may request cancellation of paid orders that have not been dispatched.
3. Cancellation requests for orders being processed or ready for dispatch require administrator review.
4. Dispatched and delivered orders must follow a future returns and refund policy.
5. Approved cancellations must trigger the necessary inventory and payment adjustments.
6. Cancellation must be recorded so that the order history remains traceable.

### 5.6 Payment Processing

1. M-Pesa is the only payment method in the MVP.
2. Payment requests must be initiated through the backend.
3. A payment must not be marked as successful merely because the customer reports success.
4. Successful payment status must be based on trusted M-Pesa confirmation and additional status verification where necessary.
5. The system must verify the payment amount, order association and transaction reference.
6. Duplicate payment callbacks must not cause duplicate order processing or inventory deductions.
7. Failed and expired payments must be recorded.
8. Refunds must be recorded as separate financial operations.
9. Delayed payment confirmations must be reconciled safely, especially when the original stock reservation has expired.

### 5.7 Notifications

The system must send email notifications for important events, including:

- Order confirmation.
- Successful payment.
- Failed payment.
- Payment expiry.
- Order dispatch.
- Delivery completion.
- Order cancellation.

### 5.8 Product Management

1. Every product must have a unique identifier.
2. Product prices must be stored and processed in KES.
3. The backend must calculate all order totals.
4. Inactive products must not be purchasable.
5. Products with insufficient available stock must not be purchasable.
6. Product information must support multiple images and relevant technical specifications.

## 6. Order and Payment Lifecycle Rules

Order fulfilment and payment processing must be treated as separate processes.

### 6.1 Payment Statuses

| Status | Meaning |
|---|---|
| Pending | Payment has been initiated but not confirmed. |
| Paid | Payment has been successfully verified. |
| Failed | Payment attempt was unsuccessful. |
| Cancelled | Payment attempt was cancelled. |
| Refunded | A refund has been completed and recorded. |

### 6.2 Order Fulfilment Statuses

| Status | Meaning |
|---|---|
| Awaiting Payment | Order is waiting for successful payment. |
| Processing | Payment has been confirmed and the order is being prepared. |
| Ready for Dispatch | Order preparation is complete. |
| Dispatched | Order has been handed over for delivery. |
| Delivered | Customer has received the order. |
| Cancelled | Order fulfilment has been cancelled. |

### 6.3 Lifecycle Rules

- An unpaid order must not enter normal fulfilment.
- A successful payment must be verified before an order moves into processing.
- Payment status and fulfilment status must be updated independently.
- A payment failure must not be treated as a completed order.
- Payment reconciliation must account for delayed and duplicate notifications.

## 7. Business Scope

### Included in MVP

- Product catalog and discovery.
- Shopping cart.
- Guest and registered checkout.
- Customer registration and authentication.
- M-Pesa payments.
- Stock reservations and inventory management.
- Order management.
- Manual delivery management.
- Administrator dashboard.
- Email notifications.
- Basic reporting.

### Excluded from MVP

- Multiple vendors or marketplace functionality.
- Multiple payment providers.
- Automated courier integrations.
- Advanced analytics.
- Customer reviews and ratings.
- Wishlist.
- Promotional campaigns.

## 8. Requirements Validation Checklist

- [ ] MVP features have been documented.
- [ ] Phase 2 and future features have been separated from MVP scope.
- [ ] Guest and registered checkout requirements are defined.
- [ ] M-Pesa payment requirements are documented.
- [ ] Stock reservation and overselling prevention rules are defined.
- [ ] Guest order access requirements are documented.
- [ ] Delivery fee rules are documented.
- [ ] Order cancellation rules are documented.
- [ ] Payment and fulfilment lifecycles are separated.
- [ ] Product information requirements are documented.
- [ ] Notification requirements are documented.
- [ ] Exceptional payment scenarios are considered.

## 9. Completion Criteria

Task 1 is complete when:

1. The functional requirements have been reviewed and approved.
2. The MVP scope is clearly defined.
3. The business rules are documented.
4. Important exceptional scenarios have been considered.
5. The requirements are consistent with the overall project objectives.

## 10. Document Status

**Task:** Phase 2 — Task 1: Requirements Audit  
**Status:** Requirements decisions finalized; documentation review and repository update pending.  
**Document location:** `docs/requirements-audit.md`
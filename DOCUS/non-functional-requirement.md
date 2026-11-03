# Task 2: Non-Functional Requirements

## 1. Purpose

Non-functional requirements (NFRs) define how well the system must operate rather than what features it provides.

They establish measurable expectations for performance, security, availability, reliability, scalability, maintainability and data protection.

This document defines the quality standards that will guide the design, implementation, testing and deployment of the electronics e-commerce platform.

## 2. System Quality Objectives

The platform must:

- Provide a responsive and reliable shopping experience.
- Protect customer accounts and personal information.
- Process payments securely and accurately.
- Maintain consistent inventory and order records.
- Support future growth in customers, products and transactions.
- Remain maintainable and easy to extend.
- Recover from failures without unnecessary data loss.
- Provide a consistent experience across the storefront and admin dashboard.

## 3. Performance Requirements

### NFR-01: API Response Time

Ordinary API requests should achieve a 95th percentile response time (p95) of 500 milliseconds or less under an agreed test workload.

This target excludes operations that naturally depend on external services, such as waiting for an M-Pesa payment response or sending an email.

### NFR-02: Frontend Performance

The storefront should aim to meet Google's Core Web Vitals good thresholds:

| Metric | Target | Description |
|---|---:|---|
| LCP | ≤ 2.5 seconds | Measures loading performance. |
| INP | ≤ 200 milliseconds | Measures interaction responsiveness. |
| CLS | ≤ 0.1 | Measures visual layout stability. |

These targets should be evaluated using representative devices, network conditions and real-user measurements when available.

### NFR-03: Efficient Resource Usage

The application should:

- Optimize product images.
- Load images efficiently.
- Avoid unnecessary API requests.
- Use pagination for large datasets.
- Avoid loading the entire product catalog at once.
- Use appropriate database indexes.
- Minimize unnecessary frontend rendering and processing.

## 4. Security Requirements

Security is a priority from the beginning of development.

### NFR-04: Secure Communication

All production communication between clients and the backend must use HTTPS.

### NFR-05: Password Protection

- Passwords must never be stored in plaintext.
- Passwords must be hashed using a suitable password-hashing algorithm.
- Argon2id is preferred; bcrypt is an acceptable alternative when configured appropriately.
- Authentication credentials must not be exposed in logs or API responses.

### NFR-06: Authentication and Authorization

- Protected operations must require authentication.
- The backend must enforce authorization independently of frontend visibility.
- Customer accounts must only access their own protected information.
- Administrator operations must require administrator authorization.
- The system must follow role-based access control and least-privilege principles.
- Access must be denied by default when authorization cannot be established.

### NFR-07: Input Validation

- All incoming data must be validated on the backend.
- Invalid data must be rejected with appropriate error responses.
- The application must protect against common injection and input-manipulation attacks.
- The frontend may validate input for usability, but backend validation remains authoritative.

### NFR-08: Secret Management

- Database credentials, M-Pesa credentials, email credentials and other secrets must remain on the backend.
- Secrets must be stored in secure environment configuration or an appropriate secrets manager.
- Secrets must never be committed to Git.
- Frontend environment variables must not contain private credentials.

### NFR-09: Rate Limiting

Rate limiting must protect sensitive endpoints, especially:

- Login.
- Registration.
- Password recovery.
- Email verification.
- Payment initiation.
- Other sensitive operations exposed to repeated requests.

### NFR-10: Payment Security

- Payment callbacks must be authenticated or independently verified.
- Payment amounts and transaction references must be checked against the relevant order.
- A customer must not be able to mark an order as paid.
- Duplicate callbacks must not cause duplicate payment processing.
- Payment reconciliation must use trusted provider verification.

### NFR-11: Customer Data Privacy

- Customers must only access their own protected account and order information.
- Guest order access must use secure, unpredictable access credentials and appropriate verification.
- Sensitive customer information must not be unnecessarily exposed through API responses.
- Personal information must only be collected and used for legitimate platform operations.

## 5. Reliability and Data Consistency

### NFR-12: Database Transactions

Critical operations must maintain database consistency through appropriate transactions.

These include:

- Order creation.
- Stock reservation.
- Inventory deduction.
- Payment record updates.
- Order status transitions.
- Cancellation and related inventory adjustments.

### NFR-13: Inventory Consistency

- The system must prevent overselling.
- Concurrent purchase attempts must be handled safely.
- Stock reservations must expire according to the approved 15-minute reservation rule.
- Inventory changes must be recorded accurately.
- A delayed payment confirmation must be reconciled before fulfilment proceeds.

### NFR-14: Payment Idempotency

Payment processing must be idempotent.

Processing the same trusted payment callback or event multiple times must not create duplicate financial records, inventory deductions or order transitions.

### NFR-15: Payment Reconciliation

The system must support reconciliation when:

- A payment callback is delayed.
- A payment callback is missed.
- A payment result is uncertain.
- A payment is confirmed after the stock reservation expires.
- A duplicate callback is received.

Reconciliation must verify the payment with the payment provider rather than allowing an administrator to manually declare an unverified payment successful.

## 6. Availability and Recovery

### NFR-16: System Availability

The production platform should target **99.5% monthly availability**.

This target allows approximately 3.65 hours of downtime in an average 30-day month.

Availability measurement must define which services and planned maintenance periods are included.

### NFR-17: Database Backups

- The production database must have daily backups.
- Backup availability and retention must be verified with the selected database provider.
- Backup procedures must be documented.
- Backups must be protected from unauthorized access.

### NFR-18: Restoration Testing

Database restoration must be tested periodically.

A successful backup process is not sufficient unless the team can demonstrate that the data can actually be restored.

### NFR-19: Recovery Objectives

The following are proposed recovery targets, subject to confirmation against the selected database provider's backup and recovery capabilities:

| Metric | Proposed Target | Meaning |
|---|---|---|
| RPO | ≤ 24 hours | Maximum acceptable amount of data loss measured in time. |
| RTO | ≤ 4 hours | Target time to restore service after a major failure. |

The final targets must be confirmed after evaluating the database provider's recovery features and the deployment architecture.

## 7. Scalability Requirements

### NFR-20: Application Architecture

The backend must use a modular monolith architecture.

The system should have clearly separated business modules while avoiding the operational complexity of microservices during the initial development stages.

### NFR-21: Horizontal Scaling

The backend should be designed to support multiple application instances.

To enable this:

- Application instances should be stateless where practical.
- Shared state must be stored in appropriate external services.
- Session management must support multiple instances.
- Background jobs must be handled through a suitable shared processing mechanism when introduced.

### NFR-22: Database Scalability

The database design should support increasing product, customer, order and transaction volumes.

The application should use:

- Appropriate database indexes.
- Efficient queries.
- Pagination.
- Database connection management.
- Transactions for critical operations.

### NFR-23: Caching Strategy

Caching may be introduced where it improves performance.

Potential candidates include:

- Product catalog data.
- Product categories.
- Static content.
- Frequently accessed public information.

Final payment status, inventory availability and other critical transactional information must not rely on stale cache values as their source of truth.

PostgreSQL remains the authoritative source for transactional data.

### NFR-24: Background Processing

Time-consuming or retryable tasks should be moved to background processing when justified.

Examples include:

- Email notifications.
- Image processing.
- Payment reconciliation.
- Expired stock reservation cleanup.
- Other scheduled maintenance tasks.

Background processing must account for retries, duplicate execution and failure handling.

## 8. Maintainability and Testability

### NFR-25: Modular Design

The application must separate responsibilities into appropriate modules and layers.

The architecture should make it possible to modify one business area without unnecessarily affecting unrelated areas.

### NFR-26: Automated Testing

Automated tests must cover critical business operations, especially:

- Authentication and authorization.
- Product and inventory operations.
- Cart and checkout.
- Stock reservation and expiration.
- Order creation and status transitions.
- Payment verification and duplicate callbacks.
- Customer data ownership.

### NFR-27: API Documentation

The backend API must have documented endpoints, request expectations, response formats and error responses.

OpenAPI documentation is the preferred approach.

### NFR-28: Operational Documentation

The project must document:

- Development environment setup.
- Environment variables required by each application.
- Database configuration.
- Testing procedures.
- Deployment procedures.
- Backup and recovery procedures.
- Important architectural decisions.

## 9. Technology and Architecture Constraints

The approved technical direction is:

| Area | Selected Technology |
|---|---|
| Storefront | React + Vite |
| Admin Dashboard | React + Vite |
| Backend | Node.js + Express |
| Backend Module System | ES Modules |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Validation | Zod |
| API Style | REST |
| API Versioning | `/api/v1` |
| Frontend Routing | React Router |
| Unit/Component Testing | Vitest + React Testing Library |
| End-to-End Testing | Playwright |
| API Testing | Postman or Bruno |

The architecture must begin as a modular monolith and allow appropriate scaling without requiring an immediate move to microservices.

## 10. NFR Summary Register

| ID | Category | Requirement | Priority |
|---|---|---|---|
| NFR-01 | Performance | API p95 ≤ 500 ms under agreed test load | High |
| NFR-02 | Performance | Meet Core Web Vitals good thresholds | High |
| NFR-03 | Performance | Efficient images, requests and database queries | High |
| NFR-04 | Security | HTTPS in production | Critical |
| NFR-05 | Security | Secure password hashing | Critical |
| NFR-06 | Security | Backend authentication and authorization | Critical |
| NFR-07 | Security | Backend input validation | Critical |
| NFR-08 | Security | Secure secret management | Critical |
| NFR-09 | Security | Rate limiting on sensitive endpoints | High |
| NFR-10 | Security | Trusted payment verification | Critical |
| NFR-11 | Privacy | Customer data protection | Critical |
| NFR-12 | Reliability | Database transactions for critical operations | Critical |
| NFR-13 | Reliability | Inventory consistency | Critical |
| NFR-14 | Reliability | Idempotent payment processing | Critical |
| NFR-15 | Reliability | Payment reconciliation | Critical |
| NFR-16 | Availability | 99.5% monthly availability target | High |
| NFR-17 | Recovery | Daily database backups | Critical |
| NFR-18 | Recovery | Periodic restoration testing | High |
| NFR-19 | Recovery | Proposed RPO ≤ 24h and RTO ≤ 4h | To be confirmed |
| NFR-20 | Scalability | Modular monolith architecture | High |
| NFR-21 | Scalability | Support multiple stateless backend instances | High |
| NFR-22 | Scalability | Efficient database design | High |
| NFR-23 | Scalability | Appropriate caching strategy | Medium |
| NFR-24 | Scalability | Background processing for suitable tasks | Medium |
| NFR-25 | Maintainability | Modular design and separation of concerns | High |
| NFR-26 | Testability | Automated tests for critical operations | High |
| NFR-27 | Documentation | Documented API contract | High |
| NFR-28 | Documentation | Documented setup and operations | High |

## 11. Verification and Measurement

Non-functional requirements must be verified rather than treated as assumptions.

| Area | Verification Approach |
|---|---|
| API performance | Load testing and response-time monitoring |
| Frontend performance | Lighthouse and real-user Core Web Vitals |
| Security | Authentication, authorization and input-validation tests |
| Payment reliability | Simulated callbacks, duplicates and delayed confirmations |
| Inventory consistency | Concurrent checkout tests |
| Availability | Production uptime monitoring |
| Backup and recovery | Scheduled restoration exercises |
| Scalability | Load tests and multiple-instance deployment tests |
| Maintainability | Code reviews and module-boundary checks |

## 12. Completion Checklist

- [ ] Performance targets are documented.
- [ ] Security requirements are documented.
- [ ] Customer privacy requirements are documented.
- [ ] Reliability and consistency requirements are documented.
- [ ] Availability target is documented.
- [ ] Backup and restoration requirements are documented.
- [ ] Recovery objectives are confirmed or explicitly marked pending.
- [ ] Scalability requirements are documented.
- [ ] Maintainability and testing requirements are documented.
- [ ] Technology constraints match the approved architecture.
- [ ] Every NFR has a suitable verification approach.

## 13. Completion Criteria

Task 2 is complete when:

1. The quality expectations of the platform are documented.
2. Critical requirements are measurable.
3. Security and reliability requirements are clearly defined.
4. Scalability expectations match the modular monolith architecture.
5. Each important requirement has a verification approach.
6. Unconfirmed recovery targets are not presented as guaranteed capabilities.

## 14. Document Status

**Task:** Phase 2 — Task 2: Non-Functional Requirements  
**Status:** Requirements decisions established; documentation review and repository update pending.  
**Document location:** `docs/non-functional-requirements.md`
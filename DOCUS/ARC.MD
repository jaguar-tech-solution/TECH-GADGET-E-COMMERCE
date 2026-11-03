## STEP 1 . PROJECT FOUNCATION AND ENVIROMENT SETUP


## STEP 2 . DETEMINING BUILING STEPS

 # Backend first

The backend establishes the business rules and API contracts that both frontend applications depend on.
1. Application configuration and environment management.
2. Database connection and data access foundation.
3. Authentication and authorization.
4. Product and category management.
5. Inventory management.
6. Cart and checkout.
7. Orders and payments.
8. Delivery and reporting.

# Admin dashboard

Build the operational interface using the backend capabilities already established.
1. Admin authentication.
2. Dashboard layout and navigation.
3. Product management.
4. Inventory management.
5. Order management.
6. Basic reporting.

# Customer storefront
1. Storefront layout and navigation.
2. Product catalog and product details.
3. Search and filtering.
4. Shopping cart.
5. Customer registration and login.
6. Guest and registered checkout.
7. Order history and tracking.

# Integration and release

Connect M-Pesa, verify payment notifications, test the complete purchasing journey, and prepare the system for deployment.

NB: I didn't build enter backend first , I build in small and test in small vertical slices: one capability at a time, from database through API to user interface.

## My working arrangement
# For every development task, I will have:
- Objective: What I am  trying to achieve.
- Concepts: What I  need to understand first.
- Tasks: What I  should implement.
- Expected outcome: What the completed work should accomplish.
- Testing: How to verify it.

## Defining application responsibilities

# Storefront
	Customer-facing experience	
# Admin	
    Manage products, inventory and orders	
# Backend	
      Business logic, validation and database access


  I am separating admin application because the administrative experience has different users, permissions, navigation and operational requirements from the customer storefront.


  ## System Architecture & Application Boundaries

### Application Responsibilities

To ensure a clear separation of concerns, maintain security, and isolate business logic, each application in the stack is assigned strict operational boundaries:

| Application | Core Responsibility | Must Not Do |
| --- | --- | --- |
| **Storefront** | Customer-facing user experience, product browsing, and order placement | Connect directly to the PostgreSQL database |
| **Admin** | Managing products, inventory, customer accounts, and orders | Bypass backend authorization rules or API security layers |
| **API** | Encapsulates business logic, data validation, and database operations | Depend on frontend presentation logic or UI frameworks |

#### Architectural Rationale: Admin Separation

The administrative experience is intentionally separated into its own application because it caters to entirely different user personas, permissions, navigation structures, and operational workflows than the customer-facing storefront. For instance, a retail customer inspecting the storefront must never have access to internal stock adjustment endpoints or inventory management tools.

---

## Local Development Configuration

### Development Addresses & Ports

For local development, each application runs on a dedicated port to enable concurrent execution and independent testing.

| Application | Local Address | Port |
| --- | --- | --- |
| **Storefront** | `http://localhost:5173` | `5173` |
| **Admin** | `http://localhost:5174` | `5173` |
| **Backend API** | `http://localhost:3780` | `5600` |

> **Note:** These ports are restricted to local development environments and do not represent production infrastructure.

#### Architectural Rationale: Isolated Port Allocation

* **Simultaneous Execution:** Enables developers to run and test all three services concurrently without port conflicts.
* **Independent Frontend Tooling:** Allows the Storefront and Admin dashboards to utilize separate frontend development server instances.
* **API Autonomy:** Facilitates isolated backend testing and accurate monitoring of cross-origin network requests (CORS) between frontends and the API.

#### Production Deployment Considerations

In production, these applications will be deployed under isolated top-level domains or subdomains (for example, `shop.example.com`, `admin.example.com`, and `api.example.com`). The exact production domains will be finalized prior to deployment.


## Environment Configuration & Security Boundaries

Environment configuration separates application logic from deployment settings across different execution stages:

| Environment | Purpose | Target Execution Context |
| --- | --- | --- |
| **Development** | Local engineering and feature iteration | Local workstation (`localhost`) |
| **Testing** | Automated CI/CD pipelines, unit testing, and integration verification | Isolated test runners and staging environments |
| **Production** | Live deployment serving end users | Multi-region production infrastructure |

---

### Security Boundaries & Variable Exposure

To prevent security vulnerabilities, application configuration is split strictly between **server-side secrets** and **public client exposure**:

* **Backend Secrets (Server-Side Only):** Database connection strings, API private keys, authentication secrets, and payment integration credentials (e.g., M-Pesa secrets). These must never be exposed to client-side bundles or HTTP responses.
* **Frontend Configuration (Public/Browser Exposed):** Public API base URLs and feature flags. **Note:** Any variable injected or exposed to a browser bundle is public, regardless of whether it originates from an `.env` file.

---

### Application Configuration Matrix

The following specification details the required configuration parameters per application. **No concrete credentials or keys are included here.**

```
├── Storefront (.env)       --> Public Client Config
├── Admin (.env)            --> Public Client Config
└── Backend API (.env)      --> Server-Side Secrets & Infrastructure Config

```

#### 1. Storefront Application (Customer Facing)

*Scope: Public Client Configuration*

* `VITE_API_BASE_URL` — Public HTTP base URL for the API backend (e.g., `http://localhost:3780` in Dev).
* `VITE_APP_ENV` — Active application environment (`development` | `testing` | `production`).
* `VITE_PUBLIC_ANALYTICS_ID` — Client-side analytics identifier (if applicable).

#### 2. Admin Application (Internal Management)

*Scope: Public Client Configuration*

* `VITE_API_BASE_URL` — Public HTTP base URL for the API backend (e.g., `http://localhost:3780` in Dev).
* `VITE_APP_ENV` — Active application environment (`development` | `testing` | `production`).

#### 3. Backend API Application (Business Engine)

*Scope: Server-Side Secrets & Core Infrastructure Settings*

* **Database & Persistence:**
* `DATABASE_URL` — PostgreSQL connection string.
* `DB_POOL_MIN` / `DB_POOL_MAX` — Connection pool sizing bounds.


* **Authentication & Authorization:**
* `JWT_SECRET` — Symmetric key for signing session tokens.
* `JWT_EXPIRES_IN` — Token lifespan duration.


* **Payment Gateways (M-Pesa Integration):**
* `MPESA_CONSUMER_KEY` — API application key.
* `MPESA_CONSUMER_SECRET` — API application secret key.
* `MPESA_PASSKEY` — Online transaction passkey for STK Push.
* `MPESA_SHORTCODE` — Paybill / Till number.
* `MPESA_ENV` — Gateway environment (`sandbox` | `production`).


* **Server Runtime:**
* `PORT` — Server listener port (`3780` in local Dev).
* `CORS_ALLOWED_ORIGINS` — Comma-separated list of permitted frontend origins (`http://localhost:5173,http://localhost:5174`).


## Cross-Origin Communication (CORS) Plan

When applications run on different ports or domains, browsers enforce cross-origin security rules to prevent unauthorized cross-domain access.

---

### Key CORS Concepts

* **What is an Origin?**
An origin is defined by the combination of **Scheme (Protocol) + Hostname + Port**.
* `http://localhost:5173` (Storefront)
* `http://localhost:5174` (Admin)
* `http://localhost:3780` (Backend API)


Because the ports differ, the browser treats each as a distinct origin.
* **Why CORS Exists:**
The Same-Origin Policy (SOP) built into browsers restricts scripts on one origin from accessing data on another. CORS is the browser-supported mechanism that lets the server explicitly declare which foreign origins are trusted to read its resources via HTTP headers (such as `Access-Control-Allow-Origin`).
* **Allowed Origins:**
Allowed origins are the specific list of origins that the API server trusts to receive its responses. The backend inspects the client's `Origin` header and responds with matching CORS headers if permitted.
* **CORS vs. Authentication & Authorization:**
* **CORS is a browser-enforced boundary**, not an API access control mechanism. It prevents a malicious website loaded in a user's browser from making unauthorized requests to your API using that user's browser context.
* **CORS does not stop non-browser clients** (such as cURL, Postman, mobile apps, or server-side scripts) from reaching your endpoints.
* **Authentication** (verifying *who* is calling) and **Authorization** (verifying *what* they can do) must always be enforced on the server for every incoming request.



---

### Environment-Based CORS Allowed Origins Matrix

| Application Origin | Development URL | Permitted API Requests | Notes |
| --- | --- | --- | --- |
| **Storefront** | `http://localhost:5173` | Allowed | Public shopping operations & customer auth |
| **Admin** | `http://localhost:5174` | Allowed | Administrative operations & internal auth |
| **Backend API** | `http://localhost:3780` | Self / Internal | Hosts endpoints and validates origins |

---

### Express.js CORS Configuration Design

When initializing the Express backend, CORS will be configured dynamically via environment configuration:

```javascript
// Express CORS Configuration Blueprint
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, server-to-server, cURL)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS policy.`));
    }
  },
  credentials: true, // Allow cookies/authorization headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

```

---

### Cookie Security Attributes Overview

* **`HttpOnly: true`**
Prevents client-side scripts (JavaScript via `document.cookie`) from reading the cookie. This mitigates Cross-Site Scripting (XSS) attacks by keeping session tokens invisible to frontend scripts.
* **`SameSite` Attribute**
Controls whether cookies are sent along with cross-site HTTP requests:
* **`Strict`**: Cookies are only sent in a first-site context. Cross-origin API calls will omit the cookie entirely.
* **`Lax`**: Cookies are withheld on cross-origin subrequests (like `fetch` or `axios`), but sent when a user navigates to the origin.
* **`None`**: Cookies are sent on all cross-origin requests (e.g., from `localhost:5173` to `localhost:3780`), **requiring `Secure: true**`.


* **`Secure: true`**
Ensures cookies are only transmitted over encrypted HTTPS connections. **Exception:** Modern browsers allow `Secure` cookies over unencrypted `http://localhost` for local development.

---

### Express.js Implementation (Backend API)

When handling cross-origin auth requests from both the Storefront and Admin frontends, set your session/JWT cookie with these attributes:

```javascript
// Express auth login controller example
res.cookie('session_token', token, {
  httpOnly: true,                                    // Protect against XSS
  secure: process.env.NODE_ENV === 'production',       // HTTPS only (false in local HTTP dev if needed)
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site prod subdomains
  maxAge: 24 * 60 * 60 * 1000,                       // 1 day expiration
  path: '/',
});

```

---

### Frontend Client Requirements (Storefront & Admin)

By default, browser HTTP client libraries (`fetch` or `axios`) do **not** send or receive cookies on cross-origin requests unless explicitly configured to include credentials.

#### 1. Native `fetch` API Configuration

Include `credentials: 'include'` on all backend API calls:

```javascript
const response = await fetch('http://localhost:3780/api/v1/auth/me', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Required to transmit HttpOnly cross-origin cookies
});

```

#### 2. Axios Global Instance Configuration

Set `withCredentials = true` on your API client configuration:

```javascript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // http://localhost:3780
  withCredentials: true,                        // Sends HttpOnly cookies with every request
});

```

---

### Key Requirements Checklist for Cross-Origin Cookies

1. **CORS Headers:** The API response MUST include `Access-Control-Allow-Credentials: true`.
2. **Explicit Origins:** `Access-Control-Allow-Origin` CANNOT be set to wildcard `*`. It must explicitly match `http://localhost:5173` or `http://localhost:5174`.
3. **SameSite=None Requirement:** If your API is on a different root domain in production, `SameSite=None` MUST be paired with `Secure=true`.



Here are the step-by-step instructions to set up, configure, and verify the `apps/api` Node.js application running Express with ES modules.

1. **Prepare Directory & Initialize Node Project:** Run from workspace root.
Create the target directory, clean existing contents, and initialize a standard `package.json`.

```bash
# Create and clean the API directory
mkdir -p apps/api
rm -rf apps/api/*

# Navigate to directory and initialize package
cd apps/api
npm init -y

```


2. **Configure ES Modules, Dependencies & Scripts:** Edit apps/api/package.json.
Update `apps/api/package.json` to set `"type": "module"` and install Express along with runtime tools.

```bash
# Install Express and environment variable handler
npm install express dotenv cors

# Install Nodemon for automatic dev server reloads
npm install -D nodemon

```

Modify `package.json` to include `"type": "module"` and your development scripts:

```json
{
  "name": "api",
  "version": "1.0.0",
  "type": "module",
  "main": "src/index.js",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js"
  }
}

```


3. **Define Environment Configuration:** Create apps/api/.env.
Create an `.env` file inside `apps/api` to specify the local port and client CORS origins.

```env
PORT=3780
NODE_ENV=development
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

```


4. **Create Express Server & Health-Check Endpoint:** Create apps/api/src/index.js.
Create the entry point file `src/index.js` with CORS configuration, JSON parsing, and the health-check route.

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3780;

// CORS configuration for storefront (5173) and admin (5174)
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});

```


5. **Start Development Server & Verify:** Run inside apps/api.
Launch the server in watch mode using Nodemon:

```bash
npm run dev

```

Test the health-check endpoint in your browser or terminal:

```bash
curl http://localhost:3780/api/health

```

**Expected Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-11-02T16:49:00.000Z",
  "environment": "development"
}

```



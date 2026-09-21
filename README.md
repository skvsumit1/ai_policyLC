# Dental Insurance Policy, Billing & Claims Management System

A testing-focused Node.js + vanilla JS application for managing dental insurance policies, billing invoices, and claims. Uses local JSON files as the data store.

## Stack

- **Backend:** Node.js + Express
- **Frontend:** Vanilla JS + Bootstrap 5
- **Data:** Local JSON files (no database required)

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Start the server

```bash
npm start
```

Or with auto-reload (dev mode):

```bash
npm run dev
```

### 3. Open in browser

```
http://localhost:3000
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@dentalco.com` | `admin123` |
| Underwriter | `mark.underwriter@dentalco.com` | `mark123` |
| Policyholder (James) | `james.carter@email.com` | `james123` |
| Policyholder (Linda) | `linda.park@email.com` | `linda123` |

---

## Views

| URL | Description |
|---|---|
| `/` | Landing page |
| `/login.html` | Login screen (auto-redirects based on role) |
| `/dashboard.html` | Policyholder view — policy status, billing, claims |
| `/admin.html` | Admin/Underwriter view — manage all policies, claims, invoices |

---

## API Endpoints

Authentication uses a simple `x-user-id` header (set automatically by the frontend after login).

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login with email + password |
| `GET` | `/api/auth/me` | Get current user profile |
| `GET` | `/api/auth/users` | List all users (admin only) |

### Policies
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/policies` | Get all policies |
| `GET` | `/api/policies/:id` | Get policy by ID |
| `GET` | `/api/policies/holder/:userId` | Get policies for a policyholder |
| `POST` | `/api/policies` | Create a new policy (admin/underwriter) |
| `PATCH` | `/api/policies/:id/status` | Change policy status |
| `PUT` | `/api/policies/:id` | Update policy fields |
| `DELETE` | `/api/policies/:id` | Delete a policy (admin) |

### Billing
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/billing` | Get all invoices |
| `GET` | `/api/billing/summary` | Billing summary stats (admin/underwriter) |
| `GET` | `/api/billing/holder/:userId` | Invoices for a policyholder |
| `GET` | `/api/billing/policy/:policyId` | Invoices for a policy |
| `POST` | `/api/billing` | Create an invoice (admin/underwriter) |
| `PATCH` | `/api/billing/:id/status` | Update invoice status (Paid/Overdue) |

### Claims
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/claims` | Get all claims |
| `GET` | `/api/claims/summary` | Claims summary stats (admin/underwriter) |
| `GET` | `/api/claims/holder/:userId` | Claims for a policyholder |
| `GET` | `/api/claims/policy/:policyId` | Claims for a policy |
| `POST` | `/api/claims` | Submit a new claim |
| `PATCH` | `/api/claims/:id/adjudicate` | Approve/Deny/Review a claim (admin/underwriter) |

---

## Project Structure

```
policy_prj/
├── server.js                  # Express app entry point
├── package.json
├── README.md
├── data/                      # JSON flat-file data store
│   ├── users.json
│   ├── policies.json
│   ├── invoices.json
│   └── claims.json
├── routes/                    # Express route definitions
│   ├── authRoutes.js
│   ├── policyRoutes.js
│   ├── billingRoutes.js
│   └── claimRoutes.js
├── controllers/               # Business logic handlers
│   ├── authController.js
│   ├── policyController.js
│   ├── billingController.js
│   └── claimController.js
├── models/                    # Schema factories + validation
│   ├── userModel.js
│   ├── policyModel.js
│   ├── invoiceModel.js
│   └── claimModel.js
├── middleware/
│   ├── authMiddleware.js      # x-user-id auth + role guards
│   └── errorHandler.js
├── utils/
│   └── fileStore.js           # CRUD helpers for JSON files
└── public/                    # Static frontend
    ├── index.html             # Landing page
    ├── login.html
    ├── dashboard.html         # Policyholder view
    ├── admin.html             # Admin/Underwriter view
    ├── css/style.css
    └── js/app.js              # Shared API client + helpers
```

---

## Seed Data Overview

| Entity | Records |
|---|---|
| Users | 4 (1 admin, 1 underwriter, 2 policyholders) |
| Policies | 3 (Active / Lapsed / Draft) |
| Invoices | 4 (Paid / Unpaid / Overdue) |
| Claims | 4 (Approved / Submitted / Denied / Under_Review) |

---

## Key Testing Scenarios

1. **Claim on Active Policy** — Submit a claim for `pol-001` (Active). Should succeed.
2. **Claim on Lapsed Policy** — Submit a claim for `pol-002` (Lapsed). Should be rejected with a clear error.
3. **Adjudicate a Claim** — Login as admin, go to Admin > Claims tab, adjudicate `CLM-2024-002`. Verify coinsurance math.
4. **Policy Status Transition** — Activate `pol-003` (Draft → Active). Verify effective/expiration/waiting-period dates auto-populate.
5. **Invoice Payment** — Mark overdue invoice `inv-003` as paid. Verify `paidDate` is set.
6. **Overdue Escalation** — Mark `inv-002` as Overdue. Observe status change without affecting the policy (grace period not yet enforced — see `PLC_Concepts.md` Section 12 for known gaps).

---

## Known Gaps (intentional for this skeleton)

See `PLC_Concepts.md` Section 12 for a full list. Key items:
- Grace period and reinstatement workflows are not yet implemented
- Annual maximum is not auto-decremented when claims are approved
- Deductible is not applied during adjudication math
- No waiting period enforcement during claim submission

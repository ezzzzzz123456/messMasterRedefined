# MessMaster Project Context Report

## 1) Project Overview
- **Project name:** MessMaster
- **Purpose:** Connect mess kitchens, students, and NGOs to reduce food waste via analytics, feedback, and excess-food request workflows.
- **Current architecture:** MERN app with separate frontend (`client`) and backend (`server`).
- **Active role flows:**
  - `staff` (mess operations + dashboard)
  - `student` (feedback)
  - `ngo` (browse listings + request food)

## 2) Tech Stack
- **Frontend:** React 18, Vite, React Router, Zustand, TanStack Query, Axios, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, Mongoose, JWT, bcryptjs, express-validator
- **Infra / utilities:** helmet, cors, compression, morgan, express-rate-limit, winston

## 3) Folder Structure
- `client/src`
  - `router/` route definitions and route guards
  - `pages/` auth pages, dashboard pages, student and NGO pages
  - `components/` reusable layout/UI components
  - `store/` Zustand auth/session state
  - `api/axios.js` API client + token refresh interceptor
- `server/src`
  - `models/` Mongoose schemas
  - `routes/` Express route modules
  - `controllers/` main controller logic (auth/mess)
  - `middleware/` auth and error handlers
  - `services/` AI/Oracle support services
  - `app.js` app middleware + route mounting
- `scripts/` and `server/scripts/` helper scripts (dev + seeding)

## 4) Important Files
- [AppRouter.jsx](/Users/prakharsharma/Downloads/MessMaster/client/src/router/AppRouter.jsx)
  - Public/protected routes, role redirect logic, dashboard nesting.
- [useAuthStore.js](/Users/prakharsharma/Downloads/MessMaster/client/src/store/useAuthStore.js)
  - Login/register/logout/init and token persistence.
- [axios.js](/Users/prakharsharma/Downloads/MessMaster/client/src/api/axios.js)
  - Base URL, bearer token injection, refresh/retry queue.
- [app.js](/Users/prakharsharma/Downloads/MessMaster/server/src/app.js)
  - Express middleware and route registration.
- [auth.controller.js](/Users/prakharsharma/Downloads/MessMaster/server/src/controllers/auth.controller.js)
  - Register/login/refresh/logout/me + custom registration flows.

## 5) API Routes and Controllers
### Auth (`/api/v1/auth`)
- `POST /register`
- `POST /register/student`
- `POST /register/mess`
- `POST /register/ngo`
- `GET /register/messes`
- `POST /login`
- `POST /refresh`
- `POST /logout`
- `GET /me`

### Core mess modules
- `/api/v1/mess` (mess profile + dashboard summary)
- `/api/v1/menu-items` (menu CRUD + correlation)
- `/api/v1/staff` (staff list/create/update/deactivate)
- `/api/v1/waste-logs` (waste entry + summaries)
- `/api/v1/inventory` (inventory CRUD, low stock, energy logs)
- `/api/v1/feedback` (student feedback + staff summary)
- `/api/v1/analytics` (overview + insights)

### Existing protected modules (keep stable)
- `/api/v1/oracle`
- `/api/v1/cook-reviews`

### NGO + marketplace flow
- `/api/v1/listings`
  - Staff: create/manage listings
  - NGO: fetch active listings + listing detail
- `/api/v1/requests`
  - NGO: request food + view own requests
  - Staff: view incoming requests, accept/decline, complete orders, notifications

## 6) Database Models and Relationships
### User
- Shared identity model for all roles.
- Key fields: `name`, `email`, `password`, `role`, `messId`, `rollNo`, `year`, `organizationName`, `location`, `refreshToken`.
- Roles: `staff | student | ngo`.

### Mess
- Key fields: `name`, `phone`, `location`, `capacity`, `adminUserId`, `pointOfContact`, `representative`, `isActive`.
- `adminUserId` references owner/staff user.

### Inventory
- Canonical: `quantity`, `minQuantity`
- Compatibility virtuals: `qty`, `minQty`

### Staff
- Staff/cook records per mess.

### MenuItem, WasteLog, Feedback, EnergyLog, CookReview
- Operational and analytics models linked by `messId`.

### FoodListing
- Excess food posted by mess: category, item, quantity, price, status (`isActive`).

### FoodRequest
- NGO -> mess request lifecycle: `pending/accepted/declined/completed`.
- Includes fee math fields:
  - `grossAmount`
  - `platformFeePercent` (default 10)
  - `platformFeeAmount`
  - `messPayoutAmount`

## 7) Environment Variables
### Backend (`server/.env`)
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `NODE_ENV`
- `CLIENT_URL`
- `BCRYPT_SALT_ROUNDS`
- `GEMINI_API_KEY`

### Frontend (`client/.env`)
- `VITE_API_BASE_URL`
- `VITE_STUDENT_FEEDBACK_URL` (legacy/optional)

## 8) Authentication Flow
- `POST /auth/login` returns `{ accessToken, refreshToken, user }`.
- Access token is held in memory (`window.__accessToken`).
- Refresh token is stored in `localStorage`.
- Axios interceptor retries failed requests after `POST /auth/refresh`.
- Route guards are role-aware (`staff`, `student`, `ngo`).

## 9) Important Middleware
- [auth.middleware.js](/Users/prakharsharma/Downloads/MessMaster/server/src/middleware/auth.middleware.js)
  - `verifyToken`, `requireRole`, `requireMessAccess`
- [error.middleware.js](/Users/prakharsharma/Downloads/MessMaster/server/src/middleware/error.middleware.js)
  - Centralized API error normalization
- Security middleware in app: helmet/cors/compression/rate-limit

## 10) Current Development Status
- Staff dashboard + operations modules are functional.
- Student feedback flow is functional.
- NGO register/login/dashboard/listing/request flow is implemented.
- Notifications + order-state flow for requests is implemented.
- Oracle and Cook Reviews modules are present and intentionally untouched in this phase.
- Frontend production build currently passes.

## 11) Known Issues / TODOs
- No formal migration framework is configured; schema additions are backward-compatible but unmanaged.
- Need integration/E2E tests for marketplace/request/order lifecycle.
- Bundle size warning in frontend build (`index` chunk > 500KB); optional future optimization.
- Some legacy UI text and demo credentials still mention "staff" naming in older pages.
- Stray directory `/{server` exists and should be reviewed/cleaned if accidental.

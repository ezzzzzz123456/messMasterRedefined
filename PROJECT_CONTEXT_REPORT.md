# MessMaster Project Context Report

## 1) Project Overview
- **Project name:** MessMaster
- **Purpose:** Campus mess operations platform for waste logging, student feedback, NGO surplus-food coordination, and operational analytics.
- **Architecture:** MERN application with separate frontend (`client`) and backend (`server`).
- **Active roles:**
  - `staff`: mess administration, inventory, listings, requests, analytics
  - `student`: mess-linked feedback and review history
  - `ngo`: browse listings, request food, track request/order status

## 2) Tech Stack
- **Frontend:** React 18, Vite, React Router, Zustand, TanStack Query, Axios, Tailwind CSS, Framer Motion, `qrcode.react`
- **Backend:** Node.js, Express, Mongoose, JWT, bcryptjs, express-validator
- **Infra / utilities:** helmet, cors, compression, morgan, express-rate-limit, winston

## 3) Folder Structure
- `client/src`
  - `router/`: route definitions and protected-route behavior
  - `pages/`: landing, auth, dashboard, student, and NGO pages
  - `components/`: shared layout and UI components
  - `store/`: auth/session state
  - `api/axios.js`: API client, bearer injection, refresh-token retry flow
- `server/src`
  - `models/`: Mongoose schemas
  - `routes/`: Express route modules
  - `controllers/`: auth and mess orchestration
  - `middleware/`: auth and error handlers
  - `services/`: Oracle and AI helper logic
  - `app.js`: middleware + route mounting
- `server/scripts`
  - seed/migration/reset helpers
- `project/`
  - supplemental project report notes

## 4) Important Files
- [AppRouter.jsx](/Users/prakharsharma/Downloads/MessMaster/client/src/router/AppRouter.jsx)
  - Canonical frontend routing, role guards, dashboard nesting.
- [Landing.jsx](/Users/prakharsharma/Downloads/MessMaster/client/src/pages/Landing.jsx)
  - Current home page with Staff and NGO portal cards plus `Student Portal` / `About Us` nav.
- [useAuthStore.js](/Users/prakharsharma/Downloads/MessMaster/client/src/store/useAuthStore.js)
  - Login/register/logout/init flows and token persistence.
- [axios.js](/Users/prakharsharma/Downloads/MessMaster/client/src/api/axios.js)
  - Request auth header injection and refresh-token retry queue.
- [app.js](/Users/prakharsharma/Downloads/MessMaster/server/src/app.js)
  - Current mounted backend APIs.
- [auth.controller.js](/Users/prakharsharma/Downloads/MessMaster/server/src/controllers/auth.controller.js)
  - Custom registration flows, login, refresh, logout, `me`.

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

### Core staff/mess modules
- `/api/v1/mess`
  - mess profile and dashboard summary
- `/api/v1/menu-items`
  - menu CRUD and menu waste correlation
- `/api/v1/staff`
  - staff list/create/update/deactivate
- `/api/v1/waste-logs`
  - waste entry and waste summaries
- `/api/v1/inventory`
  - inventory CRUD, low stock, energy logs, reorder suggestions, reorder authorization
- `/api/v1/feedback`
  - student review submit, student history, staff summary/recent/all views
- `/api/v1/analytics`
  - overview, AI insights, waste trend
- `/api/v1/oracle`
  - waste prediction for staff users

### NGO marketplace flow
- `/api/v1/listings`
  - staff create/manage listings
  - NGO fetch active listings and listing details
- `/api/v1/requests`
  - NGO create/view requests
  - staff accept/decline/complete requests and manage notification state

### Removed modules
- `Cook Reviews` has been removed from active frontend and backend flow.
- `/api/v1/cook-reviews` is no longer mounted in `app.js`.

## 6) Database Models and Relationships
### User
- Shared identity model for all roles.
- Key fields:
  - `name`, `email`, `password`, `role`, `messId`, `rollNo`, `year`, `organizationName`, `location`, `refreshToken`
- Roles:
  - `staff | student | ngo`

### Mess
- Key fields:
  - `name`, `phone`, `location`, `capacity`, `adminUserId`, `adminContact`, `isActive`
- `adminContact` is the current source-of-truth admin object:
  - `name`, `email`, `phone`
- Legacy compatibility fields remain readable:
  - `pointOfContact`
  - `representative`

### MenuItem
- `messId`, `name`, `category`, `avgWasteKg`, `avgRating`, `isActive`
- Used as approved source list for waste logging and food listing creation.

### Inventory
- Canonical quantity fields:
  - `quantity`, `minQuantity`
- Compatibility virtuals:
  - `qty`, `minQty`

### Staff
- Staff/cook records per mess.
- Operational staff management remains active even though Cook Reviews were removed.

### WasteLog
- `messId`, `loggedBy`, `date`, `meal`, `menuItemId`, `menuItemName`, `preparedKg`, `wastedKg`
- Must reference a valid active menu item for that mess when created through current backend flow.

### Feedback
- `messId`, `studentId`, `date`, `meal`, ratings, `comment`
- Review date is server-generated at submission time.
- Student history populates reviewed mess name.

### EnergyLog
- Per-mess utility logging for inventory/operations summary.

### FoodListing
- NGO-facing surplus food listing:
  - `messId`, `createdBy`, `foodCategory`, `foodItem`, `quantityAvailableKg`, `ratePerKg`, `notes`, `isActive`
- Current validation only allows approved active menu items from that mess.

### FoodRequest
- NGO-to-mess request lifecycle:
  - `pending`, `accepted`, `declined`, `completed`
- Includes fee math:
  - `grossAmount`
  - `platformFeePercent`
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
- `VITE_STUDENT_FEEDBACK_URL` (legacy / optional)

## 8) Authentication Flow
- `POST /auth/login` returns:
  - `{ accessToken, refreshToken, user }`
- Access token:
  - in memory as `window.__accessToken`
- Refresh token:
  - in `localStorage`
- Axios retries non-auth `401` responses via `POST /auth/refresh`.
- Route guards redirect by role:
  - `staff` -> `/dashboard/overview`
  - `student` -> `/student/feedback`
  - `ngo` -> `/ngo/dashboard`
- Current default access-token lifetime is effectively one hour unless explicitly configured otherwise.

## 9) Important Middleware
- [auth.middleware.js](/Users/prakharsharma/Downloads/MessMaster/server/src/middleware/auth.middleware.js)
  - `verifyToken`, `requireRole`, `requireMessAccess`
- [error.middleware.js](/Users/prakharsharma/Downloads/MessMaster/server/src/middleware/error.middleware.js)
  - central API error normalization
- Security middleware in `app.js`:
  - helmet, cors, compression, rate-limit, morgan (development)

## 10) Current User-Facing Flows
### Landing / navigation
- Home page shows:
  - Staff portal card
  - NGO portal card
- Current top nav keeps:
  - `Student Portal`
  - `About Us`
- Staff card CTA points users into the staff login/register workflow.

### Staff flow
- Staff login page supports:
  - sign-in with admin email/password
  - navigation to mess registration
- Mess registration captures:
  - mess info
  - menu setup
  - inventory setup
  - cook setup
  - admin contact fields
- Active staff dashboard modules:
  - Overview
  - Menu Analysis
  - Oracle
  - Waste Log
  - Feedback
  - Inventory
  - Food Listings
  - Requests
  - Orders
  - Settings

### Student flow
- Student registration requires mess selection.
- Student review form requires mess selection and meal selection.
- Review submission date is auto-generated by server and not user-editable.
- Review history includes:
  - mess name
  - review details
  - review date
- Student portal includes QR login entry behavior pointing to student login.

### NGO flow
- NGO registration and login are active.
- NGO dashboard shows active listings and request history.
- NGO can inspect a listing, submit a request, and track accept/decline/completion state.

## 11) Validation and Business Rules
- Only approved active menu items may be used in:
  - food listings
  - waste log creation
- Student feedback is always linked to a specific mess.
- Review date is server-generated at submission time.
- Marketplace pricing keeps NGO-facing rate visible while platform fee is computed internally on requests.

## 12) Scripts and Operations
- `npm run seed`
  - seeds baseline sample data without dropping DB first
- `npm run reset:seed`
  - drops database, then reseeds
- `npm run migrate:admin-contact`
  - backfills `adminContact` from legacy mess contact fields

### Local DB requirement
- `seed`, `reset:seed`, and `migrate:admin-contact` require local MongoDB access configured through `MONGODB_URI`.

## 13) Current Seeded State
### Users created by current seed
- Staff:
  - `ravi@mess.edu` / `staff123`
  - `priya@mess.edu` / `staff456`
- Students:
  - `arjun@student.edu` / `stu123`
  - `sneha@student.edu` / `stu456`
- NGO:
  - no NGO user is seeded by default

### Typical seeded counts after `reset:seed`
- users: 4
- messes: 1
- menuItems: 8
- inventory: 10
- wasteLogs: 21
- feedback: 12
- staff: 5

## 14) Current Development Status
- Staff dashboard operations are functional.
- Student feedback/review/history flow is functional.
- NGO listing/request/order lifecycle is implemented.
- Inventory reorder suggestion + authorization flow is implemented.
- Approved menu-item enforcement is implemented for waste logs and listings.
- Landing, about, and auth-entry flows are simplified and working.
- Frontend production build currently passes.

## 15) Known Issues / TODOs
- No formal migration framework exists; migrations are script-based.
- Root report and supplemental report must be kept in sync manually.
- There is still a standalone `Review` page route in the frontend router even though review is not treated as a core landing-nav destination.
- Bundle size warning remains in frontend production build.
- No automated integration/E2E test suite currently enforces the cross-role flows.
- Stray directory `/{server` should still be reviewed manually if it is accidental.

# MessMaster Project Context Report

## 1. Project Overview
- Project name: `MessMaster`
- Purpose: multi-role campus mess operations platform for staff operations, student feedback, and NGO surplus-food coordination.
- Architecture: MERN split into a React/Vite client and Express/Mongoose API server.
- Active roles:
  - `staff`: mess administration, waste logging, analytics, inventory, listings, requests, orders, settings
  - `student`: mess-linked reviews, meal selection, review history
  - `ngo`: browse nearby food listings, inspect mess details, send pickup requests, track request/order status
  - `bio`: browse nearby dumped/expired waste listings, send BioLoop purchase requests, track request status

## 2. Tech Stack
- Frontend
  - React 18
  - Vite
  - React Router 6
  - Zustand
  - TanStack Query
  - Axios
  - Tailwind CSS
  - Framer Motion
  - `qrcode.react`
  - `leaflet`
- Backend
  - Node.js
  - Express 4
  - Mongoose 8
  - JWT (`jsonwebtoken`)
  - `bcryptjs`
  - `express-validator`
- Middleware / infra
  - `helmet`
  - `cors`
  - `compression`
  - `morgan`
  - `express-rate-limit`
  - `winston`
- External services
  - OpenStreetMap tiles for NGO map rendering
  - Nominatim geocoding for text location -> latitude/longitude resolution
  - Gemini package still present in dependencies, but current core app flows do not depend on it

## 3. Folder Structure Explanation
- `client/src`
  - `api/axios.js`: shared API client, bearer token injection, refresh retry queue
  - `router/AppRouter.jsx`: canonical route map and protected-route redirects
  - `store/useAuthStore.js`: auth/session state and login/register/logout/init actions
  - `pages/`: public pages, auth pages, staff dashboard pages, student pages, NGO pages
  - `components/layout/`: dashboard shell and shared layout
  - `components/ui/`: reusable UI pieces such as logo link
  - `components/maps/`: Leaflet NGO map components
- `server/src`
  - `app.js`: express app bootstrap and route mounting
  - `controllers/`: auth and mess orchestration logic
  - `routes/`: API route modules
  - `models/`: Mongoose schemas and relationships
  - `middleware/`: auth guard and centralized error handler
  - `services/`: Oracle prediction and geocoding helpers
- `server/scripts`
  - DB seed, DB reset+seed, admin-contact migration, location-geocoding migration
- `project/`
  - shorter implementation supplement (`project_reports_md`)

## 4. Important Files and Responsibilities
- [AppRouter.jsx](/Users/prakharsharma/Downloads/MessMaster/client/src/router/AppRouter.jsx)
  - Frontend route definitions and role-based redirects.
- [Landing.jsx](/Users/prakharsharma/Downloads/MessMaster/client/src/pages/Landing.jsx)
  - Current home page layout and portal entry points.
- [RegisterMess.jsx](/Users/prakharsharma/Downloads/MessMaster/client/src/pages/RegisterMess.jsx)
  - Mess registration UI with mess info, menu setup, inventory, cook setup, admin contact.
- [RegisterNGO.jsx](/Users/prakharsharma/Downloads/MessMaster/client/src/pages/RegisterNGO.jsx)
  - NGO registration UI with location input used for map matching.
- [BioLoop.jsx](/Users/prakharsharma/Downloads/MessMaster/client/src/pages/BioLoop.jsx)
  - Public BioLoop page with CTA, map preview, and active waste listing preview.
- [NGODashboard.jsx](/Users/prakharsharma/Downloads/MessMaster/client/src/pages/ngo/NGODashboard.jsx)
  - NGO map, nearby listings, and request tracking.
- [BioDashboard.jsx](/Users/prakharsharma/Downloads/MessMaster/client/src/pages/bio/BioDashboard.jsx)
  - BioLoop admin map, nearby listings, and request tracking.
- [NearbyMessesMap.jsx](/Users/prakharsharma/Downloads/MessMaster/client/src/components/maps/NearbyMessesMap.jsx)
  - Leaflet map rendering with OpenStreetMap tiles.
- [useAuthStore.js](/Users/prakharsharma/Downloads/MessMaster/client/src/store/useAuthStore.js)
  - Client auth actions and persisted session bootstrapping.
- [axios.js](/Users/prakharsharma/Downloads/MessMaster/client/src/api/axios.js)
  - Access token injection and refresh-token recovery flow.
- [app.js](/Users/prakharsharma/Downloads/MessMaster/server/src/app.js)
  - Server middleware stack and route mounting.
- [auth.controller.js](/Users/prakharsharma/Downloads/MessMaster/server/src/controllers/auth.controller.js)
  - Registration/login/refresh/logout/me and mess bootstrap logic.
- [listing.routes.js](/Users/prakharsharma/Downloads/MessMaster/server/src/routes/listing.routes.js)
  - Food listing CRUD and NGO listing discovery, including nearby-mess endpoint.
- [geocoding.service.js](/Users/prakharsharma/Downloads/MessMaster/server/src/services/geocoding.service.js)
  - Server-side Nominatim lookup with timeout and error handling.

## 5. API Routes and Controllers
### Auth: `/api/v1/auth`
- `POST /register`
  - Generic role registration entry, still present for compatibility.
- `POST /register/student`
  - Student registration with required `messId`.
- `POST /register/mess`
  - Full mess registration. Creates staff admin user, mess document, menu items, inventory, and cooks.
- `POST /register/ngo`
  - NGO registration with geocoded location.
- `POST /register/bio`
  - BioLoop registration with geocoded location.
- `GET /register/messes`
  - Returns active messes for student registration dropdown.
- `POST /login`
- `POST /refresh`
- `POST /logout`
- `GET /me`

### Staff / mess modules
- `/api/v1/mess`
  - mess create/get/update/dashboard summary
- `/api/v1/menu-items`
  - menu item CRUD and menu data for waste/listing selection
- `/api/v1/staff`
  - staff create/list/update/delete/deactivate flows
- `/api/v1/waste-logs`
  - waste entry and waste summaries
- `/api/v1/feedback`
  - student review submission, student history, staff views
- `/api/v1/inventory`
  - inventory CRUD, low-stock handling, reorder suggestions, reorder authorization
- `/api/v1/oracle`
  - waste prediction
- `/api/v1/analytics`
  - overview cards, trend data, dashboard graph feeds

### NGO marketplace modules
- `/api/v1/listings`
  - `POST /` staff creates a listing from approved menu items only
  - `GET /mine` staff listing management
  - `PATCH /:id/toggle` activate/deactivate listing
  - `GET /public/all` legacy NGO listing feed (all active listings)
  - `GET /public/nearby` NGO nearby listings feed using 20 km geo filtering
  - `GET /public/:id` listing details + mess review summary
- `/api/v1/requests`
  - NGO request creation and request history
  - staff accept/decline/complete actions
  - notification/read-state handling
- `/api/v1/bioloop`
  - staff BioLoop listing management
  - BioLoop public preview feed
  - bio nearby listing discovery within 50 km
- `/api/v1/bioloop-requests`
  - bio request creation/history
  - staff accept/decline/complete actions for biogas waste pickups

### Removed / deprecated
- Cook Reviews backend route is removed.
- There is no mounted cook review API in [app.js](/Users/prakharsharma/Downloads/MessMaster/server/src/app.js).

## 6. Database Models and Relationships
### User
- Shared identity model for `staff`, `student`, and `ngo`.
  - plus `bio` for biogas marketplace operators
- Key fields:
  - `name`
  - `email`
  - `password`
  - `role`
  - `messId`
  - `organizationName`
  - `location`
  - `latitude`
  - `longitude`
  - `geo` (`Point`, 2dsphere index)
  - `rollNo`
  - `year`
  - `refreshToken`
- Relationships:
  - students and staff can reference one `Mess` through `messId`
  - NGOs are standalone users with geo coordinates for nearby-mess filtering

### Mess
- Key fields:
  - `name`
  - `phone`
  - `location` (human-readable address / display name)
  - `latitude`
  - `longitude`
  - `geo` (`Point`, 2dsphere index)
  - `capacity`
  - `adminUserId`
  - `adminContact`
  - `pointOfContact` (legacy compatibility)
  - `representative` (legacy compatibility)
  - `isActive`
- `adminContact` is the current source-of-truth admin object.
- `pointOfContact` and `representative` remain readable to avoid breaking older consumers.

### MenuItem
- `messId`, `name`, `category`, `avgWasteKg`, `avgRating`, `isActive`
- Approved source-of-truth for:
  - waste log item selection
  - food listing item selection

### Inventory
- `messId`, `name`, `category`, `unit`, `quantity`, `minQuantity`, `costPerUnit`
- Existing UI now treats category/unit as dropdown-backed fields in major inventory flows.

### Staff
- `messId`, `name`, `role`, `contactNumber`, `isActive`
- Used for mess staff management.

### WasteLog
- `messId`, `loggedBy`, `date`, `meal`, `menuItemId`, `menuItemName`, `preparedKg`, `wastedKg`, `costLoss`, `co2Kg`
- Current backend validates that logged food belongs to an approved active menu item for the mess.

### Feedback
- `messId`, `studentId`, `date`, `meal`, rating fields, `comment`
- Review date is generated by the server at submission time.
- Student history populates the reviewed mess name.

### FoodListing
- `messId`, `createdBy`, `foodCategory`, `foodItem`, `quantityAvailableKg`, `ratePerKg`, `notes`, `isActive`
- Only approved active menu items can be listed.
- NGO map/feed only shows messes with active listings and positive quantity.

### FoodRequest
- `listingId`, `messId`, `ngoId`, `requestedQtyKg`, `ratePerKg`, `status`
- Derived/computed fields:
  - `grossAmount`
  - `platformFeePercent`
  - `platformFeeAmount`
  - `messPayoutAmount`
- Notification/read flags:
  - `isReadByMess`
  - `isReadByNgo`

### Removed model
- `CookReview` model has been removed from the active system.

### BioWasteListing
- `messId`, `createdBy`, `wasteType`, `itemName`, `quantityAvailableKg`, `ratePerKg`, `notes`
- lifecycle fields:
  - `scheduledAt`
  - `activatedAt`
  - `availableUntil`
  - `finalizedAt`
  - `status`
  - `isMarketplaceVisible`
- used for dumped/expired food waste marketplace listings

### BioWasteRequest
- `listingId`, `messId`, `bioId`, `requestedQtyKg`, `offeredRatePerKg`, `status`
- includes the same 10% platform-fee math pattern used by NGO requests

## 7. Environment Variables Used
### Backend: `server/.env`
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `NODE_ENV`
- `CLIENT_URL`
- `BCRYPT_SALT_ROUNDS`
- `GEMINI_API_KEY` (optional for non-core features)

### Frontend: `client/.env`
- `VITE_API_BASE_URL`
- `VITE_STUDENT_FEEDBACK_URL` (legacy / optional)

## 8. Authentication Flow
- Login endpoint: `POST /api/v1/auth/login`
- Response shape: `{ accessToken, refreshToken, user }`
- Access token handling:
  - kept in memory at `window.__accessToken`
- Refresh token handling:
  - stored in `localStorage`
- Refresh flow:
  - Axios interceptor retries non-auth `401` responses through `POST /auth/refresh`
- Current effective access-token lifetime:
  - defaults to `1h` unless env explicitly overrides with another value
- Route guard behavior:
  - `staff` -> `/dashboard/overview`
  - `student` -> `/student/feedback`
  - `ngo` -> `/ngo/dashboard`

## 9. Important Middleware
- [auth.middleware.js](/Users/prakharsharma/Downloads/MessMaster/server/src/middleware/auth.middleware.js)
  - `verifyToken`
  - `requireRole`
  - `requireMessAccess`
- [error.middleware.js](/Users/prakharsharma/Downloads/MessMaster/server/src/middleware/error.middleware.js)
  - centralized API error formatting
- `helmet`, `cors`, `compression`, `express-rate-limit`, `morgan`
  - configured in [app.js](/Users/prakharsharma/Downloads/MessMaster/server/src/app.js)

## 10. Current Development Status
### Public / landing
- Landing page uses a dark minimal layout.
- Current top navigation shows:
  - `Student Portal`
  - `BioLoop`
  - `About Us`
- Public portal cards on home:
  - Staff
  - NGO
- Staff card leads into staff login/register flow.
- NGO card leads into NGO login/register flow.
- Public `/review` route still exists, but it is not part of the main landing-page nav anymore.

### Staff portal
- Active modules:
  - Overview
  - Menu Analysis
  - Oracle
  - Waste Log
  - Feedback
  - Inventory
  - Food Listings
  - Requests
  - Orders
  - BioLoop Waste
  - BioLoop Requests
  - BioLoop Orders
  - Settings
- Dashboard top KPI cards remain:
  - Food Waste for 7 Days
  - Cost Loss for 7 Days
  - CO2 Saved
- Dashboard embeds waste logging and refreshes graphs/data after successful waste submission.
- Waste logs support create, edit, and delete from both:
  - the full Waste Log page
  - the dashboard's Recent Waste Logs section
- Any waste-log mutation invalidates recent logs, overview KPIs, waste trends, meal breakdown, AI insights, and menu correlation views.
- Live Inventory and Quick Actions were removed from the overview layout.
- Menu Analysis uses a row-based waste chart with:
  - inline `kg` labels on each dish bar
  - pill-shaped bars
  - hover row highlighting
  - risk differentiation through purple intensity/glow, not alternate palette colors

### Student portal
- Student registration requires mess selection.
- Review flow requires mess selection and meal/date context.
- Review date is not user-editable.
- Review history shows mess name, review details, and date.
- Student QR entry points users to student login.

### NGO portal
- NGO dashboard includes:
  - Nearby mess map (Leaflet + OpenStreetMap)
  - Nearby listings within 20 km
  - request history
- NGO mess discovery is backed by geospatial filtering.
- Only messes with active food listings appear on the nearby map/feed.

### BioLoop portal
- Public `/bioloop` page includes:
  - BioLoop logo/nav entry
  - login/register CTA
  - waste listing preview
  - map preview
- BioLoop dashboard includes:
  - nearby waste map
  - 50 km filtered dumped/expired waste listings
  - request history
- Staff can create BioLoop waste listings with a scheduled activation time.
- Scheduler activates due listings and expires unclaimed listings after four hours.

### Registration / geolocation
- Mess registration keeps a text location field, geocodes it, and stores lat/lng + geo point.
- NGO registration does the same.
- Invalid or non-resolvable locations return validation errors and block submission.

## 11. Validation Rules and Business Logic
- Only approved active menu items may be used in:
  - staff food listings
  - waste log creation
- BioLoop nearby discovery uses a 50 km radius centered on bio-admin coordinates.
- BioLoop listings auto-expire after four hours of active marketplace visibility if unclaimed.
- Student feedback must be associated with a mess.
- Review submission date is server-generated.
- NGO nearby discovery uses a 20 km radius centered on NGO coordinates.
- Messes appear on the NGO map only if they have at least one active listing with `quantityAvailableKg > 0`.
- Platform fee logic remains on `FoodRequest`:
  - NGO sees full per-kg rate
  - platform fee is deducted internally from mess payout

## 12. Scripts and Operations
- `npm run seed`
  - seeds sample data without dropping DB first
- `npm run reset:seed`
  - drops DB and then reseeds
- `npm run migrate:admin-contact`
  - backfills `adminContact` from legacy contact fields
- `npm run migrate:location-geo`
  - geocodes existing mess and NGO records that only have text `location`
- `npm run build`
  - builds the frontend production bundle

### Local requirements
- MongoDB must be reachable through `MONGODB_URI` for seed/reset/migrations.
- `migrate:location-geo` requires outbound network access to Nominatim.

## 13. Current Seeded State
### Seeded users
- Staff
  - `ravi@mess.edu` / `staff123`
  - `priya@mess.edu` / `staff456`
- Students
  - `arjun@student.edu` / `stu123`
  - `sneha@student.edu` / `stu456`
- NGO
  - `ngo@helpinghands.org` / `ngo12345`
- BioLoop
  - `bio@purplefuel.org` / `bio12345`

### Seeded sample data
- One active mess: `Hostel H4 Mess`
- Active menu items, inventory records, waste logs, feedback records, staff records
- Two active food listings:
  - `Aloo Paratha`
  - `Veg Biryani`
- One pending NGO food request tied to the seeded NGO account
- Two BioLoop waste listings:
  - one active dumped-food listing
  - one scheduled expired-food listing
- One pending BioLoop request tied to the seeded bio-admin account
- Seeded mess now includes stored coordinates for location-based NGO discovery

## 14. Known Issues / TODOs
- `GET /api/v1/listings/public/all` still exists as a legacy all-listings feed; current NGO dashboard uses `/public/nearby` instead.
- Existing older DB records created before geo support need `npm run migrate:location-geo` or re-registration to participate in nearby map filtering.
- Client bundle is large in production build and currently emits a chunk-size warning.
- Nominatim rate limits should be respected; bulk migrations should be run sparingly.

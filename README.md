# 🌿 MessMaster

**Hostel Mess Food Wastage Tracker & Intelligence Platform**

A full-stack MERN application for hostel mess food wastage tracking, analytics, and AI-powered intelligence. Built for hackathons — demo-ready and production-grade.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v20+
- MongoDB Atlas account (free tier)
- Google Gemini API key (free tier)

### 1. Clone & Install
```bash
git clone https://github.com/ezzzzzz123456/MessMaster.git
cd MessMaster
npm run install:all
```

### 2. Configure Environment

**Backend** — copy and fill in `/server/.env.example` → `/server/.env`:
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/messmaster
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
CLIENT_URL=http://localhost:5173
```

**Frontend** — copy and fill in `/client/.env.example` → `/client/.env`:
```
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_STUDENT_FEEDBACK_URL=http://localhost:5173/student
```

### 3. Seed the Database
```bash
npm run seed
```

### 4. Run
```bash
npm run dev
```

App will be running at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Staff (Ravi Kumar) | ravi@mess.edu | staff123 |
| Staff (Priya Sharma) | priya@mess.edu | staff456 |
| Student (Arjun Mehta) | arjun@student.edu | stu123 |
| Student (Sneha Patel) | sneha@student.edu | stu456 |

---

## ✨ Features

### Staff Dashboard
- **Overview** — KPI cards with animated count-up, weekly waste trend chart, AI insights
- **Menu Analysis** — Horizontal bar chart showing waste by menu item with risk badges
- **Oracle** 🔮 — AI-powered predictive waste forecasting with animated scan bar
- **Log Waste** — Quick entry form for daily waste logging
- **Feedback** — QR code display + live student response feed
- **Cook Reviews** — AI-generated performance reviews using Gemini
- **Inventory** — Full CRUD with low-stock alerts and energy dashboard
- **Setup** — Manage mess info, menu items, and staff

### Student Portal
- Mobile-friendly feedback submission
- Meal-specific ratings (taste, portion, freshness)
- Past submissions history

### AI Features (Gemini 1.5 Flash)
- Weekly insight cards for the overview dashboard
- Cook performance review paragraphs
- Inventory reorder suggestions
- 24-hour response caching

---

## 🔮 Oracle Prediction Model

The Oracle uses a rule-based multiplier system:

```
predictedKg = base × day × meal × weather × event
```

| Factor | Range |
|--------|-------|
| Base waste | 18–72 kg by dish |
| Day multiplier | 0.70 (Thu) – 1.35 (Sat) |
| Meal multiplier | 0.55 (Snacks) – 1.10 (Lunch) |
| Weather | 0.85 (Very Hot) – 1.40 (Stormy) |
| Campus event | 0.60 (Long Weekend) – 1.45 (Exam Week) |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| State | Zustand + TanStack Query |
| Backend | Node.js + Express |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (access + refresh tokens) |
| AI | Google Gemini 1.5 Flash |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set root directory: `client`
3. Add env variables: `VITE_API_BASE_URL`, `VITE_STUDENT_FEEDBACK_URL`

### Backend (Render)
1. Create new Web Service, connect repo
2. Set root directory: `server`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all env variables from `.env.example`

---

## 📁 Project Structure

```
MessMaster/
├── client/          # React + Vite frontend
│   └── src/
│       ├── api/     # Axios instance
│       ├── pages/   # All pages
│       ├── components/
│       ├── store/   # Zustand
│       └── router/
├── server/          # Node.js + Express backend
│   └── src/
│       ├── models/  # Mongoose schemas
│       ├── routes/  # API routes
│       ├── services/# AI + Oracle services
│       └── middleware/
└── package.json     # Root scripts
```

---

*Built with 💚 for Hackathon 2024 — Every other team shows charts of what happened. We show what WILL happen.*

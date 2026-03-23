# MediCare — Project Startup Guide

## Overview

MediCare is a full-stack hospital management platform. It is split into two parts that run simultaneously:

| Layer | Technology | Port | Location |
|-------|-----------|------|----------|
| Frontend | Next.js 16 (React, TypeScript, Tailwind CSS) | 5000 | `frontend/` |
| Backend API | Django 5 + Django REST Framework | 8080 | `artifacts/api-server/` |

---

## Project Structure

```
/
├── frontend/                   ← Next.js app (what users see in the browser)
│   ├── app/                    ← Pages (App Router)
│   │   ├── page.tsx            ← Home page
│   │   ├── auth/
│   │   │   ├── login/          ← Login page (redirects by role)
│   │   │   └── register/       ← Register page (patient or doctor)
│   │   ├── chat/               ← Real-time messaging (WhatsApp-style)
│   │   ├── dashboard/
│   │   │   ├── patient/        ← Patient dashboard
│   │   │   ├── doctor/         ← Doctor dashboard
│   │   │   └── admin/          ← Admin dashboard
│   │   ├── appointments/       ← Book appointments
│   │   ├── doctors/            ← Browse doctors
│   │   └── departments/        ← Browse departments
│   ├── components/             ← Shared UI (Navbar, Footer, Skeleton)
│   └── lib/
│       ├── api.ts              ← All API calls + token/user storage
│       ├── types.ts            ← TypeScript type definitions
│       ├── useApi.ts           ← Custom data-fetching hooks
│       └── chatWebSocket.ts    ← WebSocket client for live chat
│
├── artifacts/
│   └── api-server/             ← Django REST API
│       ├── config/
│       │   ├── settings.py     ← Django settings (DB, JWT, CORS, installed apps)
│       │   └── urls.py         ← Root URL routes
│       ├── apps/
│       │   ├── accounts/       ← User auth (register, login, JWT)
│       │   ├── patients/       ← Patient profiles
│       │   ├── doctors/        ← Doctor profiles
│       │   ├── appointments/   ← Appointment booking
│       │   ├── billing/        ← Invoices & billing
│       │   ├── reports/        ← Medical reports
│       │   ├── notifications/  ← Notification system
│       │   ├── admin_dashboard/← Admin overview API
│       │   └── chat/           ← Messaging: conversations & messages
│       └── manage.py
│
├── startup.md                  ← This file
└── replit.md                   ← Replit project notes
```

---

## How to Run

### Start the Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev          # starts on port 5000
```

### Start the Backend (Django)
```bash
cd artifacts/api-server
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8080
```

The frontend proxies all `/api/*` requests to `http://localhost:8080` via Next.js rewrites (configured in `frontend/next.config.ts`).

---

## Authentication Flow

### Registration
1. User visits `/auth/register`
2. Selects role: **Patient** or **Doctor**
3. Fills in name, email, phone, password
4. POST → `/api/auth/register/` → Django creates `User` record + `Patient` or `Doctor` profile automatically
5. JWT token returned, stored in `sessionStorage`
6. User redirected to their role-specific dashboard

### Login
1. User visits `/auth/login`
2. Enters email + password
3. POST → `/api/auth/login/` → Django validates credentials
4. JWT token + user object returned
5. Token stored in `sessionStorage` via `tokenStore`
6. User object stored in `sessionStorage` via `userStore`
7. Redirect: **doctor** → `/dashboard/doctor` | **patient** → `/dashboard/patient` | **admin** → `/dashboard/admin`

### Token Usage
Every API request automatically includes `Authorization: Bearer <token>` via the `request()` helper in `frontend/lib/api.ts`. If the server returns `401 Unauthorized`, the token is cleared and the user is redirected to login.

---

## Chat System (Doctor ↔ Patient Messaging)

The chat feature lives at `/chat` and works like WhatsApp / Instagram DMs.

### How it works

1. **Authentication required** — unauthenticated users see a login prompt
2. **Start a conversation** — click the pencil icon (top-right of sidebar) to search for a doctor (if you're a patient) or a patient (if you're a doctor)
3. **Search** — the backend filters users by the opposite role automatically
4. **Conversation is created or resumed** — `POST /api/chat/conversations/start/`
5. **Messages are sent** — `POST /api/chat/conversations/{id}/send/`
6. **Messages are loaded** — `GET /api/chat/conversations/{id}/messages/`
7. **Unread counts** — messages from others are marked read when you open the conversation

### Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/conversations/` | List all conversations for current user |
| POST | `/api/chat/conversations/start/` | Start or resume a conversation `{ user_id }` |
| GET | `/api/chat/conversations/{id}/messages/` | Get all messages in a conversation |
| POST | `/api/chat/conversations/{id}/send/` | Send a message `{ text, message_type }` |
| GET | `/api/chat/users/search/?q=&role=` | Search users to chat with |

### Frontend Features
- **Search users** to start new conversations
- **Message reactions** (❤️ 👍 😂 😮 😢 🙏)
- **Reply to messages** with quoted context
- **Typing indicators** (simulated demo mode)
- **Message status**: sending → sent → delivered
- **Mobile responsive** — full-screen chat on small screens
- **Works offline** — demo auto-replies when backend is unavailable

---

## Database

- **Development**: SQLite (auto-created at `artifacts/api-server/db.sqlite3`)
- **Production**: PostgreSQL (set `DATABASE_URL` environment variable)

### Key Models
| App | Models |
|-----|--------|
| `accounts` | `User` (roles: admin, doctor, patient) |
| `doctors` | `Doctor` (profile linked to User) |
| `patients` | `Patient` (profile linked to User) |
| `appointments` | `Appointment` |
| `chat` | `Conversation`, `ChatMessage` |
| `billing` | `Invoice` |
| `reports` | `Report` |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DJANGO_SECRET_KEY` | insecure dev key | Django secret key (change in production!) |
| `DJANGO_DEBUG` | `True` | Debug mode |
| `DATABASE_URL` | SQLite | PostgreSQL connection string |

---

## API Base URL

The Next.js frontend uses `/api` as the base path. Next.js rewrites these to `http://localhost:8080/api` so there are no CORS issues in development. In production, configure your proxy/load balancer accordingly.

---

## User Roles

| Role | Dashboard | Can chat with |
|------|-----------|--------------|
| `patient` | `/dashboard/patient` | Doctors |
| `doctor` | `/dashboard/doctor` | Patients |
| `admin` | `/dashboard/admin` | N/A (admin panel) |

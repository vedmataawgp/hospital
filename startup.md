# MediCare — Project Startup Guide

## Overview

MediCare is a full-stack hospital management platform. It is split into two parts that run simultaneously:

| Layer | Technology | Port | Location |
|-------|-----------|------|----------|
| Frontend | Next.js 16 (React, TypeScript, Tailwind CSS) | 5000 | `frontend/` |
| Backend API | Django 5 + Django REST Framework | 8080 | `artifacts/api-server/` |

---

## Test Accounts (Pre-seeded)

Three ready-to-use accounts are seeded in the development database. Use these to log in and test every role without registering.

### Admin
| Field | Value |
|-------|-------|
| Email | `admin@medicare.com` |
| Password | `Admin@1234` |
| Role | `admin` |
| Redirects to | `/dashboard/admin` |

### Doctor (Dr. John Smith — Cardiology)
| Field | Value |
|-------|-------|
| Email | `dr.smith@medicare.com` |
| Password | `Doctor@1234` |
| Role | `doctor` |
| Redirects to | `/dashboard/doctor` |

### Patient (Jane Doe)
| Field | Value |
|-------|-------|
| Email | `patient.jane@medicare.com` |
| Password | `Patient@1234` |
| Role | `patient` |
| Redirects to | `/dashboard/patient` |

---

## Frontend Page URLs

All pages are served on **port 5000**. Replace the host with your Replit preview URL in production.

### Public pages
| URL | Description |
|-----|-------------|
| `/` | Home / landing page |
| `/auth/login` | Login (all roles) |
| `/auth/register` | Register as patient or doctor |
| `/doctors` | Browse all doctors |
| `/departments` | Browse all departments |

### Patient pages (login required — patient role)
| URL | Description |
|-----|-------------|
| `/dashboard/patient` | Patient dashboard — stats, upcoming appointments |
| `/appointments` | Book a new appointment |
| `/chat` | Message doctors |

### Doctor pages (login required — doctor role)
| URL | Description |
|-----|-------------|
| `/dashboard/doctor` | Doctor dashboard — patients, appointments, prescriptions |
| `/chat` | Message patients |

### Admin pages (login required — admin role)
| URL | Description |
|-----|-------------|
| `/dashboard/admin` | Admin dashboard — platform overview, users, analytics |

### Django built-in admin panel
| URL | Description |
|-----|-------------|
| `/api/django-admin/` | Django admin (port 8080) — full DB management |

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

### Start the Full System (Recommended)
You can start both backend and frontend with a single command:
```powershell
.\dev.ps1      # Windows (Auto-sets root .venv)
```
```bash
./dev.sh       # Linux/macOS (Auto-sets root .venv)
```

### Manual Run
> **Note**: Always use the virtual environment located at the **project root** (`.venv`). Do NOT create or use a venv inside `artifacts/api-server/`.

**Backend (Django):**
```bash
cd artifacts/api-server
# Root venv is used via uv or relative path
uv run python manage.py migrate
uv run python manage.py runserver 0.0.0.0:8080
```

**Frontend (Next.js):**
```bash
cd frontend
npm install
npm run dev          # starts on port 5000
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

## Backend REST API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register/` | No | Register (role: patient/doctor/admin) |
| POST | `/api/auth/login/` | No | Login — returns JWT |
| GET | `/api/auth/profile/` | Yes | Get current user |
| PUT/PATCH | `/api/auth/profile/update/` | Yes | Update current user |
| POST | `/api/contact/` | No | Submit contact form |

### Departments (static catalogue)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/departments/` | No | List all 8 departments |
| GET | `/api/departments/{id}/` | No | Get single department |

### Doctors (admin/public)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/doctors/` | No | List doctors (search, paginated) |
| POST | `/api/doctors/` | Yes | Create doctor |
| GET | `/api/doctors/{id}/` | No | Get single doctor |
| PUT | `/api/doctors/{id}/` | Yes | Update doctor |
| DELETE | `/api/doctors/{id}/` | Yes | Delete doctor |
| GET | `/api/doctors/{id}/availability/` | No | Get available slots |

### Doctor Portal (logged-in doctor's own data)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/doctor/dashboard/` | Yes | Stats + recent appointments |
| GET | `/api/doctor/patients/` | Yes | Patients who booked this doctor |
| GET | `/api/doctor/prescriptions/` | Yes | List prescriptions |
| POST | `/api/doctor/prescriptions/` | Yes | Create prescription `{patient_name, notes}` |

### Patients (admin)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/patients/` | Yes | List patients |
| POST | `/api/patients/` | Yes | Create patient |
| GET | `/api/patients/{id}/` | Yes | Get patient |
| PUT | `/api/patients/{id}/` | Yes | Update patient |
| DELETE | `/api/patients/{id}/` | Yes | Delete patient |

### Patient Portal (logged-in patient's own data)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/patient/dashboard/` | Yes | Stats + recent appointments |
| GET/PATCH | `/api/patient/profile/` | Yes | View or update own profile |
| GET | `/api/patient/reports/` | Yes | Own medical reports |
| GET | `/api/patient/invoices/` | Yes | Own billing invoices |

### Admin Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/overview/` | Yes | Platform-wide stats |
| GET | `/api/admin/dashboard/` | Yes | Same as overview (alias) |
| GET | `/api/admin/analytics/` | Yes | Chart data `?period=week|month|year` |
| GET | `/api/admin/users/` | Yes | All users `?role=&search=` |
| PUT/DELETE | `/api/admin/users/{id}/` | Yes | Update/delete user |
| GET/POST | `/api/admin/doctors/` | Yes | List or add doctors |
| DELETE | `/api/admin/doctors/{id}/` | Yes | Remove doctor |
| GET | `/api/admin/patients/` | Yes | List all patients |
| GET | `/api/admin/appointments/` | Yes | List all appointments |

### Appointments, Billing, Reports, Notifications, Chat
| Prefix | Description |
|--------|-------------|
| `/api/appointments/` | CRUD for appointments |
| `/api/billing/` | Billing records |
| `/api/reports/` | Medical reports |
| `/api/notifications/` | Notifications |
| `/api/chat/conversations/` | Messaging conversations |
| `/api/consultations/` | Consultations (stub) |

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

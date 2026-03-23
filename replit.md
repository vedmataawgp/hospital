# Hospital Digital System

Enterprise-grade Hospital Management and Patient Experience Platform.

## Architecture

- **Frontend**: Next.js (React) — Port 5000 (`frontend/`)
- **Backend**: Django REST Framework — Port 8080 (`artifacts/api-server/`)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4 |
| Backend | Django 5.2, Django REST Framework, SimpleJWT |
| Database | SQLite (dev) / PostgreSQL (prod via `DATABASE_URL`) |
| Auth | JWT tokens (Bearer) |

## Project Structure

```
workspace/
├── frontend/                  # Next.js frontend (port 5000)
│   ├── app/                   # App Router pages
│   │   ├── page.tsx           # Home / Landing page
│   │   ├── doctors/           # Doctors listing with filters
│   │   ├── departments/       # Departments grid
│   │   ├── appointments/      # Step-based booking flow (5 steps)
│   │   ├── auth/              # Login & Register pages
│   │   ├── dashboard/
│   │   │   ├── patient/       # Patient dashboard
│   │   │   ├── doctor/        # Doctor dashboard
│   │   │   └── admin/         # Admin dashboard
│   │   ├── consultation/      # Online consultation chat
│   │   └── contact/           # Contact page
│   └── components/
│       ├── Navbar.tsx         # Sticky navigation
│       └── Footer.tsx         # Site footer
│
└── artifacts/api-server/      # Django backend (port 8080)
    ├── apps/
    │   ├── accounts/          # Custom User model (JWT auth)
    │   ├── patients/          # Patient management
    │   ├── doctors/           # Doctor management
    │   ├── appointments/      # Appointment booking
    │   ├── billing/           # Invoices & payments
    │   ├── reports/           # Medical reports
    │   └── notifications/     # Notifications
    ├── config/
    │   ├── settings.py        # Django settings
    │   └── urls.py            # URL routing
    ├── core/                  # Shared utilities (pagination, permissions)
    ├── manage.py
    └── start.sh               # Startup script
```

## Design System

- **Primary**: `#0A2647` (Deep Blue)
- **Secondary**: `#144272`
- **Accent**: `#2C74B3`
- **Background**: `#F8FAFC`
- **Danger**: `#E63946`
- **Success**: `#2A9D8F`
- **Font**: Inter
- **Border radius**: 12–16px
- **Spacing**: 8px grid

## Running Locally

### Frontend
```bash
cd frontend && PORT=5000 npm run dev
```

### Backend
```bash
cd artifacts/api-server && PORT=8080 bash start.sh
```

## API Proxy

The frontend proxies `/api/*` requests to the Django backend at `http://localhost:8080/api/*` via `next.config.ts`.

## Default Admin Credentials

- Email: `admin@hospital.com`
- Password: `admin123`

## Django Admin

Access at `/api/admin/` on port 8080.

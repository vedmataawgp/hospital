# MediCare — Run on a New PC

Step-by-step guide to get MediCare running from scratch on any machine.

---

## Prerequisites

Install these tools before you start:

| Tool | Version | Download |
|------|---------|----------|
| **Python** | 3.11 or higher | https://www.python.org/downloads/ |
| **Node.js** | 18 or higher | https://nodejs.org/ |
| **uv** (Python package manager) | latest | `pip install uv` or https://github.com/astral-sh/uv |
| **npm** | comes with Node.js | — |

Verify everything is installed:
```bash
python --version    # Python 3.11+
node --version      # v18+
npm --version       # 9+
uv --version        # any
```

---

## Project Structure

```
/
├── frontend/               ← Next.js 16 app  (port 5000)
├── artifacts/
│   └── api-server/         ← Django 5 REST API (port 8080)
├── run.md                  ← This file
└── startup.md              ← Full technical documentation
```

---

## Step 1 — Backend (Django API)

Open a terminal and run these commands:

```bash
# 1. Go into the backend folder
cd artifacts/api-server

# 2. Install Python dependencies
uv pip install -r requirements.txt

# 3. Apply database migrations (creates db.sqlite3 automatically)
uv run python manage.py migrate

# 4. Seed the three test accounts (admin, doctor, patient)
uv run python manage.py shell < seed_users.py

# 5. Start the backend server on port 8080
uv run python manage.py runserver 0.0.0.0:8080
```

Leave this terminal open. The backend runs at **http://localhost:8080**.

---

## Step 2 — Frontend (Next.js)

Open a **second terminal** and run:

```bash
# 1. Go into the frontend folder
cd frontend

# 2. Install Node.js dependencies
npm install

# 3. Start the frontend dev server on port 5000
npm run dev
```

Leave this terminal open. The frontend runs at **http://localhost:5000**.

---

## Step 3 — Open the App

Visit **http://localhost:5000** in your browser.

---

## Test Accounts

Three accounts are created by the seed script in Step 1:

### Admin
```
Email:    admin@medicare.com
Password: Admin@1234
```
Lands on → `/dashboard/admin`

### Doctor — Dr. John Smith (Cardiology)
```
Email:    dr.smith@medicare.com
Password: Doctor@1234
```
Lands on → `/dashboard/doctor`

### Patient — Jane Doe
```
Email:    patient.jane@medicare.com
Password: Patient@1234
```
Lands on → `/dashboard/patient`

---

## All Application URLs

### Frontend pages (port 5000)

| URL | Access | Description |
|-----|--------|-------------|
| `http://localhost:5000/` | Public | Home / landing page |
| `http://localhost:5000/auth/login` | Public | Login for all roles |
| `http://localhost:5000/auth/register` | Public | Register as patient or doctor |
| `http://localhost:5000/doctors` | Public | Browse all doctors |
| `http://localhost:5000/departments` | Public | Browse all departments |
| `http://localhost:5000/appointments` | Login | Book an appointment |
| `http://localhost:5000/chat` | Login | Real-time messaging |
| `http://localhost:5000/dashboard/patient` | Patient | Patient dashboard |
| `http://localhost:5000/dashboard/doctor` | Doctor | Doctor dashboard |
| `http://localhost:5000/dashboard/admin` | Admin | Admin dashboard |

### Backend API (port 8080)

| URL | Description |
|-----|-------------|
| `http://localhost:8080/api/healthz` | Health check |
| `http://localhost:8080/api/auth/login/` | Login endpoint |
| `http://localhost:8080/api/auth/register/` | Register endpoint |
| `http://localhost:8080/api/doctors/` | Doctors list |
| `http://localhost:8080/api/departments/` | Departments list |
| `http://localhost:8080/api/patient/dashboard/` | Patient portal |
| `http://localhost:8080/api/doctor/dashboard/` | Doctor portal |
| `http://localhost:8080/api/admin/overview/` | Admin overview |
| `http://localhost:8080/api/chat/conversations/` | Chat API |
| `http://localhost:8080/api/django-admin/` | Django admin panel |

---

## Environment Variables (Optional)

Create a `.env` file inside `artifacts/api-server/` to override defaults:

```env
# Required in production — change this!
DJANGO_SECRET_KEY=your-secret-key-here

# Set to False in production
DJANGO_DEBUG=True

# Leave empty to use SQLite (default). Set for PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/medicare
```

Without a `.env` file the app runs fine in development using SQLite.

---

## Stopping the Servers

Press `Ctrl + C` in each terminal to stop the frontend and backend.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `uv: command not found` | Run `pip install uv` first |
| Port 5000 already in use | Kill the process: `lsof -ti:5000 \| xargs kill` |
| Port 8080 already in use | Kill the process: `lsof -ti:8080 \| xargs kill` |
| `ModuleNotFoundError` in Django | Re-run `uv pip install -r requirements.txt` |
| `npm install` fails | Delete `node_modules/` then retry |
| 502 / cannot connect | Make sure both terminals are running (Step 1 & 2) |
| Login returns 401 | Run the seed script again (Step 1, point 4) |

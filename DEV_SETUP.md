# MediCare — Dev Setup

One-command startup for both the Django backend and Next.js frontend.

## Quick Start

**Linux / macOS / Git Bash:**
```bash
./dev.sh
```

**Windows (PowerShell):**
```powershell
.\dev.ps1
```

Both scripts will:
1. Verify `uv` is available
2. Run database migrations (SQLite, no config needed)
3. Seed three test accounts (skips if already present)
4. Start Django on **port 8080** and Next.js on **port 5000**

---

## Manual Start (two terminals)

### Terminal 1 — Backend
```bash
cd artifacts/api-server
uv run python manage.py migrate --no-input
uv run python manage.py shell < seed_users.py
uv run python manage.py runserver 0.0.0.0:8080
```

### Terminal 2 — Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Links

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5000 |
| Backend API | http://localhost:8080 |
| Django Admin | http://localhost:8080/api/django-admin/ |

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@medicare.com` | `Admin@1234` |
| Doctor | `dr.smith@medicare.com` | `Doctor@1234` |
| Patient | `patient.jane@medicare.com` | `Patient@1234` |

---

## Environment Variables (optional)

Create `artifacts/api-server/.env` for custom settings:

```env
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True

# Leave blank to use SQLite (default for dev)
# DATABASE_URL=postgresql://user:password@localhost:5432/medicare
```

> The frontend is pre-configured to proxy `/api/*` requests to `http://localhost:8080`.
> No `.env.local` needed for local development.

---

## Python Environment

This project uses a **single `uv`-managed environment** at the workspace root  
(`pyproject.toml` + `.pythonlibs/`). There is **no separate `.venv`** inside `artifacts/api-server`.

All backend commands use `uv run python ...` which automatically resolves to this environment.

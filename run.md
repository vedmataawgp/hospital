# MediCare — Developer Run Guide

## One-Line Start

```bash
./dev.sh          # Linux / macOS / Git Bash
.\dev.ps1         # Windows PowerShell
```

---

## Manual Run

### Backend (Django — port 8080)
```bash
cd artifacts/api-server
uv run python manage.py migrate --no-input
uv run python manage.py shell < seed_users.py
uv run python manage.py runserver 0.0.0.0:8080
```

### Frontend (Next.js — port 5000)
```bash
cd frontend
npm install
npm run dev
```

---

## Port Reference

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5000 |
| Backend API | http://localhost:8080 |
| Django Admin | http://localhost:8080/api/django-admin/ |

---

## Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@medicare.com` | `Admin@1234` |
| Doctor | `dr.smith@medicare.com` | `Doctor@1234` |
| Patient | `patient.jane@medicare.com` | `Patient@1234` |

---

## Environment Variables

Create `artifacts/api-server/.env`:

```env
DJANGO_SECRET_KEY=change-this-in-production
DJANGO_DEBUG=True

# Optional PostgreSQL (SQLite used by default)
# DATABASE_URL=postgresql://user:pass@localhost:5432/medicare
```

---

## Python Environment

**Single environment only** — `uv` manages all packages via `pyproject.toml` at the  
workspace root. **Do NOT** create or use a `.venv` folder inside `artifacts/api-server/`.

If you run from a subdirectory, use `uv run` to automatically locate the root environment:
```bash
cd artifacts/api-server
uv run python manage.py runserver
```

---

## Database

The development database is located at:
`artifacts/api-server/db.sqlite3`

Always run migrations from the `artifacts/api-server` directory using the root environment.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Backend won't start | Check for a redundant `.venv` inside `artifacts/api-server` and DELETE it. |
| Port in use | `npx kill-port 8080 5000` |
| No test users | `cd artifacts/api-server && uv run python manage.py shell < seed_users.py` |
| Migration error | `cd artifacts/api-server && uv run python manage.py migrate --run-syncdb` |


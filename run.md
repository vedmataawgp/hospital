# MediCare — Developer Run Guide

This guide ensures you have everything set up correctly for the first time and explains how to run the project daily.

---

Run the automated script for your terminal:

**PowerShell (Windows):**
```powershell
.\dev.ps1
```

**Bash / Git Bash (Windows/Linux/Mac):**
```bash
./dev.sh
```

---

## 🛠️ Manual Run (Basic Commands)

If you prefer to run things manually in separate terminals:

### Terminal 1: Backend (Django)
```powershell
# 1. Enter backend folder
cd artifacts/api-server

# 2. Create and Activate virtual environment
uv venv
.venv\Scripts\activate

# 3. Install & Run
uv pip install -r requirements.txt
uv run python manage.py migrate
Get-Content seed_users.py | uv run python manage.py shell
uv run python manage.py runserver 0.0.0.0:8080
```

### Terminal 2: Frontend (Next.js)
```powershell
# 1. Enter frontend folder
cd frontend

# 2. Install & Run
npm install
npm run dev
```

---

## 🏃 Daily Run
Just run `.\dev.ps1` in your root folder. It handles both terminals for you.

---

## 🔐 Credentials & Secret Keys (.env)

For security, we do not store secret keys or passwords in the code.

**Where is the `.env` file?**
You should create a file named `.env` in the following location:
`e:\Divy\Projects\GitHub\hospital\artifacts\api-server\.env`

**Example Content for `.env`:**
```env
# Change this for production!
DJANGO_SECRET_KEY=your-actual-secret-key-here
DJANGO_DEBUG=True

# Database (optional - if left empty, SQLite is used)
# DATABASE_URL=postgresql://user:password@localhost:5432/medicare
```

*Note: The Next.js frontend is already configured to talk to `http://localhost:8080` by default. If you need to change this, you can create a `.env.local` in the `frontend` directory.*

---

## 🛠️ Port Reference

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5000 |
| **Backend API** | http://localhost:8080 |
| **Django Admin** | http://localhost:8080/api/django-admin/ |

---

## 💡 Troubleshooting
If you see storage errors or "module not found" errors:
- Delete the `.venv` folder in `artifacts/api-server/` and run `.\dev.ps1` again.
- For frontend issues, delete `frontend/node_modules` and run `.\dev.ps1` again.

# MediCare local Dev Setup (uv + Node)

This script automates the installation and execution of both the backend and frontend.

## 🚀 How to Run

1. Open **PowerShell** in the root of the project.
2. Run:
   ```powershell
   .\dev.ps1
   ```

---

## What this script does:

1. **Checks for `uv`**: If you don't have it, it installs it via `pip install uv`.
2. **Setup Backend (Django)**: 
   - Navigates to `artifacts/api-server`.
   - Installs dependencies using `uv`.
   - Runs database migrations.
   - Seeds initial test users (admin, doctor, patient).
   - Starts the Django server in a **new window** on port 8080.
3. **Setup Frontend (Next.js)**:
   - Navigates to `frontend`.
   - Installs Node.js dependencies.
   - Starts the Next.js development server on port 5000.

---

## Important Links:
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:8080
- **Django Admin**: http://localhost:8080/api/django-admin/

## Test Accounts:
- **Admin**: `admin@medicare.com` / `Admin@1234`
- **Doctor**: `dr.smith@medicare.com` / `Doctor@1234`
- **Patient**: `patient.jane@medicare.com` / `Patient@1234`

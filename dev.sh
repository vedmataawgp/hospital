#!/bin/bash
# dev.sh — Start both backend and frontend for MediCare Hospital
# Uses uv (already installed) with the workspace-level pyproject.toml.
# No separate venv needed: uv uses .pythonlibs at the workspace root.

set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "[1/4] Checking uv..."
if ! command -v uv &>/dev/null; then
    echo "ERROR: uv not found. Run: pip install uv" >&2
    exit 1
fi
echo "      uv $(uv --version) — OK"

echo "[2/4] Running Django migrations..."
cd "$REPO_ROOT/artifacts/api-server"
uv run python manage.py migrate --no-input

echo "[3/4] Seeding initial users (safe to run multiple times)..."
uv run python manage.py shell < seed_users.py 2>/dev/null || true

echo ""
echo "  Backend  → http://localhost:8080"
echo "  Frontend → http://localhost:5000"
echo ""

# Start backend in the background
echo "[4/4] Starting backend (port 8080)..."
uv run python manage.py runserver 0.0.0.0:8080 &
BACKEND_PID=$!

# Give Django a moment to start
sleep 2

# Start frontend in the foreground (CTRL+C stops both)
echo "      Starting frontend (port 5000)..."
cd "$REPO_ROOT/frontend"
npm install --silent
npm run dev

# Clean up backend on exit
kill "$BACKEND_PID" 2>/dev/null || true

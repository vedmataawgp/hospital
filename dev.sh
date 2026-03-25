#!/bin/bash
# dev.sh — Start both backend and frontend for MediCare Hospital
# Uses uv if available with the workspace-level pyproject.toml.

set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$REPO_ROOT/artifacts/api-server"
FRONTEND_DIR="$REPO_ROOT/frontend"

# 1. Environment consolidation: Ensure no redundant venv inside backend
if [ -d "$BACKEND_DIR/.venv" ]; then
    echo "[0/4] Removing redundant backend virtual environment..."
    rm -rf "$BACKEND_DIR/.venv"
fi

# 2. Check for uv and setup environment
echo "[1/4] Preparing Python environment..."
PYTHON_CMD="python3"
if command -v uv &>/dev/null; then
    echo "      Using uv $(uv --version)"
    PYTHON_CMD="uv run python"
else
    echo "      uv not found in PATH, using standard python from .venv"
    VENV_PYTHON="$REPO_ROOT/.venv/bin/python"
    if [ -f "$VENV_PYTHON" ]; then
        PYTHON_CMD="$VENV_PYTHON"
    fi
fi

# 3. Run migrations and seeds
echo "[2/4] Running Django migrations..."
cd "$BACKEND_DIR"
$PYTHON_CMD manage.py migrate --no-input

echo "[3/4] Seeding initial users..."
$PYTHON_CMD manage.py shell < seed_users.py || true

echo ""
echo "  Backend  → http://localhost:8080"
echo "  Frontend → http://localhost:5000"
echo ""

# 4. Start backend in the background
echo "[4/4] Starting backend (port 8080)..."
$PYTHON_CMD manage.py runserver 0.0.0.0:8080 &
BACKEND_PID=$!

# Give Django a moment to start
sleep 2

# Start frontend in the foreground (CTRL+C stops both)
echo "      Starting frontend (port 5000)..."
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    echo "      Installing frontend dependencies..."
    npm install --silent
fi
npm run dev

# Clean up backend on exit
trap "kill $BACKEND_PID" EXIT


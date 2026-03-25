#!/bin/bash
set -e

cd /home/runner/workspace/artifacts/api-server

export DJANGO_SETTINGS_MODULE=config.settings
export PYTHONPATH=/home/runner/workspace/artifacts/api-server

echo "Running Django migrations..."
uv run python manage.py migrate --no-input

echo "Seeding initial users (skips if already exist)..."
uv run python manage.py shell < seed_users.py 2>/dev/null || true

# Only collect static files when not already present or forced
if [ ! -d "staticfiles/admin" ] || [ "${FORCE_COLLECTSTATIC:-}" = "1" ]; then
    echo "Collecting static files..."
    uv run python manage.py collectstatic --no-input 2>/dev/null || true
fi

WORKERS=${GUNICORN_WORKERS:-2}
PORT=${PORT:-8080}

if uv run python -c "import gunicorn" 2>/dev/null; then
    echo "Starting Gunicorn with $WORKERS workers on port $PORT..."
    exec uv run gunicorn config.wsgi:application \
        --bind "0.0.0.0:$PORT" \
        --workers "$WORKERS" \
        --threads 4 \
        --worker-class gthread \
        --timeout 30 \
        --keep-alive 5 \
        --max-requests 1000 \
        --max-requests-jitter 100 \
        --access-logfile - \
        --error-logfile - \
        --log-level warning
else
    echo "Gunicorn not found, falling back to Django dev server on port $PORT..."
    exec uv run python manage.py runserver 0.0.0.0:$PORT
fi

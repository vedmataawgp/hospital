#!/bin/bash
set -e

cd /home/runner/workspace/artifacts/api-server

export DJANGO_SETTINGS_MODULE=config.settings
export PYTHONPATH=/home/runner/workspace/artifacts/api-server

echo "Running Django migrations..."
python manage.py migrate --no-input

echo "Starting Django server on port ${PORT:-8080}..."
exec python manage.py runserver --nothreading 0.0.0.0:${PORT:-8080}

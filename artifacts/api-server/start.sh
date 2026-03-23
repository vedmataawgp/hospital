#!/bin/bash
set -e

cd /home/runner/workspace/artifacts/api-server

export DJANGO_SETTINGS_MODULE=config.settings
export PYTHONPATH=/home/runner/workspace/artifacts/api-server

echo "Running Django migrations..."
python manage.py migrate --run-syncdb

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear 2>/dev/null || true

echo "Creating superuser if not exists..."
python manage.py shell -c "
from apps.accounts.models import User
if not User.objects.filter(email='admin@hospital.com').exists():
    User.objects.create_superuser(
        email='admin@hospital.com',
        name='Admin',
        password='admin123',
        role='admin',
    )
    print('Superuser created: admin@hospital.com / admin123')
else:
    print('Superuser already exists')
" 2>/dev/null || true

echo "Starting Django server on port ${PORT:-8080}..."
exec python manage.py runserver 0.0.0.0:${PORT:-8080}

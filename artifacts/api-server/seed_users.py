"""
Run with:  python manage.py shell < seed_users.py
Or:        uv run python manage.py shell < seed_users.py
"""
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from apps.doctors.models import Doctor
from apps.patients.models import Patient

def seed():
    # ── Admin ──────────────────────────────────────────────────────────────────
    if not User.objects.filter(email='admin@medicare.com').exists():
        User.objects.create_superuser(
            email='admin@medicare.com', name='Admin User',
            password='Admin@1234', role='admin',
        )
        print('[+] Admin created  → admin@medicare.com / Admin@1234')
    else:
        print('[=] Admin already exists')

    # ── Doctor ─────────────────────────────────────────────────────────────────
    if not User.objects.filter(email='dr.smith@medicare.com').exists():
        doc = User.objects.create_user(
            email='dr.smith@medicare.com', name='Dr. John Smith',
            password='Doctor@1234', role='doctor',
        )
        Doctor.objects.create(
            user=doc, specialization='Cardiology', experience=8,
            phone='+1-555-0101',
            bio='Board-certified cardiologist with 8 years of experience.',
        )
        print('[+] Doctor created → dr.smith@medicare.com / Doctor@1234')
    else:
        print('[=] Doctor already exists')

    # ── Patient ────────────────────────────────────────────────────────────────
    if not User.objects.filter(email='patient.jane@medicare.com').exists():
        pat = User.objects.create_user(
            email='patient.jane@medicare.com', name='Jane Doe',
            password='Patient@1234', role='patient',
        )
        Patient.objects.create(
            user=pat, age=34, gender='female',
            phone='+1-555-0202', blood_group='O+',
        )
        print('[+] Patient created → patient.jane@medicare.com / Patient@1234')
    else:
        print('[=] Patient already exists')

    print('\nDone. All test accounts ready.')

seed()

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static


def health_check(request):
    return JsonResponse({'status': 'ok'})


# Customize Django admin site branding
admin.site.site_header = 'Hospital Management — Admin'
admin.site.site_title = 'Hospital Admin Portal'
admin.site.index_title = 'Administration Dashboard'

urlpatterns = [
    # Django Admin Panel (accessible at /api/django-admin/)
    path('api/django-admin/', admin.site.urls),

    # Health check
    path('api/healthz', health_check, name='health-check'),

    # Auth
    path('api/auth/', include('apps.accounts.urls')),

    # Contact form (public)
    path('api/contact/', __import__('apps.accounts.views', fromlist=['contact']).contact, name='contact'),

    # Consultations
    path('api/consultations/', __import__('apps.accounts.views', fromlist=['consultations']).consultations, name='consultations'),
    path('api/consultations/<int:pk>/messages/', __import__('apps.accounts.views', fromlist=['consultation_messages']).consultation_messages, name='consultation-messages'),

    # Departments (served from doctors views, static catalogue)
    path('api/departments/', __import__('apps.doctors.views', fromlist=['department_list']).department_list, name='department-list'),
    path('api/departments/<int:pk>/', __import__('apps.doctors.views', fromlist=['department_detail']).department_detail, name='department-detail'),

    # Patient management (admin/staff)
    path('api/patients/', include('apps.patients.urls')),

    # Patient portal (logged-in patient's own data)
    path('api/patient/dashboard/', __import__('apps.patients.views', fromlist=['patient_portal_dashboard']).patient_portal_dashboard, name='patient-portal-dashboard'),
    path('api/patient/profile/', __import__('apps.patients.views', fromlist=['patient_portal_profile']).patient_portal_profile, name='patient-portal-profile'),
    path('api/patient/reports/', __import__('apps.patients.views', fromlist=['patient_portal_reports']).patient_portal_reports, name='patient-portal-reports'),
    path('api/patient/invoices/', __import__('apps.patients.views', fromlist=['patient_portal_invoices']).patient_portal_invoices, name='patient-portal-invoices'),

    # Doctor management (admin/staff)
    path('api/doctors/', include('apps.doctors.urls')),

    # Doctor portal (logged-in doctor's own data)
    path('api/doctor/dashboard/', __import__('apps.doctors.views', fromlist=['doctor_portal_dashboard']).doctor_portal_dashboard, name='doctor-portal-dashboard'),
    path('api/doctor/patients/', __import__('apps.doctors.views', fromlist=['doctor_portal_patients']).doctor_portal_patients, name='doctor-portal-patients'),
    path('api/doctor/prescriptions/', __import__('apps.doctors.views', fromlist=['doctor_portal_prescriptions']).doctor_portal_prescriptions, name='doctor-portal-prescriptions'),
    path('api/doctor/profile/', __import__('apps.doctors.views', fromlist=['doctor_portal_profile']).doctor_portal_profile, name='doctor-portal-profile'),

    # Appointments
    path('api/appointments/', include('apps.appointments.urls')),

    # Billing
    path('api/billing/', include('apps.billing.urls')),

    # Reports
    path('api/reports/', include('apps.reports.urls')),

    # Notifications
    path('api/notifications/', include('apps.notifications.urls')),

    # Custom Admin Dashboard API (used by the frontend)
    path('api/admin/', include('apps.admin_dashboard.urls')),

    # Chat
    path('api/chat/', include('apps.chat.urls')),

    # Prescriptions (also accessible via /api/appointments/prescriptions/)
    path('api/prescriptions/', __import__('apps.appointments.views', fromlist=['prescription_list']).prescription_list, name='prescription-list-root'),

    # File upload
    path('api/upload/', __import__('core.views', fromlist=['upload_file']).upload_file, name='file-upload'),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

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

    # API routes
    path('api/auth/', include('apps.accounts.urls')),
    path('api/patients/', include('apps.patients.urls')),
    path('api/doctors/', include('apps.doctors.urls')),
    path('api/appointments/', include('apps.appointments.urls')),
    path('api/billing/', include('apps.billing.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    # Custom Admin Dashboard API (used by the frontend)
    path('api/admin/', include('apps.admin_dashboard.urls')),
    # Chat
    path('api/chat/', include('apps.chat.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

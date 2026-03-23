from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard, name='admin-dashboard'),
    path('overview/', views.overview, name='admin-overview'),
    path('analytics/', views.analytics, name='admin-analytics'),
    path('users/', views.user_list, name='admin-users'),
    path('users/<int:pk>/', views.user_detail, name='admin-user-detail'),
    path('doctors/', views.admin_doctors, name='admin-doctors'),
    path('doctors/<int:pk>/', views.admin_doctor_detail, name='admin-doctor-detail'),
    path('patients/', views.admin_patients, name='admin-patients'),
    path('appointments/', views.admin_appointments, name='admin-appointments'),
]

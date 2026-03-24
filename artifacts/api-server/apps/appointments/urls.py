from django.urls import path
from . import views

urlpatterns = [
    path('', views.appointment_list, name='appointment-list'),
    path('<int:pk>/', views.appointment_detail, name='appointment-detail'),
    path('<int:pk>/confirm/', views.confirm_appointment, name='appointment-confirm'),
    path('<int:pk>/cancel/', views.cancel_appointment, name='appointment-cancel'),
    path('prescriptions/', views.prescription_list, name='prescription-list'),
    path('prescriptions/<int:pk>/', views.prescription_detail, name='prescription-detail'),
]

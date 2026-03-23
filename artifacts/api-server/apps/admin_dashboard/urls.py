from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard, name='admin-dashboard'),
    path('analytics/', views.analytics, name='admin-analytics'),
    path('users/', views.user_list, name='admin-users'),
    path('users/<int:pk>/', views.user_detail, name='admin-user-detail'),
]

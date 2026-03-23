from django.urls import path
from . import views

urlpatterns = [
    path('', views.billing_list, name='billing-list'),
    path('<int:pk>/', views.billing_detail, name='billing-detail'),
    path('<int:pk>/pay/', views.pay_billing, name='billing-pay'),
]

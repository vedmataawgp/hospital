from django.urls import path
from . import views

urlpatterns = [
    path('register', views.register, name='auth-register'),
    path('login', views.login, name='auth-login'),
    path('profile', views.profile, name='auth-profile'),
    path('profile/update', views.update_profile, name='auth-profile-update'),
    path('profile/avatar', views.upload_avatar, name='auth-avatar-upload'),
    path('profile/change-password', views.change_password, name='auth-change-password'),
    path('forgot-password', views.forgot_password, name='auth-forgot-password'),
    path('reset-password', views.reset_password, name='auth-reset-password'),
]

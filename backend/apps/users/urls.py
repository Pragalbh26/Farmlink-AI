from django.urls import path
from .views import register_view, login_view, user_profile_view

urlpatterns = [
    path('register', register_view, name='register'),
    path('login', login_view, name='login'),
    path('profile', user_profile_view, name='user-profile'),
]
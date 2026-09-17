from django.urls import path
from .views import health_check, transport_providers

urlpatterns = [
    path('health', health_check, name='health_check'),
    path('api/v1/transport/providers', transport_providers, name='transport-providers'),
]

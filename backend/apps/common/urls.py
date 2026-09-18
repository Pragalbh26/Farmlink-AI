from django.urls import path
from .views import health_check, transport_providers

urlpatterns = [
    # Resolves to: /api/v1/common/health/
    path('health/', health_check, name='health_check'),
    
    # Resolves to: /api/v1/common/transport/providers/
    path('transport/providers/', transport_providers, name='transport-providers'),
]
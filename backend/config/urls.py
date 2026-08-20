from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('apps.common.urls')),
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/listings/', include('apps.listings.urls')),
    path('api/v1/orders/', include('apps.orders.urls')),
    path('api/v1/weather/', include('apps.weather.urls')),
    path('api/v1/', include('apps.ai_services.urls')),
]
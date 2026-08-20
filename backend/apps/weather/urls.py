from django.urls import path
from .views import current_weather_view, forecast_weather_view

urlpatterns = [
    path('current', current_weather_view, name='weather-current'),
    path('forecast', forecast_weather_view, name='weather-forecast'),
]
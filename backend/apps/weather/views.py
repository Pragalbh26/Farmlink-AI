import requests
from datetime import datetime, timedelta
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def current_weather_view(request):
    location = request.GET.get('location', 'Pune, Maharashtra')
    now_iso = datetime.now().isoformat()

    # ==========================================
    # TODO: FUTURE REAL API INTEGRATION
    # ==========================================
    # api_key = getattr(settings, 'WEATHER_API_KEY', '')
    # url = f"https://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
    # try:
    #     real_data = requests.get(url, timeout=5).json()
    # except requests.exceptions.RequestException:
    #     return Response({"error": "Weather service unavailable"}, status=503)

    return Response({
        "success": True,
        "data": {
            "location": location,
            "temperature_celsius": 28.5,
            "currentTemp": 28.5,
            "condition": "Sunny",
            "humidity_percent": 65,
            "humidity": "65%",
            "rainfallChance": "20%",
            "windSpeed": "12 km/h",
            "advisories": [],
            "fiveDayForecast": [],
            "verifiedTimestamp": now_iso,
            "source": "Source: India Meteorological Department (IMD)",
            "timestamp": now_iso
        },
        "meta": {"source": "mock_weather_adapter"}
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def forecast_weather_view(request):
    location = request.GET.get('location', 'Unknown')
    
    # Generate dynamic future dates so the frontend never gets "stale" mock data
    today = datetime.now()
    tomorrow = (today + timedelta(days=1)).strftime("%Y-%m-%d")
    day_after = (today + timedelta(days=2)).strftime("%Y-%m-%d")

    return Response({
        "success": True,
        "data": {
            "location": location,
            "forecast": [
                {"date": tomorrow, "high": 30, "low": 22, "condition": "Sunny", "alert": None},
                {"date": day_after, "high": 29, "low": 23, "condition": "Rain", "alert": "Heavy rainfall expected"}
            ]
        },
        "meta": {"source": "mock_weather_adapter"}
    }, status=status.HTTP_200_OK)
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from datetime import datetime

@api_view(['GET'])
@permission_classes([AllowAny])
def current_weather_view(request):
    # Mock data for frontend development
    return Response({
        "success": True,
        "data": {
            "location": request.GET.get('location', 'Unknown'),
            "temperature_celsius": 28.5,
            "condition": "Sunny",
            "humidity_percent": 65,
            "timestamp": datetime.now().isoformat()
        },
        "meta": {"source": "mock_weather_adapter"}
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def forecast_weather_view(request):
    # Mock data for frontend development
    return Response({
        "success": True,
        "data": {
            "location": request.GET.get('location', 'Unknown'),
            "forecast": [
                {"date": "2026-08-14", "high": 30, "low": 22, "condition": "Sunny", "alert": None},
                {"date": "2026-08-15", "high": 29, "low": 23, "condition": "Rain", "alert": "Heavy rainfall expected"}
            ]
        },
        "meta": {"source": "mock_weather_adapter"}
    }, status=status.HTTP_200_OK)
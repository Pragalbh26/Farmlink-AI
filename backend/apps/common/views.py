from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({
        "status": "ok",
        "message": "AgriConnect Django backend is running"
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transport_providers(request):
    return Response({'success': True, 'data': [
        {'id': 'local-transport-1', 'name': 'Kisan Freight Services', 'vehicleType': 'Eicher Pro', 'capacity': '5 Ton', 'status': 'available', 'ratePerKm': '₹28/km', 'rating': 4.8, 'experienceYears': 8, 'operationalCorridors': ['Pune', 'Nashik', 'Mumbai']},
        {'id': 'local-transport-2', 'name': 'Rural Route Logistics', 'vehicleType': 'Bolero Pickup', 'capacity': '1.5 Ton', 'status': 'available', 'ratePerKm': '₹20/km', 'rating': 4.6, 'experienceYears': 5, 'operationalCorridors': ['Pune', 'Satara', 'Kolhapur']},
    ]})

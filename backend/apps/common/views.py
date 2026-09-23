from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from apps.users.models import User

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Public endpoint to verify the server is running.
    Useful for Docker health checks and frontend initial connection testing.
    """
    return Response({
        "status": "ok",
        "message": "FarmLink AI Django backend is running normally."
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transport_providers(request):
    providers = User.objects.filter(
        role='transporter', transporter_profile__is_available=True,
    ).exclude(
        transporter_profile__vehicle_type='Not specified',
    ).filter(
        transporter_profile__capacity__gt=0,
    ).select_related('transporter_profile').order_by('name')
    data = [{
        'id': str(user.id),
        'name': user.name,
        'vehicleType': user.transporter_profile.vehicle_type,
        'capacity': f"{user.transporter_profile.capacity} Ton",
        'status': 'available' if user.transporter_profile.is_available else 'busy',
        'ratePerKm': 'Contact for quote',
        'rating': 'New',
        'experienceYears': '—',
        'operationalCorridors': [],
    } for user in providers]
    return Response({'success': True, 'data': data})

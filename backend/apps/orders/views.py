from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Order, TransportBooking
from .serializers import OrderSerializer, TransportBookingSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order_view(request):
    if request.user.role != 'buyer':
        return Response({
            "success": False, 
            "error": "Only buyers can place orders."
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = OrderSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response({
            "success": True, 
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
        
    return Response({
        "success": False, 
        "error": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders_view(request):
    orders = Order.objects.filter(buyer=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response({
        "success": True, 
        "data": serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_transport_view(request):
    # This allows either the farmer or the buyer to request transport for an existing order
    serializer = TransportBookingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            "success": True, 
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
        
    return Response({
        "success": False, 
        "error": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Order, TransportBooking
from .serializers import OrderSerializer, TransportBookingSerializer
from apps.common.permissions import IsBuyer

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsBuyer]) # <-- Security handled here!
def create_order_view(request):
    # Notice we deleted the manual role check. If a farmer hits this, 
    # Django instantly returns a 403 Forbidden.
    serializer = OrderSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_201_CREATED)
        
    return Response({"success": False, "error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders_view(request):
    orders = Order.objects.filter(buyer=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_transport_view(request):
    serializer = TransportBookingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"success": True, "data": serializer.data}, status=status.HTTP_201_CREATED)
        
    return Response({"success": False, "error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
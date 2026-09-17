from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Order, TransportBooking
from .serializers import OrderSerializer, TransportBookingSerializer
from apps.common.permissions import IsBuyer
from apps.common.utils import send_realtime_notification

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsBuyer])
def create_order_view(request):
    serializer = OrderSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        order = serializer.save()
        
        # Notify the farmer about the new order
        try:
            farmer_id = str(order.listing.farmer.id)
            send_realtime_notification(
                user_id=farmer_id, 
                message_text="Great news! A buyer just placed an order for your listing.",
                alert_type="new_order"
            )
        except AttributeError:
            pass # Safely ignore if mock data is missing relations

        return Response({"success": True, "data": serializer.data}, status=status.HTTP_201_CREATED)
        
    return Response({"success": False, "error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders_view(request):
    orders = Order.objects.filter(buyer=request.user).order_by('-created_at')
    if request.user.role == 'farmer':
        orders = Order.objects.filter(listing__farmer=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_transport_view(request):
    serializer = TransportBookingSerializer(data=request.data)
    
    if serializer.is_valid():
        booking = serializer.save()
        
        # Notify the transporter about the pickup request
        try:
            transporter_id = str(booking.transporter.id)
            send_realtime_notification(
                user_id=transporter_id, 
                message_text="New transport pickup requested at your location!",
                alert_type="transport_request"
            )
        except AttributeError:
            pass

        return Response({"success": True, "data": serializer.data}, status=status.HTTP_201_CREATED)
        
    return Response({"success": False, "error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import models
from django.db import IntegrityError, transaction

from .models import Order, TransportBooking
from .serializers import OrderSerializer, TransportBookingSerializer
from apps.common.permissions import IsBuyer, IsTransporter
from apps.common.utils import send_realtime_notification

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsBuyer])
def create_order_view(request):
    serializer = OrderSerializer(data=request.data, context={'request': request})

    if serializer.is_valid():
        order = serializer.save()

        # Notify the farmer with a dynamic message
        try:
            farmer_id = str(order.listing.farmer.id)
            crop_name = order.listing.crop
            qty = order.quantity
            unit = order.listing.unit

            send_realtime_notification(
                user_id=farmer_id,
                message_text=f"Great news! A buyer just ordered {qty} {unit} of your {crop_name}.",
                alert_type="new_order"
            )
        except Exception:
            pass # Safely ignore if mock data is missing relations

        return Response({"success": True, "data": serializer.data}, status=status.HTTP_201_CREATED)

    return Response({"success": False, "error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders_view(request):
    # select_related fetches the connected listing and farmer in a single SQL join, preventing N+1 bugs
    base_query = Order.objects.select_related('listing', 'listing__farmer', 'buyer').order_by('-created_at')

    # Route logic based on user role
    if getattr(request.user, 'role', '') == 'farmer':
        orders = base_query.filter(listing__farmer=request.user)
    else:
        orders = base_query.filter(buyer=request.user)

    serializer = OrderSerializer(orders, many=True)
    return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_order_status_view(request, order_id):
    try:
        order = Order.objects.select_related('listing').get(pk=order_id)
    except (Order.DoesNotExist, ValueError):
        return Response({'success': False, 'error': {'message': 'Order not found.'}}, status=status.HTTP_404_NOT_FOUND)

    next_status = request.data.get('status')
    allowed = {'placed': 'confirmed', 'confirmed': 'fulfilled'}
    if request.user.role != 'farmer' or order.listing.farmer_id != request.user.id:
        return Response({'success': False, 'error': {'message': 'Only the listing farmer can update this order.'}}, status=status.HTTP_403_FORBIDDEN)
    if allowed.get(order.status) != next_status:
        return Response({'success': False, 'error': {'message': 'This order status transition is not allowed.'}}, status=status.HTTP_409_CONFLICT)

    order.status = next_status
    order.save(update_fields=['status', 'updated_at'])
    return Response({'success': True, 'data': OrderSerializer(order).data})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def request_transport_view(request):
    if request.method == 'GET':
        if request.user.role == 'transporter':
            bookings = TransportBooking.objects.filter(models.Q(transporter=request.user) | models.Q(transporter__isnull=True, status='requested')).select_related('order__listing__farmer').order_by('-created_at')
        elif request.user.role == 'buyer':
            bookings = TransportBooking.objects.filter(order__buyer=request.user).select_related('order__listing__farmer').order_by('-created_at')
        elif request.user.role == 'farmer':
            bookings = TransportBooking.objects.filter(order__listing__farmer=request.user).select_related('order__listing__farmer').order_by('-created_at')
        else:
            bookings = TransportBooking.objects.none()
        return Response({'success': True, 'data': TransportBookingSerializer(bookings, many=True, context={'request': request}).data})

    serializer = TransportBookingSerializer(data=request.data, context={'request': request})

    if serializer.is_valid():
        try:
            with transaction.atomic():
                booking = serializer.save()
        except IntegrityError:
            return Response({'success': False, 'error': {'message': 'Transport has already been requested for this order.'}}, status=status.HTTP_409_CONFLICT)

        return Response({"success": True, "data": serializer.data}, status=status.HTTP_201_CREATED)

    return Response({"success": False, "error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsTransporter])
def update_transport_booking_view(request, booking_id):
    try:
        booking = TransportBooking.objects.select_related('order__listing__farmer').get(pk=booking_id)
    except (TransportBooking.DoesNotExist, ValueError):
        return Response({'success': False, 'error': {'message': 'Transport request not found.'}}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    if new_status == 'accepted':
        if booking.transporter_id not in (None, request.user.id) or booking.status != 'requested':
            return Response({'success': False, 'error': {'message': 'This request is no longer available.'}}, status=status.HTTP_409_CONFLICT)
        if not request.user.transporter_profile.is_available:
            return Response({'success': False, 'error': {'message': 'Set your availability to accepting bookings before accepting a trip.'}}, status=status.HTTP_409_CONFLICT)
        profile = request.user.transporter_profile
        if profile.vehicle_type == 'Not specified' or profile.capacity <= 0:
            return Response({'success': False, 'error': {'message': 'Add your vehicle type and positive capacity to your profile before accepting a trip.'}}, status=status.HTTP_409_CONFLICT)
        booking.transporter = request.user
    elif new_status == 'in_transit':
        if booking.transporter_id != request.user.id or booking.status != 'accepted':
            return Response({'success': False, 'error': {'message': 'Only your accepted trips can be marked in transit.'}}, status=status.HTTP_409_CONFLICT)
    elif new_status == 'completed':
        if booking.transporter_id != request.user.id or booking.status != 'in_transit':
            return Response({'success': False, 'error': {'message': 'Only your active trips can be completed.'}}, status=status.HTTP_409_CONFLICT)
    elif new_status == 'cancelled':
        if booking.transporter_id != request.user.id or booking.status not in ('accepted', 'in_transit'):
            return Response({'success': False, 'error': {'message': 'This trip cannot be cancelled by this account.'}}, status=status.HTTP_409_CONFLICT)
    else:
        return Response({'success': False, 'error': {'message': 'Unsupported transport status.'}}, status=status.HTTP_400_BAD_REQUEST)

    booking.status = new_status
    booking.save(update_fields=['transporter', 'status', 'updated_at'])
    return Response({'success': True, 'data': TransportBookingSerializer(booking, context={'request': request}).data})

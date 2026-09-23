from rest_framework import serializers
from .models import Order, TransportBooking
from apps.users.models import User

class OrderSerializer(serializers.ModelSerializer):
    crop = serializers.CharField(source='listing.crop', read_only=True)
    variety = serializers.CharField(source='listing.variety', read_only=True)
    unit = serializers.CharField(source='listing.unit', read_only=True)
    image_url = serializers.CharField(source='listing.image_url', read_only=True, allow_null=True)
    listing_location = serializers.CharField(source='listing.location', read_only=True)
    farmer_name = serializers.CharField(source='listing.farmer.name', read_only=True)
    buyer_name = serializers.CharField(source='buyer.name', read_only=True)
    unit_price = serializers.DecimalField(source='agreed_price', max_digits=10, decimal_places=2, read_only=True)
    total_amount = serializers.SerializerMethodField()
    transport_status = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    class Meta:
        model = Order
        fields = ('id', 'buyer', 'buyer_name', 'listing', 'crop', 'variety', 'unit', 'image_url', 'listing_location', 'quantity', 'agreed_price', 'unit_price', 'total_amount', 'farmer_name', 'status', 'transport_status', 'created_at', 'createdAt', 'updated_at')
        read_only_fields = ('id', 'buyer', 'status', 'created_at', 'updated_at')

    def validate(self, data):
        listing = data['listing']
        quantity = data['quantity']
        if data.get('agreed_price') != listing.expected_price:
            raise serializers.ValidationError({'agreed_price': 'The order price must match the listed unit price.'})

        if listing.status != 'active':
            raise serializers.ValidationError({'listing': 'This crop listing is no longer available.'})
        if listing.farmer_id == self.context['request'].user.id:
            raise serializers.ValidationError({'listing': 'You cannot place an order on your own listing.'})
        
        if quantity > listing.quantity:
            raise serializers.ValidationError({
                "quantity": f"Order quantity cannot exceed available listing quantity ({listing.quantity} {listing.unit})."
            })
        return data

    def get_total_amount(self, obj):
        return obj.quantity * obj.agreed_price

    def get_transport_status(self, obj):
        booking = obj.transport_booking.first()
        return booking.status if booking else None

    def create(self, validated_data):
        from django.db import transaction
        validated_data['buyer'] = self.context['request'].user
        with transaction.atomic():
            listing = type(validated_data['listing']).objects.select_for_update().get(pk=validated_data['listing'].pk)
            if listing.status != 'active' or validated_data['quantity'] > listing.quantity:
                raise serializers.ValidationError({'quantity': 'The available quantity changed. Refresh the listing and try again.'})
            validated_data['listing'] = listing
            listing.quantity -= validated_data['quantity']
            if listing.quantity == 0:
                listing.status = 'sold'
            listing.save(update_fields=['quantity', 'status', 'updated_at'])
            return super().create(validated_data)


class TransportBookingSerializer(serializers.ModelSerializer):
    crop = serializers.CharField(source='order.listing.crop', read_only=True)
    quantity = serializers.DecimalField(source='order.quantity', max_digits=10, decimal_places=2, read_only=True)
    farmer_name = serializers.CharField(source='order.listing.farmer.name', read_only=True)
    farmer_phone = serializers.SerializerMethodField()
    unit = serializers.CharField(source='order.listing.unit', read_only=True)
    transporter = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='transporter'), required=False, allow_null=True)

    class Meta:
        model = TransportBooking
        fields = ('id', 'order', 'transporter', 'pickup_location', 'dropoff_location', 'status', 'crop', 'quantity', 'unit', 'farmer_name', 'farmer_phone', 'created_at', 'updated_at')
        read_only_fields = ('id', 'status', 'created_at', 'updated_at')

    def validate_order(self, order):
        user = self.context['request'].user
        if user.role not in ('buyer', 'farmer'):
            raise serializers.ValidationError('Only a buyer or the farmer who owns the listing can request transport.')
        if order.buyer_id != user.id and order.listing.farmer_id != user.id:
            raise serializers.ValidationError('You can only arrange delivery for an order you placed or a listing you own.')
        if order.status not in ('placed', 'confirmed'):
            raise serializers.ValidationError('Transport can only be arranged for a placed or confirmed order.')
        if TransportBooking.objects.filter(order=order).exists():
            raise serializers.ValidationError('Transport has already been requested for this order.')
        return order

    def validate_transporter(self, transporter):
        if transporter and not transporter.transporter_profile.is_available:
            raise serializers.ValidationError('This transporter is not currently accepting bookings.')
        return transporter

    def get_farmer_phone(self, obj):
        request = self.context.get('request')
        if request and request.user.role == 'transporter' and obj.transporter_id == request.user.id:
            return obj.order.listing.farmer.phone
        return None

    def create(self, validated_data):
        validated_data.setdefault('transporter', None)
        return super().create(validated_data)

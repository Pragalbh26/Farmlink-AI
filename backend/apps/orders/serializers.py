from decimal import Decimal
from django.db import transaction
from rest_framework import serializers

from .models import Order, TransportBooking
from apps.listings.models import CropListing


class OrderSerializer(serializers.ModelSerializer):
    crop = serializers.CharField(source='listing.crop', read_only=True)
    variety = serializers.CharField(source='listing.variety', read_only=True)
    unit = serializers.CharField(source='listing.unit', read_only=True)
    farmer_name = serializers.CharField(source='listing.farmer.name', read_only=True)
    unit_price = serializers.DecimalField(
        source='agreed_price', max_digits=10, decimal_places=2, read_only=True
    )
    total_amount = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'buyer', 'listing', 'crop', 'variety', 'unit',
            'quantity', 'agreed_price', 'unit_price', 'total_amount',
            'farmer_name', 'status', 'created_at', 'createdAt', 'updated_at'
        )
        read_only_fields = ('id', 'buyer', 'status', 'created_at', 'updated_at')

    def validate(self, data):
        listing = data.get('listing')
        quantity = data.get('quantity')

        if quantity is not None and listing is not None:
            if quantity <= 0:
                raise serializers.ValidationError({
                    "quantity": "Order quantity must be greater than zero."
                })
            if quantity > listing.quantity:
                raise serializers.ValidationError({
                    "quantity": f"Order quantity cannot exceed available listing quantity ({listing.quantity} {listing.unit})."
                })
        return data

    def get_total_amount(self, obj):
        if obj.quantity and obj.agreed_price:
            return round(obj.quantity * obj.agreed_price, 2)
        return Decimal('0.00')

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['buyer'] = request.user

        # Wrap in an atomic block and lock the listing row to prevent race conditions
        with transaction.atomic():
            listing = CropListing.objects.select_for_update().get(pk=validated_data['listing'].pk)
            quantity = validated_data['quantity']

            # Double-check inventory under row-lock
            if quantity > listing.quantity:
                raise serializers.ValidationError({
                    "quantity": f"Only {listing.quantity} {listing.unit} remaining."
                })

            # If agreed_price wasn't passed in payload, default to listing's unit price
            if 'agreed_price' not in validated_data or not validated_data['agreed_price']:
                validated_data['agreed_price'] = getattr(listing, 'price_per_unit', Decimal('0.00'))

            # Deduct stock
            listing.quantity -= quantity
            if listing.quantity == 0:
                listing.status = 'sold'
            listing.save()

            validated_data['listing'] = listing
            return super().create(validated_data)


class TransportBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportBooking
        fields = (
            'id', 'order', 'transporter', 'pickup_location',
            'dropoff_location', 'status', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'transporter', 'status', 'created_at', 'updated_at')
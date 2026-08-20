from rest_framework import serializers
from .models import Order, TransportBooking
from apps.listings.models import CropListing

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ('id', 'buyer', 'listing', 'quantity', 'agreed_price', 'status', 'created_at', 'updated_at')
        read_only_fields = ('id', 'buyer', 'status', 'created_at', 'updated_at')

    def validate(self, data):
        listing = data['listing']
        quantity = data['quantity']
        
        if quantity > listing.quantity:
            raise serializers.ValidationError({
                "quantity": f"Order quantity cannot exceed available listing quantity ({listing.quantity} {listing.unit})."
            })
        return data

    def create(self, validated_data):
        validated_data['buyer'] = self.context['request'].user
        
        listing = validated_data['listing']
        listing.quantity -= validated_data['quantity']
        
        if listing.quantity == 0:
            listing.status = 'sold'
            
        listing.save()
        
        return super().create(validated_data)


class TransportBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportBooking
        fields = ('id', 'order', 'transporter', 'pickup_location', 'dropoff_location', 'status', 'created_at', 'updated_at')
        read_only_fields = ('id', 'transporter', 'status', 'created_at', 'updated_at')
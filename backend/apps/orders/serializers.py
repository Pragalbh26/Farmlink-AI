from rest_framework import serializers
from .models import Order, TransportBooking
from apps.listings.models import CropListing

class OrderSerializer(serializers.ModelSerializer):
    crop = serializers.CharField(source='listing.crop', read_only=True)
    variety = serializers.CharField(source='listing.variety', read_only=True)
    unit = serializers.CharField(source='listing.unit', read_only=True)
    farmer_name = serializers.CharField(source='listing.farmer.name', read_only=True)
    unit_price = serializers.DecimalField(source='agreed_price', max_digits=10, decimal_places=2, read_only=True)
    total_amount = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    class Meta:
        model = Order
        fields = ('id', 'buyer', 'listing', 'crop', 'variety', 'unit', 'quantity', 'agreed_price', 'unit_price', 'total_amount', 'farmer_name', 'status', 'created_at', 'createdAt', 'updated_at')
        read_only_fields = ('id', 'buyer', 'status', 'created_at', 'updated_at')

    def validate(self, data):
        listing = data['listing']
        quantity = data['quantity']
        
        if quantity > listing.quantity:
            raise serializers.ValidationError({
                "quantity": f"Order quantity cannot exceed available listing quantity ({listing.quantity} {listing.unit})."
            })
        return data

    def get_total_amount(self, obj):
        return obj.quantity * obj.agreed_price

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

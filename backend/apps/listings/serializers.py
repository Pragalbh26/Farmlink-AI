from rest_framework import serializers
from .models import CropListing

class CropListingSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.name', read_only=True)
    farmer_phone = serializers.CharField(source='farmer.phone', read_only=True)

    class Meta:
        model = CropListing
        fields = (
            'id', 'farmer', 'farmer_name', 'farmer_phone', 'crop', 'variety', 
            'quantity', 'unit', 'expected_price', 'location', 'image_url', 
            'status', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'farmer', 'created_at', 'updated_at', 'status')

    def create(self, validated_data):
        # Automatically assign the logged-in user as the farmer
        validated_data['farmer'] = self.context['request'].user
        return super().create(validated_data)
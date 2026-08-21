from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.name', read_only=True)

    class Meta:
        model = Review
        fields = ('id', 'reviewer', 'reviewer_name', 'reviewee', 'order', 'rating', 'comment', 'created_at')
        read_only_fields = ('id', 'reviewer', 'created_at')
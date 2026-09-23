from rest_framework import serializers
import re
from decimal import Decimal
from django.contrib.auth import authenticate
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, FarmerProfile, BuyerProfile, TransporterProfile


class FarmerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmerProfile
        fields = ('state', 'district', 'village')


class BuyerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyerProfile
        fields = ('organization_name', 'location')


class TransporterProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransporterProfile
        fields = ('vehicle_type', 'capacity', 'is_available')


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)
    vehicle_type = serializers.CharField(required=False, max_length=50, allow_blank=False)
    capacity = serializers.DecimalField(required=False, max_digits=10, decimal_places=2, min_value=Decimal('0.01'))

    class Meta:
        model = User
        fields = ('id', 'phone', 'name', 'password', 'role', 'vehicle_type', 'capacity')

    def validate_phone(self, value):
        normalized = re.sub(r'[\s()-]', '', value)
        if not re.fullmatch(r'\+?[0-9]{10,15}', normalized):
            raise serializers.ValidationError('Enter a valid phone number with 10 to 15 digits.')
        return normalized

    def validate_role(self, value):
        if value not in ('farmer', 'buyer', 'transporter'):
            raise serializers.ValidationError('Choose farmer, buyer, or transporter.')
        return value

    @transaction.atomic
    def create(self, validated_data):
        state = self.initial_data.get('state', 'Maharashtra')
        district = self.initial_data.get('district', 'Pune')
        user = User.objects.create_user(
            phone=validated_data['phone'],
            name=validated_data.get('name', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'farmer')
        )
        # Create corresponding profile based on role
        if user.role == 'farmer':
            FarmerProfile.objects.create(user=user, state=state, district=district, village=self.initial_data.get('village', ''))
        elif user.role == 'buyer':
            BuyerProfile.objects.create(user=user, location=district)
        elif user.role == 'transporter':
            TransporterProfile.objects.create(
                user=user,
                vehicle_type=validated_data.get('vehicle_type', 'Not specified'),
                capacity=validated_data.get('capacity', 0),
            )
        return user


class UserLoginSerializer(serializers.Serializer):
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        phone = re.sub(r'[\s()-]', '', data.get('phone', ''))
        password = data.get('password')

        user = authenticate(phone=phone, password=password)
        if not user:
            raise serializers.ValidationError("Invalid phone number or password.")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        refresh = RefreshToken.for_user(user)
        return {
            'user': user,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }


class UserProfileSerializer(serializers.ModelSerializer):
    farmer_profile = FarmerProfileSerializer(required=False)
    buyer_profile = BuyerProfileSerializer(required=False)
    transporter_profile = TransporterProfileSerializer(required=False)

    class Meta:
        model = User
        fields = ('id', 'phone', 'name', 'role', 'is_active', 'farmer_profile', 'buyer_profile', 'transporter_profile')
        read_only_fields = ('id', 'phone', 'role')

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.save()

        if instance.role == 'farmer' and ('farmer_profile' in validated_data or any(k in validated_data for k in ('state', 'district', 'village'))):
            farmer_data = validated_data.pop('farmer_profile', {})
            farmer_data.update({k: validated_data.pop(k) for k in ('state', 'district', 'village') if k in validated_data})
            FarmerProfile.objects.update_or_create(user=instance, defaults=farmer_data)

        elif instance.role == 'buyer' and 'buyer_profile' in validated_data:
            buyer_data = validated_data.pop('buyer_profile')
            BuyerProfile.objects.update_or_create(user=instance, defaults=buyer_data)

        elif instance.role == 'transporter' and 'transporter_profile' in validated_data:
            transporter_data = validated_data.pop('transporter_profile')
            TransporterProfile.objects.update_or_create(user=instance, defaults=transporter_data)

        return instance

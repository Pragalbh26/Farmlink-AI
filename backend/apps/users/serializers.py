from rest_framework import serializers
from django.contrib.auth import authenticate
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
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'phone', 'name', 'password', 'role')

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
            TransporterProfile.objects.create(user=user, vehicle_type='Not specified', capacity=0)
        return user


class UserLoginSerializer(serializers.Serializer):
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        phone = data.get('phone')
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

        if instance.role == 'farmer' and 'farmer_profile' in validated_data:
            farmer_data = validated_data.pop('farmer_profile')
            FarmerProfile.objects.update_or_create(user=instance, defaults=farmer_data)

        elif instance.role == 'buyer' and 'buyer_profile' in validated_data:
            buyer_data = validated_data.pop('buyer_profile')
            BuyerProfile.objects.update_or_create(user=instance, defaults=buyer_data)

        elif instance.role == 'transporter' and 'transporter_profile' in validated_data:
            transporter_data = validated_data.pop('transporter_profile')
            TransporterProfile.objects.update_or_create(user=instance, defaults=transporter_data)

        return instance

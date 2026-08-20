import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, phone, name, password=None, role='farmer', **extra_fields):
        if not phone:
            raise ValueError('Users must have a phone number')
        user = self.model(phone=phone, name=name, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(phone, name, password, role='admin', **extra_fields)

class User(AbstractUser):
    ROLE_CHOICES = (
        ('farmer', 'Farmer'),
        ('buyer', 'Buyer'),
        ('transporter', 'Transporter'),
        ('admin', 'Admin'),
    )

    username = None
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='farmer')
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return f"{self.name} ({self.phone}) - {self.role}"

class FarmerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='farmer_profile')
    state = models.CharField(max_length=50)
    district = models.CharField(max_length=50)
    village = models.CharField(max_length=50)

    def __str__(self):
        return f"Farmer Profile: {self.user.name}"

class BuyerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='buyer_profile')
    organization_name = models.CharField(max_length=100, blank=True, null=True)
    location = models.CharField(max_length=100)

    def __str__(self):
        return f"Buyer Profile: {self.user.name}"

class TransporterProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='transporter_profile')
    vehicle_type = models.CharField(max_length=50)
    capacity = models.DecimalField(max_digits=10, decimal_places=2, help_text="Capacity in Kg or Tons")
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"Transporter: {self.user.name}"
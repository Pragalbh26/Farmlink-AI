from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import User, FarmerProfile

class AuthenticationTests(APITestCase):
    
    def setUp(self):
        # This setup runs before every single test
        self.register_url = reverse('register')
        self.login_url = reverse('login')
        
        # Pre-create a user to test the login system
        self.test_user = User.objects.create_user(
            phone='+919876543210',
            password='strongpassword123',
            name='Test Farmer',
            role='farmer'
        )

    def test_user_registration_success(self):
        """Ensure a new user can register and a profile is auto-created."""
        data = {
            "phone": "+919999999999",
            "password": "newpassword123",
            "name": "New Farmer",
            "role": "farmer"
        }
        response = self.client.post(self.register_url, data, format='json')
        
        # Check if the API returned a 201 Created status
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Check if the JWT tokens were generated
        self.assertIn('tokens', response.data['data'])
        # Check if the database actually saved the user
        self.assertEqual(User.objects.count(), 2)
        # Verify the FarmerProfile was automatically created
        new_user = User.objects.get(phone="+919999999999")
        self.assertTrue(FarmerProfile.objects.filter(user=new_user).exists())

    def test_user_login_success(self):
        """Ensure a user can log in with correct credentials."""
        data = {
            "phone": "+919876543210",
            "password": "strongpassword123"
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data['data']['tokens'])

    def test_user_login_invalid_password(self):
        """Ensure the API rejects bad passwords."""
        data = {
            "phone": "+919876543210",
            "password": "wrongpassword"
        }
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
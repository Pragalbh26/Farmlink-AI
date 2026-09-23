from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.listings.models import CropListing
from apps.orders.models import Order, TransportBooking
from apps.users.models import TransporterProfile, User


class TransportWorkflowTests(APITestCase):
    def setUp(self):
        self.farmer = User.objects.create_user('+919000000001', 'Farmer', 'password123', role='farmer')
        self.buyer = User.objects.create_user('+919000000002', 'Buyer', 'password123', role='buyer')
        self.transporter = User.objects.create_user('+919000000003', 'Driver Pat', 'password123', role='transporter')
        TransporterProfile.objects.create(user=self.transporter, vehicle_type='Mini truck', capacity=2, is_available=True)
        self.listing = CropListing.objects.create(
            farmer=self.farmer, crop='Tomato', variety='Local', quantity=Decimal('40'),
            unit='Quintal', expected_price=Decimal('1800'), location='Pune', status='active'
        )
        self.order = Order.objects.create(buyer=self.buyer, listing=self.listing, quantity=Decimal('4'), agreed_price=Decimal('1800'))

    def test_only_registered_available_transporters_are_listed(self):
        incomplete = User.objects.create_user('+919000000004', 'Incomplete Driver', 'password123', role='transporter')
        TransporterProfile.objects.create(user=incomplete, vehicle_type='Not specified', capacity=0, is_available=True)
        self.client.force_authenticate(self.buyer)
        response = self.client.get('/api/v1/transport/providers')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item['id'] for item in response.data['data']], [str(self.transporter.id)])

    def test_driver_without_vehicle_details_cannot_accept_trip(self):
        incomplete = User.objects.create_user('+919000000004', 'Incomplete Driver', 'password123', role='transporter')
        TransporterProfile.objects.create(user=incomplete, vehicle_type='Not specified', capacity=0, is_available=True)
        booking = TransportBooking.objects.create(order=self.order, pickup_location='Farm', dropoff_location='Market')
        self.client.force_authenticate(incomplete)
        response = self.client.patch(reverse('update-transport-request', args=[booking.id]), {'status': 'accepted'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_transport_request_full_lifecycle_and_role_scoping(self):
        self.client.force_authenticate(self.buyer)
        created = self.client.post(reverse('transport-requests'), {
            'order': str(self.order.id), 'transporter': str(self.transporter.id),
            'pickup_location': 'Farm Gate, Pune', 'dropoff_location': 'Vashi Market, Mumbai',
        }, format='json')
        self.assertEqual(created.status_code, status.HTTP_201_CREATED, created.data)
        booking_id = created.data['data']['id']
        self.assertEqual(TransportBooking.objects.get(pk=booking_id).transporter_id, self.transporter.id)

        self.client.force_authenticate(self.transporter)
        visible = self.client.get(reverse('transport-requests'))
        self.assertEqual(len(visible.data['data']), 1)
        self.assertEqual(visible.data['data'][0]['farmer_phone'], self.farmer.phone)
        for next_status in ('accepted', 'in_transit', 'completed'):
            updated = self.client.patch(reverse('update-transport-request', args=[booking_id]), {'status': next_status}, format='json')
            self.assertEqual(updated.status_code, status.HTTP_200_OK, updated.data)

        self.client.force_authenticate(self.buyer)
        buyer_bookings = self.client.get(reverse('transport-requests'))
        self.assertEqual(buyer_bookings.data['data'][0]['status'], 'completed')

    def test_unassigned_request_does_not_expose_farmer_phone(self):
        second_listing = CropListing.objects.create(
            farmer=self.farmer, crop='Onion', variety='Red', quantity=Decimal('20'),
            unit='Quintal', expected_price=Decimal('2200'), location='Nashik', status='active'
        )
        second_order = Order.objects.create(buyer=self.buyer, listing=second_listing, quantity=Decimal('2'), agreed_price=Decimal('2200'))
        TransportBooking.objects.create(order=second_order, pickup_location='Farm', dropoff_location='Market')
        self.client.force_authenticate(self.transporter)
        visible = self.client.get(reverse('transport-requests'))
        self.assertEqual(visible.status_code, status.HTTP_200_OK, visible.data)
        self.assertEqual(TransportBooking.objects.filter(transporter__isnull=True, status='requested').count(), 1)
        self.assertEqual(len(visible.data['data']), 1, visible.data)
        unassigned = visible.data['data'][0]
        self.assertIsNone(unassigned['farmer_phone'])

    def test_duplicate_booking_and_unauthorized_order_status_are_rejected(self):
        TransportBooking.objects.create(order=self.order, pickup_location='Farm', dropoff_location='Market')
        self.client.force_authenticate(self.buyer)
        duplicate = self.client.post(reverse('transport-requests'), {
            'order': str(self.order.id), 'pickup_location': 'Farm', 'dropoff_location': 'Market',
        }, format='json')
        self.assertEqual(duplicate.status_code, status.HTTP_400_BAD_REQUEST)
        denied = self.client.patch(reverse('update-order-status', args=[self.order.id]), {'status': 'confirmed'}, format='json')
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)

    def test_transporters_cannot_place_purchase_orders_or_request_transport(self):
        self.client.force_authenticate(self.transporter)
        order_response = self.client.post(reverse('create-order'), {
            'listing': str(self.listing.id), 'quantity': 1, 'agreed_price': 1800,
        }, format='json')
        self.assertEqual(order_response.status_code, status.HTTP_403_FORBIDDEN)
        booking_response = self.client.post(reverse('transport-requests'), {
            'order': str(self.order.id), 'pickup_location': 'Farm', 'dropoff_location': 'Market',
        }, format='json')
        self.assertEqual(booking_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_buyer_cannot_change_listed_unit_price(self):
        self.client.force_authenticate(self.buyer)
        response = self.client.post(reverse('create-order'), {
            'listing': str(self.listing.id), 'quantity': 1, 'agreed_price': 1,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_listing_creation_purchase_and_inventory_update_end_to_end(self):
        self.client.force_authenticate(self.farmer)
        created = self.client.post('/api/v1/listings/', {
            'crop': 'Wheat', 'variety': 'Lokwan', 'quantity': '15.00', 'unit': 'Quintal',
            'expected_price': '2400.00', 'location': 'Pune APMC',
        }, format='json')
        self.assertEqual(created.status_code, status.HTTP_201_CREATED, created.data)
        listing_id = created.data['data']['id']

        self.client.force_authenticate(self.buyer)
        marketplace = self.client.get('/api/v1/listings/')
        self.assertIn(listing_id, [item['id'] for item in marketplace.data['data']])
        purchase = self.client.post(reverse('create-order'), {
            'listing': listing_id, 'quantity': '3.00', 'agreed_price': '2400.00',
        }, format='json')
        self.assertEqual(purchase.status_code, status.HTTP_201_CREATED, purchase.data)
        listing = CropListing.objects.get(pk=listing_id)
        self.assertEqual(listing.quantity, Decimal('12.00'))

        self.client.force_authenticate(self.farmer)
        farmer_orders = self.client.get(reverse('my-orders'))
        self.assertIn(purchase.data['data']['id'], [item['id'] for item in farmer_orders.data['data']])

    def test_only_listing_owner_can_edit_listing(self):
        self.client.force_authenticate(self.buyer)
        denied = self.client.put(f'/api/v1/listings/{self.listing.id}', {'expected_price': '1.00'}, format='json')
        self.assertEqual(denied.status_code, status.HTTP_403_FORBIDDEN)
        self.client.force_authenticate(self.farmer)
        updated = self.client.put(f'/api/v1/listings/{self.listing.id}', {'expected_price': '1900.00'}, format='json')
        self.assertEqual(updated.status_code, status.HTTP_200_OK, updated.data)
        self.listing.refresh_from_db()
        self.assertEqual(self.listing.expected_price, Decimal('1900.00'))

    def test_farmer_order_status_transitions_persist_and_reject_invalid_steps(self):
        self.client.force_authenticate(self.farmer)
        confirmed = self.client.patch(reverse('update-order-status', args=[self.order.id]), {'status': 'confirmed'}, format='json')
        self.assertEqual(confirmed.status_code, status.HTTP_200_OK, confirmed.data)
        fulfilled = self.client.patch(reverse('update-order-status', args=[self.order.id]), {'status': 'fulfilled'}, format='json')
        self.assertEqual(fulfilled.status_code, status.HTTP_200_OK, fulfilled.data)
        repeated = self.client.patch(reverse('update-order-status', args=[self.order.id]), {'status': 'confirmed'}, format='json')
        self.assertEqual(repeated.status_code, status.HTTP_409_CONFLICT)

    def test_registered_role_survives_login_and_profile_restoration(self):
        login = self.client.post(reverse('login'), {'phone': self.transporter.phone, 'password': 'password123'}, format='json')
        self.assertEqual(login.status_code, status.HTTP_200_OK)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['data']['tokens']['access']}")
        profile = self.client.get(reverse('user-profile'))
        self.assertEqual(profile.status_code, status.HTTP_200_OK)
        self.assertEqual(profile.data['data']['role'], 'transporter')
        changed = self.client.put(reverse('user-profile'), {'transporter_profile': {'is_available': False}}, format='json')
        self.assertEqual(changed.status_code, status.HTTP_200_OK, changed.data)
        self.transporter.refresh_from_db()
        self.transporter.transporter_profile.refresh_from_db()
        self.assertEqual(self.transporter.role, 'transporter')
        self.assertFalse(self.transporter.transporter_profile.is_available)

    def test_agriculture_tools_endpoints_respond_with_expected_shapes(self):
        self.client.force_authenticate(self.farmer)
        checks = [
            ('GET', '/api/v1/schemes', None, lambda data: isinstance(data, list)),
            ('POST', '/api/v1/schemes/eligibility', {'landHectares': 1.2, 'state': 'Maharashtra', 'crop': 'Tomato'}, lambda data: isinstance(data, list)),
            ('POST', '/api/v1/prices/predict', {'commodity': 'Tomato', 'horizon': '7day'}, lambda data: data.get('commodity') == 'Tomato' and data.get('forecastPrice') is not None),
            ('POST', '/api/v1/chat', {'message': 'How do I care for tomatoes?'}, lambda data: bool(data.get('answer'))),
        ]
        for method, url, payload, valid in checks:
            response = getattr(self.client, method.lower())(url, payload or {}, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK, f'{url}: {response.data}')
            self.assertTrue(response.data.get('success'), f'{url}: {response.data}')
            self.assertTrue(valid(response.data.get('data')), f'{url}: {response.data}')

        disease = self.client.post('/api/v1/disease/predict', {'sampleType': 'Tomato'}, format='json')
        self.assertIn(disease.status_code, (status.HTTP_200_OK, status.HTTP_503_SERVICE_UNAVAILABLE))
        if disease.status_code == status.HTTP_200_OK:
            self.assertIn('confidence', disease.data.get('data', {}))
        else:
            self.assertIn('not found', disease.data.get('error', '').lower())

        weather = self.client.get('/api/v1/weather/current')
        forecast = self.client.get('/api/v1/weather/forecast')
        self.assertEqual(weather.status_code, status.HTTP_200_OK)
        self.assertEqual(forecast.status_code, status.HTTP_200_OK)
        self.assertTrue(weather.data['data']['location'])

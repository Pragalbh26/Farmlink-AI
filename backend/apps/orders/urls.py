from django.urls import path
from .views import create_order_view, my_orders_view, request_transport_view, update_transport_booking_view, update_order_status_view

urlpatterns = [
    path('', create_order_view, name='create-order'),
    path('me', my_orders_view, name='my-orders'),
    path('<uuid:order_id>', update_order_status_view, name='update-order-status'),
    path('transport/requests', request_transport_view, name='transport-requests'),
    path('transport/requests/<uuid:booking_id>', update_transport_booking_view, name='update-transport-request'),
]

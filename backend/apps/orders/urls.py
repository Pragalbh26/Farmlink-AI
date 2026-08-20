from django.urls import path
from .views import create_order_view, my_orders_view, request_transport_view

urlpatterns = [
    path('', create_order_view, name='create-order'),
    path('me', my_orders_view, name='my-orders'),
    path('transport/requests', request_transport_view, name='request-transport'),
]
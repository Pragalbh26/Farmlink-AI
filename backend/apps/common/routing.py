from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # The URL will look like: ws://localhost:8000/ws/notifications/<user_id>/
    re_path(r'ws/notifications/(?P<user_id>[0-9a-f-]+)/$', consumers.NotificationConsumer.as_asgi()),
]
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_realtime_notification(user_id, message_text, alert_type="general"):
    """
    Globally reusable function to push live alerts to any user via WebSockets.
    """
    try:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{user_id}", 
            {
                "type": "send_notification",
                "message": {
                    "text": message_text,
                    "type": alert_type
                }
            }
        )
    except Exception as e:
        print(f"WebSocket Notification Failed: {e}")
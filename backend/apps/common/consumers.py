import json
from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Grab the user ID from the WebSocket URL
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.room_group_name = f'user_{self.user_id}'

        # Add this specific connection to their personal notification group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # Accept the connection
        await self.accept()
        
        # Send a welcome message just to confirm it works
        await self.send(text_data=json.dumps({
            'message': 'Connected to FarmLink real-time notifications!'
        }))

    async def disconnect(self, close_code):
        # Remove them from the group when they close the app
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # This is the custom function that actually pushes the data to the frontend
    async def send_notification(self, event):
        message = event['message']
        await self.send(text_data=json.dumps({
            'message': message
        }))
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = 'game_room'  # Hardcoded room group name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()


    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        print(text_data_json)
        action = text_data_json['action']

        # Dispatch to the appropriate method based on the action
        if action == 'playerMoved':
            await self.player_move_recieved(text_data_json)
        # elif action == 'anotherAction':
            # await self.another_action(text_data_json)

    ''' 
        This method is called when a playerMoved message is received from the frontend. 
        It extracts the new x and y positions from the message and sends them to the room group. 
    ''' 
    async def player_move_recieved(self, event):
        # Extract the new x and y positions from the message
        x = event['x']
        y = event['y']

        # Send the new positions to the room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_moved',
                'x': x,
                'y': y
            }
        )

    '''  
        This method is a handler that gets triggered when a message with the type 
        'player_moved' is received from the group. It extracts the new x and y positions
        from the event and sends them to all connected WebSockets in the group. 
    ''' 
    async def player_moved(self, event):
        # Extract the new x and y positions from the event
        x = event['x']
        y = event['y']

        print(f'Sending playerMoved action to WebSocket: x={x}, y={y}')  # Log message

        # Send the new positions to the WebSocket
        await self.send(text_data=json.dumps({
            'action': 'playerMoved',
            'x': x,
            'y': y
        }))
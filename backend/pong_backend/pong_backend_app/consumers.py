# TODO
# 1. Add collision detection for the wall
# 2. Add Socket Message for wall collision
# 3. Handle Socket Message on Backend
# 4. Create Different Sprite images based on player health
# 5. Look into swapping sprites for an object
# 6. Create Ball reset function

from channels.generic.websocket import AsyncWebsocketConsumer
import json

class GameConsumer(AsyncWebsocketConsumer):
    player_counter = 0  # Player counter variable

    async def connect(self):
        self.room_group_name = 'game_room'  # Hardcoded room group name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        GameConsumer.player_counter += 1  # Increment player counter
        await self.transmit_player_counter()  # Transmit player counter

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        GameConsumer.player_counter -= 1  # Decrement player counter
        await self.transmit_player_counter()  # Transmit player counter

    async def transmit_player_counter(self):
        # Transmit player counter to all connected consumers
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_counter_changed',
                'count': GameConsumer.player_counter
            }
        )

    async def player_counter_changed(self, event):
        # Send player counter to the WebSocket
        await self.send(text_data=json.dumps({
            'action': 'playerCounterChanged',
            'count': event['count']
        }))

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        # print(text_data_json)
        action = text_data_json['action']

        # Dispatch to the appropriate method based on the action
        if action == 'playerMoved':
            await self.player_move_recieved(text_data_json)
        elif action == 'ballMoved':
            await self.ball_move_recieved(text_data_json)

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
    async def player_moved(self, message):
        # Extract the new x and y positions from the event
        x = message['x']
        y = message['y']

        # Send the new positions to the WebSocket
        await self.send(text_data=json.dumps({
            'action': 'playerMoved',
            'x': x,
            'y': y
        }))

    async def ball_move_recieved(self, event):
        # Extract the new x and y positions from the message
        x = event['x']
        y = event['y']
        vx = event['vx']
        vy = event['vy']

        # Send the new positions to the room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'ball_moved',
                'x': x,
                'y': y,
                'vx':vx,
                'vy':vy
            }
        )

    async def ball_moved(self, message):
        # Extract the new x and y positions from the event
        x = message['x']
        y = message['y']
        vx = message['vx']
        vy = message['vy']

        # Send the new positions to the WebSocket
        await self.send(text_data=json.dumps({
            'action': 'ballMoved',
            'x': x,
            'y': y,
            'vx':vx,
            'vy':vy
        }))
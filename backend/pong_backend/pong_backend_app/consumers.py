# TODO
# 1. Add collision detection for the wall
# 2. Add Socket Message for wall collision
# 3. Handle Socket Message on Backend
# 4. Create Different Sprite images based on player health
# 5. Look into swapping sprites for an object
# 6. Create Ball reset function

# REMEMBER TO CHANGE ALL CLASS SPECIFIC VARIABLES TO INSTANCE SPECIFIC ONES
# HAVE TO USE A DICT OF ROOM NAMES TO CLASS VARIABLES

from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio

class GameConsumer(AsyncWebsocketConsumer):
    connection_count = 0  # Connection counter variable
    player_count = 0 #player count, recieved when gameStarted
    gameStarted = False
    # This will hold the current connections
    curr_connections = []
    game_state = {}

    async def connect(self):
        self.room_group_name = 'game_room'  # Hardcoded room group name

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Add the channel name to the current connections
        # playerid = self.channel_name
        # print(f"New connection: {self.channel_name}")
        # self.curr_connections.append(playerid)
        # print(f"curr connection: {self.curr_connections}")


        GameConsumer.connection_count += 1  # Increment player counter
        await self.transmit_player_counter()  # Transmit player counter

        await self.accept()

        # if game is started, tell channel what player number they are
        #FIX THIS
        print(f"Connection count is {self.connection_count} and player count is {self.player_count}.")
        print(f"Gamestarted is {self.game_started}")
        if self.gameStarted and self.connection_count == self.player_count:
            print("Passed")
            await self.init_game()
            print(self.game_state)
            await self.transmit_game_state()
            # try:
            #     player_position = self.game_state[self.channel_name]['position']
            #     await self.send(text_data=json.dumps({'playerPosition': player_position}))
            # except:
            #     pass

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Remove the channel name from the current connections
        # playerid = self.channel_name
        # self.curr_connections.remove(playerid)
        # print(f"curr connection: {self.curr_connections}")

        GameConsumer.connection_count -= 1  # Decrement player counter
        await self.transmit_player_counter()  # Transmit player counter

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json['action']

        # print(f"Message received from: {text_data_json}")

        # Dispatch to the appropriate method based on the action
        if action == 'playerIDSET':
            print(f"!!!!!!!!!!!!!!!!!!! Receieved PLAYERIDSET {text_data_json['playerID']}")
            GameConsumer.curr_connections.append(text_data_json['playerID'])
        elif action == 'playerMoved':
            await self.player_move_recieved(text_data_json)
        elif action == 'ballMoved':
            await self.ball_move_recieved(text_data_json)
        elif action == 'gameStarted':
            print(f'Recieved game started, {text_data_json}')
            await self.game_started_received(text_data_json)

    async def game_started_received(self, message):
        GameConsumer.gameStarted = True  # Set game started flag to True
        print(f"Setting player count to {message['playerCount']}")
        GameConsumer.player_count = message['playerCount']
        await self.transmit_game_started()  # Transmit game started flag
        # await self.init_game()

    async def transmit_game_started(self):
        # Transmit game started flag to all connected consumers
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_started',
                'gameStarted': GameConsumer.gameStarted
            }
        )

    async def game_started(self, event):
        # Send game started flag to the WebSocket
        await self.send(text_data=json.dumps({
            'action': 'gameStarted',
            'gameStarted': event['gameStarted']
        }))

    async def transmit_player_counter(self):
        # Transmit player counter to all connected consumers
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'player_counter_changed',
                'count': GameConsumer.connection_count
            }
        )

    async def player_counter_changed(self, event):
        # Send player counter to the WebSocket
        await self.send(text_data=json.dumps({
            'action': 'playerCounterChanged',
            'count': event['count']
        }))
       
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


    async def transmit_game_state(self):
        # Convert game_state to JSON
        game_state_json = json.dumps(self.game_state)

        # Send game_state to all connected consumers in the room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_state',
                'game_state': game_state_json
            }
        )

    async def game_state(self, event):
        # Send game_state to the WebSocket
        await self.send(text_data=json.dumps({
            'action': 'gameState',
            'gameState': event['game_state']
        }))

    # Helper Functions to Initialize game state
    async def init_game(self):
        # while  self.connection_count < self.player_count:
        #     await asyncio.sleep(0.2)
        if self.player_count<= 4:
            await self.four_player_init()


    async def four_player_init(self):
        print(f'player count is {self.player_count}, curr_connections is {GameConsumer.curr_connections}')
        if GameConsumer.player_count == 2 :
            GameConsumer.game_state = {
                GameConsumer.curr_connections[0] : {
                    'x': None,
                    'position':'top_player'
                    },
                GameConsumer.curr_connections[1] : {
                    'x': None,
                    'position':'bottom_player'
                },
                'right_wall' : {
                    'x': None,
                    'position':'right_player'
                },
                'left_wall' : {
                    'x': None,
                    'position':'left_player'
                }
            }
        elif GameConsumer.player_count == 3:
            GameConsumer.game_state = {
                GameConsumer.curr_connections[0] : {
                    'x': None,
                    'position':'top_player'
                    },
                GameConsumer.curr_connections[1] : {
                    'x': None,
                    'position':'bottom_player'
                },
                GameConsumer.curr_connections[2] : {
                    'x': None,
                    'position':'right_player'
                },
                'left_wall' : {
                    'x': None,
                    'y':None,
                    'position':'left_player'
                }
            }
        elif GameConsumer.player_count == 4:
            GameConsumer.game_state = {
                GameConsumer.curr_connections[0] : {
                    'x': None,
                    'position':'top_player'
                    },
                GameConsumer.curr_connections[1] : {
                    'x': None,
                    'position':'bottom_player'
                },
                GameConsumer.curr_connections[2] : {
                    'x': None,
                    'position':'right_player'
                },
                GameConsumer.curr_connections[3] : {
                    'x': None,
                    'position':'left_player'
                }
            }
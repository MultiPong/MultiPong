# TODO
# 1. Add EightPlayer init - Done
# 2. Add EightPlayer handle - Done
# 3. Fix SixPlayer handle - Done
# 4. Add Ball Movement to backend
# 5. Handle Ball Movement on FourPlayer
# 6. Handle Ball Movement on SixPlayer
# 7. Handle Ball Movement on EightPlayer


# FUTURE TODO
# 1. Add collision detection for the wall - Started
# 2. Add Socket Message for wall collision
# 3. Handle Socket Message on Backend
# 4. Create Different Sprite images based on player health
# 5. Look into swapping sprites for an object
# 6. Create Ball reset function - Started

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



        GameConsumer.connection_count += 1  # Increment player counter
        await self.transmit_player_counter()  # Transmit player counter

        await self.accept()


    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )



        GameConsumer.connection_count -= 1  # Decrement player counter
        await self.transmit_player_counter()  # Transmit player counter

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json['action']

        # print(f"Message received from: {text_data_json}")

        # Dispatch to the appropriate method based on the action
        if action == 'playerIDSET':
            print(f"!!!!!!!!!!!!!!!!!!! Receieved PLAYERIDSET {text_data_json['playerIDSet']}")
            GameConsumer.curr_connections.append(text_data_json['playerIDSet'])
            if GameConsumer.gameStarted and GameConsumer.connection_count == GameConsumer.player_count:
                print("Passed")
                await self.init_game()
                print(self.game_state)
                await self.transmit_game_state()
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
       
    # This method is called when a playerMoved message is received from the frontend.
    async def player_move_recieved(self, event):
        # Extract the playerID and new x and y positions from the message
        playerID = event['playerID']
        x = event['x']

        # Update the game state
        await self.update_game_state_player_pos(playerID, x)

        # Send the game state to the room group
        await self.transmit_game_state()


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
                'type': 'game_state_update',  # Changed from 'game_state'
                'game_state': game_state_json
            }
        )

    async def game_state_update(self, event):  # Renamed from 'game_state'
        # Send game_state to the WebSocket
        await self.send(text_data=json.dumps({
            'action': 'gameState',
            'gameState': event['game_state']
        }))


    async def update_game_state_player_pos(self, playerID, x):
        GameConsumer.game_state[playerID]['x'] = x


    # Helper Functions to Initialize game state
    async def init_game(self):
        print(f'player count is {self.player_count}, curr_connections is {GameConsumer.curr_connections}')
        if self.player_count<= 4:
            await self.four_player_init()
        elif self.player_count <= 6:
            await self.six_player_init()
        elif self.player_count <= 8:
            await self.eight_player_init()



    async def four_player_init(self):
        if GameConsumer.player_count == 2 :
            GameConsumer.game_state = {
                GameConsumer.curr_connections[0] : {
                    'x': 400,
                    'position':'top_player'
                    },
                GameConsumer.curr_connections[1] : {
                    'x': 400,
                    'position':'bottom_player'
                },
                'right_wall' : {
                    'x': 400,
                    'position':'right_player'
                },
                'left_wall' : {
                    'x': 400,
                    'position':'left_player'
                }
            }
        elif GameConsumer.player_count == 3:
            GameConsumer.game_state = {
                GameConsumer.curr_connections[0] : {
                    'x': 400,
                    'position':'top_player'
                    },
                GameConsumer.curr_connections[1] : {
                    'x': 400,
                    'position':'bottom_player'
                },
                GameConsumer.curr_connections[2] : {
                    'x': 400,
                    'position':'right_player'
                },
                'left_wall' : {
                    'x': 400,
                    'position':'left_player'
                }
            }
        elif GameConsumer.player_count == 4:
            GameConsumer.game_state = {
                GameConsumer.curr_connections[0] : {
                    'x': 400,
                    'position':'top_player'
                    },
                GameConsumer.curr_connections[1] : {
                    'x': 400,
                    'position':'bottom_player'
                },
                GameConsumer.curr_connections[2] : {
                    'x': 400,
                    'position':'right_player'
                },
                GameConsumer.curr_connections[3] : {
                    'x': 400,
                    'position':'left_player'
                }
            }


    async def six_player_init(self):
        if GameConsumer.player_count == 5 :
            GameConsumer.game_state = {
                GameConsumer.curr_connections[0] : {
                    'x': 400,
                    'position':'top_player'
                    },
                GameConsumer.curr_connections[1] : {
                    'x': 400,
                    'position':'bottom_player'
                },
                GameConsumer.curr_connections[2] : {
                    'x': 400,
                    'position':'top_right_player'
                },
                GameConsumer.curr_connections[3] : {
                    'x': 400,
                    'position':'top_left_player'
                },
                GameConsumer.curr_connections[4] : {
                    'x': 400,
                    'position':'bottom_right_player'
                },
                'bottom_left_wall' : {
                    'x': 400,
                    'position':'bottom_left_player'
                }
            }
        elif GameConsumer.player_count == 6:
            GameConsumer.game_state = {
                GameConsumer.curr_connections[0] : {
                    'x': 400,
                    'position':'top_player'
                    },
                GameConsumer.curr_connections[1] : {
                    'x': 400,
                    'position':'bottom_player'
                },
                GameConsumer.curr_connections[2] : {
                    'x': 400,
                    'position':'top_right_player'
                },
                GameConsumer.curr_connections[3] : {
                    'x': 400,
                    'position':'bottom_left_player'
                },
                GameConsumer.curr_connections[4] : {
                    'x': 400,
                    'position':'bottom_right_player'
                },
                GameConsumer.curr_connections[5] : {
                    'x': 400,
                    'position':'top_left_player'
                }
            }
        
    async def eight_player_init(self):
        if GameConsumer.player_count == 7 :
            GameConsumer.game_state = {
                GameConsumer.curr_connections[0] : {
                    'x': 400,
                    'position':'top_player'
                    },
                GameConsumer.curr_connections[1] : {
                    'x': 400,
                    'position':'bottom_player'
                },
                GameConsumer.curr_connections[2] : {
                    'x': 400,
                    'position':'mid_right_player'
                },
                GameConsumer.curr_connections[3] : {
                    'x': 400,
                    'position':'mid_left_player'
                },
                GameConsumer.curr_connections[4] : {
                    'x': 400,
                    'position':'top_right_player'
                },
                GameConsumer.curr_connections[5] : {
                    'x': 400,
                    'position':'bottom_left_player'
                },
                GameConsumer.curr_connections[6] : {
                    'x': 400,
                    'position':'top_left_player'
                },
                'bottom_right_wall' : {
                    'x': 400,
                    'position':'bottom_right_player'
                }
            }
        elif GameConsumer.player_count == 8:
            GameConsumer.game_state = {
                GameConsumer.curr_connections[0] : {
                    'x': 400,
                    'position':'top_player'
                    },
                GameConsumer.curr_connections[1] : {
                    'x': 400,
                    'position':'bottom_player'
                },
                GameConsumer.curr_connections[2] : {
                    'x': 400,
                    'position':'mid_right_player'
                },
                GameConsumer.curr_connections[3] : {
                    'x': 400,
                    'position':'mid_left_player'
                },
                GameConsumer.curr_connections[4] : {
                    'x': 400,
                    'position':'top_right_player'
                },
                GameConsumer.curr_connections[5] : {
                    'x': 400,
                    'position':'bottom_left_player'
                },
                GameConsumer.curr_connections[6] : {
                    'x': 400,
                    'position':'top_left_player'
                },
                GameConsumer.curr_connections[7] : {
                    'x': 400,
                    'position':'bottom_right_player'
                }
            }
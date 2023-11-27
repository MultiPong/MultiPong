from channels.generic.websocket import AsyncWebsocketConsumer
import requests
import json
import asyncio
from django.utils import timezone
import httpx

class GameConsumer(AsyncWebsocketConsumer):
    # This will hold the room specific variables for each match id
    room_data = {}
    # connection_count = 0  # Connection counter variable
    # player_count = 0 #player count, recieved when gameStarted
    # gameStarted = False
    # # This will hold the current connections
    # curr_connections = []
    # game_state = {}

    async def connect(self):
        # self.room_group_name = 'game_room'  # Hardcoded room group name

        # Get the match id from the scope
        self.match_id = self.scope['url_route']['kwargs']['room_name']
        # Use the match id as the room group name
        self.room_group_name = f'game_room_{self.match_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Initialize the room data if not exists
        if self.match_id not in GameConsumer.room_data:
            GameConsumer.room_data[self.match_id] = {
                'connection_count': 0,  # Connection counter variable
                'player_count': 0,  # Player count, received when gameStarted
                'gameStarted': False,
                'time_game_started':0,
                'curr_connections': [],
                'game_state': {},
                'time_defeated': {},
                'start_init': False
            }

        # Increment the connection count for the room
        GameConsumer.room_data[self.match_id]['connection_count'] += 1
        # Transmit the connection count for the room
        await self.transmit_player_counter()
        await self.accept()

        # # Join room group
        # await self.channel_layer.group_add(
        #     self.room_group_name,
        #     self.channel_name
        # )
        # GameConsumer.connection_count += 1  # Increment player counter
        # await self.transmit_player_counter()  # Transmit player counter
        # await self.accept()


    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        # Decrement the connection count for the room
        GameConsumer.room_data[self.match_id]['connection_count'] -= 1
        # Transmit the connection count for the room
        await self.transmit_player_counter()

        # # Leave room group
        # await self.channel_layer.group_discard(
        #     self.room_group_name,
        #     self.channel_name
        # )
        # GameConsumer.connection_count -= 1  # Decrement player counter
        # await self.transmit_player_counter()  # Transmit player counter

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json['action']

        # print(f"Message received from: {text_data_json}")

        # Dispatch to the appropriate method based on the action
        if action == 'playerIDSET':
            print(f"!!!!!!!!!!!!!!!!!!! Receieved PLAYERIDSET {text_data_json['playerIDSet']}")
            self.room_data[self.match_id]['curr_connections'].append(text_data_json['playerIDSet'])
            if self.room_data[self.match_id]['gameStarted'] and self.room_data[self.match_id]['connection_count'] == self.room_data[self.match_id]['player_count']:
                print("Passed")
                await asyncio.sleep(0.5)
                await self.init_game()
                print(self.room_data[self.match_id]['game_state'])
                await asyncio.sleep(0.5)
                await self.transmit_game_state()
        elif action == 'playerTokenSET':
            print(f"Received playerTokenSET for player ID {text_data_json['playerID']}")
            # Wait until game_state is not empty
            while not self.room_data[self.match_id]['game_state']:
                await asyncio.sleep(0.1)  # Sleep for a short time to avoid high CPU usage
            self.room_data[self.match_id]['game_state'][text_data_json['playerID']]['token'] = text_data_json['token']
        elif action == 'playerMoved':
            await self.player_move_recieved(text_data_json)
        elif action == 'ballMoved':
            await self.ball_move_recieved(text_data_json)
        elif action == 'gameStarted':
            print(f'Recieved game started, {text_data_json}')
            await self.game_started_received(text_data_json)
        elif action == 'gameEnded':
            print(f"Received gameEnded for player ID {text_data_json['winner']}")
            await self.game_end_received(text_data_json['winner'])
        elif action == 'playerScored':
            await self.player_scored_received(text_data_json)

    async def game_started_received(self, message):
        self.room_data[self.match_id]['gameStarted'] = True  # Set game started flag to True
        print(f"Setting player count to {message['playerCount']}")
        self.room_data[self.match_id]['player_count'] = message['playerCount']
        await self.transmit_game_started()  # Transmit game started flag
        # await self.init_game()

    async def transmit_game_started(self):
        # Transmit game started flag to all connected consumers
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_started',
                'gameStarted': self.room_data[self.match_id]['gameStarted']
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
                'count': self.room_data[self.match_id]['connection_count']
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
        y = event['y']

        # Update the game state
        await self.update_game_state_player_pos(playerID, x, y)

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

    # This method is called when a playerScored message is received from the frontend.
    async def player_scored_received(self, event):
        # Extract the playerID from the message
        playerID = event['playerID']

        # Call the function to handle player scoring
        await self.handle_player_scored(playerID)

        # Send the game state to the room group
        await self.transmit_score_update()


    async def transmit_game_state(self):
        # Convert game_state to JSON
        game_state_json = json.dumps(self.room_data[self.match_id]['game_state'])

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

    async def transmit_score_update(self):
        # Convert game_state to JSON
        game_state_json = json.dumps(self.room_data[self.match_id]['game_state'])

        # Send game_state to all connected consumers in the room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'score_update',
                'game_state': game_state_json
            }
        )

    async def score_update(self, event):
        # Send game_state to the WebSocket
        await self.send(text_data=json.dumps({
            'action': 'scoreUpdate',
            'gameState': event['game_state']
        }))

    async def game_end_received(self, winner):
        self.room_data[self.match_id]['time_defeated'][winner] = timezone.now()
        print(f"Time defeated list is {self.room_data[self.match_id]['time_defeated']}")
        send_data = {
            "startTime": self.room_data[self.match_id]['time_game_started'].isoformat(),
            "players": []
        }
        for player_id, time_defeated in self.room_data[self.match_id]['time_defeated'].items():
            token = self.room_data[self.match_id]['game_state'][player_id]['token']
            # convert token string "null" to None
            if token == "null":
                token = None

            time_alive = time_defeated - self.room_data[self.match_id]['time_game_started']
            time_alive_seconds = round(time_alive.total_seconds())
            send_data['players'].append({
                "auth_token": token,
                "time_alive": time_alive_seconds
            })
        print(send_data)
        # Convert the send_data dictionary to a JSON string
        send_data_json = json.dumps(send_data)
        print(send_data_json)

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post('http://127.0.0.1:8000/save_match/', data=send_data_json, headers={'Content-Type': 'application/json'})

                if response.status_code == 201:
                    print("Data sent successfully!")
                else:
                    print(f"Failed to send data. Status code: {response.status_code}")
        except httpx.HTTPError as e:
            print(f"An HTTP error occurred: {e}")


    async def update_game_state_player_pos(self, playerID, x, y):
        self.room_data[self.match_id]['game_state'][playerID]['x'] = x
        self.room_data[self.match_id]['game_state'][playerID]['y'] = y


    async def handle_player_scored(self, playerID):
        print(f"PLayerid in handle player scored is {playerID}")
        self.room_data[self.match_id]['game_state'][playerID]['lives'] -= 1
        if self.room_data[self.match_id]['game_state'][playerID]['lives'] == 0:
            self.room_data[self.match_id]['time_defeated'][playerID] = timezone.now()
            self.room_data[self.match_id]['game_state'][playerID]['x'] = 0
            self.room_data[self.match_id]['game_state'][playerID]['y'] = 0

    # Helper Functions to Initialize game state
    async def init_game(self):
        print(self.room_data[self.match_id])
        print(f"$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ init Curr connections is {self.room_data[self.match_id]['curr_connections']}")

        if not self.room_data[self.match_id]['start_init']:

            print(f"player count is {self.room_data[self.match_id]['player_count']}, curr_connections is {self.room_data[self.match_id]['curr_connections']}")
            self.room_data[self.match_id]['time_game_started'] = timezone.now()
            if self.room_data[self.match_id]['player_count']<= 4:
                await self.four_player_init()
            elif self.room_data[self.match_id]['player_count'] <= 6:
                await self.six_player_init()
            elif self.room_data[self.match_id]['player_count'] <= 8:
                await self.eight_player_init()



    async def four_player_init(self):
        print("RUNNING FOUR PLAYER INIT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        self.room_data[self.match_id]['start_init'] = True
        print(f"$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$Curr connections is {self.room_data[self.match_id]['curr_connections']}")
        if self.room_data[self.match_id]['player_count'] == 2 :
            self.room_data[self.match_id]['game_state'] = {
                self.room_data[self.match_id]['curr_connections'][0] : {
                    'x': 400,
                    'y':65,
                    'position':'top_player',
                    'lives':3,
                    'token':None
                    },
                self.room_data[self.match_id]['curr_connections'][1] : {
                    'x': 400,
                    'y': 535,
                    'position':'bottom_player',
                    'lives':3,
                    'token':None
                },
                'right_wall' : {
                    'x': 0,
                    'y': 0,
                    'position':'right_player',
                    'lives':0,
                    'token':None
                },
                'left_wall' : {
                    'x': 0,
                    'y': 0,
                    'position':'left_player',
                    'lives':0,
                    'token':None
                }
            }
        elif self.room_data[self.match_id]['player_count'] == 3:
            self.room_data[self.match_id]['game_state'] = {
                self.room_data[self.match_id]['curr_connections'][0] : {
                    'x': 400,
                    'y':65,
                    'position':'top_player',
                    'lives':3,
                    'token':None
                    },
                self.room_data[self.match_id]['curr_connections'][1] : {
                    'x': 400,
                    'y': 535,
                    'position':'bottom_player',
                    'lives':3,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][2] : {
                    'x': 627,
                    'y': 300,
                    'position':'right_player',
                    'lives':3,
                    'token':None
                },
                'left_wall' : {
                    'x': 400,
                    'y':  0,
                    'position':'left_player',
                    'lives':0,
                    'token':None
                }
            }
        elif self.room_data[self.match_id]['player_count'] == 4:
            self.room_data[self.match_id]['game_state'] = {
                self.room_data[self.match_id]['curr_connections'][0] : {
                    'x': 400,
                    'y':65,
                    'position':'top_player',
                    'lives':3,
                    'token':None
                    },
                self.room_data[self.match_id]['curr_connections'][1] : {
                    'x': 400,
                    'y': 535,
                    'position':'bottom_player',
                    'lives':3,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][2] : {
                    'x': 627,
                    'y': 300,
                    'position':'right_player',
                    'lives':3,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][3] : {
                    'x': 173,
                    'y': 300,
                    'position':'left_player',
                    'lives':3,
                    'token':None
                }
            }


    async def six_player_init(self):
        if self.room_data[self.match_id]['player_count'] == 5 :
            self.room_data[self.match_id]['game_state'] = {
                self.room_data[self.match_id]['curr_connections'][0] : {
                    'x': 400,
                    'y': 50,
                    'position':'top_player',
                    'lives':3 ,
                    'token':None
                    },
                self.room_data[self.match_id]['curr_connections'][1] : {
                    'x': 400,
                    'y': 550,
                    'position':'bottom_player',
                    'lives':3 ,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][2] : {
                    'x': 620,
                    'y': 185,
                    'position':'top_right_player',
                    'lives':3 ,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][3] : {
                    'x': 180,
                    'y': 185,
                    'position':'top_left_player',
                    'lives':3,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][4] : {
                    'x': 620,
                    'y': 410,
                    'position':'bottom_right_player',
                    'lives':3,
                    'token':None
                },
                'bottom_left_wall' : {
                    'x': 180,
                    'y': 415,
                    'position':'bottom_left_player',
                    'lives':0 ,
                    'token':None
                }
            }
        elif self.room_data[self.match_id]['player_count'] == 6:
            self.room_data[self.match_id]['game_state'] = {
                self.room_data[self.match_id]['curr_connections'][0] : {
                    'x': 400,
                    'y': 50,
                    'position':'top_player',
                    'lives':3 ,
                    'token':None
                    },
                self.room_data[self.match_id]['curr_connections'][1] : {
                    'x': 400,
                    'y': 550,
                    'position':'bottom_player',
                    'lives':3 ,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][2] : {
                    'x': 620,
                    'y': 185,
                    'position':'top_right_player',
                    'lives':3 ,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][3] : {
                    'x': 180,
                    'y': 185,
                    'position':'top_left_player',
                    'lives':3,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][4] : {
                    'x': 620,
                    'y': 410,
                    'position':'bottom_right_player',
                    'lives':3,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][5] : {
                    'x': 180,
                    'y': 415,
                    'position':'bottom_left_player',
                    'lives':3,
                    'token':None
                }
            }

    async def eight_player_init(self):
        if self.room_data[self.match_id]['player_count'] == 7 :
            self.room_data[self.match_id]['game_state'] = {
                self.room_data[self.match_id]['curr_connections'][0] : {
                    'x': 400,
                    'y': 65,
                    'position':'top_player',
                    'lives':3,
                    'token':None
                    },
                self.room_data[self.match_id]['curr_connections'][1] : {
                    'x': 400,
                    'y': 535,
                    'position':'bottom_player',
                    'lives':3,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][2] : {
                    'x': 635,
                    'y': 300,
                    'position':'mid_right_player',
                    'lives':3,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][3] : {
                    'x': 165,
                    'y': 300,
                    'position':'mid_left_player',
                    'lives':3,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][4] : {
                    'x': 565,
                    'y': 135,
                    'position':'top_right_player',
                    'lives':3,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][5] : {
                    'x': 235,
                    'y': 465,
                    'position':'bottom_left_player',
                    'lives':3,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][6] : {
                    'x': 235,
                    'y': 135,
                    'position':'top_left_player',
                    'lives':3,
                    'token':None
                },
                'bottom_right_wall' : {
                    'x': 565,
                    'y': 465,
                    'position':'bottom_right_player',
                    'lives':0,
                    'token':None
                }
            }
        elif self.room_data[self.match_id]['player_count'] == 8:
            self.room_data[self.match_id]['game_state'] = {
                self.room_data[self.match_id]['curr_connections'][0] : {
                    'x': 400,
                    'y': 65,
                    'position':'top_player',
                    'lives':3,
                    'token':None
                    },
                self.room_data[self.match_id]['curr_connections'][1] : {
                    'x': 400,
                    'y': 535,
                    'position':'bottom_player',
                    'lives':3,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][2] : {
                    'x': 635,
                    'y': 300,
                    'position':'mid_right_player',
                    'lives':3,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][3] : {
                    'x': 165,
                    'y': 300,
                    'position':'mid_left_player',
                    'lives':3,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][4] : {
                    'x': 565,
                    'y': 135,
                    'position':'top_right_player',
                    'lives':3,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][5] : {
                    'x': 235,
                    'y': 465,
                    'position':'bottom_left_player',
                    'lives':3,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][6] : {
                    'x': 235,
                    'y': 135,
                    'position':'top_left_player',
                    'lives':3,
                    'token':None
                },
                self.room_data[self.match_id]['curr_connections'][7] : {
                    'x': 565,
                    'y': 465,
                    'position':'bottom_right_player',
                    'lives':3,
                    'token':None
                }
            }
import { generateUniqueToken, ballCollisionNoise, resetVelocityIncrease, ballAngle, playerMoved, ballMoved } from '../library.js';



class FourPlayer extends Phaser.Scene {
    constructor() {
        super({ key: 'FourPlayer' });
        this.gameInitialised = false;
        this.cursors = null;
        this.player = null;
        this.leftEnd = 220;
        this.rightEnd = 580;
        this.paddleHeight = 535;
        this.paddleScaleX = 0.15;
        this.paddleScaleY = 0.2;
        this.playerID = generateUniqueToken();
        this.playerPosition = null;
        this.rightSide = {
            playerID: null, 
            x: 627, 
            y: 300, 
            score: null 
        };
        this.rightSidePlayer = null;
        this.leftSide = {
            playerID: null, 
            x: 173, 
            y: 300, 
            score: null 
        };
        this.leftSidePlayer = null;
        this.topSide = {
            playerID: null, 
            x: 400, 
            y: 65, 
            score: null 
        };
        this.topSidePlayer = null;
    }

    preload() {
        this.load.image("paddle", "js/assets/sprites/player.png");
        this.load.image("wall", "js/assets/sprites/wall.png");
        this.load.image("ball", "js/assets/sprites/ball.png");
    }


    create() {
        this.connection = new WebSocket('ws://localhost:8080/ws/game/');

        // Listen for events from the server
        this.connection.onopen = function(e) {
            console.log("[open] Connection established");
            // Send playerID to the server
            console.log(`CREATED PLAYER ID ${this.playerID}`)
            this.connection.send(JSON.stringify({ action: 'playerIDSET', playerIDSet: this.playerID }));
        }.bind(this);
        
        

        this.connection.onmessage = (event) => {
            console.log(`[message] Data received from server: ${event.data}`);
            var message = JSON.parse(event.data);
        
            // Check if the message is a playerMoved message
            if (message.action === 'playerMoved') {
                this.player.x = message.x;
                this.player.y = message.y;
            } else if (message.action === 'ballMoved') {
                ball.x = message.x;
                ball.y = message.y;
                ball.setVelocity(message.vx, message.vy);
            } 
            // else if (message.action === 'playerPosition') {
            //     this.playerPosition = message.playerPosition;
            //     console.log(this.playerPosition)
             else if (message.action === 'gameState') {
                let gameState = JSON.parse(message.gameState);
                if (!this.gameInitialised) {
                    this.gameInitialised = true;
                    this.initGame(gameState)
                }
                this.handleGameState(gameState);
            }
        };
        
        
        this.connection.onclose = function(event) {
            console.log(`[close] Connection closed`);
        };
        
        this.connection.onerror = function(error) {
            console.log(`[error] ${error.message}`);
        };

        this.cursors = this.input.keyboard.createCursorKeys();

        

        let wall1 = this.matter.add.sprite(400, 40, "wall", { restitution: 1 }); //Top Border
        wall1.setScale(0.7, 0.1); // scales width by 70% and height by 20%
        wall1.setStatic(true);
        // let player1 = this.matter.add.sprite(400, 65, "paddle");
        // player1.setScale(this.paddleScaleX, this.paddleScaleY);
        // player1.setStatic(true);

        let wall2 = this.matter.add.sprite(148, 300, "wall", { restitution: 1 }); //Left Border
        wall2.setScale(0.7, 0.1);
        wall2.setAngle(90);
        wall2.setStatic(true);
        // let player2 = this.matter.add.sprite(173, 300, "paddle");
        // player2.setScale(this.paddleScaleX, this.paddleScaleY);
        // player2.setAngle(90);
        // player2.setStatic(true);

        let wall3 = this.matter.add.sprite(652, 300, "wall", { restitution: 1 }); //Right Border
        wall3.setScale(0.7, 0.1);
        wall3.setAngle(90);
        wall3.setStatic(true);
        // let player3 = this.matter.add.sprite(627, 300, "paddle");
        // player3.setScale(this.paddleScaleX, this.paddleScaleY);
        // player3.setAngle(90);
        // player3.setStatic(true);

        let wall4 = this.matter.add.sprite(400, 560, "wall", { restitution: 1 }); //Bottom Border
        wall4.setScale(0.7, 0.1);
        wall4.setStatic(true);

        // this.player = this.matter.add.sprite(400, this.paddleHeight, "paddle");
        // this.player.setScale(this.paddleScaleX, this.paddleScaleY);
        // this.player.setStatic(true);

        let ball = this.matter.add.image(400, 400, "ball", { restitution: 1 });
        ball.setScale(0.25);
        ball.setCircle(13);
        ball.setFriction(0, 0, 0);
        ball.setVelocity(0, 2);
        ball.setBounce(1);
        ball.setFixedRotation()

        // ball.setInertia(Infinity); // set the inertia of the ball to infinity
        this.matter.world.on("collisionactive", function (event, bodyA, bodyB) {
            // ballCollisionNoise();
            // Check if one of the bodies is the ball
            if (bodyA === ball.body || bodyB === ball.body) {
            // Get the current velocity of the ball
            var velocity = ball.body.velocity;
            let [velocityX, velocityY] = ballAngle(velocity)

            ball.setVelocity(velocityX, velocityY);
            ballMoved(this, this.playerID, ball.x, ball.y, velocityX, velocityY);
            }
        }.bind(this));

        

    }

    update() {
        if (this.cursors.left.isDown) {
            if (this.player.x > this.leftEnd) {
                this.player.x -= 5; // Move paddle left via x coordinate
              playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
            }
        } else if (this.cursors.right.isDown) {
            if (this.player.x < this.rightEnd) {
                this.player.x += 5; // move paddle right via x coordinate
                playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
            }
        }
    }

    initGame(gameState) {
        // this.playerPosition = gameState[this.playerID]['position'];
        if (gameState && this.playerID in gameState) {
            this.playerPosition = gameState[this.playerID]['position'];
        } else {
            console.error('Player ID not found in game state:', this.playerID);
        }
        // Create our own player 
        this.player = this.matter.add.sprite(400, this.paddleHeight, "paddle");
        this.player.setScale(this.paddleScaleX, this.paddleScaleY);
        this.player.setStatic(true);
        
        // Initializing game by setting values according to absolute map from server
        if (this.playerPosition === 'bottom_player') {

            // If their is a right side player set it
            if (!gameState.hasOwnProperty('right_wall')) {
                for (var playerID in gameState) {
                    if (gameState[playerID].position === 'right_player') {
                        this.rightSide.playerID = playerID; // This will set the playerID where position is 'right_player'
                        this.rightSidePlayer = this.matter.add.sprite(this.rightSide.x, this.rightSide.y, "paddle");
                        this.rightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                        this.rightSidePlayer.setAngle(90);
                        this.rightSidePlayer.setStatic(true);
                    }
                }
            }  
            // If their is a left side player set it
            if (!gameState.hasOwnProperty('left_wall')) {
                for (var playerID in gameState) {
                    if (gameState[playerID].position === 'left_player') {
                        this.leftSide.playerID = playerID; // This will set the playerID where position is 'right_player'
                        this.leftSidePlayer = this.matter.add.sprite(this.leftSide.x, this.leftSide.y, "paddle");
                        this.leftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                        this.leftSidePlayer.setAngle(90);
                        this.leftSidePlayer.setStatic(true);
                    }
                }
            }
            // There will always be at least 2 players, so def an opposite player
            for (var playerID in gameState) {
                if (gameState[playerID].position === 'top_player') {
                    this.topSide.playerID = playerID; // This will set the playerID where position is 'right_player'
                    this.topSidePlayer = this.matter.add.sprite(this.topSide.x, this.topSide.y, "paddle");
                    this.topSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topSidePlayer.setStatic(true);
                }
            }
        } if (this.playerPosition === 'top_player') {

            // If their is a right side player set it
            if (!gameState.hasOwnProperty('right_wall')) {
                for (var playerID in gameState) {
                    if (gameState[playerID].position === 'right_player') {
                        // If the player is top player then right player will be on the left locally
                        this.leftSide.playerID = playerID; // This will set the playerID where position is 'right_player'
                        this.leftSidePlayer = this.matter.add.sprite(this.leftSide.x, this.leftSide.y, "paddle");
                        this.leftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                        this.leftSidePlayer.setAngle(90);
                        this.leftSidePlayer.setStatic(true);
                    }
                }
            }  
            // If their is a left side player set it
            if (!gameState.hasOwnProperty('left_wall')) {
                for (var playerID in gameState) {
                    if (gameState[playerID].position === 'left_player') {
                        // If the player is top player then left player will be on the right locally
                        this.rightSide.playerID = playerID; // This will set the playerID where position is 'right_player'
                        this.rightSidePlayer = this.matter.add.sprite(this.rightSide.x, this.rightSide.y, "paddle");
                        this.rightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                        this.rightSidePlayer.setAngle(90);
                        this.rightSidePlayer.setStatic(true);
                    }
                }
            }
            // There will always be at least 2 players, so def an opposite player
            for (var playerID in gameState) {
                if (gameState[playerID].position === 'bottom_player') {
                    this.topSide.playerID = playerID; // This will set the playerID where position is 'right_player'
                    this.topSidePlayer = this.matter.add.sprite(this.topSide.x, this.topSide.y, "paddle");
                    this.topSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topSidePlayer.setStatic(true);
                }
            }
        } if (this.playerPosition === 'right_player') {

            // If their is a left side player on server map, set it
            if (!gameState.hasOwnProperty('left_wall')) {
                for (var playerID in gameState) {
                    if (gameState[playerID].position === 'left_player') {
                        // If the player is right player then left player will be on the top locally
                        this.topSide.playerID = playerID; // This will set the playerID where position is 'right_player'
                        this.topSidePlayer = this.matter.add.sprite(this.topSide.x, this.topSide.y, "paddle");
                        this.topSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                        this.topSidePlayer.setStatic(true);
                    }
                }
            }
            // If player is right, then we def have server side top and bottom
            for (var playerID in gameState) {
                if (gameState[playerID].position === 'bottom_player') {
                    this.leftSide.playerID = playerID; // This will set the playerID where position is 'right_player'
                    this.leftSidePlayer = this.matter.add.sprite(this.leftSide.x, this.leftSide.y, "paddle");
                    this.leftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.leftSidePlayer.setAngle(90);
                    this.leftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_player') {
                    this.rightSide.playerID = playerID; // This will set the playerID where position is 'right_player'
                    this.rightSidePlayer = this.matter.add.sprite(this.rightSide.x, this.rightSide.y, "paddle");
                    this.rightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.rightSidePlayer.setAngle(90);
                    this.rightSidePlayer.setStatic(true);
                } 
            }
        } if (this.playerPosition === 'left_player') {

            // If player is left, then there are no empty walls
            for (var playerID in gameState) {
                if (gameState[playerID].position === 'top_player') {
                    this.leftSide.playerID = playerID; // This will set the playerID where position is 'right_player'
                    this.leftSidePlayer = this.matter.add.sprite(this.leftSide.x, this.leftSide.y, "paddle");
                    this.leftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.leftSidePlayer.setAngle(90);
                    this.leftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'bottom_player') {
                    this.rightSide.playerID = playerID; // This will set the playerID where position is 'right_player'
                    this.rightSidePlayer = this.matter.add.sprite(this.rightSide.x, this.rightSide.y, "paddle");
                    this.rightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.rightSidePlayer.setAngle(90);
                    this.rightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'right_player') {
                    this.topSide.playerID = playerID; // This will set the playerID where position is 'right_player'
                    this.topSidePlayer = this.matter.add.sprite(this.topSide.x, this.topSide.y, "paddle");
                    this.topSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topSidePlayer.setStatic(true);
                } 
            }
        }
        
    }

    handleGameState(gameState) {
        this.playerPosition = gameState[this.playerID]['position'];

        for (var playerID in gameState) {
        
            if (playerID == this.topSide.playerID) {
                let positionDelta = gameState[playerID]['x'] - 400
                this.topSidePlayer.x = 400 + positionDelta
            } else if (playerID == this.rightSide.playerID) {
                let positionDelta = gameState[playerID]['x'] - 400
                this.rightSidePlayer.y = 300 - positionDelta
            } else if (playerID == this.leftSide.playerID) {
                let positionDelta = gameState[playerID]['x'] - 400
                this.leftSidePlayer.y = 300 + positionDelta
            }

        }
    }

}

export default FourPlayer;

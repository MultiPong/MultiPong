// scenes/eightPlayer.js
import { generateUniqueToken, ballCollisionNoise, resetVelocityIncrease, ballAngle, playerMoved, ballMoved } from '../library.js';


class EightPlayer extends Phaser.Scene {
    constructor() {
        super({ key: 'EightPlayer' });
        this.gameInitialised = false;
        this.cursors = null;
        this.player = null;
        this.leftEnd = 335;
        this.rightEnd = 465;
        this.paddleHeight = 535;
        this.paddleScaleX = 0.1;
        this.paddleScaleY = 0.15;
        this.playerID = generateUniqueToken();
        this.playerPosition = null;

        this.bottomRightSide = {
            playerID: null, 
            x: 565, 
            y: 465, 
            score: null 
        };
        this.bottomRightSidePlayer = null;

        this.bottomLeftSide = {
            playerID: null, 
            x: 235, 
            y: 465, 
            score: null 
        };
        this.bottomLeftSidePlayer = null;

        this.midRightSide = {
            playerID: null, 
            x: 635, 
            y: 300, 
            score: null 
        };
        this.midRightSidePlayer = null;

        this.midLeftSide = {
            playerID: null, 
            x: 165, 
            y: 300, 
            score: null 
        };
        this.midLeftSidePlayer = null;

        this.topRightSide = {
            playerID: null, 
            x: 565, 
            y: 135, 
            score: null 
        };
        this.topRightSidePlayer = null;

        this.topLeftSide = {
            playerID: null, 
            x: 235, 
            y: 135, 
            score: null 
        };
        this.topLeftSidePlayer = null;

        this.topSide = {
            playerID: null, 
            x: 400, 
            y: 64, 
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
            // console.log(`[message] Data received from server: ${event.data}`);
            console.log(`I am the ${this.playerPosition}`)
            var message = JSON.parse(event.data);
        
            // Check if the message is a playerMoved message
            if (message.action === 'playerMoved') {
                this.player.x = message.x;
                this.player.y = message.y;
            } else if (message.action === 'ballMoved') {
                ball.x = message.x;
                ball.y = message.y;
                ball.setVelocity(message.vx, message.vy);
            } else if (message.action === 'gameState') {
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

        

        let wall1 = this.matter.add.sprite(217, 115, "wall", { restitution: 1 }); //Top Left Border
        wall1.setScale(0.3, 0.1); // scales width by 30% and height by 10%
        wall1.setAngle(-45);
        wall1.setStatic(true);
        wall1.setBounce(1);

        let wall2 = this.matter.add.sprite(583, 115, "wall", { restitution: 1 }); //Top Right Border
        wall2.setScale(0.3, 0.1);
        wall2.setAngle(45);
        wall2.setStatic(true);

        let wall3 = this.matter.add.sprite(217, 485, "wall", { restitution: 1 }); //Bottom Left Border
        wall3.setScale(0.3, 0.1);
        wall3.setAngle(-135);
        wall3.setStatic(true);

        let wall4 = this.matter.add.sprite(583, 485, "wall", { restitution: 1 }); //Bottom Right Border
        wall4.setScale(0.3, 0.1);
        wall4.setAngle(135);
        wall4.setStatic(true);

        let wall5 = this.matter.add.sprite(140, 300, "wall", { restitution: 1 }); //Mid Left Border
        wall5.setScale(0.3, 0.1);
        wall5.setAngle(90);
        wall5.setStatic(true);

        let wall6 = this.matter.add.sprite(660, 300, "wall", { restitution: 1 }); //Mid Right Border
        wall6.setScale(0.3, 0.1);
        wall6.setAngle(90);
        wall6.setStatic(true);

        let wall7 = this.matter.add.sprite(400, 39, "wall", { restitution: 1 }); //Top Border
        wall7.setScale(0.3, 0.1);
        wall7.setStatic(true);

        let wall8 = this.matter.add.sprite(400, 561, "wall", { restitution: 1 }); //Bottom Border
        wall8.setScale(0.3, 0.1);
        wall8.setStatic(true);

        let ball = this.matter.add.image(400, 400, "ball", { restitution: 1 });
        ball.setScale(0.25);
        ball.setCircle(13);
        ball.setFriction(0, 0, 0);
        ball.setVelocity(0, 2);
        ball.setBounce(1);
        ball.setFixedRotation()

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
            // If their is a bottom right side player set it
            if (!gameState.hasOwnProperty('bottom_right_wall')) {
                for (var playerID in gameState) {
                    if (gameState[playerID].position === 'bottom_right_player') {
                        this.bottomRightSide.playerID = playerID; // This will set the playerID where position is 'bottom_right_player'
                        this.bottomRightSidePlayer = this.matter.add.sprite(this.bottomRightSide.x, this.bottomRightSide.y, "paddle");
                        this.bottomRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                        this.bottomRightSidePlayer.setAngle(135);
                        this.bottomRightSidePlayer.setStatic(true);
                    }
                }
            }

            for (var playerID in gameState) {
                if (gameState[playerID].position === 'bottom_left_player') {
                    this.bottomLeftSide.playerID = playerID; // This will set the playerID where position is 'bottom_left_player'
                    this.bottomLeftSidePlayer = this.matter.add.sprite(this.bottomLeftSide.x, this.bottomLeftSide.y, "paddle");
                    this.bottomLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.bottomLeftSidePlayer.setAngle(-135);
                    this.bottomLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'mid_left_player') {
                    this.midLeftSide.playerID = playerID; // This will set the playerID where position is 'mid_left_player'
                    this.midLeftSidePlayer = this.matter.add.sprite(this.midLeftSide.x, this.midLeftSide.y, "paddle");
                    this.midLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.midLeftSidePlayer.setAngle(90);
                    this.midLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'mid_right_player') {
                    this.midRightSide.playerID = playerID; // This will set the playerID where position is 'mid_right_player'
                    this.midRightSidePlayer = this.matter.add.sprite(this.midRightSide.x, this.midRightSide.y, "paddle");
                    this.midRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.midRightSidePlayer.setAngle(90);
                    this.midRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_right_player') {
                    this.topRightSide.playerID = playerID; // This will set the playerID where position is 'top_right_player'
                    this.topRightSidePlayer = this.matter.add.sprite(this.topRightSide.x, this.topRightSide.y, "paddle");
                    this.topRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topRightSidePlayer.setAngle(45);
                    this.topRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_left_player') {
                    this.topLeftSide.playerID = playerID; // This will set the playerID where position is 'top_left_player'
                    this.topLeftSidePlayer = this.matter.add.sprite(this.topLeftSide.x, this.topLeftSide.y, "paddle");
                    this.topLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topLeftSidePlayer.setAngle(-45);
                    this.topLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_player') {
                    this.topSide.playerID = playerID; // This will set the playerID where position is 'top_player'
                    this.topSidePlayer = this.matter.add.sprite(this.topSide.x, this.topSide.y, "paddle");
                    this.topSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topSidePlayer.setStatic(true);
                }
            }
        } if (this.playerPosition === 'top_player') {
            // If their is a bottom right side player set it
            if (!gameState.hasOwnProperty('bottom_right_wall')) {
                for (var playerID in gameState) {
                    if (gameState[playerID].position === 'bottom_right_player') {
                        this.topLeftSide.playerID = playerID; // This will set the playerID where position is 'bottom_right_player'
                        this.topLeftSidePlayer = this.matter.add.sprite(this.topLeftSide.x, this.topLeftSide.y, "paddle");
                        this.topLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                        this.topLeftSidePlayer.setAngle(-45);
                        this.topLeftSidePlayer.setStatic(true);
                    }
                }
            }

            for (var playerID in gameState) {
                if (gameState[playerID].position === 'bottom_left_player') {
                    this.topRightSide.playerID = playerID; // This will set the playerID where position is 'bottom_left_player'
                    this.topRightSidePlayer = this.matter.add.sprite(this.topRightSide.x, this.topRightSide.y, "paddle");
                    this.topRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topRightSidePlayer.setAngle(45);
                    this.topRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'mid_left_player') {
                    this.midRightSide.playerID = playerID; // This will set the playerID where position is 'mid_left_player'
                    this.midRightSidePlayer = this.matter.add.sprite(this.midRightSide.x, this.midRightSide.y, "paddle");
                    this.midRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.midRightSidePlayer.setAngle(90);
                    this.midRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'mid_right_player') {
                    this.midLeftSide.playerID = playerID; // This will set the playerID where position is 'mid_right_player'
                    this.midLeftSidePlayer = this.matter.add.sprite(this.midLeftSide.x, this.midLeftSide.y, "paddle");
                    this.midLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.midLeftSidePlayer.setAngle(90);
                    this.midLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_right_player') {
                    this.bottomLeftSide.playerID = playerID; // This will set the playerID where position is 'top_right_player'
                    this.bottomLeftSidePlayer = this.matter.add.sprite(this.bottomLeftSide.x, this.bottomLeftSide.y, "paddle");
                    this.bottomLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.bottomLeftSidePlayer.setAngle(-135);
                    this.bottomLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_left_player') {
                    this.bottomRightSide.playerID = playerID; // This will set the playerID where position is 'top_left_player'
                    this.bottomRightSidePlayer = this.matter.add.sprite(this.bottomRightSide.x, this.bottomRightSide.y, "paddle");
                    this.bottomRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.bottomRightSidePlayer.setAngle(135);
                    this.bottomRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'bottom_player') {
                    this.topSide.playerID = playerID; // This will set the playerID where position is 'bottom_player'
                    this.topSidePlayer = this.matter.add.sprite(this.topSide.x, this.topSide.y, "paddle");
                    this.topSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topSidePlayer.setStatic(true);
                }
            }
        } if (this.playerPosition === 'top_right_player') {
            // If their is a bottom right side player set it
            if (!gameState.hasOwnProperty('bottom_right_wall')) {
                for (var playerID in gameState) {
                    if (gameState[playerID].position === 'bottom_right_player') {
                        this.midLeftSide.playerID = playerID; // This will set the playerID where position is 'bottom_right_player'
                        this.midLeftSidePlayer = this.matter.add.sprite(this.midLeftSide.x, this.midLeftSide.y, "paddle");
                        this.midLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                        this.midLeftSidePlayer.setAngle(90);
                        this.midLeftSidePlayer.setStatic(true);
                    }
                }
            }

            for (var playerID in gameState) {
                if (gameState[playerID].position === 'mid_left_player') {
                    this.topRightSide.playerID = playerID; // This will set the playerID where position is 'mid_left_player'
                    this.topRightSidePlayer = this.matter.add.sprite(this.topRightSide.x, this.topRightSide.y, "paddle");
                    this.topRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topRightSidePlayer.setAngle(45);
                    this.topRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_left_player') {
                    this.midRightSide.playerID = playerID; // This will set the playerID where position is 'top_left_player'
                    this.midRightSidePlayer = this.matter.add.sprite(this.midRightSide.x, this.midRightSide.y, "paddle");
                    this.midRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.midRightSidePlayer.setAngle(90);
                    this.midRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'bottom_player') {
                    this.topLeftSide.playerID = playerID; // This will set the playerID where position is 'bottom_player'
                    this.topLeftSidePlayer = this.matter.add.sprite(this.topLeftSide.x, this.topLeftSide.y, "paddle");
                    this.topLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topLeftSidePlayer.setAngle(-45);
                    this.topLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'mid_right_player') {
                    this.bottomLeftSide.playerID = playerID; // This will set the playerID where position is 'mid_right_player'
                    this.bottomLeftSidePlayer = this.matter.add.sprite(this.bottomLeftSide.x, this.bottomLeftSide.y, "paddle");
                    this.bottomLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.bottomLeftSidePlayer.setAngle(-135);
                    this.bottomLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_player') {
                    this.bottomRightSide.playerID = playerID; // This will set the playerID where position is 'top_player'
                    this.bottomRightSidePlayer = this.matter.add.sprite(this.bottomRightSide.x, this.bottomRightSide.y, "paddle");
                    this.bottomRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.bottomRightSidePlayer.setAngle(135);
                    this.bottomRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'bottom_left_player') {
                    this.topSide.playerID = playerID; // This will set the playerID where position is 'bottom_left_player'
                    this.topSidePlayer = this.matter.add.sprite(this.topSide.x, this.topSide.y, "paddle");
                    this.topSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topSidePlayer.setStatic(true);
                }
            }
        } if (this.playerPosition === 'top_left_player') {
            // If their is a bottom right side player set it
            if (!gameState.hasOwnProperty('bottom_right_wall')) {
                for (var playerID in gameState) {
                    if (gameState[playerID].position === 'bottom_right_player') {
                        this.topSide.playerID = playerID; // This will set the playerID where position is 'bottom_right_player'
                        this.topSidePlayer = this.matter.add.sprite(this.topSide.x, this.topSide.y, "paddle");
                        this.topSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                        this.topSidePlayer.setStatic(true);
                    }
                }
            }

            for (var playerID in gameState) {
                if (gameState[playerID].position === 'bottom_player') {
                    this.topRightSide.playerID = playerID; // This will set the playerID where position is 'bottom_player'
                    this.topRightSidePlayer = this.matter.add.sprite(this.topRightSide.x, this.topRightSide.y, "paddle");
                    this.topRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topRightSidePlayer.setAngle(45);
                    this.topRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'bottom_left_player') {
                    this.midRightSide.playerID = playerID; // This will set the playerID where position is 'bottom_left_player'
                    this.midRightSidePlayer = this.matter.add.sprite(this.midRightSide.x, this.midRightSide.y, "paddle");
                    this.midRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.midRightSidePlayer.setAngle(90);
                    this.midRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'mid_right_player') {
                    this.topLeftSide.playerID = playerID; // This will set the playerID where position is 'mid_right_player'
                    this.topLeftSidePlayer = this.matter.add.sprite(this.topLeftSide.x, this.topLeftSide.y, "paddle");
                    this.topLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topLeftSidePlayer.setAngle(-45);
                    this.topLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_player') {
                    this.bottomLeftSide.playerID = playerID; // This will set the playerID where position is 'top_player'
                    this.bottomLeftSidePlayer = this.matter.add.sprite(this.bottomLeftSide.x, this.bottomLeftSide.y, "paddle");
                    this.bottomLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.bottomLeftSidePlayer.setAngle(-135);
                    this.bottomLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'mid_left_player') {
                    this.bottomRightSide.playerID = playerID; // This will set the playerID where position is 'mid_left_player'
                    this.bottomRightSidePlayer = this.matter.add.sprite(this.bottomRightSide.x, this.bottomRightSide.y, "paddle");
                    this.bottomRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.bottomRightSidePlayer.setAngle(135);
                    this.bottomRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_right_player') {
                    this.midLeftSide.playerID = playerID; // This will set the playerID where position is 'top_right_player'
                    this.midLeftSidePlayer = this.matter.add.sprite(this.midLeftSide.x, this.midLeftSide.y, "paddle");
                    this.midLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.midLeftSidePlayer.setAngle(90);
                    this.midLeftSidePlayer.setStatic(true);
                }
            }
        } if (this.playerPosition === 'mid_right_player') {
            // If their is a bottom right side player set it
            if (!gameState.hasOwnProperty('bottom_right_wall')) {
                for (var playerID in gameState) {
                    if (gameState[playerID].position === 'bottom_right_player') {
                        this.bottomLeftSide.playerID = playerID; // This will set the playerID where position is 'bottom_right_player'
                        this.bottomLeftSidePlayer = this.matter.add.sprite(this.bottomLeftSide.x, this.bottomLeftSide.y, "paddle");
                        this.bottomLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                        this.bottomLeftSidePlayer.setAngle(-135);
                        this.bottomLeftSidePlayer.setStatic(true);
                    }
                }
            }

            for (var playerID in gameState) {
                if (gameState[playerID].position === 'bottom_player') {
                    this.midLeftSide.playerID = playerID; // This will set the playerID where position is 'bottom_player'
                    this.midLeftSidePlayer = this.matter.add.sprite(this.midLeftSide.x, this.midLeftSide.y, "paddle");
                    this.midLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.midLeftSidePlayer.setAngle(90);
                    this.midLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_player') {
                    this.midRightSide.playerID = playerID; // This will set the playerID where position is 'top_player'
                    this.midRightSidePlayer = this.matter.add.sprite(this.midRightSide.x, this.midRightSide.y, "paddle");
                    this.midRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.midRightSidePlayer.setAngle(90);
                    this.midRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'bottom_left_player') {
                    this.topLeftSide.playerID = playerID; // This will set the playerID where position is 'bottom_left_player'
                    this.topLeftSidePlayer = this.matter.add.sprite(this.topLeftSide.x, this.topLeftSide.y, "paddle");
                    this.topLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topLeftSidePlayer.setAngle(-45);
                    this.topLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_left_player') {
                    this.topRightSide.playerID = playerID; // This will set the playerID where position is 'top_left_player'
                    this.topRightSidePlayer = this.matter.add.sprite(this.topRightSide.x, this.topRightSide.y, "paddle");
                    this.topRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topRightSidePlayer.setAngle(45);
                    this.topRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_right_player') {
                    this.bottomRightSide.playerID = playerID; // This will set the playerID where position is 'top_right_player'
                    this.bottomRightSidePlayer = this.matter.add.sprite(this.bottomRightSide.x, this.bottomRightSide.y, "paddle");
                    this.bottomRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.bottomRightSidePlayer.setAngle(135);
                    this.bottomRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'mid_left_player') {
                    this.topSide.playerID = playerID; // This will set the playerID where position is 'mid_left_player'
                    this.topSidePlayer = this.matter.add.sprite(this.topSide.x, this.topSide.y, "paddle");
                    this.topSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topSidePlayer.setStatic(true);
                }
            }
        } if (this.playerPosition === 'mid_left_player') {
            // If their is a bottom right side player set it
            if (!gameState.hasOwnProperty('bottom_right_wall')) {
                for (var playerID in gameState) {
                    if (gameState[playerID].position === 'bottom_right_player') {
                        this.topRightSide.playerID = playerID; // This will set the playerID where position is 'bottom_right_player'
                        this.topRightSidePlayer = this.matter.add.sprite(this.topRightSide.x, this.topRightSide.y, "paddle");
                        this.topRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                        this.topRightSidePlayer.setAngle(45);
                        this.topRightSidePlayer.setStatic(true);
                    }
                }
            }

            for (var playerID in gameState) {
                if (gameState[playerID].position === 'top_left_player') {
                    this.bottomLeftSide.playerID = playerID; // This will set the playerID where position is 'top_left_player'
                    this.bottomLeftSidePlayer = this.matter.add.sprite(this.bottomLeftSide.x, this.bottomLeftSide.y, "paddle");
                    this.bottomLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.bottomLeftSidePlayer.setAngle(-135);
                    this.bottomLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_player') {
                    this.midLeftSide.playerID = playerID; // This will set the playerID where position is 'top_player'
                    this.midLeftSidePlayer = this.matter.add.sprite(this.midLeftSide.x, this.midLeftSide.y, "paddle");
                    this.midLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.midLeftSidePlayer.setAngle(90);
                    this.midLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'bottom_player') {
                    this.midRightSide.playerID = playerID; // This will set the playerID where position is 'bottom_player'
                    this.midRightSidePlayer = this.matter.add.sprite(this.midRightSide.x, this.midRightSide.y, "paddle");
                    this.midRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.midRightSidePlayer.setAngle(90);
                    this.midRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'bottom_left_player') {
                    this.bottomRightSide.playerID = playerID; // This will set the playerID where position is 'bottom_left_player'
                    this.bottomRightSidePlayer = this.matter.add.sprite(this.bottomRightSide.x, this.bottomRightSide.y, "paddle");
                    this.bottomRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.bottomRightSidePlayer.setAngle(135);
                    this.bottomRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_right_player') {
                    this.topLeftSide.playerID = playerID; // This will set the playerID where position is 'top_right_player'
                    this.topLeftSidePlayer = this.matter.add.sprite(this.topLeftSide.x, this.topLeftSide.y, "paddle");
                    this.topLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topLeftSidePlayer.setAngle(-45);
                    this.topLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'mid_right_player') {
                    this.topSide.playerID = playerID; // This will set the playerID where position is 'mid_right_player'
                    this.topSidePlayer = this.matter.add.sprite(this.topSide.x, this.topSide.y, "paddle");
                    this.topSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topSidePlayer.setStatic(true);
                }
            }
        } if (this.playerPosition === 'bottom_left_player') {
            // If their is a bottom right side player set it
            if (!gameState.hasOwnProperty('bottom_right_wall')) {
                for (var playerID in gameState) {
                    if (gameState[playerID].position === 'bottom_right_player') {
                        this.midRightSide.playerID = playerID; // This will set the playerID where position is 'bottom_right_player'
                        this.midRightSidePlayer = this.matter.add.sprite(this.midRightSide.x, this.midRightSide.y, "paddle");
                        this.midRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                        this.midRightSidePlayer.setAngle(90);
                        this.midRightSidePlayer.setStatic(true);
                    }
                }
            }

            for (var playerID in gameState) {
                if (gameState[playerID].position === 'mid_left_player') {
                    this.bottomLeftSide.playerID = playerID; // This will set the playerID where position is 'mid_left_player'
                    this.bottomLeftSidePlayer = this.matter.add.sprite(this.bottomLeftSide.x, this.bottomLeftSide.y, "paddle");
                    this.bottomLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.bottomLeftSidePlayer.setAngle(-135);
                    this.bottomLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_left_player') {
                    this.midLeftSide.playerID = playerID; // This will set the playerID where position is 'top_left_player'
                    this.midLeftSidePlayer = this.matter.add.sprite(this.midLeftSide.x, this.midLeftSide.y, "paddle");
                    this.midLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.midLeftSidePlayer.setAngle(90);
                    this.midLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'bottom_player') {
                    this.bottomRightSide.playerID = playerID; // This will set the playerID where position is 'bottom_player'
                    this.bottomRightSidePlayer = this.matter.add.sprite(this.bottomRightSide.x, this.bottomRightSide.y, "paddle");
                    this.bottomRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.bottomRightSidePlayer.setAngle(135);
                    this.bottomRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'mid_right_player') {
                    this.topRightSide.playerID = playerID; // This will set the playerID where position is 'mid_right_player'
                    this.topRightSidePlayer = this.matter.add.sprite(this.topRightSide.x, this.topRightSide.y, "paddle");
                    this.topRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topRightSidePlayer.setAngle(45);
                    this.topRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_player') {
                    this.topLeftSide.playerID = playerID; // This will set the playerID where position is 'top_player'
                    this.topLeftSidePlayer = this.matter.add.sprite(this.topLeftSide.x, this.topLeftSide.y, "paddle");
                    this.topLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topLeftSidePlayer.setAngle(-45);
                    this.topLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_right_player') {
                    this.topSide.playerID = playerID; // This will set the playerID where position is 'top_right_player'
                    this.topSidePlayer = this.matter.add.sprite(this.topSide.x, this.topSide.y, "paddle");
                    this.topSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topSidePlayer.setStatic(true);
                }
            }
        } if (this.playerPosition === 'bottom_right_player') {
            for (var playerID in gameState) {
                if (gameState[playerID].position === 'bottom_player') {
                    this.bottomLeftSide.playerID = playerID; // This will set the playerID where position is 'bottom_player'
                    this.bottomLeftSidePlayer = this.matter.add.sprite(this.bottomLeftSide.x, this.bottomLeftSide.y, "paddle");
                    this.bottomLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.bottomLeftSidePlayer.setAngle(-135);
                    this.bottomLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'bottom_left_player') {
                    this.midLeftSide.playerID = playerID; // This will set the playerID where position is 'bottom_left_player'
                    this.midLeftSidePlayer = this.matter.add.sprite(this.midLeftSide.x, this.midLeftSide.y, "paddle");
                    this.midLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.midLeftSidePlayer.setAngle(90);
                    this.midLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_right_player') {
                    this.midRightSide.playerID = playerID; // This will set the playerID where position is 'top_right_player'
                    this.midRightSidePlayer = this.matter.add.sprite(this.midRightSide.x, this.midRightSide.y, "paddle");
                    this.midRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.midRightSidePlayer.setAngle(90);
                    this.midRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'mid_right_player') {
                    this.bottomRightSide.playerID = playerID; // This will set the playerID where position is 'mid_right_player'
                    this.bottomRightSidePlayer = this.matter.add.sprite(this.bottomRightSide.x, this.bottomRightSide.y, "paddle");
                    this.bottomRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.bottomRightSidePlayer.setAngle(135);
                    this.bottomRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_player') {
                    this.topRightSide.playerID = playerID; // This will set the playerID where position is 'top_player'
                    this.topRightSidePlayer = this.matter.add.sprite(this.topRightSide.x, this.topRightSide.y, "paddle");
                    this.topRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topRightSidePlayer.setAngle(45);
                    this.topRightSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'mid_left_player') {
                    this.topLeftSide.playerID = playerID; // This will set the playerID where position is 'mid_left_player'
                    this.topLeftSidePlayer = this.matter.add.sprite(this.topLeftSide.x, this.topLeftSide.y, "paddle");
                    this.topLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                    this.topLeftSidePlayer.setAngle(-45);
                    this.topLeftSidePlayer.setStatic(true);
                } else if (gameState[playerID].position === 'top_left_player') {
                    this.topSide.playerID = playerID; // This will set the playerID where position is 'top_left_player'
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
            } 
            
            else if (playerID == this.topRightSide.playerID) {
                let positionDelta = gameState[playerID]['x'] - 400
                positionDelta = positionDelta / 2
                this.topRightSidePlayer.x = 565 - positionDelta
                this.topRightSidePlayer.y = 135 - positionDelta
            } 
            
            else if (playerID == this.topLeftSide.playerID) {
                let positionDelta = gameState[playerID]['x'] - 400
                positionDelta = positionDelta / 2
                this.topLeftSidePlayer.x = 235 - positionDelta
                this.topLeftSidePlayer.y = 135 - positionDelta
            } 

            else if (playerID == this.midRightSide.playerID) {
                let positionDelta = gameState[playerID]['x'] - 400
                positionDelta = positionDelta / 2
                this.midRightSidePlayer.x = 635 - positionDelta
                this.midRightSidePlayer.y = 300 - positionDelta
            } 
            
            else if (playerID == this.midLeftSide.playerID) {
                let positionDelta = gameState[playerID]['x'] - 400
                positionDelta = positionDelta / 2
                this.midLeftSidePlayer.x = 165 - positionDelta
                this.midLeftSidePlayer.y = 300 - positionDelta
            } 
            
            else if (playerID == this.bottomLeftSide.playerID) {
                let positionDelta = gameState[playerID]['x'] - 400
                positionDelta = positionDelta / 2
                this.bottomLeftSidePlayer.x = 235 + positionDelta
                this.bottomLeftSidePlayer.y = 465 + positionDelta
            }
            
            else if (playerID == this.bottomRightSide.playerID) {
                let positionDelta = gameState[playerID]['x'] - 400
                positionDelta = positionDelta / 2
                this.bottomRightSidePlayer.x = 565 - positionDelta
                this.bottomRightSidePlayer.y = 465 - positionDelta
            }
        }
    }
}

export default EightPlayer;

import { generateUniqueToken, ballCollisionNoise, resetVelocityIncrease, ballAngle, playerMoved, ballMoved } from '../library.js';



class FourPlayer extends Phaser.Scene {
    constructor() {
        super({ key: 'FourPlayer' });
        this.gameInitialised = false;
        this.cursors = null;
        this.player = null;
        this.ball = null;
        this.leftEnd = 220;
        this.rightEnd = 580;
        this.topEnd = 120;
        this.bottomEnd = 480;
        this.paddleHeight = 535;
        this.paddleScaleX = 0.15;
        this.paddleScaleY = 0.2;
        this.playerID = generateUniqueToken(4);
        this.playerPosition = null;
        this.rightSide = {
            playerID: null, 
            x: 627, 
            y: 300, 
            life: null 
        };
        this.rightSidePlayer = null;
        this.leftSide = {
            playerID: null, 
            x: 173, 
            y: 300, 
            life: null 
        };
        this.leftSidePlayer = null;
        this.topSide = {
            playerID: null, 
            x: 400, 
            y: 65, 
            life: null 
        };
        this.bottomSidePlayer = null;
        this.bottomSide = {
            playerID: null, 
            x: 400, 
            y: 535, 
            life: null 
        };
        this.bottomSidePlayer = null;

        this.topWall = null;
        this.bottomWall = null;
        this.leftWall = null;
        this.rightWall = null;
    }

    preload() {
        this.load.image("paddle", "js/assets/sprites/player_life3.png");
        this.load.image("paddle2", "js/assets/sprites/player_life2.png");
        this.load.image("paddle3", "js/assets/sprites/player_life1.png");
        this.load.image("player", "js/assets/sprites/personal_player3.png");
        this.load.image("player2", "js/assets/sprites/personal_player2.png");
        this.load.image("player3", "js/assets/sprites/personal_player1.png");
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
                this.ball.x = message.x;
                this.ball.y = message.y;
                this.ball.setVelocity(message.vx, message.vy);
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

        this.topWall = this.matter.add.sprite(400, 40, "wall", { restitution: 1 }); //Top Border
        this.topWall.setScale(0.7, 0.1); // scales width by 70% and height by 20%
        this.topWall.setStatic(true);

        this.leftWall = this.matter.add.sprite(148, 300, "wall", { restitution: 1 }); //Left Border
        this.leftWall.setScale(0.7, 0.1);
        this.leftWall.setAngle(90);
        this.leftWall.setStatic(true);

        this.rightWall = this.matter.add.sprite(652, 300, "wall", { restitution: 1 }); //Right Border
        this.rightWall.setScale(0.7, 0.1);
        this.rightWall.setAngle(90);
        this.rightWall.setStatic(true);

        this.bottomWall = this.matter.add.sprite(400, 560, "wall", { restitution: 1 }); //Bottom Border
        this.bottomWall.setScale(0.7, 0.1);
        this.bottomWall.setStatic(true);

    }

    update() {
        if (this.playerPosition === 'top_player' || this.playerPosition === 'bottom_player') {
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
        } else if (this.playerPosition === 'left_player' || this.playerPosition === 'right_player') {
            if (this.cursors.up.isDown) {
                if (this.player.y > this.topEnd) {
                    this.player.y -= 5; // Move paddle left via x coordinate
                playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
                }
            } else if (this.cursors.down.isDown) {
                if (this.player.y < this.bottomEnd) {
                    this.player.y += 5; // move paddle right via x coordinate
                    playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
                }
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

        // init ball (move this down probably)
        this.ball = this.matter.add.image(400, 400, "ball", { restitution: 1 });
        this.ball.setScale(0.25);
        this.ball.setCircle(13);
        this.ball.setFriction(0, 0, 0);
        this.ball.setVelocity(0, 2);
        this.ball.setBounce(1);
        this.ball.setFixedRotation()

        // Create our own player 
        if (this.playerPosition === 'bottom_player') {
            this.player = this.matter.add.sprite(400, this.paddleHeight, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
        } else if (this.playerPosition === 'top_player') {
            this.player = this.matter.add.sprite(this.topSide.x, this.topSide.y, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
        } else if (this.playerPosition === 'right_player') {
            this.player = this.matter.add.sprite(this.rightSide.x, this.rightSide.y, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
            this.player.setAngle(90);
        } else if (this.playerPosition === 'left_player') {
            this.player = this.matter.add.sprite(this.leftSide.x, this.leftSide.y, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
            this.player.setAngle(90);
        }
        
        // Initializing game by setting values according to absolute map from server
        for (var playerID in gameState) {
            if (!gameState.hasOwnProperty('right_wall') && gameState[playerID].position === 'right_player' && this.playerID != playerID ) {
                this.rightSide.playerID = playerID; // This will set the playerID where position is 'right_player'
                this.rightSidePlayer = this.matter.add.sprite(this.rightSide.x, this.rightSide.y, "paddle");
                this.rightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.rightSidePlayer.setAngle(90);
                this.rightSidePlayer.setStatic(true);
                this.rightSide.life = 3;
            } else if (!gameState.hasOwnProperty('left_wall') && gameState[playerID].position === 'left_player' && this.playerID != playerID ) {
                this.leftSide.playerID = playerID; // This will set the playerID where position is 'right_player'
                this.leftSidePlayer = this.matter.add.sprite(this.leftSide.x, this.leftSide.y, "paddle");
                this.leftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.leftSidePlayer.setAngle(90);
                this.leftSidePlayer.setStatic(true);
                this.leftSide.life = 3;
            } else if ( gameState[playerID].position === 'top_player' && this.playerID != playerID ) {
                this.topSide.playerID = playerID; // This will set the playerID where position is 'right_player'
                this.topSidePlayer = this.matter.add.sprite(this.topSide.x, this.topSide.y, "paddle");
                this.topSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.topSidePlayer.setStatic(true);
                this.topSide.life = 3;
            } else if ( gameState[playerID].position === 'bottom_player' && this.playerID != playerID ) {
                this.bottomSide.playerID = playerID; // This will set the playerID where position is 'right_player'
                this.bottomSidePlayer = this.matter.add.sprite(this.bottomSide.x, this.bottomSide.y, "paddle");
                this.bottomSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.bottomSidePlayer.setStatic(true);
                this.bottomSide.life = 3;
            }
        }

        this.matter.world.on("collisionactive", function (event, bodyA, bodyB) {
            // ballCollisionNoise();
            // Check if one of the bodies is the ball
            if (this.playerPosition === 'bottom_player') {

                if (bodyA === this.ball.body && bodyB === this.topWall.body || this.bodyB === this.ball.body && this.bodyA === this.topWall.body) {
                    if (this.topSide.life != null) {
                        this.ball.x = 400;
                        this.ball.y = 300;
                        resetVelocityIncrease();
                    }
                    var velocity = this.ball.body.velocity;
                    let [velocityX, velocityY] = ballAngle(velocity)
    
                    this.ball.setVelocity(velocityX, velocityY);
                    ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
                    
                } else if (bodyA === this.ball.body && bodyB === this.leftWall.body || bodyB === this.ball.body && bodyA === this.leftWall.body) {
                    if (this.leftSide.life != null) {
                        this.ball.x = 400;
                        this.ball.y = 300;
                        resetVelocityIncrease();
                    }
                    var velocity = this.ball.body.velocity;
                    let [velocityX, velocityY] = ballAngle(velocity)
    
                    this.ball.setVelocity(velocityX, velocityY);
                    ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
    
                } else if (bodyA === this.ball.body && bodyB === this.rightWall.body || bodyB === this.ball.body && bodyA === this.rightWall.body) {
                    if (this.rightSide.life != null) {
                        this.ball.x = 400;
                        this.ball.y = 300;
                        resetVelocityIncrease();
                    }
                    var velocity = this.ball.body.velocity;
                    let [velocityX, velocityY] = ballAngle(velocity)
    
                    this.ball.setVelocity(velocityX, velocityY);
                    ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
    
                } else if (bodyA === this.ball.body && bodyB === this.bottomWall.body || bodyB === this.ball.body && bodyA === this.bottomWall.body) {
                    if (this.bottomSide.life != null) {
                        this.ball.x = 400;
                        this.ball.y = 300;
                        resetVelocityIncrease();
                    }
                    var velocity = this.ball.body.velocity;
                    let [velocityX, velocityY] = ballAngle(velocity)
    
                    this.ball.setVelocity(velocityX, velocityY);
                    ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
                } else if (bodyA === this.ball.body || bodyB === this.ball.body) {
                    // Get the current velocity of the ball
                    var velocity = this.ball.body.velocity;
                    let [velocityX, velocityY] = ballAngle(velocity)

                    this.ball.setVelocity(velocityX, velocityY);
                    ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
                }

            }
            
            

        }.bind(this));
        
    }

    handleGameState(gameState) {
        this.playerPosition = gameState[this.playerID]['position'];

        for (var playerID in gameState) {
        
            if (playerID == this.topSide.playerID) {
                this.topSidePlayer.x = gameState[playerID]['x']
                this.topSidePlayer.y = gameState[playerID]['y']
            } else if (playerID == this.rightSide.playerID) {
                this.rightSidePlayer.x = gameState[playerID]['x']
                this.rightSidePlayer.y = gameState[playerID]['y']
            } else if (playerID == this.leftSide.playerID) {
                this.leftSidePlayer.x = gameState[playerID]['x']
                this.leftSidePlayer.y = gameState[playerID]['y']
            } else if (playerID == this.bottomSide.playerID) {
                this.bottomSidePlayer.x = gameState[playerID]['x']
                this.bottomSidePlayer.y = gameState[playerID]['y']
            }

        }
    }

}

export default FourPlayer;

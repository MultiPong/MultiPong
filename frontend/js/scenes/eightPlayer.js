// scenes/eightPlayer.js
import { generateUniqueToken, ballCollisionNoise, resetVelocityIncrease, ballAngle, playerMoved, ballMoved } from '../library.js';


class EightPlayer extends Phaser.Scene {
    constructor() {
        super({ key: 'EightPlayer' });
        this.gameInitialised = false;
        this.cursors = null;
        this.player = null;
        this.ball = null;   
        this.leftEnd = 335;
        this.rightEnd = 465;
        this.topEnd = 235;
        this.bottomEnd = 365;
        this.paddleHeight = 535;
        this.paddleScaleX = 0.1;
        this.paddleScaleY = 0.15;
        this.playerID = generateUniqueToken(4);
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
            y: 65, 
            score: null 
        };
        this.topSidePlayer = null;
        this.bottomSide = {
            playerID: null, 
            x: 400, 
            y: 535, 
            life: null 
        };
        this.bottomSidePlayer = null;
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

        //Create Map Borders
        let topLeftWall = this.matter.add.sprite(217, 115, "wall", { restitution: 1 }); //Top Left Border
        topLeftWall.setScale(0.3, 0.1); // scales width by 30% and height by 10%
        topLeftWall.setAngle(-45);
        topLeftWall.setStatic(true);
        topLeftWall.setBounce(1);

        let topRightWall = this.matter.add.sprite(583, 115, "wall", { restitution: 1 }); //Top Right Border
        topRightWall.setScale(0.3, 0.1);
        topRightWall.setAngle(45);
        topRightWall.setStatic(true);

        let bottomLeftWall = this.matter.add.sprite(217, 485, "wall", { restitution: 1 }); //Bottom Left Border
        bottomLeftWall.setScale(0.3, 0.1);
        bottomLeftWall.setAngle(-135);
        bottomLeftWall.setStatic(true);

        let bottomRightWall = this.matter.add.sprite(583, 485, "wall", { restitution: 1 }); //Bottom Right Border
        bottomRightWall.setScale(0.3, 0.1);
        bottomRightWall.setAngle(135);
        bottomRightWall.setStatic(true);

        let midLeftWall = this.matter.add.sprite(140, 300, "wall", { restitution: 1 }); //Mid Left Border
        midLeftWall.setScale(0.3, 0.1);
        midLeftWall.setAngle(90);
        midLeftWall.setStatic(true);

        let midRightWall = this.matter.add.sprite(660, 300, "wall", { restitution: 1 }); //Mid Right Border
        midRightWall.setScale(0.3, 0.1);
        midRightWall.setAngle(90);
        midRightWall.setStatic(true);

        let topWall = this.matter.add.sprite(400, 39, "wall", { restitution: 1 }); //Top Border
        topWall.setScale(0.3, 0.1);
        topWall.setStatic(true);

        let bottomWall = this.matter.add.sprite(400, 561, "wall", { restitution: 1 }); //Bottom Border
        bottomWall.setScale(0.3, 0.1);
        bottomWall.setStatic(true);
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
        } else if (this.playerPosition === 'mid_left_player' || this.playerPosition === 'mid_right_player') {
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
        } else if (this.playerPosition === 'top_right_player') {
            this.player = this.matter.add.sprite(this.topRightSide.x, this.topRightSide.y, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
            this.player.setAngle(45);
        } else if (this.playerPosition === 'top_left_player') {
            this.player = this.matter.add.sprite(this.topLeftSide.x, this.topLeftSide.y, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
            this.player.setAngle(-45);
        } else if (this.playerPosition === 'mid_right_player') {
            this.player = this.matter.add.sprite(this.midRightSide.x, this.midRightSide.y, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
            this.player.setAngle(90);
        } else if (this.playerPosition === 'mid_left_player') {
            this.player = this.matter.add.sprite(this.midLeftSide.x, this.midLeftSide.y, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
            this.player.setAngle(90);
        } else if (this.playerPosition === 'bottom_right_player') {
            this.player = this.matter.add.sprite(this.bottomRightSide.x, this.bottomRightSide.y, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
            this.player.setAngle(135);
        } else if (this.playerPosition === 'bottom_left_player') {
            this.player = this.matter.add.sprite(this.bottomLeftSide.x, this.bottomLeftSide.y, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
            this.player.setAngle(-135);
        }

        // Initializing game by setting values according to absolute map from server
        for (var playerID in gameState) {
            if (!gameState.hasOwnProperty('bottom_right_wall') && gameState[playerID].position === 'bottom_right_player' && this.playerID != playerID ) {
                this.bottomRightSide.playerID = playerID; // This will set the playerID where position is 'bottom_right_player'
                this.bottomRightSidePlayer = this.matter.add.sprite(this.bottomRightSide.x, this.bottomRightSide.y, "paddle");
                this.bottomRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.bottomRightSidePlayer.setAngle(135);
                this.bottomRightSidePlayer.setStatic(true);
            } else if (gameState[playerID].position === 'top_player' && this.playerID != playerID ) {
                this.topSide.playerID = playerID; // This will set the playerID where position is 'top_player'
                this.topSidePlayer = this.matter.add.sprite(this.topSide.x, this.topSide.y, "paddle");
                this.topSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.topSidePlayer.setStatic(true);
            } else if (gameState[playerID].position === 'top_right_player' && this.playerID != playerID ) {
                this.topRightSide.playerID = playerID; // This will set the playerID where position is 'top_right_player'
                this.topRightSidePlayer = this.matter.add.sprite(this.topRightSide.x, this.topRightSide.y, "paddle");
                this.topRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.topRightSidePlayer.setAngle(45);
                this.topRightSidePlayer.setStatic(true);
            } else if (gameState[playerID].position === 'top_left_player' && this.playerID != playerID ) {
                this.topLeftSide.playerID = playerID; // This will set the playerID where position is 'top_left_player'
                this.topLeftSidePlayer = this.matter.add.sprite(this.topLeftSide.x, this.topLeftSide.y, "paddle");
                this.topLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.topLeftSidePlayer.setAngle(-45);
                this.topLeftSidePlayer.setStatic(true);
            } else if (gameState[playerID].position === 'mid_right_player' && this.playerID != playerID ) {
                this.midRightSide.playerID = playerID; // This will set the playerID where position is 'mid_right_player'
                this.midRightSidePlayer = this.matter.add.sprite(this.midRightSide.x, this.midRightSide.y, "paddle");
                this.midRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.midRightSidePlayer.setAngle(90);
                this.midRightSidePlayer.setStatic(true);
            } else if (gameState[playerID].position === 'mid_left_player' && this.playerID != playerID ) {
                this.midLeftSide.playerID = playerID; // This will set the playerID where position is 'mid_left_player'
                this.midLeftSidePlayer = this.matter.add.sprite(this.midLeftSide.x, this.midLeftSide.y, "paddle");
                this.midLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.midLeftSidePlayer.setAngle(90);
                this.midLeftSidePlayer.setStatic(true);
            } else if (gameState[playerID].position === 'bottom_left_player' && this.playerID != playerID ) {
                this.bottomLeftSide.playerID = playerID; // This will set the playerID where position is 'bottom_left_player'
                this.bottomLeftSidePlayer = this.matter.add.sprite(this.bottomLeftSide.x, this.bottomLeftSide.y, "paddle");
                this.bottomLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.bottomLeftSidePlayer.setAngle(-135);
                this.bottomLeftSidePlayer.setStatic(true);
            } else if (gameState[playerID].position === 'bottom_player' && this.playerID != playerID ) {
                this.bottomSide.playerID = playerID; // This will set the playerID where position is 'top_player'
                this.bottomSidePlayer = this.matter.add.sprite(this.bottomSide.x, this.bottomSide.y, "paddle");
                this.bottomSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.bottomSidePlayer.setStatic(true);
            }
        }

        this.matter.world.on("collisionactive", function (event, bodyA, bodyB) {
            // ballCollisionNoise();
            // Check if one of the bodies is the ball
            if (bodyA === this.ball.body || bodyB === this.ball.body) {
            // Get the current velocity of the ball
            var velocity = this.ball.body.velocity;
            let [velocityX, velocityY] = ballAngle(velocity)

            this.ball.setVelocity(velocityX, velocityY);
            ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
            }
            // if (bodyA === ball.body && bodyB === wall1.body || bodyB === ball.body && bodyA === wall1.body) {
            //     ball.x = 400;
            //     ball.y = 300;
            //     resetVelocityIncrease();
            //     var velocity = ball.body.velocity;
            //     let [velocityX, velocityY] = ballAngle(velocity)

            //     ball.setVelocity(velocityX, velocityY);
            //     ballMoved(this, this.playerID, ball.x, ball.y, velocityX, velocityY);
                
            // } else if (bodyA === ball.body && bodyB === wall2.body || bodyB === ball.body && bodyA === wall2.body) {
            //     ball.x = 400;
            //     ball.y = 300;
            //     resetVelocityIncrease();
            //     var velocity = ball.body.velocity;
            //     let [velocityX, velocityY] = ballAngle(velocity)

            //     ball.setVelocity(velocityX, velocityY);
            //     ballMoved(this, this.playerID, ball.x, ball.y, velocityX, velocityY);

            // } else if (bodyA === ball.body && bodyB === wall3.body || bodyB === ball.body && bodyA === wall3.body) {
            //     ball.x = 400;
            //     ball.y = 300;
            //     resetVelocityIncrease();
            //     var velocity = ball.body.velocity;
            //     let [velocityX, velocityY] = ballAngle(velocity)

            //     ball.setVelocity(velocityX, velocityY);
            //     ballMoved(this, this.playerID, ball.x, ball.y, velocityX, velocityY);

            // } else if (bodyA === ball.body && bodyB === wall4.body || bodyB === ball.body && bodyA === wall4.body) {
            //     ball.x = 400;
            //     ball.y = 300;
            //     resetVelocityIncrease();
            //     var velocity = ball.body.velocity;
            //     let [velocityX, velocityY] = ballAngle(velocity)

            //     ball.setVelocity(velocityX, velocityY);
            //     ballMoved(this, this.playerID, ball.x, ball.y, velocityX, velocityY);
            // }
            

        }.bind(this));
    }

    handleGameState(gameState) {
        this.playerPosition = gameState[this.playerID]['position'];

        for (var playerID in gameState) {
        
            if (playerID == this.topSide.playerID) {
                this.topSidePlayer.x = gameState[playerID]['x']
                this.topSidePlayer.y = gameState[playerID]['y']
            } else if (playerID == this.topRightSide.playerID) {
                this.topRightSidePlayer.x = gameState[playerID]['x']
                this.topRightSidePlayer.y = gameState[playerID]['y']
            }else if (playerID == this.topLeftSide.playerID) {
                this.topLeftSidePlayer.x = gameState[playerID]['x']
                this.topLeftSidePlayer.y = gameState[playerID]['y']
            }else if (playerID == this.midRightSide.playerID) {
                this.midRightSidePlayer.x = gameState[playerID]['x']
                this.midRightSidePlayer.y = gameState[playerID]['y']
            }else if (playerID == this.midLeftSide.playerID) {
                this.midLeftSidePlayer.x = gameState[playerID]['x']
                this.midLeftSidePlayer.y = gameState[playerID]['y']
            }else if (playerID == this.bottomRightSide.playerID) {
                this.bottomRightSidePlayer.x = gameState[playerID]['x']
                this.bottomRightSidePlayer.y = gameState[playerID]['y']
            } else if (playerID == this.bottomLeftSide.playerID) {
                this.bottomLeftSidePlayer.x = gameState[playerID]['x']
                this.bottomLeftSidePlayer.y = gameState[playerID]['y']
            } else if (playerID == this.bottomSide.playerID) {
                this.bottomSidePlayer.x = gameState[playerID]['x']
                this.bottomSidePlayer.y = gameState[playerID]['y']
            }
        }
    }
}

export default EightPlayer;

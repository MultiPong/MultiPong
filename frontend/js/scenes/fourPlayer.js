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

        

        let topWall = this.matter.add.sprite(400, 40, "wall", { restitution: 1 }); //Top Border
        topWall.setScale(0.7, 0.1); // scales width by 70% and height by 20%
        topWall.setStatic(true);

        let leftWall = this.matter.add.sprite(148, 300, "wall", { restitution: 1 }); //Left Border
        leftWall.setScale(0.7, 0.1);
        leftWall.setAngle(90);
        leftWall.setStatic(true);

        let rightWall = this.matter.add.sprite(652, 300, "wall", { restitution: 1 }); //Right Border
        rightWall.setScale(0.7, 0.1);
        rightWall.setAngle(90);
        rightWall.setStatic(true);

        let bottomWall = this.matter.add.sprite(400, 560, "wall", { restitution: 1 }); //Bottom Border
        bottomWall.setScale(0.7, 0.1);
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
            } else if (!gameState.hasOwnProperty('left_wall') && gameState[playerID].position === 'left_player' && this.playerID != playerID ) {
                this.leftSide.playerID = playerID; // This will set the playerID where position is 'right_player'
                this.leftSidePlayer = this.matter.add.sprite(this.leftSide.x, this.leftSide.y, "paddle");
                this.leftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.leftSidePlayer.setAngle(90);
                this.leftSidePlayer.setStatic(true);
            } else if ( gameState[playerID].position === 'top_player' && this.playerID != playerID ) {
                this.topSide.playerID = playerID; // This will set the playerID where position is 'right_player'
                this.topSidePlayer = this.matter.add.sprite(this.topSide.x, this.topSide.y, "paddle");
                this.topSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.topSidePlayer.setStatic(true);
            } else if ( gameState[playerID].position === 'bottom_player' && this.playerID != playerID ) {
                this.bottomSide.playerID = playerID; // This will set the playerID where position is 'right_player'
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

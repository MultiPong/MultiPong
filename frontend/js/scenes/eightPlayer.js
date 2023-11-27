// scenes/eightPlayer.js
import { generateUniqueToken, toggleMute, playerScored, getRandomDirectionVector, resetVelocityIncrease, ballAngle, playerMoved, ballMoved } from '../library.js';


class EightPlayer extends Phaser.Scene {
    constructor() {
        super({ key: 'EightPlayer' });
        this.gameInitialised = false;
        this.cursors = null;
        this.soundEffect = null;
        this.player = null;
        this.ball = null;
        this.lifeCounter = null;  
        this.processingCollision = false;

        this.leftEnd = 335;
        this.rightEnd = 465;

        this.topEnd = 235;
        this.bottomEnd = 365;

        this.topRightTopEnd = (465, 95);
        this.topRightBottomEnd = (660, 175);

        this.bottomRightTopEnd = (660, 425);
        this.bottomRightBottomEnd = (547, 505);

        this.topLeftTopEnd = (335, 95);
        this.topLeftBottomEnd = (140, 184);

        this.bottomLeftTopEnd = (140, 425);
        this.bottomLeftBottomEnd = (253, 505);

        this.paddleHeight = 535;
        this.paddleScaleX = 0.1;
        this.paddleScaleY = 0.15;

        this.playerID = generateUniqueToken(4);
        this.playerPosition = null;
        this.playerLife = null;

        this.bottomRightSide = {
            playerID: null, 
            x: 565, 
            y: 465, 
            life: 0 
        };
        this.bottomRightSidePlayer = null;

        this.bottomLeftSide = {
            playerID: null, 
            x: 235, 
            y: 465, 
            life: 0 
        };
        this.bottomLeftSidePlayer = null;

        this.midRightSide = {
            playerID: null, 
            x: 635, 
            y: 300, 
            life: 0 
        };
        this.midRightSidePlayer = null;

        this.midLeftSide = {
            playerID: null, 
            x: 165, 
            y: 300, 
            life: 0 
        };
        this.midLeftSidePlayer = null;

        this.topRightSide = {
            playerID: null, 
            x: 565, 
            y: 135, 
            life: 0 
        };
        this.topRightSidePlayer = null;

        this.topLeftSide = {
            playerID: null, 
            x: 235, 
            y: 135, 
            life: 0 
        };
        this.topLeftSidePlayer = null;
        this.topSide = {
            playerID: null, 
            x: 400, 
            y: 65, 
            life: 0 
        };
        this.topSidePlayer = null;
        this.bottomSide = {
            playerID: null, 
            x: 400, 
            y: 535, 
            life: 0 
        };
        this.bottomSidePlayer = null;

        this.topWall = null;
        this.bottomWall = null;
        this.topLeftWall = null;
        this.topRightWall = null;
        this.midLeftWall = null;
        this.midRightWall = null;
        this.bottomLeftWall = null;
        this.bottomRightWall = null;

        
        this.gameID = null;
        this.token = null;
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
        this.load.image("onelife", 'js/assets/sprites/OneLife.png')
        this.load.image("twolife", 'js/assets/sprites/TwoLives.png')
        this.load.image("threelife", 'js/assets/sprites/ThreeLives.png')
        this.load.image("skull", 'js/assets/sprites/skull.png')
        this.load.audio("ballCollision", 'js/assets/ballCollide.mp3')
    }


    create() {
        let params = new URLSearchParams(window.location.search);

        this.gameID = params.get('id'); 
        this.token = params.get('token'); // null if 'token' is not present in the URL
    
        if (this.token === null) {
            console.log('Token is not provided in the URL');
        } else {
            console.log(this.token);
        }    
        console.log(this.gameID)
    
        this.connection = new WebSocket(`ws://localhost:8000/ws/game/${this.gameID}`);

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
            } else if (message.action === 'scoreUpdate') {
                let gameState = JSON.parse(message.gameState);
                this.handleScoreUpdate(gameState);
            }
        };
        
        this.soundEffect = this.sound.add('ballCollision')
        this.soundEffect.setVolume(0.2)

        this.muteButton = this.add.text(700, 40, '🔊', { fontSize: '50px' })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', function () {
            toggleMute(this.soundEffect, this.muteButton);  // Pass the muteButton reference
        }, this);

        this.connection.onclose = function(event) {
            console.log(`[close] Connection closed`);
        };
        
        this.connection.onerror = function(error) {
            console.log(`[error] ${error.message}`);
        };


        this.cursors = this.input.keyboard.createCursorKeys();
        this.lifeCounter = this.matter.add.sprite(0,0,'threelife')
        this.lifeCounter.setScale(0.35,0.35)

        //Create Map Borders
        this.topLeftWall = this.matter.add.sprite(217, 115, "wall", { restitution: 1 }); //Top Left Border
        this.topLeftWall.setScale(0.3, 0.1); // scales width by 30% and height by 10%
        this.topLeftWall.setAngle(-45);
        this.topLeftWall.setStatic(true);
        this.topLeftWall.setBounce(1);

        this.topRightWall = this.matter.add.sprite(583, 115, "wall", { restitution: 1 }); //Top Right Border
        this.topRightWall.setScale(0.3, 0.1);
        this.topRightWall.setAngle(45);
        this.topRightWall.setStatic(true);

        this.bottomLeftWall = this.matter.add.sprite(217, 485, "wall", { restitution: 1 }); //Bottom Left Border
        this.bottomLeftWall.setScale(0.3, 0.1);
        this.bottomLeftWall.setAngle(-135);
        this.bottomLeftWall.setStatic(true);

        this.bottomRightWall = this.matter.add.sprite(583, 485, "wall", { restitution: 1 }); //Bottom Right Border
        this.bottomRightWall.setScale(0.3, 0.1);
        this.bottomRightWall.setAngle(135);
        this.bottomRightWall.setStatic(true);

        this.midLeftWall = this.matter.add.sprite(140, 300, "wall", { restitution: 1 }); //Mid Left Border
        this.midLeftWall.setScale(0.3, 0.1);
        this.midLeftWall.setAngle(90);
        this.midLeftWall.setStatic(true);

        this.midRightWall = this.matter.add.sprite(660, 300, "wall", { restitution: 1 }); //Mid Right Border
        this.midRightWall.setScale(0.3, 0.1);
        this.midRightWall.setAngle(90);
        this.midRightWall.setStatic(true);

        this.topWall = this.matter.add.sprite(400, 39, "wall", { restitution: 1 }); //Top Border
        this.topWall.setScale(0.3, 0.1);
        this.topWall.setStatic(true);

        this.bottomWall = this.matter.add.sprite(400, 561, "wall", { restitution: 1 }); //Bottom Border
        this.bottomWall.setScale(0.3, 0.1);
        this.bottomWall.setStatic(true);
    }

    update() {
        if (this.playerLife > 0) {
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
                        this.player.y -= 5; // Move paddle up via y coordinate
                    playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
                    }
                } else if (this.cursors.down.isDown) {
                    if (this.player.y < this.bottomEnd) {
                        this.player.y += 5; // move paddle down via y coordinate
                        playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
                    }
                }
            } else if (this.playerPosition === 'top_left_player') {
                if (this.cursors.up.isDown || this.cursors.right.isDown) {
                    if (this.player.y > this.topLeftTopEnd) {
                        this.player.y -= 3.5; // move paddle up via y coordinate
                        this.player.x += 3.5; // move paddle right via x coordinate
                    playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
                    }
                } else if (this.cursors.down.isDown || this.cursors.left.isDown) {
                    if (this.player.y < this.topLeftBottomEnd) {
                        this.player.y += 3.5; // move paddle down via y coordinate
                        this.player.x -= 3.5; // move paddle left via x coordinate
                        playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
                    }
                }
            } else if (this.playerPosition === 'bottom_left_player') {
                if (this.cursors.up.isDown || this.cursors.left.isDown) {
                    if (this.player.y > this.bottomLeftTopEnd) {
                        this.player.y -= 3.5; // move paddle up via y coordinate
                        this.player.x -= 3.5; // move paddle left via x coordinate
                    playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
                    }
                } else if (this.cursors.down.isDown || this.cursors.right.isDown) {
                    if (this.player.y < this.bottomLeftBottomEnd) {
                        this.player.y += 3.5; // move paddle down via y coordinate
                        this.player.x += 3.5; // move paddle right via x coordinate
                        playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
                    }
                }
            } else if (this.playerPosition === 'top_right_player') {
                if (this.cursors.up.isDown || this.cursors.left.isDown) {
                    if (this.player.y > this.topLeftTopEnd) {
                        this.player.y -= 3.5; // move paddle up via y coordinate
                        this.player.x -= 3.5; // move paddle left via x coordinate
                    playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
                    }
                } else if (this.cursors.down.isDown || this.cursors.right.isDown) {
                    if (this.player.y < this.topLeftBottomEnd) {
                        this.player.y += 3.5; // move paddle down via y coordinate
                        this.player.x += 3.5; // move paddle right via x coordinate
                        playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
                    }
                }
            } else if (this.playerPosition === 'bottom_right_player') {
                if (this.cursors.up.isDown || this.cursors.right.isDown) {
                    if (this.player.y > this.bottomRightTopEnd) {
                        this.player.y -= 3.5; // move paddle up via y coordinate
                        this.player.x += 3.5; // move paddle right via x coordinate
                    playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
                    }
                } else if (this.cursors.down.isDown || this.cursors.left.isDown) {
                    if (this.player.y < this.bottomRightBottomEnd) {
                        this.player.y += 3.5; // move paddle down via y coordinate
                        this.player.x -= 3.5; // move paddle left via x coordinate
                        playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
                    }
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
        
        this.connection.send(JSON.stringify({ action: 'playerTokenSET', playerID: this.playerID, token: this.token }));

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
            this.bottomSide.playerID = this.playerID;
            this.bottomSide.life = 3;
        } else if (this.playerPosition === 'top_player') {
            this.player = this.matter.add.sprite(this.topSide.x, this.topSide.y, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
            this.topSide.playerID = this.playerID
            this.topSide.life = 3
        } else if (this.playerPosition === 'top_right_player') {
            this.player = this.matter.add.sprite(this.topRightSide.x, this.topRightSide.y, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
            this.player.setAngle(45);
            this.topRightSide.playerID = this.playerID
            this.topRightSide.life = 3
        } else if (this.playerPosition === 'top_left_player') {
            this.player = this.matter.add.sprite(this.topLeftSide.x, this.topLeftSide.y, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
            this.player.setAngle(-45);
            this.topLeftSide.playerID = this.playerID
            this.topLeftSide.life = 3
        } else if (this.playerPosition === 'mid_right_player') {
            this.player = this.matter.add.sprite(this.midRightSide.x, this.midRightSide.y, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
            this.player.setAngle(90);
            this.midRightSide.playerID = this.playerID
            this.midRightSide.life = 3
        } else if (this.playerPosition === 'mid_left_player') {
            this.player = this.matter.add.sprite(this.midLeftSide.x, this.midLeftSide.y, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
            this.player.setAngle(90);
            this.midLeftSide.playerID = this.playerID
            this.midLeftSide.life = 3
        } else if (this.playerPosition === 'bottom_right_player') {
            this.player = this.matter.add.sprite(this.bottomRightSide.x, this.bottomRightSide.y, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
            this.player.setAngle(135);
            this.bottomRightSide.playerID = this.playerID
            this.bottomRightSide.life = 3
        } else if (this.playerPosition === 'bottom_left_player') {
            this.player = this.matter.add.sprite(this.bottomLeftSide.x, this.bottomLeftSide.y, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
            this.player.setAngle(-135);
            this.bottomLeftSide.playerID = this.playerID
            this.bottomLeftSide.life = 3
        }

        this.playerLife = 3;

        // Initializing game by setting values according to absolute map from server
        for (var playerID in gameState) {
            if (!gameState.hasOwnProperty('bottom_right_wall') && gameState[playerID].position === 'bottom_right_player' && this.playerID != playerID ) {
                this.bottomRightSide.playerID = playerID; // This will set the playerID where position is 'bottom_right_player'
                this.bottomRightSidePlayer = this.matter.add.sprite(this.bottomRightSide.x, this.bottomRightSide.y, "paddle");
                this.bottomRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.bottomRightSidePlayer.setAngle(135);
                this.bottomRightSidePlayer.setStatic(true);
                this.bottomRightSide.life = 3;
            } else if (gameState[playerID].position === 'top_player' && this.playerID != playerID ) {
                this.topSide.playerID = playerID; // This will set the playerID where position is 'top_player'
                this.topSidePlayer = this.matter.add.sprite(this.topSide.x, this.topSide.y, "paddle");
                this.topSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.topSidePlayer.setStatic(true);
                this.topSide.life = 3;
            } else if (gameState[playerID].position === 'top_right_player' && this.playerID != playerID ) {
                this.topRightSide.playerID = playerID; // This will set the playerID where position is 'top_right_player'
                this.topRightSidePlayer = this.matter.add.sprite(this.topRightSide.x, this.topRightSide.y, "paddle");
                this.topRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.topRightSidePlayer.setAngle(45);
                this.topRightSidePlayer.setStatic(true);
                this.topRightSide.life = 3;
            } else if (gameState[playerID].position === 'top_left_player' && this.playerID != playerID ) {
                this.topLeftSide.playerID = playerID; // This will set the playerID where position is 'top_left_player'
                this.topLeftSidePlayer = this.matter.add.sprite(this.topLeftSide.x, this.topLeftSide.y, "paddle");
                this.topLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.topLeftSidePlayer.setAngle(-45);
                this.topLeftSidePlayer.setStatic(true);
                this.topLeftSide.life = 3;
            } else if (gameState[playerID].position === 'mid_right_player' && this.playerID != playerID ) {
                this.midRightSide.playerID = playerID; // This will set the playerID where position is 'mid_right_player'
                this.midRightSidePlayer = this.matter.add.sprite(this.midRightSide.x, this.midRightSide.y, "paddle");
                this.midRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.midRightSidePlayer.setAngle(90);
                this.midRightSidePlayer.setStatic(true);
                this.midRightSide.life = 3;
            } else if (gameState[playerID].position === 'mid_left_player' && this.playerID != playerID ) {
                this.midLeftSide.playerID = playerID; // This will set the playerID where position is 'mid_left_player'
                this.midLeftSidePlayer = this.matter.add.sprite(this.midLeftSide.x, this.midLeftSide.y, "paddle");
                this.midLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.midLeftSidePlayer.setAngle(90);
                this.midLeftSidePlayer.setStatic(true);
                this.midLeftSide.life = 3;
            } else if (gameState[playerID].position === 'bottom_left_player' && this.playerID != playerID ) {
                this.bottomLeftSide.playerID = playerID; // This will set the playerID where position is 'bottom_left_player'
                this.bottomLeftSidePlayer = this.matter.add.sprite(this.bottomLeftSide.x, this.bottomLeftSide.y, "paddle");
                this.bottomLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.bottomLeftSidePlayer.setAngle(-135);
                this.bottomLeftSidePlayer.setStatic(true);
                this.bottomLeftSide.life = 3;
            } else if (gameState[playerID].position === 'bottom_player' && this.playerID != playerID ) {
                this.bottomSide.playerID = playerID; // This will set the playerID where position is 'top_player'
                this.bottomSidePlayer = this.matter.add.sprite(this.bottomSide.x, this.bottomSide.y, "paddle");
                this.bottomSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.bottomSidePlayer.setStatic(true);
                this.bottomSide.life = 3;
            }
        }

        this.matter.world.on("collisionactive", function (event, bodyA, bodyB) {
            // Check if one of the bodies is the ball
            // If a collision is already being processed, ignore this one
            if (this.processingCollision) {
                return;
            }
            this.soundEffect.play();
            if (this.playerPosition === 'bottom_player') {
                if (bodyA === this.ball.body && bodyB === this.topWall.body || bodyB === this.ball.body && bodyA === this.topWall.body) {
                    console.log("Collision detected up top")
                    console.log(this.topSide.life)
                    if (this.topSide.life > 0) {
                        // Set the flag to indicate a collision is being processed
                        this.processingCollision = true;
                        playerScored(this, this.topSide.playerID)
                        this.ball.setVelocity(0, 0);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);
                    } else {
                        var velocity = this.ball.body.velocity;
                        let [velocityX, velocityY] = ballAngle(velocity)
        
                        this.ball.setVelocity(velocityX, velocityY);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
                    }
                } else if (bodyA === this.ball.body && bodyB === this.topLeftWall.body || bodyB === this.ball.body && bodyA === this.topLeftWall.body) {
                    if (this.topLeftSide.life > 0) {
                        // Set the flag to indicate a collision is being processed
                        this.processingCollision = true;
                        playerScored(this, this.topLeftSide.playerID)
                        this.ball.setVelocity(0, 0);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);
                    } else {
                        var velocity = this.ball.body.velocity;
                        let [velocityX, velocityY] = ballAngle(velocity)
        
                        this.ball.setVelocity(velocityX, velocityY);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
                    }
                } else if (bodyA === this.ball.body && bodyB === this.topRightWall.body || bodyB === this.ball.body && bodyA === this.topRightWall.body) {
                    if (this.topRightSide.life > 0) {
                        // Set the flag to indicate a collision is being processed
                        this.processingCollision = true;
                        playerScored(this, this.topRightSide.playerID)
                        this.ball.setVelocity(0, 0);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);
                    } else {
                        var velocity = this.ball.body.velocity;
                        let [velocityX, velocityY] = ballAngle(velocity)
        
                        this.ball.setVelocity(velocityX, velocityY);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
                    }
                } else if (bodyA === this.ball.body && bodyB === this.midLeftWall.body || bodyB === this.ball.body && bodyA === this.midLeftWall.body) {
                    if (this.midLeftSide.life > 0) {
                        // Set the flag to indicate a collision is being processed
                        this.processingCollision = true;
                        playerScored(this, this.midLeftSide.playerID)
                        this.ball.setVelocity(0, 0);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);
                    } else {
                        var velocity = this.ball.body.velocity;
                        let [velocityX, velocityY] = ballAngle(velocity)
        
                        this.ball.setVelocity(velocityX, velocityY);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
                    }
                } else if (bodyA === this.ball.body && bodyB === this.midRightWall.body || bodyB === this.ball.body && bodyA === this.midRightWall.body) {
                    if (this.midRightSide.life > 0) {
                        // Set the flag to indicate a collision is being processed
                        this.processingCollision = true;
                        playerScored(this, this.midRightSide.playerID)
                        this.ball.setVelocity(0, 0);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);
                    } else {
                        var velocity = this.ball.body.velocity;
                        let [velocityX, velocityY] = ballAngle(velocity)
        
                        this.ball.setVelocity(velocityX, velocityY);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
                    }
                } else if (bodyA === this.ball.body && bodyB === this.bottomLeftWall.body || bodyB === this.ball.body && bodyA === this.bottomLeftWall.body) {
                    if (this.bottomLeftSide.life > 0) {
                        // Set the flag to indicate a collision is being processed
                        this.processingCollision = true;
                        playerScored(this, this.bottomLeftSide.playerID)
                        this.ball.setVelocity(0, 0);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);
                    } else {
                        var velocity = this.ball.body.velocity;
                        let [velocityX, velocityY] = ballAngle(velocity)
        
                        this.ball.setVelocity(velocityX, velocityY);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
                    }
                } else if (bodyA === this.ball.body && bodyB === this.bottomRightWall.body || bodyB === this.ball.body && bodyA === this.bottomRightWall.body) {
                    if (this.bottomRightSide.life > 0) {
                        // Set the flag to indicate a collision is being processed
                        this.processingCollision = true;
                        playerScored(this, this.bottomRightSide.playerID)
                        this.ball.setVelocity(0, 0);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);
                    } else {
                        var velocity = this.ball.body.velocity;
                        let [velocityX, velocityY] = ballAngle(velocity)
        
                        this.ball.setVelocity(velocityX, velocityY);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
                    }
                } else if (bodyA === this.ball.body && bodyB === this.bottomWall.body || bodyB === this.ball.body && bodyA === this.bottomWall.body) {
                    console.log("Collision detected bottom")
                    console.log(this.bottomSide.life)
                    if (this.bottomSide.life > 0) {
                        // Set the flag to indicate a collision is being processed
                        this.processingCollision = true;
                        playerScored(this, this.bottomSide.playerID)
                        this.ball.setVelocity(0, 0);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);
                    } else {
                        var velocity = this.ball.body.velocity;
                        let [velocityX, velocityY] = ballAngle(velocity)
        
                        this.ball.setVelocity(velocityX, velocityY);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
                    }
                } else if (bodyA === this.ball.body || bodyB === this.ball.body) {
                    // Get the current velocity of the ball
                    var velocity = this.ball.body.velocity;
                    let [velocityX, velocityY] = ballAngle(velocity)

                    this.ball.setVelocity(velocityX, velocityY);
                    ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
                }
            }
            // Reset the flag after a delay to allow for the next collision
            this.time.delayedCall(100, function() {
                this.processingCollision = false;
            }, [], this);
                        
        }.bind(this));
    }

    handleGameState(gameState) {
        this.playerPosition = gameState[this.playerID]['position'];

        for (var playerID in gameState) {
            if (playerID == this.playerID) {
                // do nothing 
            } else if (playerID == this.topSide.playerID) {
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

    handleScoreUpdate(gameState) {
        for (var playerID in gameState) {
            if (playerID == this.playerID) {
                this.playerLife = gameState[playerID]['lives']
                if (this.playerID === this.topSide.playerID) {
                    this.topSide.life = gameState[playerID]['lives']
                } else if (this.playerID === this.topRightSide.playerID) {
                    this.topRightSide.life = gameState[playerID]['lives']
                } else if (this.playerID === this.topLeftSide.playerID) {
                    this.topLeftSide.life = gameState[playerID]['lives']
                } else if (this.playerID === this.midRightSide.playerID) {
                    this.midRightSide.life = gameState[playerID]['lives']
                } else if (this.playerID === this.midLeftSide.playerID) {
                    this.midLeftSide.life = gameState[playerID]['lives']
                } else if (this.playerID === this.bottomRightSide.playerID) {
                    this.bottomRightSide.life = gameState[playerID]['lives']
                } else if (this.playerID === this.bottomLeftSide.playerID) {
                    this.bottomLeftSide.life = gameState[playerID]['lives']
                }else if (this.playerID === this.bottomSide.playerID) {
                    this.bottomSide.life = gameState[playerID]['lives']
                }
                if (this.playerLife == 2) {
                    this.player.setTexture("player2");
                    this.lifeCounter.setTexture("twolife")
                } else if (this.playerLife == 1) {
                    this.player.setTexture("player3");
                    this.lifeCounter.setTexture("onelife")
                } else if (this.playerLife == 0) {
                    this.player.x = 0;
                    this.player.y = 0;
                    this.player.setVisible(false);
                    this.lifeCounter.setTexture("skull")
                }
            } else if (playerID == this.topSide.playerID) {
                this.topSide.life = gameState[playerID]['lives']
                if (this.topSide.life == 2) {
                    this.topSidePlayer.setTexture("paddle2");
                } else if (this.topSide.life == 1) {
                    this.topSidePlayer.setTexture("paddle3");
                } else if (this.topSide.life == 0) {
                    this.topSidePlayer.x = 0;
                    this.topSidePlayer.y = 0;
                    this.topSidePlayer.setVisible(false);
                }

            } else if (playerID == this.topRightSide.playerID) {
                this.topRightSide.life = gameState[playerID]['lives'];
                if (this.topRightSide.life == 2) {
                    this.topRightSidePlayer.setTexture("paddle2");
                } else if (this.topRightSide.life == 1) {
                    this.topRightSidePlayer.setTexture("paddle3");
                } else if (this.topRightSide.life == 0) {
                    this.topRightSidePlayer.x = 0;
                    this.topRightSidePlayer.y = 0;
                    this.topRightSidePlayer.setVisible(false);
                }

            } else if (playerID == this.topLeftSide.playerID) {
                this.topLeftSide.life = gameState[playerID]['lives'];
                if (this.topLeftSide.life == 2) {
                    this.topLeftSidePlayer.setTexture("paddle2");
                } else if (this.topLeftSide.life == 1) {
                    this.topLeftSidePlayer.setTexture("paddle3");
                } else if (this.topLeftSide.life == 0) {
                    this.topLeftSidePlayer.x = 0;
                    this.topLeftSidePlayer.y = 0;
                    this.topLeftSidePlayer.setVisible(false);
                }

            } else if (playerID == this.midRightSide.playerID) {
                this.midRightSide.life = gameState[playerID]['lives'];
                if (this.midRightSide.life == 2) {
                    this.midRightSidePlayer.setTexture("paddle2");
                } else if (this.midRightSide.life == 1) {
                    this.midRightSidePlayer.setTexture("paddle3");
                } else if (this.midRightSide.life == 0) {
                    this.midRightSidePlayer.x = 0;
                    this.midRightSidePlayer.y = 0;
                    this.midRightSidePlayer.setVisible(false);
                }

            } else if (playerID == this.midLeftSide.playerID) {
                this.midLeftSide.life = gameState[playerID]['lives'];
                if (this.midLeftSide.life == 2) {
                    this.midLeftSidePlayer.setTexture("paddle2");
                } else if (this.midLeftSide.life == 1) {
                    this.midLeftSidePlayer.setTexture("paddle3");
                } else if (this.midLeftSide.life == 0) {
                    this.midLeftSidePlayer.x = 0;
                    this.midLeftSidePlayer.y = 0;
                    this.midLeftSidePlayer.setVisible(false);
                }

            } else if (playerID == this.bottomRightSide.playerID) {
                this.bottomRightSide.life = gameState[playerID]['lives'];
                if (this.bottomRightSide.life == 2) {
                    this.bottomRightSidePlayer.setTexture("paddle2");
                } else if (this.bottomRightSide.life == 1) {
                    this.bottomRightSidePlayer.setTexture("paddle3");
                } else if (this.bottomRightSide.life == 0) {
                    this.bottomRightSidePlayer.x = 0;
                    this.bottomRightSidePlayer.y = 0;
                    this.bottomRightSidePlayer.setVisible(false);
                }

            } else if (playerID == this.bottomLeftSide.playerID) {
                this.bottomLeftSide.life = gameState[playerID]['lives'];
                if (this.bottomLeftSide.life == 2) {
                    this.bottomLeftSidePlayer.setTexture("paddle2");
                } else if (this.bottomLeftSide.life == 1) {
                    this.bottomLeftSidePlayer.setTexture("paddle3");
                } else if (this.bottomLeftSide.life == 0) {
                    this.bottomLeftSidePlayer.x = 0;
                    this.bottomLeftSidePlayer.y = 0;
                    this.bottomLeftSidePlayer.setVisible(false);
                }

            } else if (playerID == this.bottomSide.playerID) {
                this.bottomSide.life = gameState[playerID]['lives'];
                if (this.bottomSide.life == 2) {
                    this.bottomSidePlayer.setTexture("paddle2");
                } else if (this.bottomSide.life == 1) {
                    this.bottomSidePlayer.setTexture("paddle3");
                } else if (this.bottomSide.life == 0) {
                    this.bottomSidePlayer.x = 0;
                    this.bottomSidePlayer.y = 0;
                    this.bottomSidePlayer.setVisible(false);
                }
            }
        }
        let results = this.checkWinConditions(gameState)
        if (!results) {
            this.resetRound();
            // Wait for 3 seconds (3000 milliseconds) before executing the code inside setTimeout
            setTimeout(() => {
                if (this.playerPosition === 'bottom_player') {
                    var [velocityX, velocityY] = getRandomDirectionVector(gameState);
                    this.ball.setVelocity(velocityX, velocityY);
                    ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
                }
            }, 3000);
        } else {

            this.ball.setVelocity(0, 0);
            ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);

            // Create a text object at the center of the screen
            let text = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'GOAL', { fontSize: '64px', fill: '#fff' });
            text.setOrigin(0.5, 0.5);  // Center align the text

            // Wait for 2 seconds (3000 milliseconds) before executing the code inside setTimeout
            setTimeout(() => {
                text.destroy();
                if (this.playerID == results) {
                    this.scene.start('Victory');
                    this.connection.send(JSON.stringify({ action: 'gameEnded', winner: this.playerID }));
                } else {
                    this.scene.start('Defeat');
                }
            }, 2000);
        }
    }

    resetRound() {
        this.ball.x = 400;
        this.ball.y = 300;
        this.ball.setVelocity(0, 0);
        ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);
        resetVelocityIncrease();
        
        // Create a "GOAL" text object slightly above the center of the screen
        let goalText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 70, 'GOAL', { fontSize: '64px', fill: '#fff' });
        goalText.setOrigin(0.5, 0.5);  // Center align the text

        // Create a countdown text object at the center of the screen
        let counter = 3;
        let countdownText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 70, counter.toString(), { fontSize: '64px', fill: '#fff' });
        countdownText.setOrigin(0.5, 0.5);  // Center align the text

        // Start a countdown from 3
        let timer = this.time.addEvent({
            delay: 1000,  // 1000ms = 1s
            callback: () => {
                counter--;
                countdownText.setText(counter.toString());  // Update the countdown text
                if (counter === 0) {
                    // When the countdown reaches 0, destroy the texts
                    goalText.destroy();
                    countdownText.destroy();
                    timer.destroy();
                }
            },
            loop: true  // Repeat the countdown every second
        });
    }
    
    checkWinConditions(gameState) { 
        let notDefeated = 0;
        let notDefeatedPlayerID = null;
        for (var playerID in gameState) {
            if (playerID == this.topSide.playerID) {
                if (this.topSide.life > 0) {
                    notDefeated += 1
                    notDefeatedPlayerID = playerID
                }

            } else if (this.topRightSide.playerID != null && playerID == this.topRightSide.playerID) {
                if (this.topRightSide.life > 0) {
                    notDefeated += 1
                    notDefeatedPlayerID = playerID
                }
            } else if (this.topLeftSide.playerID != null && playerID == this.topLeftSide.playerID) {
                if (this.topLeftSide.life > 0) {
                    notDefeated += 1
                    notDefeatedPlayerID = playerID
                }
            } else if (this.midRightSide.playerID != null && playerID == this.midRightSide.playerID) {
                if (this.midRightSide.life > 0) {
                    notDefeated += 1
                    notDefeatedPlayerID = playerID
                }
            } else if (this.midLeftSide.playerID != null && playerID == this.midLeftSide.playerID) {
                if (this.midLeftSide.life > 0) {
                    notDefeated += 1
                    notDefeatedPlayerID = playerID
                }
            } else if (this.bottomRightSide.playerID != null && playerID == this.bottomRightSide.playerID) {
                if (this.bottomRightSide.life > 0) {
                    notDefeated += 1
                    notDefeatedPlayerID = playerID
                }
            } else if (this.bottomLeftSide.playerID != null && playerID == this.bottomLeftSide.playerID) {
                if (this.bottomLeftSide.life > 0) {
                    notDefeated += 1
                    notDefeatedPlayerID = playerID
                }
            } else if (playerID == this.bottomSide.playerID) {
                if (this.bottomSide.life > 0) {
                    notDefeated += 1
                    notDefeatedPlayerID = playerID
                }
            }
        }

        if (notDefeated === 1) {
            return notDefeatedPlayerID;
        }
        return false;
    }

}

export default EightPlayer;

// scenes/eightPlayer.js
import { generateUniqueToken, toggleMute, playerScored, getRandomDirectionVector, resetVelocityIncrease, ballAngle, playerMoved, ballMoved } from '../library.js';

class FourPlayer extends Phaser.Scene {
    constructor() {
        super({ key: 'FourPlayer' });
        this.gameInitialised = false;
        this.cursors = null;
        this.soundEffect = null;
        this.player = null;
        this.ball = null;
        this.lifeCounter = null;
        this.processingCollision = false;

        this.leftEnd = 220;
        this.rightEnd = 580;
        this.topEnd = 120;
        this.bottomEnd = 480;

        this.paddleHeight = 535;
        this.paddleScaleX = 0.15;
        this.paddleScaleY = 0.2;

        this.playerID = generateUniqueToken(4);
        this.playerPosition = null;
        this.playerLife = null;

        this.rightSide = {
            playerID: null, 
            x: 627, 
            y: 300, 
            life: 0 
        };
        this.rightSidePlayer = null;
        this.leftSide = {
            playerID: null, 
            x: 173, 
            y: 300, 
            life: 0 
        };
        this.leftSidePlayer = null;
        this.topSide = {
            playerID: null, 
            x: 400, 
            y: 65, 
            life: 0 
        };
        this.bottomSide = {
            playerID: null, 
            x: 400, 
            y: 535, 
            life: 0 
        };
        this.bottomSidePlayer = null;

        this.topWall = null;
        this.bottomWall = null;
        this.leftWall = null;
        this.rightWall = null;

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
        if (this.playerLife > 0 ) {
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
        } else if (this.playerPosition === 'right_player') {
            this.player = this.matter.add.sprite(this.rightSide.x, this.rightSide.y, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
            this.player.setAngle(90);
            this.rightSide.playerID = this.playerID
            this.rightSide.life = 3
        } else if (this.playerPosition === 'left_player') {
            this.player = this.matter.add.sprite(this.leftSide.x, this.leftSide.y, "player");
            this.player.setScale(this.paddleScaleX, this.paddleScaleY);
            this.player.setStatic(true);
            this.player.setAngle(90);
            this.leftSide.playerID = this.playerID
            this.leftSide.life = 3
        }

        this.playerLife = 3;
        
        // Initializing game by setting values according to absolute map from server
        for (var playerID in gameState) {
            if (!gameState.hasOwnProperty('right_wall') && gameState[playerID].position === 'right_player' && this.playerID != playerID ) {
                this.rightSide.playerID = playerID;
                this.rightSidePlayer = this.matter.add.sprite(this.rightSide.x, this.rightSide.y, "paddle");
                this.rightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.rightSidePlayer.setAngle(90);
                this.rightSidePlayer.setStatic(true);
                this.rightSide.life = 3;
            } else if (!gameState.hasOwnProperty('left_wall') && gameState[playerID].position === 'left_player' && this.playerID != playerID ) {
                this.leftSide.playerID = playerID;
                this.leftSidePlayer = this.matter.add.sprite(this.leftSide.x, this.leftSide.y, "paddle");
                this.leftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.leftSidePlayer.setAngle(90);
                this.leftSidePlayer.setStatic(true);
                this.leftSide.life = 3;
            } else if ( gameState[playerID].position === 'top_player' && this.playerID != playerID ) {
                this.topSide.playerID = playerID; 
                this.topSidePlayer = this.matter.add.sprite(this.topSide.x, this.topSide.y, "paddle");
                this.topSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.topSidePlayer.setStatic(true);
                this.topSide.life = 3;
            } else if ( gameState[playerID].position === 'bottom_player' && this.playerID != playerID ) {
                this.bottomSide.playerID = playerID; 
                this.bottomSidePlayer = this.matter.add.sprite(this.bottomSide.x, this.bottomSide.y, "paddle");
                this.bottomSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
                this.bottomSidePlayer.setStatic(true);
                this.bottomSide.life = 3;
            }
        }


        this.matter.world.on("collisionactive", function (event, bodyA, bodyB) {
            // If a collision is already being processed, ignore this one
            if (this.processingCollision) {
                return;
            }

            

            this.soundEffect.play();
            if (this.playerPosition === 'bottom_player') {

                if (bodyA === this.ball.body && bodyB === this.topWall.body || bodyB === this.ball.body && bodyA === this.topWall.body) {

                    if (this.topSide.life > 0 ) {
                        // Set the flag to indicate a collision is being processed
                        this.processingCollision = true;
                        console.log("Collision detected up top")
                        console.log(this.topSide.life)
                        playerScored(this, this.topSide.playerID)
                        this.ball.setVelocity(0, 0);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);
                    } else {
                        var velocity = this.ball.body.velocity;
                        let [velocityX, velocityY] = ballAngle(velocity)
        
                        this.ball.setVelocity(velocityX, velocityY);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
                    }
                } else if (bodyA === this.ball.body && bodyB === this.leftWall.body || bodyB === this.ball.body && bodyA === this.leftWall.body) {
                    if (this.leftSide.life > 0 ) {
                        // Set the flag to indicate a collision is being processed
                        this.processingCollision = true;
                        console.log("Collision detected left")
                        playerScored(this, this.leftSide.playerID)
                        this.ball.setVelocity(0, 0);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);
                    } else {
                        var velocity = this.ball.body.velocity;
                        let [velocityX, velocityY] = ballAngle(velocity)
        
                        this.ball.setVelocity(velocityX, velocityY);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
                    }
                } else if (bodyA === this.ball.body && bodyB === this.rightWall.body || bodyB === this.ball.body && bodyA === this.rightWall.body) {
                    if (this.rightSide.life > 0 ) {
                        // Set the flag to indicate a collision is being processed
                        this.processingCollision = true;
                        console.log("Collision detected right")
                        playerScored(this, this.rightSide.playerID)
                        this.ball.setVelocity(0, 0);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);
                    } else {
                        var velocity = this.ball.body.velocity;
                        let [velocityX, velocityY] = ballAngle(velocity)
        
                        this.ball.setVelocity(velocityX, velocityY);
                        ballMoved(this, this.playerID, this.ball.x, this.ball.y, velocityX, velocityY);
                    }
                } else if (bodyA === this.ball.body && bodyB === this.bottomWall.body || bodyB === this.ball.body && bodyA === this.bottomWall.body) {

                    if (this.bottomSide.life > 0 ) {
                        // Set the flag to indicate a collision is being processed
                        this.processingCollision = true;
                        console.log("Collision detected bottom")
                        console.log(this.bottomSide.life)
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

    handleScoreUpdate(gameState) {
        for (var playerID in gameState) {

            if (playerID == this.playerID) {
                this.playerLife = gameState[playerID]['lives']
                if (this.playerID === this.topSide.playerID) {
                    this.topSide.life = gameState[playerID]['lives']
                } else if (this.playerID === this.rightSide.playerID) {
                    this.rightSide.life = gameState[playerID]['lives']
                } else if (this.playerID === this.leftSide.playerID) {
                    this.leftSide.life = gameState[playerID]['lives']
                } else if (this.playerID === this.bottomSide.playerID) {
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

            } else if (playerID == this.rightSide.playerID) {
                this.rightSide.life = gameState[playerID]['lives'];
                if (this.rightSide.life == 2) {
                    this.rightSidePlayer.setTexture("paddle2");
                } else if (this.rightSide.life == 1) {
                    this.rightSidePlayer.setTexture("paddle3");
                } else if (this.rightSide.life == 0) {
                    this.rightSidePlayer.x = 0;
                    this.rightSidePlayer.y = 0;
                    this.rightSidePlayer.setVisible(false);
                }

            } else if (playerID == this.leftSide.playerID) {
                this.leftSide.life = gameState[playerID]['lives'];
                if (this.leftSide.life == 2) {
                    this.leftSidePlayer.setTexture("paddle2");
                } else if (this.leftSide.life == 1) {
                    this.leftSidePlayer.setTexture("paddle3");
                } else if (this.leftSide.life == 0) {
                    this.leftSidePlayer.x = 0;
                    this.leftSidePlayer.y = 0;
                    this.leftSidePlayer.setVisible(false);
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
                if (this.topSide.life > 0 ) {
                    notDefeated += 1
                    notDefeatedPlayerID = playerID
                }

            } else if (this.rightSide.playerID != null && playerID == this.rightSide.playerID) {
                if (this.rightSide.life > 0 ) {
                    notDefeated += 1
                    notDefeatedPlayerID = playerID
                }
            } else if (this.leftSide.playerID != null && playerID == this.leftSide.playerID) {
                if (this.leftSide.life > 0 ) {
                    notDefeated += 1
                    notDefeatedPlayerID = playerID
                }
            } else if (playerID == this.bottomSide.playerID) {
                if (this.bottomSide.life > 0 ) {
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

export default FourPlayer;

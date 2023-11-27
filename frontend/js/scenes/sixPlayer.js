// scenes/sixPlayer.js
import { generateUniqueToken, toggleMute, playerScored, getRandomDirectionVector, resetVelocityIncrease, ballAngle, playerMoved, ballMoved } from '../library.js';


class SixPlayer extends Phaser.Scene {
  constructor() {
    super({ key: "SixPlayer" });
    this.gameInitialised = false;
    this.cursors = null;
    this.player = null;
    this.ball = null;
    this.soundEffect = null;
    this.lifeCounter = null;
    this.processingCollision = false;

    this.leftEnd = 305;
    this.rightEnd = 495;

    this.topRightTopEnd = (465, 95);
    this.topRightBottomEnd = (660, 250);

    this.bottomRightTopEnd = (660, 350);
    this.bottomRightBottomEnd = (547, 505);

    this.topLeftTopEnd = (335, 95);
    this.topLeftBottomEnd = (140, 250);

    this.bottomLeftTopEnd = (140, 350);
    this.bottomLeftBottomEnd = (253, 505);

    this.paddleHeight = 550;
    this.paddleScaleX = 0.13;
    this.paddleScaleY = 0.18;

    this.playerID = generateUniqueToken(4);
    this.playerPosition = null;
    this.playerLife = null;


    this.topSide = {
      playerID: null,
      x: 400,
      y: 50,
      life: 0,
    };
    this.topSidePlayer = null;

    this.bottomRightSide = {
      playerID: null,
      x: 620,
      y: 410,
      life: 0,
    };
    this.bottomRightSidePlayer = null;

    this.bottomLeftSide = {
      playerID: null,
      x: 180,
      y: 415,
      life: 0,
    };
    this.bottomLeftSidePlayer = null;

    this.bottomSide = {
      playerID: null,
      x: 400,
      y: 550,
      life: 0,
    };
    this.bottomSidePlayer = null;

    this.topRightSide = {
      playerID: null,
      x: 620,
      y: 185,
      life: 0,
    };
    this.topRightSidePlayer = null;

    this.topLeftSide = {
      playerID: null,
      x: 180,
      y: 185,
      life: 0,
    };
    this.topLeftSidePlayer = null;

    this.topWall = null;
    this.bottomWall = null;
    this.topRightWall = null;
    this.topLeftWall = null;
    this.bottomRightWall = null;
    this.bottomLeftWall = null;
    
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
    this.load.image("onelife", "js/assets/sprites/OneLife.png");
    this.load.image("twolife", "js/assets/sprites/TwoLives.png");
    this.load.image("threelife", "js/assets/sprites/ThreeLives.png");
    this.load.image("skull", "js/assets/sprites/skull.png");
    this.load.audio("ballCollision", "js/assets/ballCollide.mp3");
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
    this.connection.onopen = function (e) {
      console.log("[open] Connection established");
      // Send playerID to the server
      console.log(`CREATED PLAYER ID ${this.playerID}`);
      this.connection.send(JSON.stringify({ action: "playerIDSET", playerIDSet: this.playerID }));
    }.bind(this);

    this.connection.onmessage = (event) => {
      // console.log(`[message] Data received from server: ${event.data}`);
      console.log(`I am the ${this.playerPosition}`);
      var message = JSON.parse(event.data);

      // Check if the message is a playerMoved message
      if (message.action === "playerMoved") {
        this.player.x = message.x;
        this.player.y = message.y;
      } else if (message.action === "ballMoved") {
        this.ball.x = message.x;
        this.ball.y = message.y;
        this.ball.setVelocity(message.vx, message.vy);
      } else if (message.action === "gameState") {
        let gameState = JSON.parse(message.gameState);
        if (!this.gameInitialised) {
          this.gameInitialised = true;
          this.initGame(gameState);
        }
        this.handleGameState(gameState);
      } else if (message.action === "scoreUpdate") {
        let gameState = JSON.parse(message.gameState);
        this.handleScoreUpdate(gameState);
      }
    };

    this.soundEffect = this.sound.add("ballCollision");
    this.soundEffect.setVolume(0.2);

    this.muteButton = this.add.text(700, 40, '🔊', { fontSize: '50px' })
    .setInteractive({ useHandCursor: true })
    .on('pointerdown', function () {
      toggleMute(this.soundEffect, this.muteButton);  // Pass the muteButton reference
    }, this);

    this.connection.onclose = function (event) {
      console.log(`[close] Connection closed`);
      console.error('WebSocket is closed with code: ' + event.code);
      console.error('Reason: ' + event.reason);
    };

    this.connection.onerror = function (error) {
      console.log(`[error] ${error.message}`);
    };

    this.cursors = this.input.keyboard.createCursorKeys();
    this.lifeCounter = this.matter.add.sprite(0, 0, "threelife");
    this.lifeCounter.setScale(0.35, 0.35);

    //Create Map Borders
    this.topLeftWall = this.matter.add.sprite(155, 160, "wall", {
      restitution: 1,
    }); //Top Left Border
    this.topLeftWall.setScale(0.45, 0.1); // scales width by 45% and height by 10%
    this.topLeftWall.setAngle(-60); // Rotate Border
    this.topLeftWall.setStatic(true);

    this.bottomLeftWall = this.matter.add.sprite(155, 440, "wall", {
      restitution: 1,
    }); //Bottom Left Border
    this.bottomLeftWall.setScale(0.45, 0.1);
    this.bottomLeftWall.setAngle(-120);
    this.bottomLeftWall.setStatic(true);

    this.bottomRightWall = this.matter.add.sprite(645, 435, "wall", {
      restitution: 1,
    }); //Bottom Right Border
    this.bottomRightWall.setScale(0.45, 0.1);
    this.bottomRightWall.setAngle(120);
    this.bottomRightWall.setStatic(true);

    this.topRightWall = this.matter.add.sprite(645, 160, "wall", {
      restitution: 1,
    }); //Top Right Border
    this.topRightWall.setScale(0.45, 0.1);
    this.topRightWall.setAngle(60);
    this.topRightWall.setStatic(true);

    this.topWall = this.matter.add.sprite(400, 20, "wall", { restitution: 1 }); //Top Border
    this.topWall.setScale(0.45, 0.1);
    this.topWall.setStatic(true);

    this.bottomWall = this.matter.add.sprite(400, 580, "wall", {
      restitution: 1,
    }); //Bottom Border
    this.bottomWall.setScale(0.45, 0.1);
    this.bottomWall.setStatic(true);
  }

  update() {
    if (this.playerLife > 0) {
      //if current player is top or bottom, they can only move left and right
      if (
        this.playerPosition === "top_player" ||
        this.playerPosition === "bottom_player"
      ) {
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
        //if current player is top left, move diagonally
      } else if (this.playerPosition === "top_left_player") {
        if (this.cursors.up.isDown || this.cursors.right.isDown)  {
          if (this.player.y > this.topLeftTopEnd) {
            let positionDelta = 5;
            this.player.x += positionDelta * Math.cos(Math.PI / 3);
            this.player.y -= positionDelta * Math.sin(Math.PI / 3);
            playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
          }
        } else if (this.cursors.down.isDown || this.cursors.left.isDown) {
          if (this.player.y < this.topLeftBottomEnd) {
            let positionDelta = 5;
            this.player.x -= positionDelta * Math.cos(Math.PI / 3);
            this.player.y += positionDelta * Math.sin(Math.PI / 3);
            playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
          }
        }
        //if current player is bottom left, move diagonally
      } else if (this.playerPosition === "bottom_left_player") {
        if (this.cursors.up.isDown || this.cursors.left.isDown) {
          if (this.player.y > this.bottomLeftTopEnd) {
            let positionDelta = 5;
            this.player.x -= positionDelta * Math.cos(Math.PI / 3);
            this.player.y -= positionDelta * Math.sin(Math.PI / 3);
            playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
          }
        } else if (this.cursors.down.isDown || this.cursors.right.isDown) {
          if (this.player.y < this.bottomLeftBottomEnd) {
            let positionDelta = 5;
            this.player.x += positionDelta * Math.cos(Math.PI / 3);
            this.player.y += positionDelta * Math.sin(Math.PI / 3);
            playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
          }
        }
        //if current player is top right, move diagonally
      } else if (this.playerPosition === "top_right_player") {
        if (this.cursors.up.isDown || this.cursors.left.isDown) {
          if (this.player.y > this.topLeftTopEnd) {
            let positionDelta = 5;
            this.player.x -= positionDelta * Math.cos(Math.PI / 3);
            this.player.y -= positionDelta * Math.sin(Math.PI / 3);
            playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
          }
        } else if (this.cursors.down.isDown || this.cursors.right.isDown) {
          if (this.player.y < this.topLeftBottomEnd) {
            let positionDelta = 5;
            this.player.x += positionDelta * Math.cos(Math.PI / 3);
            this.player.y += positionDelta * Math.sin(Math.PI / 3);
            playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
          }
        }
        //if current player is bottom right, move diagonally
      } else if (this.playerPosition === "bottom_right_player") {
        if (this.cursors.up.isDown || this.cursors.right.isDown) {
          if (this.player.y > this.bottomRightTopEnd) {
            let positionDelta = 5;
            this.player.x += positionDelta * Math.cos(Math.PI / 3);
            this.player.y -= positionDelta * Math.sin(Math.PI / 3);
            playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
          }
        } else if (this.cursors.down.isDown || this.cursors.left.isDown) {
          if (this.player.y < this.bottomRightBottomEnd) {
            let positionDelta = 5;
            this.player.x -= positionDelta * Math.cos(Math.PI / 3);
            this.player.y += positionDelta * Math.sin(Math.PI / 3);
            playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
          }
        }
      }
    }
  }

  initGame(gameState) {
    // this.playerPosition = gameState[this.playerID]['position'];
    if (gameState && this.playerID in gameState) {
      this.playerPosition = gameState[this.playerID]["position"];
    } else {
      console.error("Player ID not found in game state:", this.playerID);
    }

    this.connection.send(JSON.stringify({ action: 'playerTokenSET', playerID: this.playerID, token: this.token }));

    // init ball (move this down probably)
    this.ball = this.matter.add.image(400, 400, "ball", { restitution: 1 });
    this.ball.setScale(0.25);
    this.ball.setCircle(13);
    this.ball.setFriction(0, 0, 0);
    this.ball.setVelocity(0, 2);
    this.ball.setBounce(1);
    this.ball.setFixedRotation();

    // Create the six players, for each respective paddle
    // BOTTOM PLAYER
    if (this.playerPosition === "bottom_player") {
      this.player = this.matter.add.sprite(400, this.paddleHeight, "player");
      this.player.setScale(this.paddleScaleX, this.paddleScaleY);
      this.player.setStatic(true);
      this.bottomSide.playerID = this.playerID;
      this.bottomSide.life = 3;
    }
    //TOP PLAYER
    else if (this.playerPosition === "top_player") {
      this.player = this.matter.add.sprite(
        this.topSide.x,
        this.topSide.y,
        "player"
      );
      this.player.setScale(this.paddleScaleX, this.paddleScaleY);
      this.player.setStatic(true);
      this.topSide.playerID = this.playerID;
      this.topSide.life = 3;
    }
    // TOP RIGHT PLAYER
    else if (this.playerPosition === "top_right_player") {
      this.player = this.matter.add.sprite(
        this.topRightSide.x,
        this.topRightSide.y,
        "player"
      );
      this.player.setScale(this.paddleScaleX, this.paddleScaleY);
      this.player.setStatic(true);
      this.player.setAngle(60);
      this.topRightSide.playerID = this.playerID;
      this.topRightSide.life = 3;
    }
    // TOP LEFT PLAYER
    else if (this.playerPosition === "top_left_player") {
      this.player = this.matter.add.sprite(
        this.topLeftSide.x,
        this.topLeftSide.y,
        "player"
      );
      this.player.setScale(this.paddleScaleX, this.paddleScaleY);
      this.player.setStatic(true);
      this.player.setAngle(-60);
      this.topLeftSide.playerID = this.playerID;
      this.topLeftSide.life = 3;
    }
    // BOTTOM LEFT PLAYER
    else if (this.playerPosition === "bottom_left_player") {
      this.player = this.matter.add.sprite(
        this.bottomLeftSide.x,
        this.bottomLeftSide.y,
        "player"
      );
      this.player.setScale(this.paddleScaleX, this.paddleScaleY);
      this.player.setStatic(true);
      this.player.setAngle(-120);
      this.bottomLeftSide.playerID = this.playerID;
      this.bottomLeftSide.life = 3;
    }
    // BOTTOM RIGHT PLAYER
    else if (this.playerPosition === "bottom_right_player") {
      this.player = this.matter.add.sprite(
        this.bottomRightSide.x,
        this.bottomRightSide.y,
        "player"
      );
      this.player.setScale(this.paddleScaleX, this.paddleScaleY);
      this.player.setStatic(true);
      this.player.setAngle(120);
      this.bottomRightSide.playerID = this.playerID;
      this.bottomRightSide.life = 3;
    }

    this.playerLife = 3;

    // Initializing game by setting values according to absolute map from server
    for (var playerID in gameState) {
      if (
        !gameState.hasOwnProperty("bottom_left_wall") &&
        gameState[playerID].position === "bottom_left_player" &&
        this.playerID != playerID
      ) {
        // BOTTOM LEFT SIDE
        this.bottomLeftSide.playerID = playerID; // This will set the playerID where position is 'bottom_left_player'
        this.bottomLeftSidePlayer = this.matter.add.sprite(
          this.bottomLeftSide.x,
          this.bottomLeftSide.y,
          "paddle"
        );
        this.bottomLeftSidePlayer.setScale(
          this.paddleScaleX,
          this.paddleScaleY
        );
        this.bottomLeftSidePlayer.setAngle(-120);
        this.bottomLeftSidePlayer.setStatic(true);
        this.bottomLeftSide.life = 3;
      }
      // TOP SIDE
      else if (
        gameState[playerID].position === "top_player" &&
        this.playerID != playerID
      ) {
        this.topSide.playerID = playerID; // This will set the playerID where position is 'top_player'
        this.topSidePlayer = this.matter.add.sprite(
          this.topSide.x,
          this.topSide.y,
          "paddle"
        );
        this.topSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
        this.topSidePlayer.setStatic(true);
        this.topSide.life = 3;
      }
      // TOP RIGHT PLAYER
      else if (
        gameState[playerID].position === "top_right_player" &&
        this.playerID != playerID
      ) {
        this.topRightSide.playerID = playerID; // This will set the playerID where position is 'top_right_player'
        this.topRightSidePlayer = this.matter.add.sprite(
          this.topRightSide.x,
          this.topRightSide.y,
          "paddle"
        );
        this.topRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
        this.topRightSidePlayer.setAngle(60);
        this.topRightSidePlayer.setStatic(true);
        this.topRightSide.life = 3;
      }
      // TOP LEFT SIDE
      else if (
        gameState[playerID].position === "top_left_player" &&
        this.playerID != playerID
      ) {
        this.topLeftSide.playerID = playerID; // This will set the playerID where position is 'top_left_player'
        this.topLeftSidePlayer = this.matter.add.sprite(
          this.topLeftSide.x,
          this.topLeftSide.y,
          "paddle"
        );
        this.topLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
        this.topLeftSidePlayer.setAngle(-60);
        this.topLeftSidePlayer.setStatic(true);
        this.topLeftSide.life = 3;
      }
      // BOTTOM RIGHT SIDE
      else if (
        gameState[playerID].position === "bottom_right_player" &&
        this.playerID != playerID
      ) {
        this.bottomRightSide.playerID = playerID; // This will set the playerID where position is 'top_right_player'
        this.bottomRightSidePlayer = this.matter.add.sprite(
          this.bottomRightSide.x,
          this.bottomRightSide.y,
          "paddle"
        );
        this.bottomRightSidePlayer.setScale(
          this.paddleScaleX,
          this.paddleScaleY
        );
        this.bottomRightSidePlayer.setAngle(120);
        this.bottomRightSidePlayer.setStatic(true);
        this.bottomRightSide.life = 3;
      }
      // BOTTOM SIDE
      else if (
        gameState[playerID].position === "bottom_player" &&
        this.playerID != playerID
      ) {
        this.bottomSide.playerID = playerID; // This will set the playerID where position is 'top_player'
        this.bottomSidePlayer = this.matter.add.sprite(
          this.bottomSide.x,
          this.bottomSide.y,
          "paddle"
        );
        this.bottomSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
        this.bottomSidePlayer.setStatic(true);
        this.bottomSide.life = 3;
      }
    }

    this.matter.world.on( "collisionactive", function (event, bodyA, bodyB) {

        // If a collision is already being processed, ignore this one
        if (this.processingCollision) {
          return;
        }

        this.soundEffect.play();
        if (this.playerPosition === "bottom_player") {
          // CHECKING COLLISIONS FOR EACH SIDE
          // TOP SIDE COLLISION
          if (
            (bodyA === this.ball.body && bodyB === this.topWall.body) ||
            (bodyB === this.ball.body && bodyA === this.topWall.body)
          ) {
            console.log("Collision detected up top");
            console.log(this.topSide.life);
            if (this.topSide.life > 0) {
              // Set the flag to indicate a collision is being processed
              this.processingCollision = true;
              playerScored(this, this.topSide.playerID);
              this.ball.setVelocity(0, 0);
              ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);
            } else {
              var velocity = this.ball.body.velocity;
              let [velocityX, velocityY] = ballAngle(velocity);

              this.ball.setVelocity(velocityX, velocityY);
              ballMoved(
                this,
                this.playerID,
                this.ball.x,
                this.ball.y,
                velocityX,
                velocityY
              );
            }
          }
        
        // TOP LEFT SIDE COLLISION
        else if (
          (bodyA === this.ball.body && bodyB === this.topLeftWall.body) ||
          (bodyB === this.ball.body && bodyA === this.topLeftWall.body)
        ) {
          console.log("Collision detected on the top left wall");
          console.log(this.topLeftSide.life);
          if (this.topLeftSide.life > 0) {
            // Set the flag to indicate a collision is being processed
            this.processingCollision = true;
            playerScored(this, this.topLeftSide.playerID);
            this.ball.setVelocity(0, 0);
            ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);
          } else {
            var velocity = this.ball.body.velocity;
            let [velocityX, velocityY] = ballAngle(velocity);

            this.ball.setVelocity(velocityX, velocityY);
            ballMoved(
              this,
              this.playerID,
              this.ball.x,
              this.ball.y,
              velocityX,
              velocityY
            );
          }
        }
        // TOP RIGHT SIDE COLLISION
        else if (
          (bodyA === this.ball.body && bodyB === this.topRightWall.body) ||
          (bodyB === this.ball.body && bodyA === this.topRightWall.body)
        ) {
          console.log("Collision detected on the top right wall");
          console.log(this.topRightSide.life);
          if (this.topRightSide.life > 0) {
            // Set the flag to indicate a collision is being processed
            this.processingCollision = true;
            playerScored(this, this.topRightSide.playerID);
            this.ball.setVelocity(0, 0);
            ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);
          } else {
            var velocity = this.ball.body.velocity;
            let [velocityX, velocityY] = ballAngle(velocity);

            this.ball.setVelocity(velocityX, velocityY);
            ballMoved(
              this,
              this.playerID,
              this.ball.x,
              this.ball.y,
              velocityX,
              velocityY
            );
          }
        }
        // BOTTOM LEFT SIDE COLLISION
        else if (
          (bodyA === this.ball.body && bodyB === this.bottomLeftWall.body) ||
          (bodyB === this.ball.body && bodyA === this.bottomLeftWall.body)
        ) {
          console.log("Collision detected at the bottom left wall");
          console.log(this.bottomLeftSide.life);
          if (this.bottomLeftSide.life > 0) {
            // Set the flag to indicate a collision is being processed
            this.processingCollision = true;
            playerScored(this, this.bottomLeftSide.playerID);
            this.ball.setVelocity(0, 0);
            ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);
          } else {
            var velocity = this.ball.body.velocity;
            let [velocityX, velocityY] = ballAngle(velocity);

            this.ball.setVelocity(velocityX, velocityY);
            ballMoved(
              this,
              this.playerID,
              this.ball.x,
              this.ball.y,
              velocityX,
              velocityY
            );
          }
        }
        // BOTTOM RIGHT SIDE COLLISION
        else if (
          (bodyA === this.ball.body && bodyB === this.bottomRightWall.body) ||
          (bodyB === this.ball.body && bodyA === this.bottomRightWall.body)
        ) {
          console.log("Collision detected at the bottom right wall");
          console.log(this.bottomRightSide.life);
          if (this.bottomRightSide.life > 0) {
            // Set the flag to indicate a collision is being processed
            this.processingCollision = true;
            playerScored(this, this.bottomRightSide.playerID);
            this.ball.setVelocity(0, 0);
            ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);
          } else {
            var velocity = this.ball.body.velocity;
            let [velocityX, velocityY] = ballAngle(velocity);

            this.ball.setVelocity(velocityX, velocityY);
            ballMoved(
              this,
              this.playerID,
              this.ball.x,
              this.ball.y,
              velocityX,
              velocityY
            );
          }
        }
        // BOTTOM COLLISION
        else if (
          (bodyA === this.ball.body && bodyB === this.bottomWall.body) ||
          (bodyB === this.ball.body && bodyA === this.bottomWall.body)
        ) {
          console.log("Collision detected at the bottom");
          console.log(this.bottomSide.life);
          if (this.bottomSide.life > 0) {
            // Set the flag to indicate a collision is being processed
            this.processingCollision = true;
            playerScored(this, this.bottomSide.playerID);
            this.ball.setVelocity(0, 0);
            ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);
          } else {
            var velocity = this.ball.body.velocity;
            let [velocityX, velocityY] = ballAngle(velocity);

            this.ball.setVelocity(velocityX, velocityY);
            ballMoved(
              this,
              this.playerID,
              this.ball.x,
              this.ball.y,
              velocityX,
              velocityY
            );
          }
        } else if (bodyA === this.ball.body || bodyB === this.ball.body) {
          // Get the current velocity of the ball
          var velocity = this.ball.body.velocity;
          let [velocityX, velocityY] = ballAngle(velocity);

          this.ball.setVelocity(velocityX, velocityY);
          ballMoved(
            this,
            this.playerID,
            this.ball.x,
            this.ball.y,
            velocityX,
            velocityY
          );
        }
      }
        // Reset the flag after a delay to allow for the next collision
        this.time.delayedCall(100, function() {
          this.processingCollision = false;
        }, [], this);
      }.bind(this)
    );
  }

  handleGameState(gameState) {
    this.playerPosition = gameState[this.playerID]["position"];

    for (var playerID in gameState) {
      if (playerID == this.playerID) {
      } else if (playerID == this.topSide.playerID) {
        this.topSidePlayer.x = gameState[playerID]["x"];
        this.topSidePlayer.y = gameState[playerID]["y"];
      } else if (playerID == this.topRightSide.playerID) {
        this.topRightSidePlayer.x = gameState[playerID]["x"];
        this.topRightSidePlayer.y = gameState[playerID]["y"];
      } else if (playerID == this.topLeftSide.playerID) {
        this.topLeftSidePlayer.x = gameState[playerID]["x"];
        this.topLeftSidePlayer.y = gameState[playerID]["y"];
      } else if (playerID == this.bottomRightSide.playerID) {
        this.bottomRightSidePlayer.x = gameState[playerID]["x"];
        this.bottomRightSidePlayer.y = gameState[playerID]["y"];
      } else if (playerID == this.bottomLeftSide.playerID) {
        this.bottomLeftSidePlayer.x = gameState[playerID]["x"];
        this.bottomLeftSidePlayer.y = gameState[playerID]["y"];
      } else if (playerID == this.bottomSide.playerID) {
        this.bottomSidePlayer.x = gameState[playerID]["x"];
        this.bottomSidePlayer.y = gameState[playerID]["y"];
      }
    }
  }

  handleScoreUpdate(gameState) {
    for (var playerID in gameState) {
      if (playerID == this.playerID) {
        this.playerLife = gameState[playerID]["lives"];
        if (this.playerID === this.topSide.playerID) {
          this.topSide.life = gameState[playerID]["lives"];
        } else if (this.playerID === this.topRightSide.playerID) {
          this.topRightSide.life = gameState[playerID]["lives"];
        } else if (this.playerID === this.topLeftSide.playerID) {
          this.topLeftSide.life = gameState[playerID]["lives"];
        } else if (this.playerID === this.bottomRightSide.playerID) {
          this.bottomRightSide.life = gameState[playerID]["lives"];
        } else if (this.playerID === this.bottomLeftSide.playerID) {
          this.bottomLeftSide.life = gameState[playerID]["lives"];
        } else if (this.playerID === this.bottomSide.playerID) {
          this.bottomSide.life = gameState[playerID]["lives"];
        }
        if (this.playerLife == 2) {
          this.player.setTexture("player2");
          this.lifeCounter.setTexture("twolife");
        } else if (this.playerLife == 1) {
          this.player.setTexture("player3");
          this.lifeCounter.setTexture("onelife");
        } else if (this.playerLife == 0) {
          this.player.x = 0;
          this.player.y = 0;
          this.player.setVisible(false);
          this.lifeCounter.setTexture("skull");
        }
      }
      // TOP SIDE
      else if (playerID == this.topSide.playerID) {
        this.topSide.life = gameState[playerID]["lives"];
        if (this.topSide.life == 2) {
          this.topSidePlayer.setTexture("paddle2");
        } else if (this.topSide.life == 1) {
          this.topSidePlayer.setTexture("paddle3");
        } else if (this.topSide.life == 0) {
          this.topSidePlayer.x = 0;
          this.topSidePlayer.y = 0;
          this.topSidePlayer.setVisible(false);
        }
      }
      // TOP RIGHT SIDE
      else if (playerID == this.topRightSide.playerID) {
        this.topRightSide.life = gameState[playerID]["lives"];
        if (this.topRightSide.life == 2) {
          this.topRightSidePlayer.setTexture("paddle2");
        } else if (this.topRightSide.life == 1) {
          this.topRightSidePlayer.setTexture("paddle3");
        } else if (this.topRightSide.life == 0) {
          this.topRightSidePlayer.x = 0;
          this.topRightSidePlayer.y = 0;
          this.topRightSidePlayer.setVisible(false);
        }
      }
      // TOP LEFT SIDE
      else if (playerID == this.topLeftSide.playerID) {
        this.topLeftSide.life = gameState[playerID]["lives"];
        if (this.topLeftSide.life == 2) {
          this.topLeftSidePlayer.setTexture("paddle2");
        } else if (this.topLeftSide.life == 1) {
          this.topLeftSidePlayer.setTexture("paddle3");
        } else if (this.topLeftSide.life == 0) {
          this.topLeftSidePlayer.x = 0;
          this.topLeftSidePlayer.y = 0;
          this.topLeftSidePlayer.setVisible(false);
        }
      }
      // BOTTOM RIGHT SIDE
      else if (playerID == this.bottomRightSide.playerID) {
        this.bottomRightSide.life = gameState[playerID]["lives"];
        if (this.bottomRightSide.life == 2) {
          this.bottomRightSidePlayer.setTexture("paddle2");
        } else if (this.bottomRightSide.life == 1) {
          this.bottomRightSidePlayer.setTexture("paddle3");
        } else if (this.bottomRightSide.life == 0) {
          this.bottomRightSidePlayer.x = 0;
          this.bottomRightSidePlayer.y = 0;
          this.bottomRightSidePlayer.setVisible(false);
        }
      }
      // BOTTOM LEFT SIDE
      else if (playerID == this.bottomLeftSide.playerID) {
        this.bottomLeftSide.life = gameState[playerID]["lives"];
        if (this.bottomLeftSide.life == 2) {
          this.bottomLeftSidePlayer.setTexture("paddle2");
        } else if (this.bottomLeftSide.life == 1) {
          this.bottomLeftSidePlayer.setTexture("paddle3");
        } else if (this.bottomLeftSide.life == 0) {
          this.bottomLeftSidePlayer.x = 0;
          this.bottomLeftSidePlayer.y = 0;
          this.bottomLeftSidePlayer.setVisible(false);
        }
      }
      // BOTTOM SIDE
      else if (playerID == this.bottomSide.playerID) {
        this.bottomSide.life = gameState[playerID]["lives"];
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
    let results = this.checkWinConditions(gameState);
    if (!results) {
      this.resetRound();
      // Wait for 3 seconds (3000 milliseconds) before executing the code inside setTimeout
      setTimeout(() => {
        if (this.playerPosition === "bottom_player") {
          var [velocityX, velocityY] = getRandomDirectionVector(gameState);
          this.ball.setVelocity(velocityX, velocityY);
          ballMoved(
            this,
            this.playerID,
            this.ball.x,
            this.ball.y,
            velocityX,
            velocityY
          );
        }
      }, 3000);
    } else {
      this.ball.setVelocity(0, 0);
      ballMoved(this, this.playerID, this.ball.x, this.ball.y, 0, 0);

      // Create a text object at the center of the screen
      let text = this.add.text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        "GOAL",
        { fontSize: "64px", fill: "#fff" }
      );
      text.setOrigin(0.5, 0.5); // Center align the text

      // Wait for 2 seconds (3000 milliseconds) before executing the code inside setTimeout
      setTimeout(() => {
        text.destroy();
        if (this.playerID == results) {
          this.scene.start("Victory");
          this.connection.send(JSON.stringify({ action: 'gameEnded', winner: this.playerID }));
        } else {
          this.scene.start("Defeat");
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
    let goalText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 70,
      "GOAL",
      { fontSize: "64px", fill: "#fff" }
    );
    goalText.setOrigin(0.5, 0.5); // Center align the text

    // Create a countdown text object at the center of the screen
    let counter = 3;
    let countdownText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY + 70,
      counter.toString(),
      { fontSize: "64px", fill: "#fff" }
    );
    countdownText.setOrigin(0.5, 0.5); // Center align the text

    // Start a countdown from 3
    let timer = this.time.addEvent({
      delay: 1000, // 1000ms = 1s
      callback: () => {
        counter--;
        countdownText.setText(counter.toString()); // Update the countdown text
        if (counter === 0) {
          // When the countdown reaches 0, destroy the texts
          goalText.destroy();
          countdownText.destroy();
          timer.destroy();
        }
      },
      loop: true, // Repeat the countdown every second
    });
  }

  checkWinConditions(gameState) {
    let notDefeated = 0;
    let notDefeatedPlayerID = null;
    for (var playerID in gameState) {
      if (playerID == this.topSide.playerID) {
        if (this.topSide.life > 0) {
          notDefeated += 1;
          notDefeatedPlayerID = playerID;
        }
      } else if (
        this.topRightSide.playerID != null &&
        playerID == this.topRightSide.playerID
      ) {
        if (this.topRightSide.life > 0) {
          notDefeated += 1;
          notDefeatedPlayerID = playerID;
        }
      } else if (
        this.topLeftSide.playerID != null &&
        playerID == this.topLeftSide.playerID
      ) {
        if (this.topLeftSide.life > 0) {
          notDefeated += 1;
          notDefeatedPlayerID = playerID;
        }
      } else if (
        this.bottomRightSide.playerID != null &&
        playerID == this.bottomRightSide.playerID
      ) {
        if (this.bottomRightSide.life > 0) {
          notDefeated += 1;
          notDefeatedPlayerID = playerID;
        }
      } else if (
        this.bottomLeftSide.playerID != null &&
        playerID == this.bottomLeftSide.playerID
      ) {
        if (this.bottomLeftSide.life > 0) {
          notDefeated += 1;
          notDefeatedPlayerID = playerID;
        }
      } else if (playerID == this.bottomSide.playerID) {
        if (this.bottomSide.life > 0) {
          notDefeated += 1;
          notDefeatedPlayerID = playerID;
        }
      }
    }

    if (notDefeated === 1) {
      return notDefeatedPlayerID;
    }
    return false;
  }
}

export default SixPlayer;

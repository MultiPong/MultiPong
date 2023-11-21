// scenes/sixPlayer.js
import { generateUniqueToken, ballCollisionNoise, resetVelocityIncrease, ballAngle, playerMoved, ballMoved } from '../library.js';


class SixPlayer extends Phaser.Scene {
  constructor() {
    super({ key: "SixPlayer" });
    this.gameInitialised = false;
    this.cursors = null;
    this.player = null;
    this.ball = null;
    this.leftEnd = 305;
    this.rightEnd = 495;

    this.topRightTopEnd = (465, 95);
    this.topRightBottomEnd = (660, 175);

    this.bottomRightTopEnd = (660, 425);
    this.bottomRightBottomEnd = (547, 505);

    this.topLeftTopEnd = (335, 95);
    this.topLeftBottomEnd = (140, 184);

    this.bottomLeftTopEnd = (140, 425);
    this.bottomLeftBottomEnd = (253, 505);

    this.paddleHeight = 550;
    this.paddleScaleX = 0.13;
    this.paddleScaleY = 0.18;
    this.playerID = generateUniqueToken(4);
    this.playerPosition = null;

    this.topSide = {
      playerID: null,
      x: 400,
      y: 50,
      life: null,
    };
    this.topSidePlayer = null;

    this.bottomRightSide = {
      playerID: null,
      x: 620,
      y: 410,
      life: null,
    };
    this.bottomRightSidePlayer = null;

    this.bottomLeftSide = {
      playerID: null,
      x: 180,
      y: 415,
      life: null,
    };
    this.bottomLeftSidePlayer = null;

    this.bottomSide = {
      playerID: null,
      x: 400,
      y: 550,
      life: null,
    };
    this.bottomSidePlayer = null;

    this.topRightSide = {
      playerID: null,
      x: 620,
      y: 185,
      life: null,
    };
    this.topRightSidePlayer = null;

    this.topLeftSide = {
      playerID: null,
      x: 180,
      y: 185,
      life: null,
    };
    this.topLeftSidePlayer = null;
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
    this.topLeftWall = this.matter.add.sprite(155, 160, "wall", { restitution: 1 }); //Top Left Border
    this.topLeftWall.setScale(0.45, 0.1); // scales width by 45% and height by 10%
    this.topLeftWall.setAngle(-60); // Rotate Border
    this.topLeftWall.setStatic(true);

    this.bottomLeftWall = this.matter.add.sprite(155, 440, "wall", { restitution: 1 }); //Bottom Left Border
    this.bottomLeftWall.setScale(0.45, 0.1);
    this.bottomLeftWall.setAngle(-120);
    this.bottomLeftWall.setStatic(true);

    this.bottomRightWall = this.matter.add.sprite(645, 435, "wall", { restitution: 1 }); //Bottom Right Border
    this.bottomRightWall.setScale(0.45, 0.1);
    this.bottomRightWall.setAngle(120);
    this.bottomRightWall.setStatic(true);

    this.topRightWall = this.matter.add.sprite(645, 160, "wall", { restitution: 1 }); //Top Right Border
    this.topRightWall.setScale(0.45, 0.1);
    this.topRightWall.setAngle(60);
    this.topRightWall.setStatic(true);

    this.topWall = this.matter.add.sprite(400, 20, "wall", { restitution: 1 }); //Top Border
    this.topWall.setScale(0.45, 0.1);
    this.topWall.setStatic(true);

    this.bottomWall = this.matter.add.sprite(400, 580, "wall", { restitution: 1 }); //Bottom Border
    this.bottomWall.setScale(0.45, 0.1);
    this.bottomWall.setStatic(true);
  }

  handleGameState(gameState) {
    this.playerPosition = gameState[this.playerID]['position'];

    for (var playerID in gameState) {
    
        if (playerID == this.topSide.playerID) {
            let positionDelta = gameState[playerID]['x'] - 400;
            this.topSidePlayer.x = 400 - positionDelta;
        } 
        
        else if (playerID == this.topRightSide.playerID) {
            let positionDelta = 5;
            this.topRightSidePlayer.x = 620 - (positionDelta * Math.cos(Math.PI/3)); 
            this.topRightSidePlayer.y = 185 - (positionDelta * Math.sin(Math.PI/3));
        } 
        
        else if (playerID == this.topLeftSide.playerID) {
            let positionDelta = gameState[playerID]['x'] - 400;
            this.topLeftSidePlayer.x = 180 - (positionDelta * Math.cos(Math.PI/3)); 
            this.topLeftSidePlayer.y = 185 + (positionDelta * Math.sin(Math.PI/3));
        } 
        
        else if (playerID == this.bottomLeftSide.playerID) {
            let positionDelta = gameState[playerID]['x'] - 400;
            this.bottomLeftSidePlayer.x = 180 + (positionDelta * Math.cos(Math.PI/3)); 
            this.bottomLeftSidePlayer.y = 415 + (positionDelta * Math.sin(Math.PI/3)); 
        }
        
        else if (playerID == this.bottomRightSide.playerID) {
            let positionDelta = gameState[playerID]['x'] - 400;
            this.bottomRightSidePlayer.x = 620 + (positionDelta * Math.cos(Math.PI/3)); 
            this.bottomRightSidePlayer.y = 410 - (positionDelta * Math.sin(Math.PI/3)); 
        }
    }
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
    } else if (this.playerPosition === 'top_left_player') {
      if (this.cursors.up.isDown) {
        if (this.player.y > this.topLeftTopEnd) {
          this.player.y -= 3.5; // move paddle up via y coordinate
          this.player.x += 3.5; // move paddle right via x coordinate
          playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
        }
      } else if (this.cursors.down.isDown) {
        if (this.player.y < this.topLeftBottomEnd) {
          this.player.y += 3.5; // move paddle down via y coordinate
          this.player.x -= 3.5; // move paddle left via x coordinate
          playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
        }
      }
    } else if (this.playerPosition === 'bottom_left_player') {
        if (this.cursors.up.isDown) {
          if (this.player.y > this.bottomLeftTopEnd) {
            this.player.y -= 3.5; // move paddle up via y coordinate
            this.player.x -= 3.5; // move paddle left via x coordinate
            playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
          }
        } else if (this.cursors.down.isDown) {
          if (this.player.y < this.bottomLeftBottomEnd) {
            this.player.y += 3.5; // move paddle down via y coordinate
            this.player.x += 3.5; // move paddle right via x coordinate
            playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
          }
        }
    } else if (this.playerPosition === 'top_right_player') {
        if (this.cursors.up.isDown) {
          if (this.player.y > this.topLeftTopEnd) {
            this.player.y -= 3.5; // move paddle up via y coordinate
            this.player.x -= 3.5; // move paddle left via x coordinate
            playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
          }
        } else if (this.cursors.down.isDown) {
          if (this.player.y < this.topLeftBottomEnd) {
            this.player.y += 3.5; // move paddle down via y coordinate
            this.player.x += 3.5; // move paddle right via x coordinate
            playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
          }
        }
    } else if (this.playerPosition === 'bottom_right_player') {
        if (this.cursors.up.isDown) {
          if (this.player.y > this.bottomRightTopEnd) {
            this.player.y -= 3.5; // move paddle up via y coordinate
            this.player.x += 3.5; // move paddle right via x coordinate
            playerMoved(this, this.playerID, this.player.x, this.player.y); // Send the new position to the backend
          }
        } else if (this.cursors.down.isDown) {
          if (this.player.y < this.bottomRightBottomEnd) {
            this.player.y += 3.5; // move paddle down via y coordinate
            this.player.x -= 3.5; // move paddle left via x coordinate
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
    this.ball.setFixedRotation();

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
      this.player.setAngle(60);
    } else if (this.playerPosition === 'top_left_player') {
      this.player = this.matter.add.sprite(this.topLeftSide.x, this.topLeftSide.y, "player");
      this.player.setScale(this.paddleScaleX, this.paddleScaleY);
      this.player.setStatic(true);
      this.player.setAngle(-60);
    } else if (this.playerPosition === 'bottom_left_player') {
      this.player = this.matter.add.sprite(this.bottomLeftSide.x, this.bottomLeftSide.y, "player");
      this.player.setScale(this.paddleScaleX, this.paddleScaleY);
      this.player.setStatic(true);
      this.player.setAngle(-120);
    } else if (this.playerPosition === 'bottom_right_player') {
      this.player = this.matter.add.sprite(this.bottomRightSide.x, this.bottomRightSide.y, "player");
      this.player.setScale(this.paddleScaleX, this.paddleScaleY);
      this.player.setStatic(true);
      this.player.setAngle(120);
    }


    // Initializing game by setting values according to absolute map from server
    for (var playerID in gameState) {
      if (!gameState.hasOwnProperty('bottom_left_wall') && gameState[playerID].position === 'bottom_left_player' && this.playerID != playerID ) {
      this.bottomLeftSide.playerID = playerID; // This will set the playerID where position is 'bottom_left_player'
      this.bottomLeftSidePlayer = this.matter.add.sprite(this.bottomLeftSide.x, this.bottomLeftSide.y, "paddle");
      this.bottomLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
      this.bottomLeftSidePlayer.setAngle(-120);
      this.bottomLeftSidePlayer.setStatic(true);
      } else if (gameState[playerID].position === 'top_player' && this.playerID != playerID ) {
      this.topSide.playerID = playerID; // This will set the playerID where position is 'top_player'
      this.topSidePlayer = this.matter.add.sprite(this.topSide.x, this.topSide.y, "paddle");
      this.topSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
      this.topSidePlayer.setStatic(true);
    } else if (gameState[playerID].position === 'top_right_player' && this.playerID != playerID ) {
      this.topRightSide.playerID = playerID; // This will set the playerID where position is 'top_right_player'
      this.topRightSidePlayer = this.matter.add.sprite(this.topRightSide.x, this.topRightSide.y, "paddle");
      this.topRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
      this.topRightSidePlayer.setAngle(60);
      this.topRightSidePlayer.setStatic(true);
    } else if (gameState[playerID].position === 'top_left_player' && this.playerID != playerID ) {
      this.topLeftSide.playerID = playerID; // This will set the playerID where position is 'top_left_player'
      this.topLeftSidePlayer = this.matter.add.sprite(this.topLeftSide.x, this.topLeftSide.y, "paddle");
      this.topLeftSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
      this.topLeftSidePlayer.setAngle(-60);
      this.topLeftSidePlayer.setStatic(true);
    } else if (gameState[playerID].position === 'bottom_right_player' && this.playerID != playerID ) {
      this.bottomRightSide.playerID = playerID; // This will set the playerID where position is 'top_right_player'
      this.bottomRightSidePlayer = this.matter.add.sprite(this.bottomRightSide.x, this.bottomRightSide.y, "paddle");
      this.bottomRightSidePlayer.setScale(this.paddleScaleX, this.paddleScaleY);
      this.bottomRightSidePlayer.setAngle(120);
      this.bottomRightSidePlayer.setStatic(true);
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
      } else if (playerID == this.topLeftSide.playerID) {
        this.topLeftSidePlayer.x = gameState[playerID]['x']
        this.topLeftSidePlayer.y = gameState[playerID]['y']
      } else if (playerID == this.bottomRightSide.playerID) {
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

export default SixPlayer;

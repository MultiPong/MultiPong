// scenes/eightPlayer.js
import { ballCollisionNoise, ballAngle, playerMoved, ballMoved } from '../library.js';



class SixPlayer extends Phaser.Scene {
    constructor() {
        super({ key: 'SixPlayer' });
        this.cursors = null;
        this.player = null;
        this.leftEnd = 305;
        this.rightEnd = 495;
        this.paddleHeight = 550;
        this.paddleScaleX = 0.13;
        this.paddleScaleY = 0.18;
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
        };
        

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
        };
        
        
        this.connection.onclose = function(event) {
            console.log(`[close] Connection closed`);
        };
        
        this.connection.onerror = function(error) {
            console.log(`[error] ${error.message}`);
        };

        this.cursors = this.input.keyboard.createCursorKeys();

        

        let wall1 = this.matter.add.sprite(155, 160, "wall", { restitution: 1 }); //Top Left Border
        wall1.setScale(0.45, 0.1); // scales width by 45% and height by 10%
        wall1.setAngle(-60); // Rotate Border
        wall1.setStatic(true);
        let player1 = this.matter.add.sprite(180, 185, "paddle");
        player1.setScale(this.paddleScaleX, this.paddleScaleY);
        player1.setStatic(true);
        player1.setAngle(-60);

        let wall2 = this.matter.add.sprite(155, 440, "wall", { restitution: 1 }); //Bottom Left Border
        wall2.setScale(0.45, 0.1);
        wall2.setAngle(-120);
        wall2.setStatic(true);
        let player2 = this.matter.add.sprite(180, 415, "paddle");
        player2.setScale(this.paddleScaleX, this.paddleScaleY);
        player2.setStatic(true);
        player2.setAngle(-120);

        let wall3 = this.matter.add.sprite(645, 435, "wall", { restitution: 1 }); //Bottom Right Border
        wall3.setScale(0.45, 0.1);
        wall3.setAngle(120);
        wall3.setStatic(true);
        let player3 = this.matter.add.sprite(620, 410, "paddle");
        player3.setScale(this.paddleScaleX, this.paddleScaleY);
        player3.setStatic(true);
        player3.setAngle(120);

        let wall4 = this.matter.add.sprite(645, 160, "wall", { restitution: 1 }); //Top Right Border
        wall4.setScale(0.45, 0.1);
        wall4.setAngle(60);
        wall4.setStatic(true);
        let player4 = this.matter.add.sprite(620, 185, "paddle");
        player4.setScale(this.paddleScaleX, this.paddleScaleY);
        player4.setStatic(true);
        player4.setAngle(-120);

        let wall5 = this.matter.add.sprite(400, 20, "wall", { restitution: 1 }); //Top Border
        wall5.setScale(0.45, 0.1);
        wall5.setStatic(true);
        let player5 = this.matter.add.sprite(400, 50, "paddle");
        player5.setScale(this.paddleScaleX, this.paddleScaleY);
        player5.setStatic(true);

        let wall6 = this.matter.add.sprite(400, 580, "wall", { restitution: 1 }); //Bottom Border
        wall6.setScale(0.45, 0.1);
        wall6.setStatic(true);

        this.player = this.matter.add.sprite(400, this.paddleHeight, "paddle");
        this.player.setScale(this.paddleScaleX, this.paddleScaleY);
        this.player.setStatic(true);

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
                ballMoved(this, ball.x, ball.y, velocityX, velocityY);
            }
        }.bind(this));

    
    }

    update() {
        if (this.cursors.left.isDown) {
            if (this.player.x > this.leftEnd) {
                this.player.x -= 5; // Move paddle left via x coordinate
              playerMoved(this, this.player.x, this.player.y); // Send the new position to the backend
            }
        } else if (this.cursors.right.isDown) {
            if (this.player.x < this.rightEnd) {
                this.player.x += 5; // move paddle right via x coordinate
                playerMoved(this, this.player.x, this.player.y); // Send the new position to the backend
            }
        }
    }
}

export default SixPlayer;

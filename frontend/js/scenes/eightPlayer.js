// scenes/eightPlayer.js
import { ballCollisionNoise, resetVelocityIncrease, ballAngle, playerMoved, ballMoved } from '../library.js';



class EightPlayer extends Phaser.Scene {
    constructor() {
        super({ key: 'EightPlayer' });
        this.cursors = null;
        this.player = null;
        this.leftEnd = 335;
        this.rightEnd = 465;
        this.paddleHeight = 535;
        this.paddleScaleX = 0.1;
        this.paddleScaleY = 0.15;
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

        

        let wall1 = this.matter.add.sprite(217, 115, "wall", { restitution: 1 }); //Top Left Border
        wall1.setScale(0.3, 0.1); // scales width by 30% and height by 10%
        wall1.setAngle(-45);
        wall1.setStatic(true);
        wall1.setBounce(1);
        let player1 = this.matter.add.sprite(235, 135, "paddle");
        player1.setScale(this.paddleScaleX, this.paddleScaleY);
        player1.setAngle(-45);
        player1.setStatic(true);

        let wall2 = this.matter.add.sprite(583, 115, "wall", { restitution: 1 }); //Top Right Border
        wall2.setScale(0.3, 0.1);
        wall2.setAngle(45);
        wall2.setStatic(true);
        let player2 = this.matter.add.sprite(565, 135, "paddle");
        player2.setScale(this.paddleScaleX, this.paddleScaleY);
        player2.setAngle(45);
        player2.setStatic(true);

        let wall3 = this.matter.add.sprite(217, 485, "wall", { restitution: 1 }); //Bottom Left Border
        wall3.setScale(0.3, 0.1);
        wall3.setAngle(-135);
        wall3.setStatic(true);
        let player3 = this.matter.add.sprite(235, 465, "paddle");
        player3.setScale(this.paddleScaleX, this.paddleScaleY);
        player3.setAngle(-135);
        player3.setStatic(true);

        let wall4 = this.matter.add.sprite(583, 485, "wall", { restitution: 1 }); //Bottom Right Border
        wall4.setScale(0.3, 0.1);
        wall4.setAngle(135);
        wall4.setStatic(true);
        let player4 = this.matter.add.sprite(565, 465, "paddle");
        player4.setScale(this.paddleScaleX, this.paddleScaleY);
        player4.setAngle(135);
        player4.setStatic(true);

        let wall5 = this.matter.add.sprite(140, 300, "wall", { restitution: 1 }); //Mid Left Border
        wall5.setScale(0.3, 0.1);
        wall5.setAngle(90);
        wall5.setStatic(true);
        let player5 = this.matter.add.sprite(165, 300, "paddle");
        player5.setScale(this.paddleScaleX, this.paddleScaleY);
        player5.setAngle(90);
        player5.setStatic(true);

        let wall6 = this.matter.add.sprite(660, 300, "wall", { restitution: 1 }); //Mid Right Border
        wall6.setScale(0.3, 0.1);
        wall6.setAngle(90);
        wall6.setStatic(true);
        let player6 = this.matter.add.sprite(635, 300, "paddle");
        player6.setScale(this.paddleScaleX, this.paddleScaleY);
        player6.setAngle(90);
        player6.setStatic(true);

        let wall7 = this.matter.add.sprite(400, 39, "wall", { restitution: 1 }); //Top Border
        wall7.setScale(0.3, 0.1);
        wall7.setStatic(true);
        let player7 = this.matter.add.sprite(400, 64, "paddle");
        player7.setScale(this.paddleScaleX, this.paddleScaleY);
        player7.setStatic(true);

        let wall8 = this.matter.add.sprite(400, 561, "wall", { restitution: 1 }); //Bottom Border
        wall8.setScale(0.3, 0.1);
        wall8.setStatic(true);

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

export default EightPlayer;

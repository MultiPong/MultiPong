import { generateUniqueToken, ballCollisionNoise, resetVelocityIncrease, ballAngle, playerMoved, ballMoved } from '../library.js';



class FourPlayer extends Phaser.Scene {
    constructor() {
        super({ key: 'FourPlayer' });
        this.cursors = null;
        this.player = null;
        this.leftEnd = 220;
        this.rightEnd = 580;
        this.paddleHeight = 535;
        this.paddleScaleX = 0.15;
        this.paddleScaleY = 0.2;
        this.playerID = generateUniqueToken();
        this.playerPosition = null;
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
            this.connection.send(JSON.stringify({ action: 'playerIDSET', playerIDSet: this.playerID }));
        }.bind(this);
        
        

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
            } else if (message.action === 'playerPosition') {
                this.playerPosition = message.playerPosition;
                console.log(this.playerPosition)
            }
        };
        
        
        this.connection.onclose = function(event) {
            console.log(`[close] Connection closed`);
        };
        
        this.connection.onerror = function(error) {
            console.log(`[error] ${error.message}`);
        };

        this.cursors = this.input.keyboard.createCursorKeys();

        

        let wall1 = this.matter.add.sprite(400, 40, "wall", { restitution: 1 }); //Top Border
        wall1.setScale(0.7, 0.1); // scales width by 70% and height by 20%
        wall1.setStatic(true);
        let player1 = this.matter.add.sprite(400, 65, "paddle");
        player1.setScale(this.paddleScaleX, this.paddleScaleY);
        player1.setStatic(true);

        let wall2 = this.matter.add.sprite(148, 300, "wall", { restitution: 1 }); //Left Border
        wall2.setScale(0.7, 0.1);
        wall2.setAngle(90);
        wall2.setStatic(true);
        let player2 = this.matter.add.sprite(173, 300, "paddle");
        player2.setScale(this.paddleScaleX, this.paddleScaleY);
        player2.setAngle(90);
        player2.setStatic(true);

        let wall3 = this.matter.add.sprite(652, 300, "wall", { restitution: 1 }); //Right Border
        wall3.setScale(0.7, 0.1);
        wall3.setAngle(90);
        wall3.setStatic(true);
        let player3 = this.matter.add.sprite(627, 300, "paddle");
        player3.setScale(this.paddleScaleX, this.paddleScaleY);
        player3.setAngle(90);
        player3.setStatic(true);

        let wall4 = this.matter.add.sprite(400, 560, "wall", { restitution: 1 }); //Bottom Border
        wall4.setScale(0.7, 0.1);
        wall4.setStatic(true);

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
}

export default FourPlayer;

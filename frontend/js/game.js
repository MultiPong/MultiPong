//TODO:
//Remake foursided and sixsided with matter physics
//Add non player paddles to other walls
//

var config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 800,
  height: 600,
  physics: {
    default: "matter",
    //arcade: better for performance but 90 degree only
    // arcade: {
    //   debug: true,
    //   gravity: { y: 0 }
    // },
    //matter: angled hitboxes but high cost
    matter: {
      debug: true,
      gravity: { y: 0 },
      setBounds: {
        left: true,
        right: true,
        top: true,
        bottom: true,
      },
      frictionNormalMultiplier: 0,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);

//generally used to load assets
function preload() {
  this.load.image("paddle", "js/assets/sprites/wall.png");
  this.load.image("wall", "js/assets/sprites/wall.png");
  this.load.image("ball", "js/assets/sprites/ball.png");
}

let paddleHeight = 0;
let paddleScaleX = 0;
let paddleScaleY = 0;

//initialize game
function create() {
  cursors = this.input.keyboard.createCursorKeys();

  //sixSided(this);
  eightSided(this);
  // fourSided(this);

  player = this.matter.add.sprite(400, paddleHeight, "paddle");
  player.setScale(paddleScaleX, paddleScaleY);
  player.setStatic(true);
  // player.setBounce(1);

  ball = this.matter.add.image(400, 400, "ball", { restitution: 1 });
  // const body = ball.body;
  // this.matter.body.setInertia(body, Infinity);
  ball.setScale(0.25);
  ball.setCircle(13);
  // ball.setFixedRotation();
  // const body = ball.body;
  // this.matter.body.setInertia(body,Infinity)
  ball.setFriction(0, 0, 0);
  ball.setVelocity(0, 2);
  ball.setBounce(1);

  // ball.setInertia(Infinity); // set the inertia of the ball to infinity
  this.matter.world.on("collisionactive", function (event, bodyA, bodyB) {
    // Check if one of the bodies is the ball
    if (bodyA === ball.body || bodyB === ball.body) {
      // Get the current velocity of the ball
      var velocity = ball.body.velocity;

      // Calculate the angle of the ball's velocity
      var angle = Math.atan2(velocity.y, velocity.x);

      // Adjust the angle to make the ball bounce off at a 90-degree angle in the opposite direction
      angle += Math.PI / 2;

      // Set the velocity of the ball
      ball.setVelocity(2 * Math.cos(angle), 2 * Math.sin(angle));
    }
  });
}

let leftEnd = 0;
let rightEnd = 800;

//Code that happens during runtime
function update() {
  //TODO: paddle inputs, powerups*, time-based mechanics*
  if (cursors.left.isDown) {
    if (player.x > leftEnd) {
      player.x -= 5; // Move paddle left
    }
  } else if (cursors.right.isDown) {
    if (player.x < rightEnd) {
      player.x += 5; // move paddle right
    }
  }
}

//Game Maps
function fourSided(scene) {
  leftEnd = 220;
  rightEnd = 580;
  paddleHeight = 535;
  paddleScaleX = 0.15;
  paddleScaleY = 0.2;

  let wall1 = scene.matter.add.sprite(400, 40, "wall", { restitution: 1 }); //Top Border
  wall1.setScale(0.7, 0.1); // scales width by 1 and height by 20%
  wall1.setStatic(true);
  let player1 = scene.matter.add.sprite(400, 65, "paddle");
  player1.setScale(paddleScaleX, paddleScaleY);
  player1.setStatic(true);

  let wall2 = scene.matter.add.sprite(148, 300, "wall", { restitution: 1 }); //Left Border
  wall2.setScale(0.7, 0.1);
  wall2.setAngle(90);
  wall2.setStatic(true);
  let player2 = scene.matter.add.sprite(173, 300, "paddle");
  player2.setScale(paddleScaleX, paddleScaleY);
  player2.setAngle(90);
  player2.setStatic(true);

  let wall3 = scene.matter.add.sprite(652, 300, "wall", { restitution: 1 }); //Right Border
  wall3.setScale(0.7, 0.1);
  wall3.setAngle(90);
  wall3.setStatic(true);
  let player3 = scene.matter.add.sprite(627, 300, "paddle");
  player3.setScale(paddleScaleX, paddleScaleY);
  player3.setAngle(90);
  player3.setStatic(true);

  let wall4 = scene.matter.add.sprite(400, 560, "wall", { restitution: 1 }); //Bottom Border
  wall4.setScale(0.7, 0.1);
  wall4.setStatic(true);
}

function sixSided(scene) {
  leftEnd = 305;
  rightEnd = 495;
  paddleHeight = 550;
  paddleScaleX = 0.13;
  paddleScaleY = 0.18;

  let wall1 = scene.matter.add.sprite(155, 160, "wall", { restitution: 1 }); //Top Left Border
  wall1.setScale(0.45, 0.1); // scales width by 1 and height by 20%
  wall1.setAngle(-60); // Rotate Border
  wall1.setStatic(true);
  let player1 = scene.matter.add.sprite(180, 185, "paddle");
  player1.setScale(paddleScaleX, paddleScaleY);
  player1.setStatic(true);
  player1.setAngle(-60);

  let wall2 = scene.matter.add.sprite(155, 440, "wall", { restitution: 1 }); //Bottom Left Border
  wall2.setScale(0.45, 0.1);
  wall2.setAngle(-120);
  wall2.setStatic(true);
  let player2 = scene.matter.add.sprite(180, 415, "paddle");
  player2.setScale(paddleScaleX, paddleScaleY);
  player2.setStatic(true);
  player2.setAngle(-120);

  let wall3 = scene.matter.add.sprite(645, 435, "wall", { restitution: 1 }); //Bottom Right Border
  wall3.setScale(0.45, 0.1);
  wall3.setAngle(120);
  wall3.setStatic(true);
  let player3 = scene.matter.add.sprite(620, 410, "paddle");
  player3.setScale(paddleScaleX, paddleScaleY);
  player3.setStatic(true);
  player3.setAngle(120);

  let wall4 = scene.matter.add.sprite(645, 160, "wall", { restitution: 1 }); //Top Right Border
  wall4.setScale(0.45, 0.1);
  wall4.setAngle(60);
  wall4.setStatic(true);
  let player4 = scene.matter.add.sprite(620, 185, "paddle");
  player4.setScale(paddleScaleX, paddleScaleY);
  player4.setStatic(true);
  player4.setAngle(-120);

  let wall5 = scene.matter.add.sprite(400, 20, "wall", { restitution: 1 }); //Top Border
  wall5.setScale(0.45, 0.1);
  wall5.setStatic(true);
  let player5 = scene.matter.add.sprite(400, 50, "paddle");
  player5.setScale(paddleScaleX, paddleScaleY);
  player5.setStatic(true);

  let wall6 = scene.matter.add.sprite(400, 580, "wall", { restitution: 1 }); //Bottom Border
  wall6.setScale(0.45, 0.1);
  wall6.setStatic(true);
}

function eightSided(scene) {
  leftEnd = 330;
  rightEnd = 470;
  paddleHeight = 535;
  paddleScaleX = 0.1;
  paddleScaleY = 0.15;

  let wall1 = scene.matter.add.sprite(217, 115, "wall", { restitution: 1 }); //Top Left Border
  wall1.setScale(0.3, 0.1); // scales width by 1 and height by 20%
  wall1.setAngle(-45);
  wall1.setStatic(true);
  wall1.setBounce(1);
  let player1 = scene.matter.add.sprite(235, 135, "paddle");
  player1.setScale(paddleScaleX, paddleScaleY);
  player1.setAngle(-45);
  player1.setStatic(true);

  let wall2 = scene.matter.add.sprite(583, 115, "wall", { restitution: 1 }); //Top Right Border
  wall2.setScale(0.3, 0.1);
  wall2.setAngle(45);
  wall2.setStatic(true); // Rotate Border
  let player2 = scene.matter.add.sprite(565, 135, "paddle");
  player2.setScale(paddleScaleX, paddleScaleY);
  player2.setAngle(45);
  player2.setStatic(true);

  let wall3 = scene.matter.add.sprite(217, 485, "wall", { restitution: 1 }); //Bottom Left Border
  wall3.setScale(0.3, 0.1);
  wall3.setAngle(-135);
  wall3.setStatic(true); // Rotate Border
  let player3 = scene.matter.add.sprite(235, 465, "paddle");
  player3.setScale(paddleScaleX, paddleScaleY);
  player3.setAngle(-135);
  player3.setStatic(true);

  let wall4 = scene.matter.add.sprite(583, 485, "wall", { restitution: 1 }); //Bottom Right Border
  wall4.setScale(0.3, 0.1);
  wall4.setAngle(135);
  wall4.setStatic(true); // Rotate Border
  let player4 = scene.matter.add.sprite(565, 465, "paddle");
  player4.setScale(paddleScaleX, paddleScaleY);
  player4.setAngle(135);
  player4.setStatic(true);

  let wall5 = scene.matter.add.sprite(140, 300, "wall", { restitution: 1 }); //Mid Left Border
  wall5.setScale(0.3, 0.1);
  wall5.setAngle(90);
  wall5.setStatic(true); // Rotate Border
  let player5 = scene.matter.add.sprite(165, 300, "paddle");
  player5.setScale(paddleScaleX, paddleScaleY);
  player5.setAngle(90);
  player5.setStatic(true);

  let wall6 = scene.matter.add.sprite(660, 300, "wall", { restitution: 1 }); //Mid Right Border
  wall6.setScale(0.3, 0.1);
  wall6.setAngle(90);
  wall6.setStatic(true); // Rotate Border
  let player6 = scene.matter.add.sprite(635, 300, "paddle");
  player6.setScale(paddleScaleX, paddleScaleY);
  player6.setAngle(90);
  player6.setStatic(true);

  let wall7 = scene.matter.add.sprite(400, 39, "wall", { restitution: 1 }); //Top Border
  wall7.setScale(0.3, 0.1);
  wall7.setStatic(true);
  let player7 = scene.matter.add.sprite(400, 64, "paddle");
  player7.setScale(paddleScaleX, paddleScaleY);
  player7.setStatic(true);

  let wall8 = scene.matter.add.sprite(400, 561, "wall", { restitution: 1 }); //Bottom Border
  wall8.setScale(0.3, 0.1);
  wall8.setStatic(true);

}
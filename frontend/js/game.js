var config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  physics: {
    default: 'matter', 
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
        bottom: true
      },
      frictionNormalMultiplier:0,
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
  this.load.image('paddle','js/assets/sprites/wall.png');
  this.load.image('wall','js/assets/sprites/wall.png');
  this.load.image('ball','js/assets/sprites/ball.png');
}

//initialize game
function create() {
  cursors = this.input.keyboard.createCursorKeys();
  player = this.matter.add.sprite(400, 525, 'paddle');
  player.setScale(0.15, 0.25);
  player.setStatic(true);
  // player.setBounce(1);
  eightsided(this);

  ball = this.matter.add.image(400,400,'ball', {restitution:1});
  // const body = ball.body;
  // this.matter.body.setInertia(body, Infinity);
  ball.setScale(0.5);
  ball.setCircle(25);
  // ball.setFixedRotation();
  // const body = ball.body;
  // this.matter.body.setInertia(body,Infinity)
  ball.setFriction(0,0,0);
  ball.setVelocity(0,2);
  ball.setBounce(1);
  // ball.setInertia(Infinity); // set the inertia of the ball to infinity
  this.matter.world.on('collisionactive', function (event, bodyA, bodyB) {
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

//Code that happens during runtime
function update() {
  //TODO: paddle inputs, powerups*, time-based mechanics*
  if (cursors.left.isDown) {
      player.x -=5; // Move paddle left
    
  } 

  else if (cursors.right.isDown) {
      player.x += 5; // move paddle right
    
  }   // if (ball.body.speed < 1) {
  //   // Calculate the angle of the ball's velocity
  //   let angle = Math.atan2(ball.body.velocity.y, ball.body.velocity.x);
  //   angle += Math.PI / 2;
  //   // Set the velocity of the ball
  //   ball.setVelocity(2 * Math.cos(angle), 2 * Math.sin(angle));
  // }
}


//Game Maps


function eightsided(scene) {
  let wall1 = scene.matter.add.sprite(217,115,'wall', {}); //Top Left Border
  wall1.setScale(0.3,0.1); // scales width by 1 and height by 20%
  wall1.setAngle(-45);
  wall1.setStatic(true);
  wall1.setBounce(1);

  let wall2 = scene.matter.add.sprite(583,115,'wall'); //Top Right Border
  wall2.setScale(0.3,0.1);
  wall2.setAngle(45);
  wall2.setStatic(true); // Rotate Border


  let wall3 = scene.matter.add.sprite(217,485,'wall'); //Bottom Left Border
  wall3.setScale(0.3,0.1); 
  wall3.setAngle(-135);
  wall3.setStatic(true); // Rotate Border

  let wall4 = scene.matter.add.sprite(583,485,'wall'); //Bottom Right Border
  wall4.setScale(0.3,0.1);
  wall4.setAngle(135);
  wall4.setStatic(true); // Rotate Border


  let wall5 = scene.matter.add.sprite(140,300,'wall'); //Mid Left Border
  wall5.setScale(0.3,0.1);
  wall5.setAngle(90);
  wall5.setStatic(true); // Rotate Border


  let wall6 = scene.matter.add.sprite(660,300,'wall'); //Mid Right Border
  wall6.setScale(0.3,0.1);
  wall6.setAngle(90);
  wall6.setStatic(true); // Rotate Border

  
  let wall7 = scene.matter.add.sprite(400,561,'wall', {restitution: 1}); //Bottom Border
  wall7.setScale(0.3,0.1);
  wall7.setStatic(true); 
  // wall7.setBounce(1);
  // wall7.setFriction(0,0,0);


  let wall8 = scene.matter.add.sprite(400,39,'wall'); //Top Border
  wall8.setScale(0.3,0.1);
  wall8.setStatic(true); // Rotate Border

}

function foursided(scene) {
  let wall1 = scene.add.sprite(400,40,'wall'); //Top Border
  wall1.setScale(0.7,0.1); // scales width by 1 and height by 20%

  let wall2 = scene.add.sprite(148,300,'wall'); //Left Border
  wall2.setScale(0.7,0.1); 
  wall2.setAngle(90);

  let wall3 = scene.add.sprite(400,560,'wall'); //Bottom Border
  wall3.setScale(0.7,0.1);

  let wall4 = scene.add.sprite(652,300,'wall'); //Right Border
  wall4.setScale(0.7,0.1);
  wall4.setAngle(90);

  scene.physics.add.existing(wall1);
  scene.physics.add.existing(wall2);
  scene.physics.add.existing(wall3);
  scene.physics.add.existing(wall4);
  scene.physics.add.existing(player);
}


function fivesided(scene) {
  let wall1 = scene.add.sprite(255,125,'wall'); //Top Left Border
  wall1.setScale(0.5,0.1); // scales width by 1 and height by 20%
  wall1.setAngle(-36); // Rotate Border

  let wall2 = scene.add.sprite(165,403,'wall'); //Bottom Left Border
  wall2.setScale(0.5,0.1); 
  wall2.setAngle(-108);

  let wall3 = scene.add.sprite(635,403,'wall'); //Bottom Right Border
  wall3.setScale(0.5,0.1);
  wall3.setAngle(108);

  let wall4 = scene.add.sprite(545,125,'wall'); //Top Right Border
  wall4.setScale(0.5,0.1);
  wall4.setAngle(36);

  let wall5 = scene.add.sprite(400,575,'wall'); //Bottom Border
  wall5.setScale(0.5,0.1);

  scene.physics.add.existing(wall1);
  scene.physics.add.existing(wall2);
  scene.physics.add.existing(wall3);
  scene.physics.add.existing(wall4);
  scene.physics.add.existing(wall5);
  scene.physics.add.existing(player);
}


function sixsided(scene) {
  let wall1 = scene.add.sprite(155,160,'wall'); //Top Left Border
  wall1.setScale(0.45,0.1); // scales width by 1 and height by 20%
  wall1.setAngle(-60); // Rotate Border

  let wall2 = scene.add.sprite(155,440,'wall'); //Bottom Left Border
  wall2.setScale(0.45,0.1); 
  wall2.setAngle(-120);

  let wall3 = scene.add.sprite(645,440,'wall'); //Bottom Right Border
  wall3.setScale(0.45,0.1);
  wall3.setAngle(120);

  let wall4 = scene.add.sprite(645,160,'wall'); //Top Right Border
  wall4.setScale(0.45,0.1);
  wall4.setAngle(60);

  let wall5 = scene.add.sprite(400,20,'wall'); //Top Border
  wall5.setScale(0.45,0.1);

  let wall6 = scene.add.sprite(400,580,'wall'); //Bottom Border
  wall6.setScale(0.45,0.1);

  scene.physics.add.existing(wall1);
  scene.physics.add.existing(wall2);
  scene.physics.add.existing(wall3);
  scene.physics.add.existing(wall4);
  scene.physics.add.existing(wall5);
  scene.physics.add.existing(wall6);
  scene.physics.add.existing(player);
}


function sevensided(scene) {
  let wall1 = scene.add.sprite(287,80,'wall'); //Top Left Border
  wall1.setScale(0.35,0.1); // scales width by 1 and height by 20%
  wall1.setAngle(-25.71); // Rotate Border

  let wall2 = scene.add.sprite(513,80,'wall'); //Top Right Border
  wall2.setScale(0.35,0.1);
  wall2.setAngle(25.71);

  let wall3 = scene.add.sprite(195,480,'wall'); //Bottom Left Border
  wall3.setScale(0.35,0.1); 
  wall3.setAngle(-128.57);

  let wall4 = scene.add.sprite(605,480,'wall'); //Bottom Right Border
  wall4.setScale(0.35,0.1);
  wall4.setAngle(128.57);

  let wall5 = scene.add.sprite(145,258,'wall'); //Mid Left Border
  wall5.setScale(0.35,0.1);
  wall5.setAngle(-77.15);

  let wall6 = scene.add.sprite(655,258,'wall'); //Mid Right Border
  wall6.setScale(0.35,0.1);
  wall6.setAngle(77.15);
  
  let wall7 = scene.add.sprite(400,580,'wall'); //Bottom Border
  wall7.setScale(0.35,0.1);

  scene.physics.add.existing(wall1);
  scene.physics.add.existing(wall2);
  scene.physics.add.existing(wall3);
  scene.physics.add.existing(wall4);
  scene.physics.add.existing(wall5);
  scene.physics.add.existing(wall6);
  scene.physics.add.existing(wall7);
  scene.physics.add.existing(player);
}

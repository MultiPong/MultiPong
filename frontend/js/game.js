var config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade', 
    //arcade: better for performance but 90 degree only
    arcade: {
      debug: false,
      gravity: { y: 0 }
    },
    //matter: angled hitboxes but high cost
    matter: {
      debug: false,
      gravity: { y: 0 }
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);

var borderShape = 'foursided'; // Default to foursided, but the user can change this

//generally used to load assets
function preload() {
  this.load.image('paddle','js/assets/sprites/wall.png');
  this.load.image('wall','js/assets/sprites/wall.png');
  this.load.image('ball','js/assets/sprites/ball.png');
}

//initialize game
function create() {
  cursors = this.input.keyboard.createCursorKeys();
  player = this.physics.add.sprite(400, 525, 'paddle');
  player.setScale(0.15, 0.25);
  eightsided(this);

  //tried to implement the switch case for choosing the maps
  // Listen for user input to change the border shape
  // this.input.keyboard.on('keydown', function (event) {
  //   if (event.key === '2' || event.key === '3' || event.key === '4') {
  //     borderShape = 'foursided';
  //   } else if (event.key === '5') {
  //     borderShape = 'fivesided';
  //   } else if (event.key === '6') {
  //     borderShape = 'sixsided';
  //   } else if (event.key === '7') {
  //     borderShape = 'sevensided';
  //   } else if (event.key === '8') {
  //     borderShape = 'eightsided';
  //   }
  //   // Update the border shape when the user presses a key
  //   updateBorderShape(this);
  //});
  


  // wall4.setAngle(90);
  // num_players = 4;
  // theta = 360/num_players;
  // Radius = 1000;
  // for(let i = 0; i < num_players; i++){
  //     //TODO: implement angle-render func in desmos (with offsets) for paddles and borders
  //     x = X(i*theta, Radius);
  //     this.matter.add.image(/*x*/x,/*y*/(x*Math.tan(i*theta*Math.PI/180)),/*sprite*/'wall',null,{isStatic: true}).setScale(/*length*/1,/*thickness*/0.5).setAngle((i*theta)+90);
  // }
  // ball = this.matter.add.image(0,0, /*ball sprite name*/'ball');
  // ball.setScale(0.5,0.5);
  // ball.setCircle();
  // ball.setBounce(1);
  // randangle = Phaser.Math.Between(0,359)*Math.PI/180;
  // spd = 10;
  // ball.setVelocity(spd*Math.cos(randangle), spd*Math.sin(randangle));
}

//tried to implement the switch case function
// Function to update the border shape
// function updateBorderShape(scene) {
//   switch (borderShape) {
//     case 'foursided':
//       foursided(scene);
//       break;
//     case 'fivesided':
//       fivesided(scene);
//       break;
//     case 'sixsided':
//       sixsided(scene);
//       break;
//     case 'sevensided':
//       sevensided(scene);
//       break;
//     case 'eightsided':
//       eightsided(scene);
//       break;
//     default:
//       // Default to foursided if the user's choice is invalid
//       foursided(scene);
//       break;
//   }
// }
  
//Code that happens during runtime
function update() {
  //TODO: paddle inputs, powerups*, time-based mechanics*
    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        // player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        // player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        // player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }   
}

function X(angle, radius){
    ANGLE = Math.PI * angle/180;
    return Math.sqrt(radius*radius/(1+Math.pow(Math.tan(ANGLE))))* Math.cos(ANGLE)/Math.abs(Math.cos(ANGLE));
}


//Game Maps
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


function eightsided(scene) {
  let wall1 = scene.add.sprite(217,115,'wall'); //Top Left Border
  wall1.setScale(0.3,0.1); // scales width by 1 and height by 20%
  wall1.setAngle(-45); // Rotate Border

  let wall2 = scene.add.sprite(583,115,'wall'); //Top Right Border
  wall2.setScale(0.3,0.1);
  wall2.setAngle(45);

  let wall3 = scene.add.sprite(217,485,'wall'); //Bottom Left Border
  wall3.setScale(0.3,0.1); 
  wall3.setAngle(-135);

  let wall4 = scene.add.sprite(583,485,'wall'); //Bottom Right Border
  wall4.setScale(0.3,0.1);
  wall4.setAngle(135);

  let wall5 = scene.add.sprite(140,300,'wall'); //Mid Left Border
  wall5.setScale(0.3,0.1);
  wall5.setAngle(90);

  let wall6 = scene.add.sprite(660,300,'wall'); //Mid Right Border
  wall6.setScale(0.3,0.1);
  wall6.setAngle(90);
  
  let wall7 = scene.add.sprite(400,561,'wall'); //Bottom Border
  wall7.setScale(0.3,0.1);

  let wall8 = scene.add.sprite(400,39,'wall'); //Top Border
  wall8.setScale(0.3,0.1);

  scene.physics.add.existing(wall1);
  scene.physics.add.existing(wall2);
  scene.physics.add.existing(wall3);
  scene.physics.add.existing(wall4);
  scene.physics.add.existing(wall5);
  scene.physics.add.existing(wall6);
  scene.physics.add.existing(wall7);
  scene.physics.add.existing(wall8);
  scene.physics.add.existing(player);
}
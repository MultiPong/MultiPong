var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1000,
    height: 800,
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
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    } 
  };
  var game = new Phaser.Game(config);

  //generally used to load assets
  function preload() {
    this.load.image('paddle','js/assets/sprites/wall.png');
    this.load.image('ball','js/assets/sprites/ball.png');
  }

  //initialize game
  function create() {
    cursors = this.input.keyboard.createCursorKeys();
    player = this.physics.add.sprite(100, 100, 'ball');
    platforms = this.physics.add.staticGroup();
    platforms.create(500,500, 'paddle').setScale(2).refreshBody();

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

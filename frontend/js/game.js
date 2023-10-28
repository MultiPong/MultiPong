var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
      default: 'matter', 
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

  }

  //initialize game
  function create() {
    //num_players = 4;
    /*for(let i = 0; i < num_players; i++){
        //TODO: implement angle-render func in desmos (with offsets) for paddles and borders 
    }*/
    //ball = this.matter.add.image(/*coordinates for center*/, /*ball sprite name*/);
    //ball.setCircle();
    //ball.setBounce(1);
    //ball.setVelocity(//random_x, random_y); //see Math.random()



  }
  
  //Code that happens during runtime
  function update() {
    //TODO: paddle inputs, powerups*, time-based mechanics*
  }
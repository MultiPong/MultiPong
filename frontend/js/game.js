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
    this.load.image('platform', 'assets/sprites/platform.png');
    this.load.image('ball', 'assets/sprites/pangball.png');
  }

  //initialize game
  function create() {
    num_players = 4;
    theta = 360/num_players;
    Radius = 1000
    for(let i = 0; i < num_players; i++){
        //TODO: implement angle-render func in desmos (with offsets) for paddles and borders
        x = X(i*theta, Radius);
        this.matter.add.image(/*x*/x,/*y*/(x*tan(i*theta)),/*sprite*/'platform',{isStatic: true}).setScale(/*length*/1,/*thickness*/0.5).setAngle((i*theta)+90);
    }
    ball = this.matter.add.image(0,0, /*ball sprite name*/'ball');
    ball.setCircle();
    ball.setBounce(1);
    randangle = Phaser.Math.Between(0,359);
    spd = 10;
    ball.setVelocity(spd*cos(randangle), spd*sin(randangle));



  }
  
  //Code that happens during runtime
  function update() {
    //TODO: paddle inputs, powerups*, time-based mechanics*
  }

function X(angle, radius){
    return sqrt(radius*radius/(1+sqr(tan(angle))))* cos(angle)/abs(cos(angle));
}

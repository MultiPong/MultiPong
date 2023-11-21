import EightPlayer from "./scenes/eightPlayer.js";
import FourPlayer from "./scenes/fourPlayer.js";
import SixPlayer from "./scenes/sixPlayer.js";
import WaitingRoom from "./scenes/waitingRoom.js";
import Victory from "./scenes/victory.js";
import Defeat from "./scenes/defeat.js";

var config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 800,
  height: 600,
  physics: {
    default: "matter",
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
  scene: [Defeat, WaitingRoom, SixPlayer, FourPlayer, EightPlayer],
};

var game = new Phaser.Game(config);

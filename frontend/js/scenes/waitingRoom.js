import EightPlayer from './eightPlayer.js';
import FourPlayer from './fourPlayer.js';
import SixPlayer from './sixPlayer.js';

class WaitingRoom extends Phaser.Scene {
    constructor() {
        super({ key: 'WaitingRoom' });
        this.playerCount = 0;  // The number of players in the room
    }

    create() {
        // Display the number of players
        this.playerCountText = this.add.text(10, 10, 'Players: ' + this.playerCount);

        // Create the "Start Game" button
        this.startButton = this.add.text(100, 100, 'Start Game', { fill: '#0f0' })
            .setInteractive()
            .on('pointerdown', () => this.startGame());  // Start the game when the button is clicked
    }

    // Call this method whenever a player joins or leaves
    updatePlayerCount(count) {
        this.playerCount = count;
        this.playerCountText.setText('Players: ' + this.playerCount);
    }

    // Start the appropriate game scene
    startGame() {
        if (this.playerCount <= 4) {
            this.scene.start('FourPlayer');
        } else if (this.playerCount <= 6) {
            this.scene.start('SixPlayer');
        } else {
            this.scene.start('EightPlayer');
        }
    }
}

export default WaitingRoom;
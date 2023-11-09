import { gameStarted } from "../library.js";

class WaitingRoom extends Phaser.Scene {
    constructor() {
        super({ key: 'WaitingRoom' });
        this.playerCount = 0;  // The number of players in the room
    }

    create() {

        this.connection = new WebSocket('ws://localhost:8080/ws/game/');

        // Listen for events from the server
        this.connection.onopen = function(e) {
            console.log("[open] Connection established");
        };

        this.connection.onclose = function(event) {
            console.log(`[close] Connection closed`);
        };

        this.connection.onerror = function(error) {
            console.log(`[error] ${error.message}`);
        };

        this.connection.onmessage = (event) => {
            console.log(`[message] Data received from server: ${event.data}`);
            var message = JSON.parse(event.data);
        
            if (message.action === 'playerCounterChanged') {
                this.playerCount = message.count;
                this.playerCountText.setText('Players: ' + this.playerCount);
            } else if (message.action === 'gameStarted') {
                this.startGame();
            }
        };

        // Display the number of players
        this.playerCountText = this.add.text(this.cameras.main.centerX, 200, 'Players: ' + this.playerCount, { fontSize: '32px' })
            .setOrigin(0.5, 0);  // Center the text horizontally

        // Create the "Start Game" button
        this.startButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Start Game', { fill: '#0f0', fontSize: '32px', backgroundColor: '#000' })
            .setOrigin(0.5, 0.5)  // Center the button
            .setPadding(10)  // Add some padding
            .setInteractive({ useHandCursor: true })  // Change cursor to pointer on hover
            .on('pointerdown', () => this.startGame())  // Start the game when the button is clicked
            .on('pointerover', () => this.startButton.setFill('#ff0'))  // Change color to yellow on hover
            .on('pointerout', () => this.startButton.setFill('#0f0'));  // Change color back on hover out
    }


    // Start the appropriate game scene
    startGame() {
        gameStarted(this);
        if (this.playerCount <= 4) {
            this.scene.start('FourPlayer');
        } else if (this.playerCount <= 6) {
            this.scene.start('SixPlayer');
        } else {
            this.scene.start('EightPlayer');
        }
        this.connection.close();
    }
}

export default WaitingRoom;


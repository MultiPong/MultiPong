import { gameStarted } from "../library.js";

class WaitingRoom extends Phaser.Scene {
    constructor() {
        super({ key: 'WaitingRoom' });
        this.playerCount = 0;  // The number of players in the room
        this.errorMessage = null;
    }

    create() {
        let params = new URLSearchParams(window.location.search);

        let gameID = params.get('id'); 
        let token = params.get('token'); // null if 'token' is not present in the URL

        if (token === null) {
            console.log('Token is not provided in the URL');
        } else {
            console.log(token);
        }    
        console.log(gameID)
        

        this.connection = new WebSocket(`ws://localhost:8000/ws/game/${gameID}`);

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
                // Remove the error message, if any
            if (this.playerCount >= 2 && this.errorMessage !== null && this.playerCount <= 8) {
                this.errorMessage.destroy();
                this.errorMessage = null;
            }
                this.playerCountText.setText('Players: ' + this.playerCount);
            } else if (message.action === 'gameStarted') {
                this.startGame();
            }
        };

        // Display the number of players
        this.playerCountText = this.add.text(this.cameras.main.centerX, 200, 'Players: ' + this.playerCount, { fontSize: '32px' })
            .setOrigin(0.5, 0);  // Center the text horizontally

        // Create the "Start Game" button
        this.startButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Start Game', 
            { fill: '#0f0', fontSize: '32px', backgroundColor: '#000' })
            .setOrigin(0.5, 0.5)  // Center the button
            .setPadding(10)  // Add some padding
            .setInteractive({ useHandCursor: true })  // Change cursor to pointer on hover
            .on('pointerdown', () => this.startGame())  // Start the game when the button is clicked
            .on('pointerover', () => this.startButton.setFill('#ff0'))  // Change color to yellow on hover
            .on('pointerout', () => this.startButton.setFill('#0f0'));  // Change color back on hover out
    }


    // Start the appropriate game scene
    startGame() {
        if (this.playerCount < 2 || this.playerCount > 8) {
            console.error('Invalid number of players. There must be between 2 and 8 players to start the game.');
            // Remove the previous error message, if any
            if (this.errorMessage !== null) {
                this.errorMessage.destroy();
            }
            // Display the error message to the user
            this.errorMessage = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 200, 
                '       Invalid number of players. \n There must be between 2 and 8 players  \n         to start the game.',
                { fill: '#f00', fontSize: '28px', backgroundColor: '#000', fontWeight: 'bold'  })
                .setOrigin(0.5, 0.5);  // Center the text
            return;
        }

        

        gameStarted(this, this.playerCount);
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


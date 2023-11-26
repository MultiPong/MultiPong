//Play this noise when the ball collides with an object
export function ballCollisionNoise() {
    var audio = new Audio("js/assets/ballCollide.mp3");
    audio.volume = 0.03;
    audio.play();
}
  
//Calculate new outgoing Ball Angle
let velocityIncrease = 0;

export function ballAngle(velocity) {
// Calculate the angle of the ball's velocity
    var angle = Math.atan2(velocity.y, velocity.x);

    // Adjust the angle to make the ball bounce off at a 90-degree angle in the opposite direction
    angle += Math.PI / 2;

    // Increases the velocity of the ball after every collision
    // Move this above the angle calculations if it messes with the direction too much
    let velocityX = 2 * Math.cos(angle);
    let velocityY = 2 * Math.sin(angle);

    if (velocityX > 0) {
        velocityX += velocityIncrease;
    } else if (velocityX < 0) {
        velocityX -= velocityIncrease;
    }
    if (velocityY > 0) {
        velocityY += velocityIncrease;
    } else if (velocityY < 0) {
        velocityY -= velocityIncrease;
    }
    velocityIncrease += 0.05;

    return [velocityX, velocityY]
}

export function resetVelocityIncrease() {
    velocityIncrease = 0;
}


//WebSocket Methods
export function playerMoved(self, playerID,  newX, newY) {
    // Construct the message
    var message = {
        action: 'playerMoved',
        playerID:playerID, 
        x: newX,
        y: newY
    };
  
    // Send the message as a JSON string
    self.connection.send(JSON.stringify(message));
}
  
export function ballMoved(self, playerID, ballX, ballY, ballVX, ballVY) {
  
    var message = {
        action: 'ballMoved',
        playerID:playerID, 
        x:ballX,
        y:ballY,
        vx:ballVX,
        vy:ballVY
    };

    self.connection.send(JSON.stringify(message));
  
}

export function playerScored(self, playerID) {
  
    var message = {
        action: 'playerScored',
        playerID:playerID
    };

    self.connection.send(JSON.stringify(message));
  
}

export function gameStarted(self, playerCount) {
  
    var message = {
        action: 'gameStarted',
        playerCount: playerCount
    };

    self.connection.send(JSON.stringify(message));
  
}

export function generateUniqueToken(number) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var token = '';
    for (var i = 0; i < number; i++) {
        token += chars[Math.floor(Math.random() * chars.length)];
    }
    return token;
}

export function getRandomDirectionVector(numDirections) {
    var directions = [];

    if (numDirections === 4) {
        directions = [
            [0, -2], // top
            [0, 2],  // bottom
            [-2, 0], // left
            [2, 0]   // right
        ];
    } else if (numDirections === 6) {
        directions = [
            [-2, -2], // top left
            [2, -2],  // top right
            [-2, 2],  // bottom left
            [2, 2],   // bottom right
            [0, -2],  // top
            [0, 2]    // bottom
        ];
    } else if (numDirections === 8) {
        directions = [
            [-2, -2], // top left
            [2, -2],  // top right
            [-2, 2],  // bottom left
            [2, 2],   // bottom right
            [0, -2],  // top
            [0, 2],   // bottom
            [-2, 0],  // left
            [2, 0]    // right
        ];
    }

    var randomIndex = Math.floor(Math.random() * directions.length);
    return directions[randomIndex];
}

export function toggleMute(soundEffect, muteButton) {
    // Toggle mute status
    soundEffect.setMute(!soundEffect.mute);

    // Update the button text
    muteButton.setText(soundEffect.mute ? '🔇' : '🔊');
}

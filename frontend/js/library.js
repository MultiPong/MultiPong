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
    velocityIncrease += 0.02;

    return [velocityX, velocityY]
}


//WebSocket Methods
export function playerMoved(self, newX, newY) {
    // Construct the message
    var message = {
        action: 'playerMoved',
        x: newX,
        y: newY
    };
  
    // Send the message as a JSON string
    self.connection.send(JSON.stringify(message));
}
  
export function ballMoved(self, ballX, ballY, ballVX, ballVY) {
  
    var message = {
        action: 'ballMoved',
        x:ballX,
        y:ballY,
        vx:ballVX,
        vy:ballVY
    };

    self.connection.send(JSON.stringify(message));
  
}



import React from 'react';
import '../../CSS/Game.css'

function PlayGame({ authToken, gameRoomID }) {
  return (
    <>
      <h1>game room id: {gameRoomID}</h1>
      <h1>Auth Token is: {authToken}</h1>
      

<div style={{ position: 'relative', borderRadius: '25px' }} className="home-container-Play">
      
      <div style={{ zIndex: 1, position: 'absolute' }} className='Game-Creation-box-iframe'>

        <div className='options-game'>
          
        <iframe
        title={`Game Room ${gameRoomID}`}
        src={`http://127.0.0.1:5500/index.html?id=${gameRoomID}&${authToken}`}
        width="800"
        height="600"
        frameBorder="0"
        allowFullScreen
      ></iframe>
       
        </div>
      </div>
    </div>
    </>
  );
}

export default PlayGame;

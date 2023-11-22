import React from 'react';
import '../Account/Stuff.css';

function PlayGame({ changeState, gameRoomID }) {
  return (
    <>
      <h1>game room id: {gameRoomID}</h1>
      <iframe
        src={`http://127.0.0.1:5500/index.html?id=${gameRoomID}`}
        width="600"
        height="400"
        frameBorder="0"
        allowFullScreen
      ></iframe>
    </>
  );
}

export default PlayGame;

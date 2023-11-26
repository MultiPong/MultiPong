
import React, { useState } from 'react';
import './Stuff.css'
/*import GameLobby from './GameLobby.jsx';*/

function GameCreation({changeState}) {
  

  
  const [numPlayers, setNumPlayers] = useState(2)
  const [ballSpeed, setBallSpeed] = useState(1.5)
  return (
    <div className="home-container">
      <div className='Game-Creation-box'>
      <h1>MULTIPONG</h1>
        <div className='inner-Game-Creation-box'>
          <div className="j-box">
            <input
                type="range"
                min={2}
                max={8}
                step={1}
                value={numPlayers}
                onChange={event => {
                  setNumPlayers(event.target.valueAsNumber)
                }}
              />
              <p>Number of players: {numPlayers.toFixed(0)}</p>

              <input
                type="range"
                min={1.5}
                max={3}
                step={0.5}
                value={ballSpeed}
                onChange={event => {
                  setBallSpeed(event.target.valueAsNumber)
                }}
              />
              <p>Ball Speed: {ballSpeed.toFixed(1)}</p>
              <button className="create-game-button">
                CREATE GAME
              </button>
          </div>
          <div className='stuff-box'>
            <div className="j-box">
                <div className="j-input-container">
                    <input className='j-input' type="text" placeholder="Enter Code" />
                </div>
                
                <button className="join-game-button">
                  JOIN GAME
                </button>
                <div>
                  <button className="back-button">
                    Back
                  </button>
                </div>
            </div>
          </div>
        </div>
        
        
      </div>
    </div>
  );
}
export default GameCreation;
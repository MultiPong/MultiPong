import React, { useState } from 'react';
import '../../CSS/Game.css'
import ParticlesBg from 'particles-bg';

function CreateGame({ authToken, changeState, changeGameRoomIDApp, setMatchID }) {
  const [gameCodeTextbox, setGameCodeTextbox] = useState('');
  const [error, setError] = useState('');

  const CreateGameID = async () => {
    try {
      const response = await fetch('http://localhost:8000/create_game_room/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      changeGameRoomIDApp(data.game_room_id);
      console.log('1', data.game_room_id);
    } catch (err) {
      console.error(`Error here is ${err}`);
    }
  };
  const getRecentGame = async () => {
    fetch('http://localhost:8000/user_match_history/', {
      method: 'GET',
      headers: {
          'Authorization': `Token ${authToken}`,
      },
  })
      .then(response => response.json())
      .then(data => {
          if(data && data[0]){
            setMatchID(data[0].match.matchID)
            changeState('Leaderboard')
          } else {
            setError('No Recent Games Found')
          }
      })
      .catch(err => {
          console.error(`Error here is ${err}`);
      });
  };

  const handleGameCodeInput = (event) => {
    setGameCodeTextbox(event.target.value);
  };

  const handleGameCreation = async () => {
    await CreateGameID();
    changeState('PlayGame');
  };

  return (
    <div style={{ position: 'relative', borderRadius: '25px' }} className="home-container">
      <div style={{zIndex: 1}} className='particlesBgstyles'>
        <ParticlesBg color="lime" num={100} type="square"/>
      </div>
      <div style={{ zIndex: 1, position: 'absolute' }} className='Game-Creation-box'>
        <div style={{ marginTop: '50px' }}>
          <h1>Create a Multipong Game</h1>
        </div>
        <div className='options-game'>
          <div className='inner-box-game-creation'>
            <div className="j-box">
              <button style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => handleGameCreation()} className="create-game-button">
                Create Game
              </button>
              <button style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => getRecentGame()} className="create-game-button">
                View Recent Game
              </button>
            </div>
          </div>

          <div className='inner-box-game-creation'>
            <div className="j-box">
              <button
                onClick={() => {
                  if (gameCodeTextbox) {
                    changeGameRoomIDApp(gameCodeTextbox);
                    changeState('PlayGame');
                  } else if (!gameCodeTextbox) {
                    setError('Enter the game code to join the game');
                  }
                }}
                className="create-game-button"
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              >
                Join Game
              </button>
              <input
                onChange={handleGameCodeInput}
                value={gameCodeTextbox}
                className='j-input'
                type="text"
                placeholder="Enter Code"
              />
              <p style={{ color: 'red' }}>{error}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CreateGame;
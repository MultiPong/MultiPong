import React, { useState } from 'react';
import '../../CSS/Game.css'
import ParticlesBg from 'particles-bg';
import { motion } from 'framer-motion';

const REACT_APP_CREATE_GAME_ROOM = process.env.REACT_APP_CREATE_GAME_ROOM;
const REACT_APP_USER_MATCH_HISTORY = process.env.REACT_APP_USER_MATCH_HISTORY;

function CreateGame({ authToken, changeState, changeGameRoomIDApp, setMatchID }) {
  const [gameCodeTextbox, setGameCodeTextbox] = useState('');
  const [error, setError] = useState('');
  const [error2, setError2] = useState('');

  const CreateGameID = async () => {
    try {
      const response = await fetch(REACT_APP_CREATE_GAME_ROOM, {
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
    fetch(REACT_APP_USER_MATCH_HISTORY, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${authToken}`,
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data && data[0]) {
          setMatchID(data[0].match.matchID)
          changeState('Leaderboard')
        } else {
          setError('No Recent Game Found')
          setError2('')
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
    <motion.div style={{ position: 'relative', borderRadius: '25px' }} className="home-container-Play" initial={{ x: 1200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }}>
      <div style={{ zIndex: 1 }} className='particlesBgstyles'>
        <ParticlesBg color="lime" num={25} type="square" />
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
              <p style={{ color: 'red' }}>{error}</p>
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
                    setError2('Enter the game code to join the game');
                    setError('')
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
              <p style={{ color: 'red' }}>{error2}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
export default CreateGame;
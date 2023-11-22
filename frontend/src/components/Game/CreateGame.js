
import React, { useEffect, useState } from 'react';
import '../Account/Stuff.css'

function CreateGame({ changeState, changeGameRoomIDApp }) {
  const [gameCodeTextbox, setGameCodeTextbox] = useState('')
  const [error, setError] = useState('')


  const CreateGameID = async () => {
    try {
      const response = await fetch('http://localhost:8000/create_game_room/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(data => {
          changeGameRoomIDApp(data.game_room_id)
          console.log('1', data.game_room_id)
        })
    } catch (err) {
      console.error(`Error here is ${err}`);
    }
  };

  const handleGameCodeInput = (event) => {
    setGameCodeTextbox(event.target.value)
  }

  const handleGameCreation = async () => {
    await CreateGameID()
    changeState('PlayGame')
  }
  return (
    <div className="home-container">
      <div className='Game-Creation-box'>
        <h1>MULTIPONG</h1>
        <div className='inner-Game-Creation-box'>
          <button onClick={() => handleGameCreation()} className="create-game-button">
            Create Game
          </button>
          <div className="j-box">
            <button onClick={() => {
              if (gameCodeTextbox) {
                changeGameRoomIDApp(gameCodeTextbox)
                changeState('PlayGame')
              }
              else if (!gameCodeTextbox) {
                setError('Enter the game code to join the game')
              }
            }} className="create-game-button">
              Join Game
            </button>
            <input onChange={handleGameCodeInput} value={gameCodeTextbox} className='j-input' type="text" placeholder="Enter Code" />
            <p style={{ color: 'red' }}>{error}</p>
          </div>

        </div>
      </div>
    </div >
  );
}
export default CreateGame;

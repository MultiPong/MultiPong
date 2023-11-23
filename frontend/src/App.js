import React, { useState } from 'react';
import './CSS/App.css'
import SignIn from './components/Account/Sign In & out/SignIn.js'
import SignUp from './components/Account/Sign In & out/SignUp.js';
import Home from './components/Account/Sign In & out/Home.js';
import MatchHistory from './components/Game/MatchHistory.js';
import UserProfile from './components/Account/Profile/UserProfile.js';
import CreateGame from './components/Game/CreateGame.js';
import Navbar from './components/Account/Navbar/Navbar.js'
import Leaderboard from './components/Game/Leaderboard.js';
import PlayGame from './components/Game/PlayGame.js';

function App() {
  const [currentState, setCurrentState] = useState('home');
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'))
  const [usernameOfToken, setUsernameOfToken] = useState('')
  const [matchID, setMatchID] = useState('')
  const [gameRoomID, setGameRoomID] = useState('')

  const changeState = (newState) => {
    setCurrentState(newState);
  };

  const changeTokenState = (tokenState, token, username) => {
    if (tokenState === 'setToken') {
      localStorage.setItem('authToken', token)
      setAuthToken(localStorage.getItem('authToken'))
      setUsernameOfToken(username)
    }

    else if (tokenState === 'removeToken') {
      localStorage.removeItem('authToken')
      setAuthToken(false)
      setUsernameOfToken('')
    }
    else if (tokenState === 'usernameOnly') {
      setUsernameOfToken(username)
    }

  }

  const changeGameRoomIDApp = (id) => {
    setGameRoomID(id)
  }
  return (
    <div className='AppContainer'>
      {currentState === 'home' && <Home changeGameRoomIDApp={changeGameRoomIDApp} changeTokenState={changeTokenState} authToken={authToken} changeState={changeState} />}
      {authToken ?
        (
          <>
            {currentState === 'home'
              ? ''
              : <Navbar style={{ paddingBot: '50px' }} currentUsername={usernameOfToken} changeTokenState={changeTokenState} authToken={authToken} changeState={changeState} />
            }
            {currentState === 'PlayGame' && <PlayGame gameRoomID={gameRoomID} authToken={authToken} changeState={changeState} />}
            {currentState === 'CreateGame' && <CreateGame authToken={authToken} setMatchID={setMatchID} gameRoomIDApp={gameRoomID} changeGameRoomIDApp={changeGameRoomIDApp} changeState={changeState} />}
            {currentState === 'matchHistory' && <MatchHistory  setMatchID={setMatchID} authToken={authToken} changeState={changeState} />}
            {currentState === 'Leaderboard' && <Leaderboard SignedInUsername={usernameOfToken} match_ID={matchID} changeState={changeState} />}
            {currentState === 'UserProfile' && <UserProfile setUsernameOfToken={setUsernameOfToken} authToken={authToken} changeState={changeState} />}
            
          </>
        ) : (
          <>
            {currentState === 'signIn' && <SignIn changeTokenState={changeTokenState} changeState={changeState} />}
            {currentState === 'signUp' && <SignUp changeTokenState={changeTokenState} changeState={changeState} />}
          </>
        )}
    </div>
  );
}

export default App;
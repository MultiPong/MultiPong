import React, { useState } from 'react';
import './App.css';
import ChangePassword from './components/Account/ChangePassword.js';
import SignIn from './components/Account/SignIn.js';
import SignUp from './components/Account/SignUp.js';
import UpdateProfile from './components/Account/UpdateProfile.js';
import Home from './components/Game/Home.js';
import MatchHistory from './components/Game/MatchHistory.js';
import UserProfile from './components/Account/UserProfile.js';
import CreateGame from './components/Game/CreateGame.js';
import Navbar from './components/Account/Navbar.js'
import Leaderboard from './components/Game/Leaderboard.js';
import PlayGame from './components/Game/PlayGame.js';

function App() {
  const [currentState, setCurrentState] = useState('home');
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'))
  const [usernameOfToken, setUsernameOfToken] = useState('')
  const [ matchID, setMatchID ] = useState('')
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
    else if(tokenState === 'usernameOnly'){
      setUsernameOfToken(username)
    }

  }

  const changeGameRoomIDApp = (id) => {
    setGameRoomID(id)
  }
  return (
    <div className='AppContainer'>
      {currentState === 'home' && <Home changeTokenState={changeTokenState} authToken={authToken} changeState={changeState} />}
      {authToken ?
        (
          <>
            {currentState === 'home'
              ? ''
              : <Navbar style={{ paddingBot: '50px' }} currentUsername = {usernameOfToken} changeTokenState={changeTokenState} authToken={authToken} changeState={changeState} />
            }
            {currentState === 'updateProfile' && <UpdateProfile setUsernameOfToken={setUsernameOfToken} authToken={authToken} changeState={changeState} />}
            {currentState === 'changePassword' && <ChangePassword authToken={authToken} changeState={changeState} />}
            {currentState === 'CreateGame' && <CreateGame gameRoomIDApp={gameRoomID} changeGameRoomIDApp={changeGameRoomIDApp} changeState={changeState} />}
            {currentState === 'matchHistory' && <MatchHistory setMatchID={setMatchID} authToken={authToken} changeState={changeState} />}
            {currentState === 'Leaderboard' && <Leaderboard match_ID={matchID} changeState={changeState} />}
            {currentState === 'UserProfile' && <UserProfile authToken={authToken} changeState={changeState} />}
            {currentState === 'PlayGame' && <PlayGame gameRoomID={gameRoomID} authToken={authToken} changeState={changeState} />}
          </>
        ) : (
          <>
            {currentState === 'signIn' && <SignIn changeTokenState={changeTokenState} changeState={changeState} />}
            {currentState === 'signUp' && <SignUp changeTokenState={changeTokenState} changeState={changeState} />}
          </>
        )}


      {/* Temporary buttons at the bottom of the screen for easy navigation, will be removed later on in the project*/}
      <button onClick={() => changeState('navbar')}>Navbar</button>
      <button onClick={() => changeState('signIn')}>Sign In</button>
      <button onClick={() => changeState('signUp')}>Sign Up</button>
      <button onClick={() => changeState('updateProfile')}>Update Profile</button>
      <button onClick={() => changeState('changePassword')}>Change Password</button>
      <button onClick={() => changeState('home')}>Home</button>
      <button onClick={() => changeState('matchHistory')}>Match History</button>
      <button onClick={() => changeState('CreateGame')}>Game Creation</button>
      <button onClick={() => changeState('UserProfile')}>User Profile</button>
    </div>
  );
}

export default App;
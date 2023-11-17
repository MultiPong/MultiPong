import React, { useState } from 'react';
import './App.css';
import ChangePassword from './components/Account/ChangePassword.js';
import SignIn from './components/Account/SignIn.js';
import SignUp from './components/Account/SignUp.js';
import UpdateProfile from './components/Account/UpdateProfile.js';
import Home from './components/Game/Home.js';
import MatchHistory from './components/Game/MatchHistory.js';
import UserProfile from './components/Account/UserProfile.jsx';
import GameCreation from './components/Game/GameCreation.jsx';
import GameLobby from './components/Game/GameLobby.jsx';
import Navbar from './components/Account/Navbar.js'

function App() {
  const [currentState, setCurrentState] = useState('home');
  const [currentUser, setCurrentUser] = useState('')
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'))

  const changeState = (newState) => {
    setCurrentState(newState);
  };

  const changeCurrentUser = (signedInUser) => {
    setCurrentUser(signedInUser);
  };

  const changeTokenState = (tokenState, token) => {
    if (tokenState === 'setToken') {
      localStorage.setItem('authToken', token)
      setAuthToken(localStorage.getItem('authToken'))
    }

    else if (tokenState === 'removeToken') {
      localStorage.removeItem('authToken')
      setAuthToken(false)
    }

  }

  return (
    <div className='AppContainer'>
      {currentState === 'home' && <Home changeTokenState={changeTokenState} authToken={authToken} changeState={changeState} />}
      {authToken ?
        (
          <>
            {currentState === 'home'
              ? ''
              : <Navbar style={{ paddingBot: '50px' }} changeTokenState={changeTokenState} authToken={authToken} currentUser={currentUser} changeState={changeState} />
            }
            {currentState === 'updateProfile' && <UpdateProfile authToken={authToken} changeState={changeState} />}
            {currentState === 'changePassword' && <ChangePassword authToken={authToken} changeState={changeState} />}
            {currentState === 'matchHistory' && <MatchHistory authToken={authToken} changeState={changeState} />}
            {currentState === 'GameCreation' && <GameCreation changeState={changeState} />}
            {currentState === 'GameLobby' && <GameLobby changeState={changeState} />}
            {currentState === 'UserProfile' && <UserProfile authToken={authToken} changeState={changeState} />}
          </>
        ) : (
          <>
            {currentState === 'signIn' && <SignIn changeTokenState={changeTokenState} changeCurrentUser={changeCurrentUser} changeState={changeState} />}
            {currentState === 'signUp' && <SignUp changeTokenState={changeTokenState} changeCurrentUser={changeCurrentUser} changeState={changeState} />}
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
      <button onClick={() => changeState('GameCreation')}>Game Creation</button>
      <button onClick={() => changeState('GameLobby')}>Game Lobby</button>
      <button onClick={() => changeState('UserProfile')}>User Profile</button>
    </div>
  );
}

export default App;
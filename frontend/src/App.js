import React, { useState } from 'react';
import './App.css';
import ChangePassword from './components/ChangePassword.js';
import SignIn from './components/SignIn.js';
import SignUp from './components/SignUp.js';
import UpdateProfile from './components/UpdateProfile.js';
import Home from './components/Home';
import MatchHistory from './components/MatchHistory';

function App() {
  const [currentState, setCurrentState] = useState('signUp');

  const changeState = (newState) => {
    setCurrentState(newState);
  };

  return (
    <div className='AppContainer'>
      {currentState === 'signIn' && <SignIn changeState={changeState}/>}
      {currentState === 'signUp' && <SignUp changeState={changeState}/>}
      {currentState === 'updateProfile' && <UpdateProfile changeState={changeState}/>}
      {currentState === 'changePassword' && <ChangePassword changeState={changeState}/>}
      {currentState === 'home' && <Home changeState={changeState}/>}
      {currentState === 'matchHistory' && <MatchHistory changeState={changeState}/>}
      


      {/* Temporary buttons at the bottom of the screen for easy navigation, will be removed later on in the project*/}
      <button onClick={() => changeState('signIn')}>Sign In</button>
      <button onClick={() => changeState('signUp')}>Sign Up</button>
      <button onClick={() => changeState('updateProfile')}>Update Profile</button>
      <button onClick={() => changeState('changePassword')}>Change Password</button>
      <button onClick={() => changeState('home')}>Home</button>
      <button onClick={() => changeState('matchHistory')}>Match History</button>
    </div>
  );
}

export default App;

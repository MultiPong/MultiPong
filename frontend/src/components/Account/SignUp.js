import React, { useState } from 'react';
import './forms.css';

function SignUp({ changeState, changeCurrentUser, changeTokenState }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  function handleUsernameChange(event) {
    setUsername(event.target.value);
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function handleConfirmPasswordChange(event) {
    setConfirmPassword(event.target.value);
  }

  function handleSignUp() {
    if (password === confirmPassword) {
      signup(username, email, password);
    } else {
      console.error("Passwords do not match");
    }
  }

  function signup(username, email, password) {
    return fetch('http://127.0.0.1:8000/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',

      },
      body: JSON.stringify({ username, email, password }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          changeTokenState('setToken', data.token)
          changeCurrentUser('Joe')
          // changeCurrentUser(data.username)
          changeState('GameCreation')
        }


        return data;
      })
      .catch(error => {
        console.error('Signup failed:', error);
      });
  }

  return (
    <div className="login-box">
      <div className="box">
        <h1 className='h1' style={{ fontSize: '27px' }}>Create Your Account🚀</h1>
        <div className="input-container">
          <input
            className='input'
            type="text"
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div className="input-container">
          <input
            className='input'
            type="text"
            placeholder="Email"
            value={email}
            onChange={handleEmailChange}
          />
        </div>
        <div className="input-container">
          <input
            className='input'
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <div className="input-container">
          <input
            className='input'
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />
        </div>
        <button className="login-button" onClick={handleSignUp}>
          Sign up
        </button>
        <div style={{ marginBottom: '10px' }}>
          Already have an account?&nbsp;
          <div style={{ display: 'inline-block' }}>Sign In&nbsp;</div>
          <div style={{ display: 'inline-block', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => changeState('signIn')} className='a'>here</div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;

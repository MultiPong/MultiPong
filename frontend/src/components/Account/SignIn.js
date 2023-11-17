import React, { useState } from 'react';
import './forms.css';

function SignIn({ changeState, changeCurrentUser, changeTokenState }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleUsernameChange(event) {
    setUsername(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function handleLogin() {
    login(username, password);
  }

  function login(username, password) {
    return fetch('http://127.0.0.1:8000/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
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
      });
  }

  return (
    <div className="login-box">
      <div className="box">
        <h1 className='h1'>Welcome back 👋</h1>
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
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <button className="login-button" onClick={handleLogin}>
          Login
        </button>
        <div style={{marginBottom: '10px'}}>
          Don't have an account?&nbsp;
            <div style={{ display: 'inline-block' }}>Sign up&nbsp;</div>
            <div style={{ display: 'inline-block', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => changeState('signUp')} className='a'>here</div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;

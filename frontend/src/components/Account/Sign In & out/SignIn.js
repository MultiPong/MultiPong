import React, { useState } from 'react';
import '../../../CSS/Forms.css'

function SignIn({ changeState, changeTokenState }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  function handleUsernameChange(event) {
    setUsername(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function handleLogin() {
    if (username && !password) {
      setPasswordError('Please enter your password.')
      setUsernameError('')
      setError('')
    }
    else if (password && !username) {
      setUsernameError('Please enter your username.')
      setPasswordError('')
      setError('')
    }
    else if (!username && !password) {
      setUsernameError('')
      setPasswordError('')
      setError('Enter your username and password.')
    }
    else {
      setUsernameError('')
      setPasswordError('')
      setError('')
      login(username, password);
    }

  }

  function login(username, password) {
    return fetch('http://127.0.0.1:8000/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            console.log(errorData)
            if(errorData.error && errorData.error === "Wrong Credentials"){
              setError('Wrong username or password.')
            }
          })
        }
        else {
          return response.json().then(data => {
            if (data.token && data.username) {
              changeTokenState('setToken', data.token, data.username)
              changeState('CreateGame')
            }
          })
        }
      })
      .catch(error => {
        console.error('Signin failed:', error);
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
        <p style={{ color: 'red' }}>{usernameError}</p>
        <p style={{ color: 'red' }}>{passwordError}</p>
        <p style={{ color: 'red' }}>{error}</p>
        <button className="login-button" onClick={handleLogin}>
          Login
        </button>

        <div style={{ marginBottom: '10px' }}>
          Don't have an account?&nbsp;
          <div style={{ display: 'inline-block' }}>Sign up&nbsp;</div>
          <div style={{ display: 'inline-block', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => changeState('signUp')} className='a'>here</div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
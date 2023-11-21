import React, { useState } from 'react';
import './forms.css';

function SignUp({ changeState, changeTokenState }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

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
    if (!username || !email || !password || !confirmPassword) {
      setError('Cannot register, all fields must be filled.')
      setPasswordError('')
      setUsernameError('')
      setEmailError('')
    }
    else if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.")
      setError('')
      setUsernameError('')
      setEmailError('')
    } else {
      signup(username, email, password);
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
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            console.log(errorData)
            const isEmailInvalid = errorData.email && errorData.email[0] === 'Enter a valid email address.'
            const isExisitingEmail = errorData.email && errorData.email[0] === 'user with this email already exists.'
            const isExistingUsername = errorData.username && errorData.username[0] === 'user with this username already exists.'
            console.log(isEmailInvalid, isExisitingEmail, isExistingUsername)
            if (isEmailInvalid) {
              setEmailError('Enter a valid email.')
              setError('')
              setPasswordError('')
              setUsernameError('')
            } else {
              if (isExisitingEmail && (!isExistingUsername || isExistingUsername === undefined)) {
                setEmailError('Email already exists.')
                setError('')
                setPasswordError('')
                setUsernameError('')
              }
              else if (isExistingUsername && (!isExisitingEmail || isExisitingEmail === undefined)) {
                setUsernameError('Username already exists.')
                setError('')
                setPasswordError('')
                setEmailError('')
              }
              else if (isExisitingEmail && isExistingUsername) {
                setUsernameError('Username already exists.')
                setEmailError('Email already exists.')
                setError('')
                setPasswordError('')
              }
            }

          })
        }
        else {
          return response.json().then(data => {
            if (data.token && data.username) {
              changeTokenState('setToken', data.token, data.username)
              changeState('GameCreation')
            }
          })
        }
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
        <p style={{ color: 'red' }}>{usernameError}</p>
        <p style={{ color: 'red' }}>{emailError}</p>
        <p style={{ color: 'red' }}>{passwordError}</p>
        <p style={{ color: 'red' }}>{error}</p>
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
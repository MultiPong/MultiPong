import React, { useState } from 'react';
import '../../../CSS/Forms.css'

const REACT_APP_EDIT_PROFILE = process.env.REACT_APP_EDIT_PROFILE;

function UpdateProfile({ changeState, authToken, setUsernameOfToken, fetchedUsername, fetchedEmail }) {
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')

  function handleUsernameChange(event) {
    setUsername(event.target.value);
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  async function handleUpdateProfile() {
    if (!username && !email) {
      setError('Enter your new username or email.')
      setEmailError('')
      setUsernameError('')
    } else {
      try {
        if (await updateProfile(username || fetchedUsername, email || fetchedEmail) === 'success') {
          setUsernameOfToken(username || fetchedUsername);
          setError('Profile Updated Successfully');
          setEmailError('');
          setUsernameError('');
        };

      } catch (error) {
        console.error('Profile update failed:', error);
      }
    }
  }

  const updateProfile = (username, email) => {
    return fetch(REACT_APP_EDIT_PROFILE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`
      },
      body: JSON.stringify({ username, email }),
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            console.log(errorData)
            const isEmailInvalid = errorData.email && errorData.email[0] === 'Enter a valid email address.'
            const isExisitingEmail = errorData.email && errorData.email[0] === 'user with this email already exists.'
            const isExistingUsername = errorData.username && errorData.username[0] === 'user with this username already exists.'

            if (isEmailInvalid) {
              setEmailError('Enter a valid email.')
              setError('')
              setUsernameError('')
            } else {
              if (isExisitingEmail && (!isExistingUsername || isExistingUsername === undefined)) {
                setEmailError('Email already exists.')
                setError('')
                setUsernameError('')
              }
              else if (isExistingUsername && (!isExisitingEmail || isExisitingEmail === undefined)) {
                setUsernameError('Username already exists.')
                setError('')
                setEmailError('')
              }
              else if (isExisitingEmail && isExistingUsername) {
                setUsernameError('')
                setEmailError('')
                setError('Both username and email already exist.')
              }
            }

          })
        } else {
          return response.json().then(data => {
            if (data.message && data.message === 'Profile successfully updated') {
              return 'success'
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
      <div className="box profiles">
        <h1 className='h1' style={{ fontSize: '29px' }}>Update Your Profile</h1>
        <div className="input-container">
          <input
            className='input placeholder-style-update-profile'
            type="text"
            placeholder={`Username: ${fetchedUsername}`}
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div style={{ marginBottom: '30px' }} className="input-container">
          <input
            className='input placeholder-style-update-profile'
            type="text"
            placeholder={`Email: ${fetchedEmail}`}
            value={email}
            onChange={handleEmailChange}
          />
        </div>
        
        <p style={{ color: 'red' }}>{usernameError}</p>
        <p style={{ color: 'red' }}>{emailError}</p>
        {error === 'Profile Updated Successfully' ?
          <p style={{ color: 'green' }}>{error}</p> :
          <p style={{ color: 'red' }}>{error}</p>
        }

        <button className="login-button" onClick={handleUpdateProfile}>
          Update
        </button>
      </div>
    </div>
  );
}

export default UpdateProfile;

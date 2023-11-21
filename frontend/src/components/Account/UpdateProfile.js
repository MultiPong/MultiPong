import React, { useEffect, useState } from 'react';
import './forms.css';

function UpdateProfile({ changeState, authToken, setUsernameOfToken }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const [fetchedUsername, setFetchedUsername] = useState('');
  const [fetchedEmail, setFetchedEmail] = useState('');
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [usernameError, setUsernameError] = useState('')

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
        await getUserInfo();
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


  const getUserInfo = () => {
    fetch('http://127.0.0.1:8000/get_account_info/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`
      },
    })
      .then(response => response.json())
      .then(userInfo => {
        setFetchedUsername(userInfo.username)
        setFetchedEmail(userInfo.email)
      })
  }



  const updateProfile = (username, email) => {
    return fetch('http://127.0.0.1:8000/edit_profile/', {
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
      <div className="box">
        <h1 className='h1' style={{ fontSize: '29px' }}>Update Your Profile</h1>
        <div className="input-container">
          <input
            className='input'
            type="text"
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div style={{ marginBottom: '30px' }} className="input-container">
          <input
            className='input'
            type="text"
            placeholder="Email"
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
        <div onClick={() => changeState('changePassword')} style={{ marginBottom: '10px' }}>
          Change your password?&nbsp;
          <div style={{ display: 'inline-block' }}>Click&nbsp;</div>
          <div style={{ display: 'inline-block', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => changeState('signUp')} className='a'>here</div>
        </div>
      </div>
    </div>
  );
}

export default UpdateProfile;

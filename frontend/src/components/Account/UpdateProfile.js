import React, { useState } from 'react';
import './forms.css';

function UpdateProfile({ changeState, authToken }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  function handleUsernameChange(event) {
    setUsername(event.target.value);
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handleUpdateProfile() {
    updateProfile(username, email);
  }

  function updateProfile(username, email) {
    return fetch('http://127.0.0.1:8000/edit_profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`
      },
      body: JSON.stringify({ username, email }),
    })
      .then(response => response.json())
      .then(data => {
        return data;
      })
      .catch(error => {
        console.error('Profile update failed:', error);
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
        <button className="login-button" onClick={handleUpdateProfile}>
          Update
        </button>
        <div style={{marginBottom: '10px'}}>
          Change your password?&nbsp;
            <div style={{ display: 'inline-block' }}>Click&nbsp;</div>
            <div style={{ display: 'inline-block', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => changeState('signUp')} className='a'>here</div>
        </div>
      </div>
    </div>
  );
}

export default UpdateProfile;

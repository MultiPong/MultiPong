import React, { useState } from 'react';
import './forms.css';

function ChangePassword({ changeState, authToken }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  function handleOldPasswordChange(event) {
    setOldPassword(event.target.value);
  }

  function handleNewPasswordChange(event) {
    setNewPassword(event.target.value);
  }

  function handleConfirmPasswordChange(event) {
    setConfirmPassword(event.target.value);
  }

  function handleUpdatePassword() {
    if (newPassword === confirmPassword) {
      updatePassword(oldPassword, newPassword);
    } else {
      console.error("New passwords do not match");
    }
  }

  function updatePassword(oldPassword, newPassword) {
    return fetch('http://127.0.0.1:8000/change_password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`
      },
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    })
      .then(response => response.json())
      .then(data => {
        return data;
      })
      .catch(error => {
        console.error('Password update failed:', error);
      });
  }

  return (
    <div className="login-box">
      <div className="box">
        <h1 className='h1' style={{ fontSize: '25px' }}>Change Your Password</h1>
        <div className="input-container">
          <input
            className='input'
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={handleOldPasswordChange}
          />
        </div>
        <div className="input-container">
          <input
            className='input'
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={handleNewPasswordChange}
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
        <button className="login-button" onClick={handleUpdatePassword}>
          Update
        </button>
        <div style={{marginBottom: '10px'}}>
          Change account details?&nbsp;
            <div style={{ display: 'inline-block' }}>Click&nbsp;</div>
            <div style={{ display: 'inline-block', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => changeState('signUp')} className='a'>here</div>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;

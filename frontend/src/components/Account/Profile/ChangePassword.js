import React, { useState } from 'react';
import '../../../CSS/Forms.css'

const REACT_APP_CHANGE_PASSWORD = process.env.REACT_APP_CHANGE_PASSWORD;

function ChangePassword({ changeState, authToken }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('')

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
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Cannot update, all fields must be filled.')
    }
    else if (oldPassword && newPassword !== confirmPassword) {
      setError('Passwords must match.')
    }
    else if (oldPassword && newPassword === confirmPassword) {
      updatePassword(oldPassword, newPassword);
    } else {
      console.error("New passwords do not match");
    }
  }



  const updatePassword = (oldPassword, newPassword) => {
    return fetch(REACT_APP_CHANGE_PASSWORD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`
      },
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)

        if (data.error && data.error === 'Wrong password') {
          setError('Old password is wrong. Try again')
        }
        else if (data.message && data.message === 'Password successfully updated') {
          setError('Password Updated Successfully')
          console.log(data.message)
        }
      })
      .catch(error => {
        console.error('Password update failed:', error);
      });
  }

  return (
    <div className="login-box">
      <div className="box profiles">
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

        {error === 'Password Updated Successfully' ?
          <p style={{ color: 'green' }}>{error}</p> :
          <p style={{ color: 'red' }}>{error}</p>}
        <button className="login-button" onClick={handleUpdatePassword}>
          Update
        </button>
      </div>
    </div>
  );
}

export default ChangePassword;

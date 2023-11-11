import React from 'react';
import './forms.css'
function ChangePassword({changeState}) {
  return (
    <div className="login-box">
      <div className="box">
        <h1 className='h1' style={{fontSize: '25px'}}>Change Your Password 🔐</h1>
        <div className="input-container">
          <input className='input' type="password" placeholder="Old Password" />
        </div>
        <div className="input-container">
          <input className='input' type="password" placeholder="New Password" />
        </div>
        <div className="input-container">
          <input className='input' type="password" placeholder="Confirm Password" />
        </div>
        <button className="login-button">UPDATE</button>
        <p>Click <a onClick={() => changeState('updateProfile')} className='a' href="#">here</a> to go back</p>
      </div>
    </div>
  );
}

export default ChangePassword;

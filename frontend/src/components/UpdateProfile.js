import React from 'react';
import './forms.css'
function UpdateProfile() {
  return (
    <div className="login-box">
      <div className="box">
        <h1 className='h1' style={{fontSize: '29px'}}>Update Your Profile ✅</h1>
        <div className="input-container">
          <input className='input' type="text" placeholder="Username" />
        </div>
        <div style={{marginBottom: '30px'}}className="input-container">
          <input className='input' type="text" placeholder="Email" />
        </div>
        <button className="login-button">UPDATE</button>
        <p>Click <a className='a' href="#">here</a> to change your password</p>
      </div>
    </div>
  );
}

export default UpdateProfile;

import React from 'react';
import './forms.css'
function LoginBox() {
  return (
    <div className="login-box">
      <div className="box">
        <h1 className='h1' style={{fontSize: '2px'}}>Create Your Account 🚀</h1>
        <div className="input-container">
          <input className='input' type="text" placeholder="Username" />
        </div>
        <div className="input-container">
          <input className='input' type="password" placeholder="Password" />
        </div>
        <button className="login-button">LOGIN</button>
        <p>Don't have an account? <a className='a' href="#">Sign up here</a></p>
      </div>
    </div>
  );
}

export default LoginBox;

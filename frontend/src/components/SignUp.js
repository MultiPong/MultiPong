import React from 'react';
import './forms.css'
function SignUp() {
  return (
    <div className="login-box">
      <div className="box">
        <h1 className='h1' style={{fontSize: '27px'}}>Create Your Account 🚀</h1>
        <div className="input-container">
          <input className='input' type="text" placeholder="Username" />
        </div>
        <div className="input-container">
          <input className='input' type="text" placeholder="Email" />
        </div>
        <div className="input-container">
          <input className='input' type="password" placeholder="Password" />
        </div>
        <div className="input-container">
          <input className='input' type="password" placeholder="Confirm Password" />
        </div>
        <button className="login-button">SIGNUP</button>
        <p>Already have an account? <a className='a' href="#">Login here</a></p>
      </div>
    </div>
  );
}

export default SignUp;

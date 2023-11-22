
import React, { useEffect, useState } from 'react';
import './Stuff.css'
function UserProfile({ changeState, authToken }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [ratio, setRatio] = useState(0)
  const [lastGame, setLastGame] = useState('')


  useEffect(() => {
    fetch('http://127.0.0.1:8000/get_account_info/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${authToken}`
      },
    })
      .then(response => response.json())
      .then(userInfo => {
        console.log(userInfo)
        setUsername(userInfo.username)
        setEmail(userInfo.email)
        setLastGame(userInfo.date)
        setRatio(userInfo.ratio)
      })
  })
  return (
    <div className="home-container">
      <div className="Stuff-box">
        <div className="avatar-image"></div>
        <div>

          <div>USERNAME: {username}</div>
          <div>Email: {email}</div>
          <div>WIN RATIO: {ratio}</div>
          <div>LAST WIN: {lastGame}</div>

          <button className="update-profile-btn">
            Update Profile
          </button>

          <div>
            <button className="back-button">
              Back
            </button>
          </div>


        </div>
      </div>
    </div>
  );
}
export default UserProfile;

import React, { useEffect, useState } from 'react';
import './Stuff.css'
function UserProfile({changeState}) {
const [username, setUsername] = useState(0)
  useEffect(()=> {
  setUsername("Joe")

  },[])
  const [ratio, setRatio] = useState(0)
    useEffect(()=> {
    setRatio(0.54)

  },[])
  const [lastGame, setLastGame] = useState(0)
  useEffect(()=> {
    setLastGame("11/09/2023")

  },[])
  return (
    <div className="home-container">
    <div className="Stuff-box">
    <div className = "avatar-image"></div>
      <div>
        
        <div>USERNAME: {username}</div>
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
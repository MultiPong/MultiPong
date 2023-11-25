import React, { useState, useEffect } from 'react';
import '../../../CSS/Game.css'
import ParticlesBg from 'particles-bg';
import UpdateProfile from './UpdateProfile';
import ChangePassword from './ChangePassword';
import ReadOnlyProfile from './ReadOnlyProfile';
import { motion } from 'framer-motion';

const REACT_APP_GET_ACCOUNT_INFO = process.env.REACT_APP_GET_ACCOUNT_INFO;

function UserProfile({ setUsernameOfToken, authToken, changeState }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [winRatio, setWinRatio] = useState('')
  const [lastwin, setLastWin] = useState('')

  useEffect(() => {
    fetch(REACT_APP_GET_ACCOUNT_INFO, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${authToken}`
        },
    })
        .then(response => response.json())
        .then(userInfo => {
            const date = userInfo.last_win_date ? new Date(userInfo.last_win_date).toLocaleDateString() : 'No games won';
            setLastWin(date);

            const roundedWinRatio = userInfo.win_ratio.toFixed(4);
            setWinRatio(roundedWinRatio);

            setEmail(userInfo.email)
            setUsername(userInfo.username)

        });
}, [authToken]);

  return (
    <motion.div className="home-container" initial={{ x: 1200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }}>
      <div className='particlesBgstylesForUser'>
        <ParticlesBg color="lime" num={5} type="balls" />
      </div>
      <div style={{ zIndex: 1, position: 'absolute' }} className='ProfileMainContainer'>
        <div className='profile-password-container'>
          <ReadOnlyProfile winRatio={winRatio} lastwin={lastwin} authToken={authToken} changeState={changeState} />
          <UpdateProfile fetchedUsername={username} fetchedEmail={email} setUsernameOfToken={setUsernameOfToken} authToken={authToken} changeState={changeState} />
          <ChangePassword authToken={authToken} changeState={changeState} />
        </div>
      </div>
    </motion.div>
  );
  }
export default UserProfile;
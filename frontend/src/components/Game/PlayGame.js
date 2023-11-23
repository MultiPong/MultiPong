import React from 'react';
import '../../CSS/Game.css'
import '../../CSS/Tables.css'
import { motion } from "framer-motion";

function PlayGame({ changeState, authToken, gameRoomID, UsernameOfSignIn }) {
  return (




      <motion.div style={{ position: 'relative' }} className="home-container-Play" initial={{ x: 1200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }}>
        <div style={{}} className='Game-Creation-box-iframe'>
          <div className='GameRoomIDAndName' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }} >
            <h2 style={{ marginLeft: '10px' }}>Playing as: {authToken ? UsernameOfSignIn : 'Guest'}</h2>
            <h2 style={{  marginRight: '10px' }}>Game ID: {gameRoomID}</h2>
          </div>
          <div className='options-game'>

            <iframe
              title={`Game Room ${gameRoomID}`}
              src={`http://127.0.0.1:8001/`}
              // src={`http://127.0.0.1:5500/index.html?id=${gameRoomID}&${authToken}`}
              width="800"
              height="600"
              frameBorder="0"
              allowFullScreen
              style={{borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px'}}
            ></iframe>

          </div>
        </div>
      </motion.div>

  );
}

export default PlayGame;

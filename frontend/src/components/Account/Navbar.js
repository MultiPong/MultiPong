import React, { useState } from 'react';
import Dropdown from './Dropdown';
import './Navbar.css';

const Navbar = ({ changeState, currentUser, changeTokenState, authToken}) => {
    const [activeItem, setActiveItem] = useState('');

    const handleItemClick = (item) => {
        setActiveItem(item);
    };

    return (
        <div className="navbar">
            <div className={`navbar-item ${activeItem === 'GameCreation' ? 'active' : ''}`} onClick={() => { changeState('GameCreation'); handleItemClick('GameCreation'); }}>
                Play
            </div>
            <div className={`navbar-item ${activeItem === 'GameLobby' ? 'active' : ''}`} onClick={() => { changeState('GameLobby'); handleItemClick('GameLobby'); }}>
                Game Lobby
            </div>
            <div className={`navbar-item ${activeItem === 'matchHistory' ? 'active' : ''}`} onClick={() => { changeState('matchHistory'); handleItemClick('matchHistory'); }}>
                Match History
            </div>
            <div className={`navbar-item ${activeItem === 'Dropdown' ? 'active' : ''}`} onClick={() => { handleItemClick(''); }}>
                <Dropdown changeTokenState={changeTokenState} authToken={authToken} changeState={changeState}/>
            </div>
            <div style={{ color: 'white', right: '0px', position: 'absolute' }}>
                {/* <b><u>Signed In as:</u></b><span style={{color: 'lime'}}>&nbsp;&nbsp;&nbsp;{currentUser.username}&nbsp;&nbsp;&nbsp;</span> */}
                <b><u>Signed In as:</u></b><span style={{color: 'lime'}}>&nbsp;&nbsp;&nbsp;{currentUser}&nbsp;&nbsp;&nbsp;</span>
            </div>
        </div>
    );
};

export default Navbar;

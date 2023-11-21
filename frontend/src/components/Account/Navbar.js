import React, { useEffect, useState } from 'react';
import Dropdown from './Dropdown';
import './Navbar.css';

const Navbar = ({ changeState, changeTokenState, authToken, currentUsername }) => {
    const [activeItem, setActiveItem] = useState('');

    const handleItemClick = (item) => {
        setActiveItem(item);
    };

    const [username, setUsername] = useState('')

    useEffect(() => {
        if (!currentUsername) {
            fetch('http://127.0.0.1:8000/get_account_info/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${authToken}`
                },
            })
                .then(response => response.json())
                .then(userInfo => {
                    changeTokenState('usernameOnly', 'sameToken', userInfo.username)
                })
        }
    })

    return (
        <div className="navbar">
            <div className={`navbar-item navbara-and-dropdown-items ${activeItem === 'GameCreation' ? 'active' : ''}`} onClick={() => { changeState('GameCreation'); handleItemClick('GameCreation'); }}>
                Play
            </div>
            <div className={`navbar-item navbara-and-dropdown-items ${activeItem === 'GameLobby' ? 'active' : ''}`} onClick={() => { changeState('GameLobby'); handleItemClick('GameLobby'); }}>
                Game Lobby
            </div>
            <div className={`navbar-item navbara-and-dropdown-items ${activeItem === 'matchHistory' ? 'active' : ''}`} onClick={() => { changeState('matchHistory'); handleItemClick('matchHistory'); }}>
                Match History
            </div>
            <div className={`navbar-item navbara-and-dropdown-items ${activeItem === 'Dropdown' ? 'active' : ''}`} onClick={() => { handleItemClick(''); }}>
                <Dropdown changeTokenState={changeTokenState} authToken={authToken} changeState={changeState} />
            </div>
            <div style={{ color: 'white', right: '0px', position: 'absolute' }}>
                <b><u>Signed In as:</u></b><span style={{ color: 'lime' }}>&nbsp;&nbsp;&nbsp;{currentUsername}&nbsp;&nbsp;&nbsp;</span>
            </div>
        </div>
    );
};

export default Navbar;

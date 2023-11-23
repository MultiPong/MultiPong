import React, { useEffect, useState } from 'react';
import '../../../CSS/Navbar.css'

const Navbar = ({ changeState, changeTokenState, authToken, currentUsername }) => {
    const [activeItem, setActiveItem] = useState('');

    const handleItemClick = (item) => {
        setActiveItem(item);
    };

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

    const logout = () => {
        return fetch('http://127.0.0.1:8000/logout/', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${authToken}`
          },
        })
          .then(response => {
            changeTokenState('removeToken')
            changeState('home')
            return response;
          });
      }

    return (
        <div className="navbar">
            <div className={`navbar-item navbara-and-dropdown-items ${activeItem === 'CreateGame' ? 'active' : ''}`} onClick={() => { changeState('CreateGame'); handleItemClick('CreateGame'); }}>
                Play
            </div>
            <div className={`navbar-item navbara-and-dropdown-items ${activeItem === 'matchHistory' ? 'active' : ''}`} onClick={() => { changeState('matchHistory'); handleItemClick('matchHistory'); }}>
                Match History
            </div>
            <div className={`navbar-item navbara-and-dropdown-items ${activeItem === 'UserProfile' ? 'active' : ''}`} onClick={() => { changeState('UserProfile'); handleItemClick('UserProfile');}}>
                Profile
            </div>
            <div className={`navbar-item navbara-and-dropdown-items ${activeItem === 'Logout' ? 'active' : ''}`} onClick={() => { logout(); handleItemClick('UserProfile');}}>
                Logout
            </div>
            <div style={{ color: 'white', right: '0px', position: 'absolute' }}>
                <b><u>Signed In as:</u></b><span style={{ color: 'lime' }}>&nbsp;&nbsp;&nbsp;{currentUsername}&nbsp;&nbsp;&nbsp;</span>
            </div>
        </div>
    );
};

export default Navbar;

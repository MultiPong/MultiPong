import React, { useEffect, useState } from 'react';
import '../../../CSS/Navbar.css'

const REACT_APP_GET_ACCOUNT_INFO = process.env.REACT_APP_GET_ACCOUNT_INFO;
const REACT_APP_LOGOUT = process.env.REACT_APP_LOGOUT;

const Navbar = ({ changeState, changeTokenState, authToken, currentUsername }) => {
    const [activeItem, setActiveItem] = useState('');

    const handleItemClick = (item) => {
        setActiveItem(item);
    };

    useEffect(() => {
        if (!currentUsername) {
            fetch(REACT_APP_GET_ACCOUNT_INFO, {
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
        return fetch(REACT_APP_LOGOUT, {
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
            {authToken ?
                (
                    <> <div className={`navbar-item navbara-and-dropdown-items ${activeItem === 'CreateGame' ? 'active' : ''}`} onClick={() => { changeState('CreateGame'); handleItemClick('CreateGame'); }}>
                        Play
                    </div>
                        <div className={`navbar-item navbara-and-dropdown-items ${activeItem === 'matchHistory' ? 'active' : ''}`} onClick={() => { changeState('matchHistory'); handleItemClick('matchHistory'); }}>
                            Match History
                        </div>
                        <div className={`navbar-item navbara-and-dropdown-items ${activeItem === 'UserProfile' ? 'active' : ''}`} onClick={() => { changeState('UserProfile'); handleItemClick('UserProfile'); }}>
                            Profile
                        </div>
                        <div className={`navbar-item navbara-and-dropdown-items ${activeItem === 'Logout' ? 'active' : ''}`} onClick={() => { logout(); handleItemClick('UserProfile'); }}>
                            Logout
                        </div>
                        <div style={{ color: 'white', right: '0px', position: 'absolute' }}>
                            <b><u>Signed In as:</u></b><span style={{ color: 'lime' }}>&nbsp;&nbsp;&nbsp;{currentUsername}&nbsp;&nbsp;&nbsp;</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={`navbar-item navbara-and-dropdown-items ${activeItem === 'home' ? 'active' : ''}`} onClick={() => { changeState('home'); handleItemClick('home'); }}>
                            Home
                        </div>
                        <div className={`navbar-item navbara-and-dropdown-items ${activeItem === 'matchHistory' ? 'active' : ''}`}>
                            Match History &nbsp;(Sign In Required)
                        </div>
                        <div className={`navbar-item navbara-and-dropdown-items ${activeItem === 'signIn' ? 'active' : ''}`} onClick={() => { changeState('signIn'); handleItemClick('signIn'); }}>
                            Sign In
                        </div>
                        <div className={`navbar-item navbara-and-dropdown-items ${activeItem === 'signUp' ? 'active' : ''}`} onClick={() => { changeState('signUp'); handleItemClick('signUp'); }}>
                            Sign Up
                        </div>
                    </>
                )}

        </div>
    );
};

export default Navbar;

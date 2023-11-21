import React, { useState, useEffect, useRef } from 'react';

const Dropdown = ({ changeState, changeTokenState, authToken }) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  const dropdownRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownVisible(false);
    }
  };

  function logout() {
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

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={`dropdown ${isDropdownVisible ? 'active' : ''}`}>
      <button className="button navbara-and-dropdown-items" onClick={toggleDropdown}>
        Account
      </button>
      <div className="menu">
        <div className='navbara-and-dropdown-items' style={{ marginBottom: '10px' }} onClick={() => { changeState('UserProfile') }}>
          View Profile
        </div>
        <div className='navbara-and-dropdown-items' style={{ marginBottom: '10px' }} onClick={() => { changeState('updateProfile') }}>
          Update Profile
        </div>
        <div className='navbara-and-dropdown-items' style={{ marginBottom: '10px' }} onClick={() => { changeState('changePassword') }}>
          Change Password
        </div>
        <div className='navbara-and-dropdown-items' style={{ marginBottom: '5px' }} onClick={() => logout()}>
          Logout
        </div>
      </div>
    </div>
  );
};

export default Dropdown;

import React, { useEffect, useState } from 'react';
import '../../../CSS/Forms.css'

const REACT_APP_GET_ACCOUNT_INFO = process.env.REACT_APP_GET_ACCOUNT_INFO;
function ReadOnlyProfile({ authToken }) {
    const [lastWinDate, setFetchedLastWinDate] = useState('');
    const [winRatio, setFetchedWinRatio] = useState('');

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
                setFetchedLastWinDate(date);

                const roundedWinRatio = userInfo.win_ratio.toFixed(4);
                setFetchedWinRatio(roundedWinRatio);
            });
    }, [authToken]);

    return (
        <div className="login-box">
            <div className="box profiles">
                <h1 className='h1' style={{ fontSize: '29px' }}>View Only</h1>
                <div className="input-container">
                    <input
                        className='input '
                        type="text"
                        placeholder="Username"
                        value={`Win Ratio: ${winRatio}`}
                        style={{backgroundColor: '#39df86', fontSize: '16px'}}
                        readOnly
                    />
                </div>
                <div style={{ marginBottom: '30px' }} className="input-container">
                    <input
                        className='input'
                        type="text"
                        placeholder="lastwin"
                        value={`Last Win: ${lastWinDate}`}
                        style={{backgroundColor: '#39df86', fontSize: '16px'}}
                        readOnly
                    />
                </div>
            </div>
        </div>
    );
}

export default ReadOnlyProfile;

import '../../CSS/Tables.css'
import { motion } from "framer-motion";
import { FaArrowCircleRight } from "react-icons/fa";
import { useState, useEffect } from "react";

const REACT_APP_USER_MATCH_HISTORY = process.env.REACT_APP_USER_MATCH_HISTORY;

const MatchHistory = ({ setMatchID, authToken, changeState }) => {
    const [matchHistoryData, setMatchHistoryData] = useState(null)
    useEffect(() => {
        fetch(REACT_APP_USER_MATCH_HISTORY, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${authToken}`,
            },
        })
            .then(response => response.json())
            .then(data => {
                setMatchHistoryData(data.reverse());
            })
            .catch(err => {
                console.error(`Error here is ${err}`);
            });
    }, [authToken]);

    const extractDate = (startTime) => {
        const date = new Date(startTime);
        const formattedDate = new Intl.DateTimeFormat('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
        }).format(date);

        return formattedDate;
    };

    return (
        <>
            <div className="match-history-container">
                <motion.h1 className="game-history-title" initial={{ x: -1200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }}>Match History</motion.h1>
                <div className="scrollable-container">
                    <motion.table className="card-container" initial={{ x: 1200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }}>
                        <thead>
                            <tr className="header-container">
                                <th className="game-date-title">Date</th>
                                <th className="game-result-title">Result</th>
                                <th className="game-id-title">Time Alive</th>
                                <th className="game-result-title">Players</th>
                                <th className="game-id-title">Match Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matchHistoryData && matchHistoryData.map((gameData) => (
                                <tr key={gameData.match.matchID} className="game-overview">
                                    <td style={{ margin: 'auto', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }} className="gamedate">{extractDate(gameData.match.startTime)}</td>
                                    <td style={{ margin: 'auto', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }} className="result">
                                        {gameData.placement === '1st' ? `${gameData.placement} 🥇` : gameData.placement}
                                    </td>
                                    <td style={{ margin: 'auto', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }} className="gamedate">{gameData.timeAlive}</td>
                                    <td style={{ margin: 'auto', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }} className='player-tag'>{gameData.num_players}</td>
                                    <td style={{ margin: 'auto', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }} onClick={() => { setMatchID(gameData.match.matchID); changeState('Leaderboard'); }}>
                                        <div className='MatchDetailsMH' style={{position: 'relative'}}>
                                            <span class='MatchDetailsSpan'>Match Details</span>
                                            <span class='MatchDetailsSpanArrow'><FaArrowCircleRight /></span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </motion.table>
                </div>
            </div>
        </>
    );
}


export default MatchHistory;


import './ashik.css'
import { motion } from "framer-motion";
import { FaArrowCircleLeft } from "react-icons/fa";
import { useState, useEffect } from "react";

const Leaderboard = ({ changeState, match_ID }) => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [gameData, setGameData] = useState('')
    const [dateOfGame, setDateOfGame] = useState('')

    const extractDate = (startTime) => {
        const date = new Date(startTime);
        const formattedDate = new Intl.DateTimeFormat('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
        }).format(date);

        return formattedDate ? formattedDate : '';
    };

    useEffect(() => {
        fetch(`http://localhost:8000/match/${match_ID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                setLeaderboardData(data.leaderboard);
                setGameData(data)
                setDateOfGame(extractDate(data.startTime))
            })
            .catch(err => {
                console.error(`Error here is ${err}`);
            });
    }, [match_ID]);



    return (
        <>
            <div className="leaderboard-container">
                <motion.h1 className="game-history-title" initial={{ x: -1200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }}>Leaderboard</motion.h1>
                <motion.table className="card-container" initial={{ x: 1200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }}>
                    <thead>
                        <div
                            onClick={() => changeState('matchHistory')}
                            style={{ cursor: 'pointer', marginBottom: '10px', color: 'green' }}
                        >
                            <FaArrowCircleLeft style={{ fontSize: '18px', paddingLeft: '16px' }} /> Match History
                        </div>
                        <span style={{ paddingLeft: '26px' }}>Date: {dateOfGame}</span>
                        <tr className="header-container">
                            <th className="game-result-title">Username</th>
                            <th className="game-result-title">Time Alive</th>
                            <th className="game-id-title">Placement</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboardData.map((gameData) => (
                            <tr key={gameData.username} className="game-overview">
                                <td style={{ margin: 'auto', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }} className="gamedate">{gameData.username}</td>
                                <td style={{ margin: 'auto', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }} className="gamedate">{gameData.timeAlive}</td>
                                <td style={{ margin: 'auto', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }} className="result">
                                    {gameData.placement}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </motion.table>
            </div>
        </>
    );
}

export default Leaderboard;

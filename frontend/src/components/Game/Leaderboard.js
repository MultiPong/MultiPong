import '../../CSS/Tables.css'
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import { useState, useEffect } from "react";

const REACT_APP_MATCH = process.env.REACT_APP_MATCH;
const Leaderboard = ({ changeState, match_ID, SignedInUsername }) => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [dateOfGame, setDateOfGame] = useState('')
    const [timeOfGame, setTimeOfGame] = useState('')

    const formatDate = (startTime) => {
        const date = new Date(startTime);

        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        return date.toLocaleString('en-CA', options);
    };

    const formatTime = (startTime) => {
        const date = new Date(startTime);

        const options = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short'
        };
        return date.toLocaleString('en-CA', options);
    };



    useEffect(() => {
        fetch(`${REACT_APP_MATCH}${match_ID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                setLeaderboardData(data.leaderboard);
                setDateOfGame(formatDate(data.startTime))
                setTimeOfGame(formatTime(data.startTime))
            })
            .catch(err => {
                console.error(`Error here is ${err}`);
            });
    }, [match_ID]);



    return (
        <>
            <div className="leaderboard-container">


                <motion.h1 className="game-history-title" initial={{ x: -1200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }}>Leaderboard</motion.h1>
                <motion.div initial={{ x: 1200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }}>
                    <div className='scrollable-container-LB' style={{ backgroundColor: 'white', borderRadius: '2em', }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '15px', paddingLeft: '6px', fontSize: '18px' }}>
                            <div className='LeftEnd' style={{ paddingLeft: '30px', marginRight: 'auto' }}>
                                <span style={{ paddingBottom: '3px', color: 'red', display: 'flex' }}>Date:&nbsp;<span style={{ color: 'black' }}>{dateOfGame}</span></span>
                                <span style={{ color: 'red' }}>Time:&nbsp;<span style={{ color: 'black' }}>{timeOfGame}</span></span>
                            </div>
                            <div onClick={() => changeState('matchHistory')} style={{position: 'relative', display: 'flex', cursor: 'pointer'}}>
                                <div style={{ position: 'absolute' ,right: '50px', color: "#3edd8e" }}>Match<span style={{color :'white'}}>.</span>History</div>
                                <FaArrowRight style={{ position: 'absolute' ,top: '4.5px', right: '25px', color: "#3edd8e" }} />
                            </div>

                            {/* <div className='' style={{ position: "relative", right: "20", fontSize: "18px", color: "#3edd8e" }}>Toggle &nbsp;&nbsp;</div><div style={{ position: "relative", right: "0", fontSize: "18px", top: '0', color: "#3edd8e" }}></div> */}


                        </div>


                        <table className="card-container-LB">
                            <thead>
                                <div
                                    onClick={() => changeState('matchHistory')}
                                    style={{ cursor: 'pointer', marginBottom: '10px', color: 'green', display: 'flex', justifyContent: 'space-between' }}
                                >
                                </div>
                                <tr className="header-container-LB">
                                    <th className="game-result-title">Placement</th>
                                    <th className="game-result-title">Username</th>
                                    <th className="game-id-title">Time Alive</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboardData.map((gameData) => (
                                    <tr key={gameData.username} className={`game-overview-LB ${gameData.username === SignedInUsername ? 'highlight-row-LB' : ''}`}>
                                        <td style={{ margin: 'auto', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }} className="result">
                                            {(() => {
                                                if (gameData.placement === '1st') {
                                                    return `${gameData.placement} 🥇`;
                                                } else if (gameData.placement === '2nd') {
                                                    return `${gameData.placement} 🥈`;
                                                } else if (gameData.placement === '3rd') {
                                                    return `${gameData.placement} 🥉`;
                                                } else {
                                                    return gameData.placement;
                                                }
                                            })()}
                                        </td>
                                        <td style={{ margin: 'auto', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }} className="result">
                                            {gameData.username}
                                        </td>
                                        <td style={{ margin: 'auto', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }} className="result">
                                            {gameData.timeAlive}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
        </>
    );
}

export default Leaderboard;

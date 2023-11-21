import './ashik.css'
import { motion } from "framer-motion";
import moment from "moment"


import { useEffect, useState, authToken } from "react";

const MatchHistory = () => {
    const [showDetails, setShowDetails] = useState(false)
    const [selectedGame, setSelectedGame] = useState(null)
    const [matchHistoryData, setMatchHistoryData] = useState(null)
    
    let dummyData = [
        {gameid: '12343', opponents: "user1, user2, user3, user4, user5, user6, user7", date: "09/23/2014", result: "win"},
        {gameid: '52134',opponents: "user1, user2, user3, user4, user5, user6, user7", date: "09/23/2014", result: "loss"},
        {gameid: '90421',opponents: "user1, user2, user3, user4, user5, user6, user7", date: "09/23/2014", result: "loss"},
        {gameid: '11241', opponents: "user1, user2, user3, user4, user5, user6, user7", date: "09/23/2014", result: "win"},
        {gameid: '97311',opponents: "user1, user2, user3, user4, user5, user6, user7", date: "09/23/2014", result: "loss"},
        {gameid: '63221',opponents: "user1, user2, user3, user4, user5, user6, user7", date: "09/23/2014", result: "win"},
    ]

    useEffect(() => {
        fetch('http://localhost:8000/user_match_history/', {
            method: 'GET',
            headers: {
                'Authorization': `Token ${authToken}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            console.log(`response.data here is ${JSON.stringify(data)}`);
            setMatchHistoryData(data);
        })
        .catch(err => {
            console.error(`Error here is ${err}`);
        });
    }, []);    
    
    const showDropdown = (id) => {
        setShowDetails(!showDetails)
        setSelectedGame(id)
    }
    return ( 
        <>
            <div className="match-history-container">
               <motion.h1 className="game-history-title" initial={{x: -1200, opacity: 0}} animate={{x: 0, opacity: 1}} transition={{duration: 0.9, type: 'spring'}}>Game History</motion.h1> 
                <motion.div className="card-container" initial={{x: 1200, opacity: 0}} animate={{x: 0, opacity: 1}} transition={{duration: 0.9, type: 'spring'}}>
                    <div className="header-container">
                        <div className="game-id-title">Game ID</div>
                        <div className="game-date-title">Date</div>
                        <div className="game-result-title">Result</div>
                    </div>
                    {matchHistoryData && matchHistoryData.map((gameData, index) => {
                        return <>
                            <div className="game-overview" onClick={() => showDropdown(matchHistoryData[index].match.matchID)}>
                                <div className="gameid">
                                    {matchHistoryData[index].match.matchID.substring(0,8)}
                                </div>
                                <div className="gamedate">
                                    {moment(matchHistoryData[index].match.endTime).format('MMMM Do YYYY, h:mm a')}
                                </div>
                                <div className="result">
                                    {matchHistoryData[index].placement === '1st' ? <div className="win-result">WIN</div> : <div className="loss-result">LOSS</div>}
                                </div>
                        </div>
                        {showDetails && matchHistoryData[index].match.matchID === selectedGame && <div className="game-details" style={{color: 'purple'}}>
                            <div><b style={{color: 'black'}}>Placement: </b>{matchHistoryData[index].placement}</div>
                            <div><b style={{color: 'black'}}>Time Alive: </b>{matchHistoryData[index].timeAlive}</div>
                            <div><b style={{color: 'black'}}>Players Faced: </b>{matchHistoryData[index].num_players}</div>
                        </div>}
                            </>
                    })}
                    {/* <table className="game-history-table">
                        <th>Opponent</th>
                        <th>Date</th>
                        <th>Result</th>
                        {dummyData.map((opponentData) => {
                    return <> <tr>
                            <td className="opponent-name-container">{opponentData.opponent}</td>
                            <td className="opponent-date-container">{opponentData.date}</td>
                            {opponentData.result === "win" ? <td><div className="win-tag">WIN</div></td> : <td><div className="loss-tag">LOSS</div></td>}
                        </tr> </>
                    })}
                    </table> */}
                </motion.div>
                
            </div>
        </>
     );
}
 
export default MatchHistory;
import './ashik.css'

const MatchHistory = () => {
    let dummyData = [
        {opponent: "user1", date: "09/23/2014", result: "win"},
        {opponent: "user2", date: "09/23/2014", result: "loss"},
        {opponent: "user3", date: "09/23/2014", result: "loss"},
        {opponent: "user4", date: "09/23/2014", result: "win"},
        {opponent: "user5", date: "09/23/2014", result: "loss"},
        {opponent: "user6", date: "09/23/2014", result: "win"},
    ]
    return ( 
        <div>
            <div className="match-history-container">
               <h1 className="game-history-title">Game History</h1> 
                <div className="card-container">
                    <table className="game-history-table">
                        <th>Opponent</th>
                        <th>Date</th>
                        <th>Result</th>
                        {dummyData.map((opponentData) => {
                    return <> <tr>
                            <td className="opponent-name-container">{opponentData.opponent}</td>
                            <td className="opponent-date-container">{opponentData.date}</td>
                            {opponentData.result === "win" ? <td><div className="win-tag">WIN</div></td> : <td><div className="loss-tag">LOSS</div></td>}
                            {/* <td className="opponent-result-container">{opponentData.result}</td> */}
                        </tr> </>
                    })}
                    </table>
                </div>
            </div>
            </div>
     );
}
 
export default MatchHistory;
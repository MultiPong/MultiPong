import React from 'react';
import '../Account/Stuff.css'

function GameLobby({changeState}) {

    const playersList = ["player1","player2","player3","player4","player5","player6","player7","player8"];
    
  
  return (
    <div className="home-container">
        <div className='game-lobby-box'>
            <h1>MULTIPONG</h1> 
            <div className='outer-game-lobby-box'>
                
                    
                <div><h1>GAME LOBBY</h1>
                <div className='inner-game-lobby-box'>
                    
                        <div>
                            <table>
                                <tr>PLAYERS</tr>
                                <tr>{playersList[0]}</tr>
                                <tr>{playersList[1]}</tr>
                                <tr>{playersList[2]}</tr>
                                <tr>{playersList[3]}</tr>
                                <tr>{playersList[4]}</tr>
                                <tr>{playersList[5]}</tr>
                                <tr>{playersList[6]}</tr>
                                <tr>{playersList[7]}</tr>
                            </table>

                            
                            
                        </div> 
                        
                    
                        <div>
                            <button className ="Start-Game-button">
                                START GAME
                            </button>
                            <div>
                            <button className ="back-button">
                                BACK
                            </button>
                        </div>
                        </div>
                    
                </div>
            </div>
            </div>
        </div>
    </div>
  );
}
export default GameLobby;

import { motion } from "framer-motion";
import '../../../CSS/Tables.css'

const Home = ({ changeGameRoomIDApp, changeState, changeTokenState, authToken }) => {

    // function logout() {
    //     return fetch('http://127.0.0.1:8000/logout/', {
    //         method: 'POST',
    //         headers: {
    //             'Authorization': `Token ${authToken}`
    //         },
    //     })
    //         .then(response => {
    //             if (response) {
    //                 changeTokenState('removeToken')
    //                 changeState('signIn')
    //             }
    //         });

    // }

    const CreateGameID = async () => {
        try {
            const response = await fetch('http://localhost:8000/create_game_room/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            changeGameRoomIDApp(data.game_room_id);
        } catch (err) {
            console.error(`Error here is ${err}`);
        }
    };

    const handleGameCreation = async () => {
        await CreateGameID();

        changeState('PlayGame');
    };
    return (
        <div>
            <div className="home-container">
                <div className="main-container">
                    <motion.h1 className="title" initial={{ x: -1200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }}>MultiPong</motion.h1>
                    {authToken ? (
                        <>
                            <motion.button className="play-now-btn" initial={{ x: 1200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }} onClick={() => { changeState('CreateGame') }}>PLAY NOW</motion.button>
                        </>
                    ) : (
                        <>
                            <motion.button className="play-now-btn" initial={{ x: 1200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }} onClick={() => { handleGameCreation(); }}>PLAY NOW</motion.button>
                        </>
                    )}
                    <motion.button className="sign-in-btn" initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }} onClick={() => changeState('signIn')}>Sign In</motion.button>
                    <motion.button className="sign-up-btn" initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }} onClick={() => changeState('signUp')}>Sign Up</motion.button>
                </div>
            </div>
        </div >
    );
}

export default Home;
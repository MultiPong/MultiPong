import { motion } from "framer-motion";
import '../../../CSS/Tables.css'

// const REACT_APP_CREATE_GAME_ROOM = process.env.REACT_APP_CREATE_GAME_ROOM;
// const REACT_APP_LOGOUT = process.env.REACT_APP_LOGOUT;

const Home = ({ changeState, authToken }) => {

    // function logout() {
    //     return fetch(REACT_APP_LOGOUT, {
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

    // const CreateGameID = async () => {
    //     try {
    //         const response = await fetch(REACT_APP_CREATE_GAME_ROOM, {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //         });
    //         const data = await response.json();
    //         changeGameRoomIDApp(data.game_room_id);
    //     } catch (err) {
    //         console.error(`Error here is ${err}`);
    //     }
    // };
    // const handleGameCreation = async () => {
    //     await CreateGameID();

    //     changeState('PlayGame');
    // };
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
                            <motion.button className="play-now-btn" initial={{ x: 1200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }} onClick={() => { changeState('GuestCreateGame') }}>PLAY NOW</motion.button>
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
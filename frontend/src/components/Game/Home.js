import { motion } from "framer-motion";
import './ashik.css'
import { useEffect, useState } from "react";

const Home = ({ changeState, changeTokenState, authToken }) => {

    const [homeStateButton, sethomeStateButton] = useState('')

    useEffect(() => {
        if (authToken) {
            sethomeStateButton('Logout')
        } else {
            sethomeStateButton('Sign Up')
        }
    }, [])

    function logout() {
        return fetch('http://127.0.0.1:8000/logout/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${authToken}`
            },
        })
            .then(response => {
                if (response) {
                    changeTokenState('removeToken')
                    changeState('signIn')
                }
            });

    }
    return (
        <div>
            <div className="home-container">
                <div className="main-container">
                    <motion.h1 className="title" initial={{ x: -1200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }}>MultiPong</motion.h1>
                    {authToken ? (
                        <>
                            <motion.button className="play-now-btn" initial={{ x: 1200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }} onClick={() => changeState('CreateGame')}>PLAY NOW</motion.button>
                            <motion.button className="sign-up-btn" initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }}
                                onClick={() => { logout() }}>{homeStateButton}</motion.button>
                        </>
                    ) : (
                        <>
                            <motion.button className="play-now-btn" initial={{ x: 1200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }} onClick={() => changeState('signIn')}>PLAY NOW</motion.button>
                            <motion.button className="sign-up-btn" initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, type: 'spring' }}
                                onClick={() => changeState('signUp')}>{homeStateButton}</motion.button>
                        </>
                    )}
                </div>
            </div>
        </div >
    );
}

export default Home;
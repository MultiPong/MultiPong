import { motion } from "framer-motion";
import './ashik.css'

const Home = ({changeState}) => {
    return ( 
        <div>
            <div className="home-container">
                <div className="main-container">
                    <motion.h1 className="title" initial={{x: -1200, opacity: 0}} animate={{x: 0, opacity: 1}} transition={{duration: 0.9, type: 'spring'}}>MultiPong</motion.h1>
                    <motion.button className="play-now-btn" initial={{x: 1200, opacity: 0}} animate={{x: 0, opacity: 1}} transition={{duration: 0.9, type: 'spring'}} onClick={() => changeState('signIn')}>PLAY NOW</motion.button>
                </div>
                <motion.button className="sign-up-btn" initial={{y: -100, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{duration: 0.9, type: 'spring'}} onClick={() => changeState('signUp')}>SIGN UP</motion.button>
            </div>
        </div>
     );
}
 
export default Home;
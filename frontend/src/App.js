import './App.css';
import ChangePassword from './components/ChangePassword.js';
import SignIn from './components/SignIn.js';
import SignUp from './components/SignUp.js';
import UpdateProfile from './components/UpdateProfile.js';

function App() {
  return (
    <div class='AppContainer'>
      <SignIn />
      <SignUp /> 
      <UpdateProfile /> 
      <ChangePassword />
    </div>
  );
}

export default App;

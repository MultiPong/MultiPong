<h1 align="center">MultiPong</h1>

  <p align="center" >
    <i>A realtime online multiplayer pong game.</i>
    <br>
  </p>


<p align="center">
    A CPS714 Project
    <br>
    Fall 2023
    <br>
    Toronto Metropolitan University
</p>


## Installation and Running
1. Clone the repo or download the zip
2. Make sure you have the correct node and python versions installed, we've tested the minimum versions below:
    - Node: v17.4.0
    - Python: v3.12.0
3. Install dependencies
    - Frontend
        1. Navigate to the frontend directory and run `npm install`
   - Backend
        - Navigate to the backend directory and run `pip install -r requirements.txt`
4. Run the app
    - Frontend
        - Navigate to the frontend directory and run `npm run start-react`
        - Open another terminal and navigate to the frontend directory and run `python -m http.server 5500`
    - Backend
        - Navigate to the 'backend/pong_backend' directory and run `python manage.py runserver`

## Usage
- Navigate to http://localhost:3000/ in your browser for the game 
- Navigate to http://localhost:8000/swagger/ in your browser for the API documentation
    - More in-depth documentation can be found in the `backend/README.md` file
- Navigate to http://localhost:8000/admin/ in your browser for the admin panel
    - Username: `test`
    - Password: `test`
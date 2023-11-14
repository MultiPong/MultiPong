# Multipong Backend

This projects backend is built on Python using the [Django](https://www.djangoproject.com/) framework.

## Requirements
- Python 3.12

## Getting Started
1. Clone the repository
2. Navigate into the backend directory
3. Create a virtual environment
    - currently based on Python 3.12
4. Install the requirements via `pip install -r requirements.txt`
5. Run the server via `python manage.py runserver`
    - Make sure you're in the `pong_backend` directory


## API Reference
The project comes bundled with [Swagger](https://swagger.io/) for API documentation.
1. Follow the instructions in the [Getting Started](#getting-started) section
2. avigate to `http://localhost:8000/swagger/` in your browser
3. You should see the Swagger UI with all the endpoints and their documentation, along with the ability to test them out
    - To test out the authenticated endpoints, follow the instructions in the [Authentication](#authentication) section


## Authentication
- The project uses Tokens for authentication
- You receive a token when using the login endpoint
    - Our test user is: 
        - username: `test`
        - password: `test`
    - e.g. the token could be `c7640c6c152fc6e9a0d18d4fa0dc2b6c86c0b67c`
- You must pass this token in the header of all authenticated endpoints
    - In the top right of the UI there is a button that says `Authorize`
    - Enter 'Token {YOUR TOKEN}' in the value field
        - e.g. `Token c7640c6c152fc6e9a0d18d4fa0dc2b6c86c0b67c`
    - Click `Authorize` and then `Close`
    - You should now be able to use the authenticated endpoints
        - **NOTE**: this resets on page refresh

## Contributing
As you contribute please remember to:
- Update requirements.txt with any new dependencies 
    - via `pip freeze -r requirements.txt`
- Update the `README.md` with any new instructions or changes to the project
- Update the `.gitignore` with any new files that should not be tracked
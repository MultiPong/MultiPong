# Multipong Backend

This projects backend is built on Python using the [Django](https://www.djangoproject.com/) framework.

## Requirements
- Python 3.12


## API Reference
The project comes bundled with [Swagger](https://swagger.io/) for API documentation.
1. Clone the repository
2. CD into the backend directory
3. Create a virtual environment
    - currently based on Python 3.12
4. Install the requirements via `pip install -r requirements.txt`
5. Run the server via `python manage.py runserver` 
    - Make sure you're in the `pong_backend` dirzectory
6. Navigate to `http://localhost:8000/swagger/` in your browser
7. You should see the Swagger UI with all the endpoints and their documentation, along with the ability to test them out


## Development
1. Clone the repository
2. CD into the backend directory
3. Create a virtual environment
    - currently based on Python 3.12
4. Install the requirements via `pip install -r requirements.txt`
5. Run the server via `python manage.py runserver` 
    - Make sure you're in the `pong_backend` directory


## Contributing
As you contribute please remember to:
- Update requirements.txt with any new dependencies 
    - via `pip freeze -r requirements.txt`
- Update the `README.md` with any new instructions or changes to the project
- Update the `.gitignore` with any new files that should not be tracked
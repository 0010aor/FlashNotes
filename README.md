<img src="frontend/src/assets/Logo.svg" alt="FlashNotes Logo" width="80" height="80"/>

# Learn Better with FlashNotes

#### A simple flashcard app focused on quick card creation and distraction-free practice.

[![Live Demo](https://img.shields.io/badge/Live_Demo-2D3748?style=for-the-badge&logo=firefox&logoColor=white)](https://flash-notes.com)

## Technology Stack and Features



- **Backend:**
    - [**FastAPI**](https://fastapi.tiangolo.com) for the Python backend API.
        - [SQLModel](https://sqlmodel.tiangolo.com) for ORM-based SQL database interactions.
        - [Pydantic](https://docs.pydantic.dev) for data validation and settings management.
        - [PostgreSQL](https://www.postgresql.org) as the SQL database.
- **Frontend:**
    - [**React**](https://react.dev) with TypeScript, hooks, and Vite for a modern frontend stack.
        - [Chakra UI](https://chakra-ui.com) for UI components.
        - Generated client for consuming the backend API.
- **Authentication:**
    - JWT (JSON Web Token) authentication.
- **Testing:**
    - [Pytest](https://pytest.org) for backend testing.

Explore the API documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

## How to Run it!

## Project Structure
```
.
├── backend/
│   ├── src/
│   │   ├── auth/         # Authentication logic
│   │   ├── core/         # Core configurations
│   │   ├── flashcards/   # Flashcard related endpoints
│   │   ├── users/        # User management
│   │   └── main.py       # Application entry point
│   └── tests/            # Backend tests
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── hooks/        # Custom React hooks
    │   ├── routes/       # Application routes
    │   └── client/       # Generated API client
    └── public/           # Static assets
```

## Setup Instructions

### Backend Setup

1. Create a PostgreSQL database:
```bash
createdb <dbname>
```

2. Set up environment variables in `backend/.env`:
```env
PROJECT_NAME=FlashNotes
DOMAIN=localhost
POSTGRES_SERVER=localhost
POSTGRES_USER=<your-username>
POSTGRES_PASSWORD=<your-password>
POSTGRES_DB=<dbname>
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=<admin-password>
USERS_OPEN_REGISTRATION=true
```

3. Navigate to the backend directory:
```bash
cd backend
```

4. Make the prestart script executable:
```bash
chmod +x prestart.sh
```

5. Choose one of the following setup options:

#### Option 1: Quick Setup with uv
```bash
# Install dependencies and run migrations
uv run ./prestart.sh # Run ./prestart.sh to run db migrations

# Start the development server
uv run uvicorn src.main:app --reload
```

#### Option 2: Traditional Virtual Environment Setup
```bash
# Create and activate virtual environment
uv venv .venv
source .venv/bin/activate

# Install dependencies
uv sync

# Run migrations
./prestart.sh

# Start the development server
uvicorn src.main:app --reload
```

The backend server will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. Install dependencies and start the development server:
```bash
cd frontend
pnpm install
pnpm run dev
```

### Generate Frontend API Client

The frontend uses a generated TypeScript client to communicate with the backend API. To update the client after making changes to the backend:

1. Activate the backend virtual environment:
```bash
cd backend
source .venv/bin/activate  # For Unix/Linux
# OR
.venv\Scripts\activate     # For Windows
```

2. Run the client generation script from the project root:
```bash
./scripts/generate_client.sh
```

This script will:
- Generate OpenAPI specification from the backend
- Move it to the frontend directory
- Generate the TypeScript client
- Format the generated code

<img src="preview.gif" alt="Preview" width="300" align="center"/>

## API Documentation
Once the backend is running, access the interactive API documentation at:
- ReDoc: http://127.0.0.1:8000/redoc
- Swagger UI: http://127.0.0.1:8000/docs

## Contributing
1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

## License
This project is licensed under the MIT License.


## Related Projects

Check out my other projects:

- [TasteThis!](https://github.com/ZorroGuadaPavos/taste-this-front) - Find the most popular dishes (https://taste-this.com)

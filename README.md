<p align="center">
<img src="frontend/src/assets/Logo.svg" alt="FlashNotes Logo" width="80" height="80"/>
</p>

<h1 align="center">FlashNotes</h1>
<p align="center">A simple flashcard app focused on quick card creation and distraction-free practice.</p>
<p align="center">
 <a href="https://flash-notes.com" target="_blank"><img src="https://img.shields.io/badge/-flash--notes.com-2D3748" alt="Live Demo URL"></a>
 <a href="https://discord.gg/CDPHbQ3Ct5" target="_blank"><img src="https://img.shields.io/static/v1?label=Join%20our&message=Discord&color=blue&logo=Discord" alt="Discord"></a>
</p>

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
    - [Dexie.js](https://dexie.org/) and IndexedDB for offline/guest mode support and local data storage.
- **Authentication:**
    - JWT (JSON Web Token) authentication.
- **Guest Mode & Offline Support:**
    - Users can try the app instantly as a guest, with all data stored locally in the browser (IndexedDB).
    - Guest Mode users can create, edit, and practice flashcards, but data will not sync across devices.
- **Testing:**
    - [Pytest](https://pytest.org) for backend testing.

Explore the API documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

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

### Generate Frontend API Client (Only if backend API is updated)

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

## API Documentation
Once the backend is running, access the interactive API documentation at:
- ReDoc: http://127.0.0.1:8000/redoc
- Swagger UI: http://127.0.0.1:8000/docs

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started, report bugs, suggest enhancements, and submit pull requests. Feel free to join our [Discord](https://discord.gg/CDPHbQ3Ct5) for questions and discussions!

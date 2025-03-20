# Development Guide for Multimodal Prompt Studio

## Development Environment Setup

### Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/multimodal-prompt-studio.git
   cd multimodal-prompt-studio
   ```

2. Backend setup:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env  # Edit with your local settings
   ```

3. Frontend setup:
   ```bash
   cd frontend
   npm install
   cp .env.example .env  # Edit with your local settings
   ```

4. Start the backend:
   ```bash
   cd backend
   python -m uvicorn main:app --reload
   ```

5. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

### Docker Setup

1. Start the development environment:
   ```bash
   docker-compose -f docker/docker-compose.dev.yml up -d
   ```

2. Initialize the database:
   ```bash
   docker-compose -f docker/docker-compose.dev.yml exec backend python init_db.py
   ```

## Project Structure

```
multimodal-prompt-studio/
├── backend/                  # FastAPI backend
│   ├── app/                  # Application code
│   │   ├── api/              # API endpoints
│   │   ├── core/             # Core configuration
│   │   ├── db/               # Database models
│   │   ├── integrations/     # LLM provider integrations
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   └── utils/            # Utilities
│   ├── tests/                # Backend tests
│   ├── main.py               # Application entry point
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React frontend
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── store/            # Redux store
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utilities
│   ├── package.json          # Node.js dependencies
│   └── tsconfig.json         # TypeScript configuration
├── docker/                   # Docker configuration
│   ├── docker-compose.dev.yml  # Development environment
│   └── docker-compose.prod.yml # Production environment
└── docs/                     # Documentation
```

## Backend Development

### Creating New API Endpoints

1. Define Pydantic schemas in `app/schemas/`
2. Create or update database models in `app/db/models/`
3. Implement service logic in `app/services/`
4. Create API endpoint in `app/api/endpoints/`
5. Register the endpoint in `app/api/router.py`

### Database Migrations

1. Create a migration:
   ```bash
   cd backend
   alembic revision --autogenerate -m "Description of changes"
   ```

2. Apply migrations:
   ```bash
   alembic upgrade head
   ```

## Frontend Development

### Adding New Components

1. Create component in `src/components/`
2. Import and use in relevant pages
3. Add styles using Material-UI's styling system

### Redux State Management

1. Define types in `src/types/`
2. Create slice in `src/store/slices/`
3. Register slice in `src/store/index.ts`
4. Use with hooks from `src/hooks/redux.ts`

### API Integration

1. Create or update API service in `src/services/`
2. Use in components with async thunks or direct calls

## Testing

### Backend Tests

1. Write tests in `backend/tests/`
2. Run tests:
   ```bash
   cd backend
   pytest
   ```

### Frontend Tests

1. Write tests in `__tests__` directories
2. Run tests:
   ```bash
   cd frontend
   npm test
   ```

## Building for Production

### Backend

```bash
cd backend
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm run build
```

### Docker Deployment

```bash
docker-compose -f docker/docker-compose.prod.yml up -d
```

## Adding New LLM Providers

1. Create new provider class in `backend/app/integrations/`
2. Implement the required methods from `LLMProvider` base class
3. Register provider in `LLMProviderFactory`
4. Update frontend to support the new provider

# ScriptRipper API

FastAPI backend for ScriptRipper transcript analysis platform.

## Quick Start

### 1. Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your API keys
```

### 2. Start Services

```bash
# From project root
make setup
make up
```

### 3. Run Database Migration

```bash
make migrate
```

### 4. Seed Database (Optional)

```bash
make seed
```

This creates:
- Admin user: `admin@scriptripper.local` / `admin123`
- Regular user: `user@scriptripper.local` / `user123`
- Two profiles: "Meeting Analysis" and "Presentation Analysis"

### 5. Access API

- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **Health**: http://localhost:8000/health

## Development

### Database Migrations

```bash
# Create new migration
make migrate-create MSG="add new table"

# Apply migrations
make migrate

# Rollback last migration
make migrate-down
```

### Testing

```bash
# Run tests
make test-api

# Run with coverage
make test-coverage
```

### Code Quality

```bash
# Format code
make format-api

# Lint code
make lint-api

# Type check
mypy .
```

## Project Structure

```
api/
├── app/
│   ├── models/         # SQLAlchemy models
│   ├── routes/         # API endpoints
│   ├── services/       # Business logic
│   ├── utils/          # Utilities
│   ├── config/         # Configuration
│   └── scripts/        # Database scripts
├── alembic/            # Database migrations
├── tests/              # Test files
├── requirements.txt    # Python dependencies
└── Dockerfile          # Container definition
```

## API Endpoints

### Health

- `GET /health` - Health check with database/Redis status
- `GET /ready` - Readiness check

### Authentication

- `POST /api/v1/auth/login` - Request magic link
- `POST /api/v1/auth/verify` - Verify magic link token
- `GET /api/v1/auth/oauth/google` - Google OAuth redirect
- `GET /api/v1/auth/oauth/google/callback` - OAuth callback

## Database Schema

### Tables

- **users** - User accounts and authentication
- **profiles** - Analysis profile configurations
- **jobs** - Analysis jobs and status
- **artifacts** - Job output files
- **custom_prompts** - Ad-hoc analysis prompts

### Relationships

```
users ─┬─> jobs ──┬─> artifacts
       │          └─> custom_prompts
       │
profiles ──> jobs
```

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT tokens
- `GEMINI_API_KEY` - Google Gemini API key
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key

## Troubleshooting

### Database connection errors

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View logs
docker-compose logs postgres
```

### Migration errors

```bash
# Reset database (WARNING: destroys data)
make db-reset
```

### Import errors

```bash
# Ensure you're in the API directory
cd api

# Install dependencies
pip install -r requirements.txt
```

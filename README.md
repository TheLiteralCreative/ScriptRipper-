# ScriptRipper

> Production-ready transcript analysis and filtering tool

ScriptRipper transforms long meeting and presentation transcripts into actionable insights. Upload a transcript, select an analysis profile, and receive curated outputs including highlights, decisions, tasks, summaries, and quotables—all exportable in multiple formats.

**Status**: 🚧 In Development (MVP Phase)

---

## Features

- **Multi-Speaker Support**: Analyze both conversational (meetings) and presentational (monologues) transcripts
- **Analysis Profiles**: Pre-configured prompt sets for different use cases (meetings, presentations, custom)
- **Multi-Provider LLM**: Support for Gemini, OpenAI, and Anthropic models
- **Batch Processing**: Analyze multiple transcripts in one go
- **Rich Exports**: Download results as Markdown, JSON, or ZIP bundles
- **Web + CLI + API**: Use via browser, command line, or integrate with your tools
- **Custom Prompts**: Run ad-hoc analysis on completed jobs

---

## Architecture

```
┌─────────────┐
│   Web UI    │  Next.js (Vercel)
│  (Next.js)  │
└──────┬──────┘
       │ REST/JSON
       ▼
┌─────────────┐     ┌──────────────┐
│   FastAPI   │────▶│   Postgres   │
│     API     │     │   (SSOT)     │
└──────┬──────┘     └──────────────┘
       │
       │ Redis Queue
       ▼
┌─────────────┐     ┌──────────────┐
│   Python    │────▶│ LLM Provider │
│   Workers   │     │ (Multi)      │
└─────────────┘     └──────────────┘
```

**Stack**:
- Frontend: Next.js + React + TypeScript
- API: FastAPI + Python
- Workers: Python + LangChain
- Database: PostgreSQL
- Cache/Queue: Redis
- Orchestration: n8n
- Hosting: Vercel (web) + Render/Cloud Run (API/workers)

See [Architecture Decisions](docs/adr/) for detailed rationale.

---

## Quick Start

### Prerequisites

- Node.js 18+ (for web)
- Python 3.11+ (for API/workers)
- Docker & Docker Compose (for local development)
- PostgreSQL 15+
- Redis 7+

### Local Development

#### 1. Clone the repository

```bash
git clone <repo-url>
cd ScriptRipper+
```

#### 2. Environment Setup

Create `.env` files for each service:

```bash
# Copy example env files
cp api/.env.example api/.env
cp web/.env.example web/.env
cp worker/.env.example worker/.env
```

Edit the `.env` files with your credentials:

```bash
# api/.env
DATABASE_URL=postgresql://user:pass@localhost:5432/scriptripper
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

#### 3. Start Services (Docker Compose)

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

#### 4. Run Database Migrations

```bash
# Enter API container
docker-compose exec api bash

# Run migrations
alembic upgrade head
```

#### 5. Access Services

- **Web UI**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **n8n**: http://localhost:5678

---

## Project Structure

```
ScriptRipper+/
├── web/                    # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
├── api/                    # FastAPI backend
│   ├── app/
│   │   ├── models/        # SQLAlchemy models
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utilities
│   │   └── config/        # Configuration
│   └── alembic/           # DB migrations
├── worker/                 # Python workers
│   ├── tasks/             # Analysis tasks
│   ├── providers/         # LLM provider adapters
│   └── utils/             # Utilities
├── shared/                 # Shared code
├── prompts/                # Analysis prompts
├── docs/                   # Documentation
│   ├── spec/              # Technical specs
│   ├── adr/               # Architecture decisions
│   └── diagrams/          # Architecture diagrams
├── .github/                # GitHub config
│   └── ISSUE_TEMPLATE/
├── ROADMAP.md
├── CHANGELOG.md
├── openapi.yaml
└── docker-compose.yml
```

---

## Documentation

- [Technical Specification](docs/spec/SPEC.md) - Comprehensive technical spec
- [Roadmap](ROADMAP.md) - Development milestones
- [Changelog](CHANGELOG.md) - Version history
- [Architecture Decisions](docs/adr/) - ADRs
- [API Reference](openapi.yaml) - OpenAPI spec

---

## Development

### Running Tests

```bash
# API tests
cd api
pytest

# Web tests
cd web
npm test

# E2E tests
npm run test:e2e
```

### Code Style

```bash
# Python (API/Worker)
black .
isort .
mypy .

# TypeScript (Web)
npm run lint
npm run type-check
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

---

## Deployment

### Web (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd web
vercel --prod
```

### API & Workers (Render/Cloud Run)

See [ADR-0006: Hosting](docs/adr/0006-hosting.md) for deployment instructions.

---

## CLI Usage

```bash
# Install CLI
pip install scriptripper-cli

# Authenticate
scriptripper login

# Run analysis
scriptripper run --profile meetings --input transcript.json --output results/

# List profiles
scriptripper profiles list

# Check job status
scriptripper jobs status <job-id>

# Download results
scriptripper jobs download <job-id>
```

---

## API Usage

```bash
# Create job
curl -X POST https://api.scriptripper.example.com/api/v1/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@transcript.json" \
  -F "profileId=uuid"

# Check status
curl https://api.scriptripper.example.com/api/v1/jobs/{id} \
  -H "Authorization: Bearer $TOKEN"

# Download artifact
curl https://api.scriptripper.example.com/api/v1/artifacts/{id} \
  -H "Authorization: Bearer $TOKEN"
```

Full API reference: [OpenAPI Spec](openapi.yaml)

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Reporting Issues

- [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)
- [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)

### Pull Requests

See our [PR Template](.github/PULL_REQUEST_TEMPLATE.md).

---

## Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features and milestones.

**Current Phase**: M0 - Project Setup

---

## License

Proprietary - All Rights Reserved

---

## Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/your-org/scriptripper/issues)
- Email: support@scriptripper.example.com

---

## Acknowledgments

Built on the shoulders of:
- [FastAPI](https://fastapi.tiangolo.com/)
- [Next.js](https://nextjs.org/)
- [LangChain](https://langchain.com/)
- [n8n](https://n8n.io/)

---

**Made with care for creators, knowledge workers, and agencies who prefer specifics over full rewatches.**

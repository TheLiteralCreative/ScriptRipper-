.PHONY: help setup up down logs restart clean test lint format migrate db-shell api-shell worker-shell web-shell

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Setup and Configuration
setup: ## Initial project setup (copy env files, install dependencies)
	@echo "Setting up project..."
	@cp -n api/.env.example api/.env 2>/dev/null || true
	@cp -n worker/.env.example worker/.env 2>/dev/null || true
	@cp -n web/.env.local.example web/.env.local 2>/dev/null || true
	@echo "✓ Environment files created"
	@echo "⚠️  Remember to update .env files with your API keys!"

# Docker Compose Commands
up: ## Start all services
	docker-compose up -d
	@echo "✓ Services starting..."
	@echo "  Web:    http://localhost:3000"
	@echo "  API:    http://localhost:8000"
	@echo "  Docs:   http://localhost:8000/docs"
	@echo "  n8n:    http://localhost:5678"

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## View logs from all services
	docker-compose logs -f

logs-api: ## View API logs
	docker-compose logs -f api

logs-worker: ## View worker logs
	docker-compose logs -f worker

logs-web: ## View web logs
	docker-compose logs -f web

clean: ## Stop and remove all containers, volumes, and images
	docker-compose down -v --rmi local
	@echo "✓ Cleaned up Docker resources"

# Database Commands
migrate: ## Run database migrations
	docker-compose exec api alembic upgrade head

migrate-create: ## Create a new migration (use: make migrate-create MSG="description")
	docker-compose exec api alembic revision --autogenerate -m "$(MSG)"

migrate-down: ## Rollback last migration
	docker-compose exec api alembic downgrade -1

db-shell: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U scriptripper -d scriptripper_dev

db-reset: ## Reset database (WARNING: destroys all data)
	@echo "⚠️  This will destroy all data. Press Ctrl+C to cancel."
	@sleep 3
	docker-compose down -v
	docker-compose up -d postgres
	@sleep 5
	$(MAKE) migrate

# Service Shells
api-shell: ## Open shell in API container
	docker-compose exec api bash

worker-shell: ## Open shell in worker container
	docker-compose exec worker bash

web-shell: ## Open shell in web container
	docker-compose exec web sh

redis-cli: ## Open Redis CLI
	docker-compose exec redis redis-cli

# Testing
test: ## Run all tests
	$(MAKE) test-api
	$(MAKE) test-web

test-api: ## Run API tests
	docker-compose exec api pytest

test-worker: ## Run worker tests
	docker-compose exec worker pytest

test-web: ## Run web tests
	docker-compose exec web npm test

test-e2e: ## Run end-to-end tests
	docker-compose exec web npm run test:e2e

test-coverage: ## Run tests with coverage
	docker-compose exec api pytest --cov=app --cov-report=html
	@echo "✓ Coverage report: api/htmlcov/index.html"

# Code Quality
lint: ## Run linters
	$(MAKE) lint-api
	$(MAKE) lint-web

lint-api: ## Lint Python code
	docker-compose exec api black --check .
	docker-compose exec api isort --check .
	docker-compose exec api flake8

lint-web: ## Lint TypeScript code
	docker-compose exec web npm run lint

format: ## Format all code
	$(MAKE) format-api
	$(MAKE) format-web

format-api: ## Format Python code
	docker-compose exec api black .
	docker-compose exec api isort .

format-web: ## Format TypeScript code
	docker-compose exec web npm run format

type-check: ## Run type checking
	docker-compose exec api mypy .
	docker-compose exec web npm run type-check

# Development
dev-api: ## Start API in development mode with hot reload
	docker-compose up api

dev-worker: ## Start worker in development mode
	docker-compose up worker

dev-web: ## Start web in development mode
	docker-compose up web

# Build
build: ## Build all Docker images
	docker-compose build

build-api: ## Build API image
	docker-compose build api

build-worker: ## Build worker image
	docker-compose build worker

build-web: ## Build web image
	docker-compose build web

# Utilities
ps: ## Show running containers
	docker-compose ps

stats: ## Show container resource usage
	docker stats

health: ## Check health of all services
	@echo "Checking service health..."
	@curl -s http://localhost:8000/health | jq . || echo "API not responding"
	@curl -s http://localhost:3000/api/health | jq . || echo "Web not responding"
	@redis-cli -h localhost ping > /dev/null && echo "✓ Redis OK" || echo "✗ Redis not responding"

# Data Management
seed: ## Seed database with sample data
	docker-compose exec api python -m app.scripts.seed

backup-db: ## Backup database to file
	@mkdir -p backups
	docker-compose exec -T postgres pg_dump -U scriptripper scriptripper_dev > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✓ Database backed up to backups/"

restore-db: ## Restore database from latest backup
	@latest=$$(ls -t backups/*.sql | head -1); \
	echo "Restoring from $$latest..."; \
	docker-compose exec -T postgres psql -U scriptripper scriptripper_dev < $$latest

# Documentation
docs: ## Generate and serve documentation
	@echo "API Documentation: http://localhost:8000/docs"
	@echo "OpenAPI Spec: http://localhost:8000/openapi.json"

# CI/CD
ci-test: ## Run CI test suite locally
	docker-compose -f docker-compose.yml -f docker-compose.ci.yml up --abort-on-container-exit

# Installation (for bare metal dev)
install-api: ## Install API dependencies locally
	cd api && pip install -r requirements.txt

install-worker: ## Install worker dependencies locally
	cd worker && pip install -r requirements.txt

install-web: ## Install web dependencies locally
	cd web && npm install

install: ## Install all dependencies locally
	$(MAKE) install-api
	$(MAKE) install-worker
	$(MAKE) install-web

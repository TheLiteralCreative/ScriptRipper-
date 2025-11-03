#!/bin/bash
# Test script for database setup

set -e

echo "=================================="
echo "ScriptRipper Database Setup Test"
echo "=================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "${YELLOW}Step 1: Checking if .env files exist...${NC}"
if [ -f "api/.env" ]; then
    echo "${GREEN}✓ api/.env exists${NC}"
else
    echo "${RED}✗ api/.env missing${NC}"
    echo "  Run: make setup"
    exit 1
fi

echo ""
echo "${YELLOW}Step 2: Checking if Docker services are running...${NC}"
if docker-compose ps | grep -q "Up"; then
    echo "${GREEN}✓ Docker services are running${NC}"
else
    echo "${RED}✗ Docker services not running${NC}"
    echo "  Run: make up"
    exit 1
fi

echo ""
echo "${YELLOW}Step 3: Checking PostgreSQL connection...${NC}"
if docker-compose exec -T postgres pg_isready -U scriptripper > /dev/null 2>&1; then
    echo "${GREEN}✓ PostgreSQL is ready${NC}"
else
    echo "${RED}✗ PostgreSQL not ready${NC}"
    exit 1
fi

echo ""
echo "${YELLOW}Step 4: Checking Redis connection...${NC}"
if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
    echo "${GREEN}✓ Redis is ready${NC}"
else
    echo "${RED}✗ Redis not ready${NC}"
    exit 1
fi

echo ""
echo "${YELLOW}Step 5: Checking API health...${NC}"
sleep 2  # Give API time to start
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo "${GREEN}✓ API is healthy${NC}"
else
    echo "${YELLOW}⚠ API may still be starting...${NC}"
    echo "  Check: curl http://localhost:8000/health"
fi

echo ""
echo "=================================="
echo "${GREEN}✓ Setup test completed!${NC}"
echo "=================================="
echo ""
echo "Next steps:"
echo "  1. make migrate    # Run database migrations"
echo "  2. make seed       # Add test data"
echo "  3. Visit: http://localhost:8000/docs"
echo ""

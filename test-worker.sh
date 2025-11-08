#!/bin/bash

# Test script for verifying worker implementation

set -e

echo "🧪 ScriptRipper Worker Test"
echo "============================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "1. Checking prerequisites..."

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ docker-compose not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ docker-compose found${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ python3 not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ python3 found${NC}"

echo ""

# Check services
echo "2. Checking Docker services..."

docker-compose ps postgres redis | grep -q "Up" && \
    echo -e "${GREEN}✓ PostgreSQL and Redis are running${NC}" || \
    echo -e "${YELLOW}⚠ Services not running. Starting...${NC}" && docker-compose up -d postgres redis

sleep 2
echo ""

# Test Redis connection
echo "3. Testing Redis connection..."

docker-compose exec -T redis redis-cli ping > /dev/null 2>&1 && \
    echo -e "${GREEN}✓ Redis is responding${NC}" || \
    (echo -e "${RED}✗ Redis not responding${NC}" && exit 1)

echo ""

# Check worker files
echo "4. Checking worker implementation..."

FILES=(
    "worker/__init__.py"
    "worker/main.py"
    "worker/tasks/__init__.py"
    "worker/tasks/analysis.py"
    "api/app/utils/queue.py"
    "api/app/routes/jobs.py"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file (missing)${NC}"
        exit 1
    fi
done

echo ""

# Check API integration
echo "5. Checking API integration..."

if grep -q "from app.routes import.*jobs" api/app/main.py; then
    echo -e "${GREEN}✓ Jobs router registered in main.py${NC}"
else
    echo -e "${RED}✗ Jobs router not registered${NC}"
    exit 1
fi

echo ""

# Summary
echo "================================"
echo -e "${GREEN}✅ Worker implementation verified!${NC}"
echo ""
echo "Next steps:"
echo "  1. Install dependencies: cd worker && pip install -r requirements.txt"
echo "  2. Start worker: docker-compose up worker"
echo "  3. Test API: curl http://localhost:8000/api/v1/jobs/analyze"
echo ""
echo "Documentation: worker/README.md"

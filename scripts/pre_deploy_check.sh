#!/bin/bash

###############################################################################
# Pre-Deployment Validation Script
#
# Validates that ScriptRipper+ is ready for Railway deployment.
# Run this BEFORE attempting deployment to catch issues early.
#
# Usage: ./scripts/pre_deploy_check.sh
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

log_info() { echo -e "${BLUE}ℹ ${1}${NC}"; }
log_success() { echo -e "${GREEN}✓ ${1}${NC}"; }
log_warning() { echo -e "${YELLOW}⚠ ${1}${NC}"; WARNINGS=$((WARNINGS + 1)); }
log_error() { echo -e "${RED}✗ ${1}${NC}"; ERRORS=$((ERRORS + 1)); }

echo ""
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "ScriptRipper+ Pre-Deployment Validation"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

###############################################################################
# 1. File Structure Validation
###############################################################################

log_info "Step 1: Validating file structure..."

# Critical API files
if [ -f "api/Dockerfile" ]; then
    log_success "api/Dockerfile exists"
else
    log_error "api/Dockerfile missing"
fi

if [ -f "api/app/main.py" ]; then
    log_success "api/app/main.py exists"
else
    log_error "api/app/main.py missing"
fi

if [ -f "api/requirements.txt" ]; then
    log_success "api/requirements.txt exists"
else
    log_error "api/requirements.txt missing"
fi

# Worker files
if [ -f "worker/Dockerfile" ]; then
    log_success "worker/Dockerfile exists"
else
    log_error "worker/Dockerfile missing"
fi

if [ -f "worker/main.py" ]; then
    log_success "worker/main.py exists"
else
    log_error "worker/main.py missing"
fi

# Database files
if [ -f "api/alembic.ini" ]; then
    log_success "alembic.ini exists"
else
    log_error "alembic.ini missing"
fi

if [ -d "api/alembic/versions" ]; then
    log_success "alembic/versions directory exists"
else
    log_warning "alembic/versions directory missing (no migrations yet?)"
fi

# Seed scripts
if [ -f "api/scripts/seed_prompts.py" ]; then
    log_success "seed_prompts.py exists"
else
    log_warning "seed_prompts.py missing (optional)"
fi

# Deployment configs
if [ -f "railway.json" ]; then
    log_success "railway.json exists"
else
    log_warning "railway.json missing (optional)"
fi

if [ -f "railway.toml" ]; then
    log_success "railway.toml exists"
else
    log_warning "railway.toml missing (optional)"
fi

echo ""

###############################################################################
# 2. Python Syntax Validation
###############################################################################

log_info "Step 2: Validating Python syntax..."

cd api

# Main API app
if python3 -m py_compile app/main.py 2>/dev/null; then
    log_success "app/main.py syntax valid"
else
    log_error "app/main.py has syntax errors"
fi

# Routes
for route_file in app/routes/*.py; do
    if [ -f "$route_file" ]; then
        if python3 -m py_compile "$route_file" 2>/dev/null; then
            log_success "$(basename $route_file) syntax valid"
        else
            log_error "$(basename $route_file) has syntax errors"
        fi
    fi
done

cd ..

# Worker
cd worker
if python3 -m py_compile main.py 2>/dev/null; then
    log_success "worker/main.py syntax valid"
else
    log_error "worker/main.py has syntax errors"
fi
cd ..

echo ""

###############################################################################
# 3. Dependency Check
###############################################################################

log_info "Step 3: Checking critical dependencies..."

cd api

# Check requirements.txt has critical packages
REQUIRED_PACKAGES=("fastapi" "sqlalchemy" "redis" "stripe" "google-generativeai")

for package in "${REQUIRED_PACKAGES[@]}"; do
    if grep -q "$package" requirements.txt; then
        log_success "$package listed in requirements.txt"
    else
        log_error "$package missing from requirements.txt"
    fi
done

cd ..

echo ""

###############################################################################
# 4. Docker Validation
###############################################################################

log_info "Step 4: Validating Dockerfiles..."

# Check API Dockerfile
if grep -q "FROM python" api/Dockerfile; then
    log_success "api/Dockerfile has valid FROM statement"
else
    log_error "api/Dockerfile missing FROM statement"
fi

if grep -q "CMD\|ENTRYPOINT" api/Dockerfile; then
    log_success "api/Dockerfile has valid CMD/ENTRYPOINT"
else
    log_error "api/Dockerfile missing CMD/ENTRYPOINT"
fi

# Check Worker Dockerfile
if grep -q "FROM python" worker/Dockerfile; then
    log_success "worker/Dockerfile has valid FROM statement"
else
    log_error "worker/Dockerfile missing FROM statement"
fi

if grep -q "CMD\|ENTRYPOINT" worker/Dockerfile; then
    log_success "worker/Dockerfile has valid CMD/ENTRYPOINT"
else
    log_error "worker/Dockerfile missing CMD/ENTRYPOINT"
fi

echo ""

###############################################################################
# 5. Git Status
###############################################################################

log_info "Step 5: Checking Git status..."

if git rev-parse --git-dir > /dev/null 2>&1; then
    log_success "In a Git repository"

    # Check for uncommitted changes
    if [ -z "$(git status --porcelain)" ]; then
        log_success "No uncommitted changes"
    else
        log_warning "You have uncommitted changes. Commit before deploying."
    fi

    # Check if remote exists
    if git remote -v | grep -q origin; then
        log_success "Remote 'origin' configured"
    else
        log_error "No remote 'origin' found. Add GitHub remote."
    fi
else
    log_error "Not in a Git repository"
fi

echo ""

###############################################################################
# 6. Environment Variables Template
###############################################################################

log_info "Step 6: Validating environment template..."

if [ -f "api/.env.example" ]; then
    log_success ".env.example exists"

    # Check for critical env vars
    REQUIRED_VARS=("DATABASE_URL" "REDIS_URL" "JWT_SECRET" "GEMINI_API_KEY" "STRIPE_SECRET_KEY")

    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "$var" api/.env.example; then
            log_success "$var in .env.example"
        else
            log_warning "$var missing from .env.example"
        fi
    done
else
    log_warning ".env.example missing"
fi

echo ""

###############################################################################
# 7. Deployment Scripts
###############################################################################

log_info "Step 7: Checking deployment scripts..."

if [ -f "scripts/deploy_railway.sh" ]; then
    if [ -x "scripts/deploy_railway.sh" ]; then
        log_success "deploy_railway.sh exists and is executable"
    else
        log_warning "deploy_railway.sh exists but not executable (run: chmod +x scripts/deploy_railway.sh)"
    fi
else
    log_error "deploy_railway.sh missing"
fi

if [ -f "DEPLOYMENT_CHECKLIST.md" ]; then
    log_success "DEPLOYMENT_CHECKLIST.md exists"
else
    log_warning "DEPLOYMENT_CHECKLIST.md missing"
fi

echo ""

###############################################################################
# 8. Health Check Endpoint
###############################################################################

log_info "Step 8: Verifying health endpoint exists..."

if grep -q "/health" api/app/main.py; then
    log_success "Health endpoint found in main.py"
else
    log_warning "No /health endpoint found (recommended for Railway)"
fi

echo ""

###############################################################################
# Final Report
###############################################################################

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "VALIDATION COMPLETE"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    log_success "✓ All checks passed! Ready for deployment."
    echo ""
    echo "Next steps:"
    echo "1. Read DEPLOYMENT_CHECKLIST.md"
    echo "2. Gather required API keys"
    echo "3. Run: ./scripts/deploy_railway.sh"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    log_warning "⚠ $WARNINGS warnings found, but ready to proceed."
    echo ""
    echo "You can deploy, but consider fixing warnings first."
    echo "Next steps:"
    echo "1. Read DEPLOYMENT_CHECKLIST.md"
    echo "2. Run: ./scripts/deploy_railway.sh"
    echo ""
    exit 0
else
    log_error "✗ $ERRORS errors found. Fix these before deploying."
    echo ""
    echo "Please fix the errors above and run this script again."
    echo ""
    exit 1
fi

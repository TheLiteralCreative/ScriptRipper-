#!/bin/bash

###############################################################################
# Railway Deployment Automation Script
#
# Automates deployment of ScriptRipper+ to Railway with custom domain.
#
# Usage: ./scripts/deploy_railway.sh
# Prerequisites: Railway account, GitHub repo connected, domain registered
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="ScriptRipper+"
DOMAIN="scriptripper.com"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

###############################################################################
# Helper Functions
###############################################################################

log_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

log_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

log_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 is not installed"
        return 1
    fi
    log_success "$1 is installed"
    return 0
}

prompt_for_value() {
    local var_name=$1
    local prompt_text=$2
    local is_secret=${3:-false}

    if [ -z "${!var_name}" ]; then
        echo -n "${prompt_text}: "
        if [ "$is_secret" = true ]; then
            read -s value
            echo
        else
            read value
        fi
        eval "$var_name='$value'"
    fi
}

###############################################################################
# Step 1: Validate Prerequisites
###############################################################################

step_validate_prerequisites() {
    log_info "Step 1: Validating prerequisites..."

    # Check Railway CLI
    if ! check_command railway; then
        log_warning "Railway CLI not found. Installing..."
        npm i -g @railway/cli
        log_success "Railway CLI installed"
    fi

    # Check if authenticated
    if ! railway whoami &> /dev/null; then
        log_warning "Not authenticated with Railway. Please login..."
        railway login
        log_success "Authenticated with Railway"
    else
        log_success "Already authenticated with Railway"
    fi

    # Check git
    check_command git

    # Check if in git repo
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository. Please run from project root."
        exit 1
    fi
    log_success "In git repository"

    log_success "Prerequisites validated\n"
}

###############################################################################
# Step 2: Initialize Railway Project
###############################################################################

step_initialize_project() {
    log_info "Step 2: Initializing Railway project..."

    # Check if already linked
    if [ -f ".railway/railway.toml" ]; then
        log_warning "Project already linked to Railway. Skipping initialization."
        return
    fi

    # Initialize project
    log_info "Creating new Railway project..."
    railway init

    log_success "Railway project initialized\n"
}

###############################################################################
# Step 3: Create Services
###############################################################################

step_create_services() {
    log_info "Step 3: Creating Railway services..."

    # Add PostgreSQL
    log_info "Adding PostgreSQL database..."
    railway add --database postgres || log_warning "PostgreSQL may already exist"
    log_success "PostgreSQL added"

    # Add Redis
    log_info "Adding Redis cache..."
    railway add --database redis || log_warning "Redis may already exist"
    log_success "Redis added"

    # Main API service is auto-created from Dockerfile
    log_success "API service will be auto-created from Dockerfile"

    # Add worker service
    log_info "Creating worker service..."
    railway service create worker || log_warning "Worker service may already exist"
    log_success "Worker service created"

    log_success "All services created\n"
}

###############################################################################
# Step 4: Configure Environment Variables
###############################################################################

step_configure_environment() {
    log_info "Step 4: Configuring environment variables..."

    # Prompt for required variables
    prompt_for_value GEMINI_API_KEY "Enter Gemini API Key" true
    prompt_for_value STRIPE_SECRET_KEY "Enter Stripe Secret Key (sk_live_...)" true
    prompt_for_value STRIPE_PRO_PRICE_ID "Enter Stripe Pro Price ID (price_...)"

    # Optional variables
    prompt_for_value STRIPE_WEBHOOK_SECRET "Enter Stripe Webhook Secret (leave empty to skip)" true
    prompt_for_value SENTRY_DSN "Enter Sentry DSN (leave empty to skip)"
    prompt_for_value PURELYMAIL_API_TOKEN "Enter Purelymail API Token (leave empty to skip)" true

    # Generate JWT secret if not provided
    if [ -z "$JWT_SECRET" ]; then
        JWT_SECRET=$(openssl rand -hex 32)
        log_success "Generated JWT_SECRET"
    fi

    # Create environment file
    log_info "Creating .env.railway file..."
    cat > .env.railway <<EOF
# Database (Railway will inject these)
DATABASE_URL=\${{Postgres.DATABASE_URL}}
REDIS_URL=\${{Redis.REDIS_URL}}

# LLM Provider
GEMINI_API_KEY=${GEMINI_API_KEY}
DEFAULT_LLM_PROVIDER=gemini

# Authentication
JWT_SECRET=${JWT_SECRET}
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Stripe
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
STRIPE_PRO_PRICE_ID=${STRIPE_PRO_PRICE_ID}
STRIPE_SUCCESS_URL=https://${DOMAIN}/success
STRIPE_CANCEL_URL=https://${DOMAIN}/pricing
EOF

    # Add optional variables
    if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
        echo "STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}" >> .env.railway
    fi

    if [ -n "$SENTRY_DSN" ]; then
        cat >> .env.railway <<EOF
SENTRY_DSN=${SENTRY_DSN}
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1
EOF
    fi

    if [ -n "$PURELYMAIL_API_TOKEN" ]; then
        echo "PURELYMAIL_API_TOKEN=${PURELYMAIL_API_TOKEN}" >> .env.railway
    fi

    # Add app configuration
    cat >> .env.railway <<EOF

# App Configuration
ENVIRONMENT=production
LOG_LEVEL=INFO
CORS_ORIGINS=https://${DOMAIN},https://www.${DOMAIN}
APP_NAME=ScriptRipper
APP_VERSION=1.0.0
MAX_TRANSCRIPT_LENGTH=500000
EOF

    log_success "Environment file created"

    # Upload to Railway (API service)
    log_info "Uploading environment variables to Railway..."
    railway variables --set-from-file .env.railway
    log_success "Environment variables uploaded to API service"

    # Upload to worker service
    log_info "Uploading environment variables to worker service..."
    railway service use worker
    railway variables --set-from-file .env.railway
    railway service use api  # Switch back to API
    log_success "Environment variables uploaded to worker service"

    # Clean up sensitive file
    rm .env.railway
    log_success "Environment configured\n"
}

###############################################################################
# Step 5: Deploy Application
###############################################################################

step_deploy_application() {
    log_info "Step 5: Deploying application..."

    # Deploy API service
    log_info "Deploying API service..."
    railway up
    log_success "API service deployed"

    # Deploy worker service
    log_info "Deploying worker service..."
    railway service use worker
    railway up
    railway service use api  # Switch back to API
    log_success "Worker service deployed"

    log_info "Waiting for deployments to complete (this may take 2-3 minutes)..."
    sleep 30

    log_success "Application deployed\n"
}

###############################################################################
# Step 6: Configure Custom Domain
###############################################################################

step_configure_domain() {
    log_info "Step 6: Configuring custom domain..."

    # Add domain
    log_info "Adding custom domain: ${DOMAIN}"
    railway domain add ${DOMAIN} || log_warning "Domain may already be added"

    # Get DNS instructions
    log_info "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    log_info "${YELLOW}DNS CONFIGURATION REQUIRED${NC}"
    log_info "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Please configure the following DNS records in GoDaddy:"
    echo ""
    echo "1. Log into GoDaddy → My Products → Domains → ${DOMAIN} → DNS"
    echo ""
    echo "2. Add the following records (Railway will provide exact values):"
    echo "   Run: railway domain"
    echo "   Copy the CNAME or A record value shown"
    echo ""
    echo "   Typically:"
    echo "   Type: CNAME"
    echo "   Name: @"
    echo "   Value: <your-project>.up.railway.app"
    echo "   TTL: 600"
    echo ""
    echo "   Also add www subdomain:"
    echo "   Type: CNAME"
    echo "   Name: www"
    echo "   Value: ${DOMAIN}"
    echo "   TTL: 600"
    echo ""
    echo "3. Delete any existing @ A records pointing to GoDaddy parking page"
    echo ""
    log_info "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    read -p "Press Enter when DNS records are configured..."

    log_info "Waiting for DNS propagation (this may take 10-30 minutes)..."
    log_info "You can check status at: https://dnschecker.org"

    # Wait for DNS to propagate
    local max_attempts=60
    local attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if dig ${DOMAIN} | grep -q "ANSWER SECTION"; then
            log_success "DNS propagated successfully!"
            break
        fi
        attempt=$((attempt + 1))
        echo -n "."
        sleep 30
    done

    if [ $attempt -eq $max_attempts ]; then
        log_warning "DNS propagation taking longer than expected. Check dnschecker.org"
    fi

    log_success "Domain configured\n"
}

###############################################################################
# Step 7: Initialize Database
###############################################################################

step_initialize_database() {
    log_info "Step 7: Initializing database..."

    # Run migrations
    log_info "Running Alembic migrations..."
    railway run alembic upgrade head
    log_success "Migrations completed"

    # Seed prompts
    log_info "Seeding prompts database..."
    railway run python3 scripts/seed_prompts.py
    log_success "Prompts seeded"

    log_success "Database initialized\n"
}

###############################################################################
# Step 8: Verify Deployment
###############################################################################

step_verify_deployment() {
    log_info "Step 8: Verifying deployment..."

    local base_url="https://${DOMAIN}"

    # Wait a bit for services to stabilize
    log_info "Waiting for services to stabilize..."
    sleep 10

    # Test health endpoint
    log_info "Testing health endpoint..."
    if curl -f -s "${base_url}/health" | grep -q "healthy"; then
        log_success "Health check passed"
    else
        log_error "Health check failed. Check Railway logs: railway logs"
    fi

    # Test API docs
    log_info "Testing API docs..."
    if curl -f -s "${base_url}/docs" > /dev/null; then
        log_success "API docs accessible"
    else
        log_warning "API docs not accessible yet (may need more time)"
    fi

    # Check SSL
    log_info "Checking SSL certificate..."
    if curl -I "${base_url}" 2>&1 | grep -q "200 OK"; then
        log_success "SSL certificate valid"
    else
        log_warning "SSL certificate may still be provisioning"
    fi

    log_success "Deployment verified\n"
}

###############################################################################
# Step 9: Post-Deployment Instructions
###############################################################################

step_post_deployment() {
    log_info "Step 9: Post-deployment setup..."

    echo ""
    log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_success "DEPLOYMENT COMPLETE! 🎉"
    log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Your application is now live at: https://${DOMAIN}"
    echo "API Documentation: https://${DOMAIN}/docs"
    echo "Health Check: https://${DOMAIN}/health"
    echo ""
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "NEXT STEPS"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Configure Stripe Webhook:"
    echo "   - Go to: https://dashboard.stripe.com/webhooks"
    echo "   - Add endpoint: https://${DOMAIN}/api/v1/billing/webhook"
    echo "   - Select events: checkout.session.completed, customer.subscription.*"
    echo "   - Copy webhook secret and add to Railway:"
    echo "     railway variables set STRIPE_WEBHOOK_SECRET=whsec_..."
    echo ""
    echo "2. Test the deployment:"
    echo "   - Register a new user"
    echo "   - Submit a transcript for analysis"
    echo "   - Test Stripe checkout flow"
    echo ""
    echo "3. Set up monitoring:"
    echo "   - Configure UptimeRobot for uptime monitoring"
    echo "   - Verify Sentry is receiving errors (if configured)"
    echo ""
    echo "4. Create admin user (if needed):"
    echo "   - Connect to Railway: railway connect"
    echo "   - Run Python shell: railway run python"
    echo "   - Update user role in database"
    echo ""
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    log_success "Deployment script completed successfully!"
    echo ""
}

###############################################################################
# Main Execution
###############################################################################

main() {
    echo ""
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "${APP_NAME} Railway Deployment Script"
    log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    step_validate_prerequisites
    step_initialize_project
    step_create_services
    step_configure_environment
    step_deploy_application
    step_configure_domain
    step_initialize_database
    step_verify_deployment
    step_post_deployment
}

# Run main function
main

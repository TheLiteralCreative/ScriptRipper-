#!/bin/bash

# ==============================================================================
# ScriptRipper+ Render Deployment Script
# ==============================================================================
# This script prepares your repository for Render deployment by:
# 1. Validating git configuration
# 2. Adding render.yaml to git
# 3. Committing and pushing to GitHub
# 4. Providing next steps
# ==============================================================================

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}===================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===================================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# ==============================================================================
# Pre-flight Checks
# ==============================================================================
print_header "Pre-flight Checks"

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install git first."
    exit 1
fi
print_success "Git is installed"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not a git repository. Please initialize git first:"
    echo "  git init"
    echo "  git add ."
    echo "  git commit -m 'Initial commit'"
    exit 1
fi
print_success "Git repository detected"

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    print_error "render.yaml not found in current directory"
    exit 1
fi
print_success "render.yaml found"

# Check if .env.render exists
if [ ! -f ".env.render" ]; then
    print_warning ".env.render not found - you'll need to configure environment variables manually"
else
    print_success ".env.render found"
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
    print_warning "You have uncommitted changes"
fi

# Check if remote is configured
if ! git remote get-url origin &> /dev/null; then
    print_error "No git remote configured. Please add your GitHub repository:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    exit 1
fi

REMOTE_URL=$(git remote get-url origin)
print_success "Git remote configured: $REMOTE_URL"

# ==============================================================================
# Environment Variable Validation
# ==============================================================================
print_header "Environment Variable Validation"

if [ -f ".env.render" ]; then
    print_info "Checking .env.render for required values..."

    # Check if JWT_SECRET is still the auto-generated one
    if grep -q "eef03d89a3acd5ef6d76bb23e111d85bc7323b1234f214fa9e00e4b0fb32fea9" .env.render; then
        print_success "JWT_SECRET is configured (auto-generated)"
    else
        print_warning "JWT_SECRET was modified - ensure it's a secure 64-character hex string"
    fi

    # Check for placeholder values
    MISSING_VARS=()

    if grep -q "GEMINI_API_KEY=your_gemini_api_key_here" .env.render || \
       grep -q "GEMINI_API_KEY=$" .env.render; then
        MISSING_VARS+=("GEMINI_API_KEY")
    fi

    if grep -q "STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here" .env.render || \
       grep -q "STRIPE_SECRET_KEY=$" .env.render; then
        MISSING_VARS+=("STRIPE_SECRET_KEY")
    fi

    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        print_warning "The following required variables have placeholder values:"
        for var in "${MISSING_VARS[@]}"; do
            echo "  - $var"
        done
        print_info "You'll need to configure these in Render Dashboard after deployment"
    else
        print_success "All required environment variables appear to be configured"
    fi
fi

# ==============================================================================
# Git Operations
# ==============================================================================
print_header "Preparing Deployment"

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
print_info "Current branch: $CURRENT_BRANCH"

# Recommend using 'main' branch for Render auto-deploy
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    print_warning "You're on branch '$CURRENT_BRANCH'. Render auto-deploy is configured for 'main' branch."
    print_info "Consider switching to main branch or updating render.yaml to use '$CURRENT_BRANCH'"
    echo ""
    read -p "Continue with current branch? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deployment cancelled"
        exit 0
    fi
fi

# Add render.yaml to git
print_info "Adding render.yaml to git..."
git add render.yaml

# Check if there are changes to commit
if git diff --staged --quiet; then
    print_info "render.yaml is already committed"
else
    print_info "Committing render.yaml..."
    git commit -m "Add Render deployment configuration

- Add render.yaml Blueprint for Infrastructure as Code
- Configure API web service with FastAPI
- Configure background worker service
- Set up PostgreSQL database (free tier)
- Set up Redis cache (free tier)
- Configure environment variables and health checks
- Enable auto-deploy on main branch"
    print_success "Changes committed"
fi

# ==============================================================================
# Push to GitHub
# ==============================================================================
print_header "Pushing to GitHub"

print_info "Pushing to remote repository..."
if git push origin "$CURRENT_BRANCH"; then
    print_success "Successfully pushed to GitHub"
else
    print_error "Failed to push to GitHub"
    print_info "You may need to run: git push -u origin $CURRENT_BRANCH"
    exit 1
fi

# ==============================================================================
# Next Steps
# ==============================================================================
print_header "Deployment Ready!"

echo ""
print_success "render.yaml has been committed and pushed to GitHub"
echo ""
print_info "NEXT STEPS:"
echo ""
echo "1. Open RENDER_DEPLOYMENT_GUIDE.md for complete browser-based deployment instructions"
echo ""
echo "2. Quick start:"
echo "   a. Go to: https://dashboard.render.com/blueprints"
echo "   b. Click 'New Blueprint Instance'"
echo "   c. Connect your GitHub repository: ${REMOTE_URL}"
echo "   d. Render will detect render.yaml and show all services"
echo "   e. Fill in required environment variables from .env.render"
echo "   f. Click 'Apply' to deploy everything at once"
echo ""
echo "3. After deployment:"
echo "   - Run database migrations (see guide for commands)"
echo "   - Configure custom domain (scriptripper.com)"
echo "   - Set up Stripe webhooks"
echo "   - Test with: ./verify_deployment.sh"
echo ""
echo "4. Your services will be available at:"
echo "   - API: https://scriptripper-api.onrender.com"
echo "   - Docs: https://scriptripper-api.onrender.com/docs (disabled in production)"
echo "   - Health: https://scriptripper-api.onrender.com/health"
echo ""
print_warning "IMPORTANT: Don't forget to configure environment variables in Render Dashboard!"
print_info "See .env.render for all required values"
echo ""

print_header "Deployment script complete!"

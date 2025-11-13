#!/bin/bash

# ==============================================================================
# ScriptRipper+ Deployment Verification Script
# ==============================================================================
# Tests your Render deployment to ensure all services are working correctly
# ==============================================================================

set -e  # Exit on error (but we'll handle errors for each test)

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="https://scriptripper.com"
API_BASE="$BASE_URL/api/v1"

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_test() {
    echo -e "\n${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}  ✓ $1${NC}"
    ((PASSED++))
}

print_failure() {
    echo -e "${RED}  ✗ $1${NC}"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}  ⚠ $1${NC}"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}  ℹ $1${NC}"
}

# Test function wrapper
run_test() {
    local test_name="$1"
    local test_command="$2"

    print_test "$test_name"

    if eval "$test_command"; then
        return 0
    else
        return 1
    fi
}

# ==============================================================================
# Pre-flight Checks
# ==============================================================================
print_header "Pre-flight Checks"

# Check if curl is installed
if ! command -v curl &> /dev/null; then
    print_failure "curl is not installed. Please install curl first."
    exit 1
fi
print_success "curl is installed"

# Check if jq is installed (optional but helpful)
if command -v jq &> /dev/null; then
    print_success "jq is installed (JSON parsing enabled)"
    HAS_JQ=true
else
    print_warning "jq is not installed (install for better output: brew install jq)"
    HAS_JQ=false
fi

# ==============================================================================
# Connectivity Tests
# ==============================================================================
print_header "Connectivity Tests"

# Test 1: Base URL Reachable
print_test "Base URL is reachable"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL" --max-time 10)
if [ "$RESPONSE" -eq 200 ]; then
    print_success "Base URL responds with HTTP 200"
elif [ "$RESPONSE" -eq 308 ] || [ "$RESPONSE" -eq 301 ] || [ "$RESPONSE" -eq 302 ]; then
    print_warning "Base URL redirects (HTTP $RESPONSE) - this is usually OK"
    ((WARNINGS++))
else
    print_failure "Base URL returned HTTP $RESPONSE (expected 200)"
    ((FAILED++))
fi

# Test 2: HTTPS is enabled
print_test "HTTPS is properly configured"
if curl -s -I "$BASE_URL" | grep -q "https://"; then
    print_success "HTTPS is enabled"
else
    print_warning "HTTPS may not be properly configured"
    ((WARNINGS++))
fi

# ==============================================================================
# Health Check Tests
# ==============================================================================
print_header "Health Check Tests"

# Test 3: Health endpoint
print_test "Health check endpoint"
HEALTH_RESPONSE=$(curl -s "$BASE_URL/health" --max-time 10)
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health" --max-time 10)

if [ "$HEALTH_CODE" -eq 200 ]; then
    print_success "Health endpoint responds with HTTP 200"

    if [ "$HAS_JQ" = true ]; then
        STATUS=$(echo "$HEALTH_RESPONSE" | jq -r '.status')
        API_CHECK=$(echo "$HEALTH_RESPONSE" | jq -r '.checks.api')
        DB_CHECK=$(echo "$HEALTH_RESPONSE" | jq -r '.checks.database')
        REDIS_CHECK=$(echo "$HEALTH_RESPONSE" | jq -r '.checks.redis')

        print_info "Status: $STATUS"

        if [ "$STATUS" = "healthy" ]; then
            print_success "Overall status: healthy"
        else
            print_failure "Overall status: $STATUS (expected 'healthy')"
            ((FAILED++))
        fi

        # Check individual services
        if [ "$API_CHECK" = "ok" ]; then
            print_success "API: ok"
        else
            print_failure "API: $API_CHECK"
            ((FAILED++))
        fi

        if [ "$DB_CHECK" = "ok" ]; then
            print_success "Database: ok"
        else
            print_failure "Database: $DB_CHECK"
            ((FAILED++))
        fi

        if [ "$REDIS_CHECK" = "ok" ]; then
            print_success "Redis: ok"
        else
            print_failure "Redis: $REDIS_CHECK"
            ((FAILED++))
        fi
    else
        print_info "Response: $HEALTH_RESPONSE"
    fi
else
    print_failure "Health endpoint returned HTTP $HEALTH_CODE (expected 200)"
    print_info "Response: $HEALTH_RESPONSE"
    ((FAILED++))
fi

# Test 4: Readiness endpoint
print_test "Readiness check endpoint"
READY_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/ready" --max-time 10)
if [ "$READY_CODE" -eq 200 ]; then
    print_success "Readiness endpoint responds with HTTP 200"
else
    print_failure "Readiness endpoint returned HTTP $READY_CODE (expected 200)"
    ((FAILED++))
fi

# ==============================================================================
# API Endpoint Tests
# ==============================================================================
print_header "API Endpoint Tests"

# Test 5: Root endpoint
print_test "Root endpoint"
ROOT_RESPONSE=$(curl -s "$BASE_URL/" --max-time 10)
ROOT_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/" --max-time 10)

if [ "$ROOT_CODE" -eq 200 ]; then
    print_success "Root endpoint responds with HTTP 200"

    if [ "$HAS_JQ" = true ]; then
        APP_NAME=$(echo "$ROOT_RESPONSE" | jq -r '.name')
        APP_VERSION=$(echo "$ROOT_RESPONSE" | jq -r '.version')
        APP_ENV=$(echo "$ROOT_RESPONSE" | jq -r '.environment')

        print_info "App: $APP_NAME v$APP_VERSION ($APP_ENV)"

        if [ "$APP_NAME" = "ScriptRipper" ]; then
            print_success "Application name is correct"
        else
            print_warning "Application name: $APP_NAME (expected 'ScriptRipper')"
            ((WARNINGS++))
        fi

        if [ "$APP_ENV" = "production" ]; then
            print_success "Environment is set to production"
        else
            print_warning "Environment: $APP_ENV (expected 'production')"
            ((WARNINGS++))
        fi
    fi
else
    print_failure "Root endpoint returned HTTP $ROOT_CODE (expected 200)"
    ((FAILED++))
fi

# Test 6: API documentation (should be disabled in production)
print_test "API documentation (should be disabled in production)"
DOCS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/docs" --max-time 10)

if [ "$DOCS_CODE" -eq 404 ] || [ "$DOCS_CODE" -eq 403 ]; then
    print_success "API docs are properly disabled in production (HTTP $DOCS_CODE)"
elif [ "$DOCS_CODE" -eq 200 ]; then
    print_warning "API docs are accessible at /docs - consider disabling in production"
    print_info "This exposes your API schema publicly"
    ((WARNINGS++))
else
    print_info "API docs returned HTTP $DOCS_CODE"
fi

# Test 7: OpenAPI schema
print_test "OpenAPI schema endpoint"
OPENAPI_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/openapi.json" --max-time 10)

if [ "$OPENAPI_CODE" -eq 404 ] || [ "$OPENAPI_CODE" -eq 403 ]; then
    print_success "OpenAPI schema is properly disabled in production"
elif [ "$OPENAPI_CODE" -eq 200 ]; then
    print_warning "OpenAPI schema is accessible - consider disabling in production"
    ((WARNINGS++))
else
    print_info "OpenAPI schema returned HTTP $OPENAPI_CODE"
fi

# ==============================================================================
# Authentication Tests
# ==============================================================================
print_header "Authentication Tests"

# Test 8: Auth endpoints exist
print_test "Auth registration endpoint exists"
REG_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d '{}' --max-time 10)

if [ "$REG_CODE" -eq 422 ] || [ "$REG_CODE" -eq 400 ]; then
    print_success "Registration endpoint exists (validation error expected)"
elif [ "$REG_CODE" -eq 404 ]; then
    print_failure "Registration endpoint not found (HTTP 404)"
    ((FAILED++))
else
    print_info "Registration endpoint returned HTTP $REG_CODE"
fi

print_test "Auth login endpoint exists"
LOGIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{}' --max-time 10)

if [ "$LOGIN_CODE" -eq 422 ] || [ "$LOGIN_CODE" -eq 400 ] || [ "$LOGIN_CODE" -eq 401 ]; then
    print_success "Login endpoint exists (error expected without credentials)"
elif [ "$LOGIN_CODE" -eq 404 ]; then
    print_failure "Login endpoint not found (HTTP 404)"
    ((FAILED++))
else
    print_info "Login endpoint returned HTTP $LOGIN_CODE"
fi

# ==============================================================================
# CORS Tests
# ==============================================================================
print_header "CORS Configuration Tests"

# Test 9: CORS headers
print_test "CORS headers are configured"
CORS_HEADERS=$(curl -s -I -X OPTIONS "$API_BASE/auth/login" \
    -H "Origin: https://scriptripper.com" \
    -H "Access-Control-Request-Method: POST" \
    --max-time 10)

if echo "$CORS_HEADERS" | grep -qi "access-control-allow-origin"; then
    print_success "CORS headers are present"
    ALLOW_ORIGIN=$(echo "$CORS_HEADERS" | grep -i "access-control-allow-origin" | cut -d' ' -f2 | tr -d '\r')
    print_info "Allowed origin: $ALLOW_ORIGIN"
else
    print_warning "CORS headers not found - may cause issues with frontend"
    ((WARNINGS++))
fi

# ==============================================================================
# Response Time Tests
# ==============================================================================
print_header "Performance Tests"

# Test 10: Response time
print_test "API response time"
START_TIME=$(date +%s%N)
curl -s "$BASE_URL/health" --max-time 10 > /dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))  # Convert to milliseconds

print_info "Response time: ${RESPONSE_TIME}ms"

if [ "$RESPONSE_TIME" -lt 1000 ]; then
    print_success "Response time is good (< 1 second)"
elif [ "$RESPONSE_TIME" -lt 3000 ]; then
    print_warning "Response time is acceptable (1-3 seconds)"
    ((WARNINGS++))
else
    print_warning "Response time is slow (> 3 seconds) - service may be spinning up"
    print_info "Free tier services spin down after 15 minutes of inactivity"
    ((WARNINGS++))
fi

# ==============================================================================
# Security Tests
# ==============================================================================
print_header "Security Tests"

# Test 11: Security headers
print_test "Security headers"
SECURITY_HEADERS=$(curl -s -I "$BASE_URL/" --max-time 10)

if echo "$SECURITY_HEADERS" | grep -qi "strict-transport-security"; then
    print_success "HSTS header is present"
else
    print_warning "HSTS header not found - consider enabling"
    ((WARNINGS++))
fi

# Test 12: HTTPS redirect
print_test "HTTP to HTTPS redirect"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://scriptripper.com/" --max-time 10)
if [ "$HTTP_CODE" -eq 301 ] || [ "$HTTP_CODE" -eq 308 ]; then
    print_success "HTTP redirects to HTTPS (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" -eq 000 ]; then
    print_info "HTTP connection not tested (may not be configured)"
else
    print_warning "HTTP does not redirect to HTTPS (HTTP $HTTP_CODE)"
    ((WARNINGS++))
fi

# ==============================================================================
# Results Summary
# ==============================================================================
print_header "Test Results Summary"

TOTAL_TESTS=$((PASSED + FAILED + WARNINGS))

echo ""
echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:      ${GREEN}$PASSED${NC}"
echo -e "Failed:      ${RED}$FAILED${NC}"
echo -e "Warnings:    ${YELLOW}$WARNINGS${NC}"
echo ""

# Determine overall status
if [ "$FAILED" -eq 0 ]; then
    if [ "$WARNINGS" -eq 0 ]; then
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${GREEN}Your ScriptRipper+ deployment is working perfectly!${NC}"
        echo ""
        exit 0
    else
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}✓ TESTS PASSED WITH WARNINGS${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${YELLOW}Your deployment is functional but has some warnings.${NC}"
        echo -e "${YELLOW}Review the warnings above and consider addressing them.${NC}"
        echo ""
        exit 0
    fi
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}✗ TESTS FAILED${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${RED}$FAILED test(s) failed. Please review the errors above.${NC}"
    echo ""
    echo -e "${BLUE}Troubleshooting steps:${NC}"
    echo "1. Check Render Dashboard for service status"
    echo "2. Review service logs for errors"
    echo "3. Verify all environment variables are set"
    echo "4. Ensure database migrations have been run"
    echo "5. Check DNS configuration if domain issues"
    echo ""
    echo "See RENDER_DEPLOYMENT_GUIDE.md for detailed troubleshooting"
    echo ""
    exit 1
fi

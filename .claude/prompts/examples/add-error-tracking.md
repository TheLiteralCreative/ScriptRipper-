# Ready-to-Use: Add Error Tracking (Sentry)

**Pattern**: Service Integration (Pattern #2 variant)
**Expected Time**: 30-45 minutes
**Use For**: Adding Sentry, Rollbar, Bugsnag, DataDog, etc.

## Instructions

1. Fill in all `[PLACEHOLDERS]` below
2. Copy the entire filled-in prompt
3. Send to Task tool with `subagent_type="general-purpose"`
4. Review the comprehensive report

---

# Task: Implement [ERROR_TRACKING_SERVICE] Error Tracking for [PROJECT_NAME]

## Objective

Implement production-ready [ERROR_TRACKING_SERVICE] error tracking for [PROJECT_NAME], integrating it into [SERVICES_LIST]. [ERROR_TRACKING_SERVICE] should capture exceptions, performance data, and provide error context for debugging production issues.

## Context

- **Project**: [PROJECT_NAME]
- **Tech Stack**: [FRAMEWORK], [LANGUAGE], [ADDITIONAL_TECH]
- **Current State**:
  - No error tracking in place
  - [EXCEPTION_HANDLER_LOCATION] (if exists)
  - [SERVICE_1] runs [SERVICE_1_DESCRIPTION]
  - [SERVICE_2] runs [SERVICE_2_DESCRIPTION]
  - Logger is set up: [LOGGER_PATH]
  - Production deployment imminent - need error visibility
- **Target State**:
  - [ERROR_TRACKING_SERVICE] SDK integrated in all services
  - Exceptions automatically captured and sent to [ERROR_TRACKING_SERVICE]
  - Performance monitoring enabled (if supported)
  - User context attached (user ID, email)
  - Request context attached (URL, method, params)
  - Environment variables configured

## Scope

**Files to analyze:**
- `[MAIN_APP_FILE]` - Application entry point
- `[SERVICE_2_MAIN]` - Second service entry point (if applicable)
- `[SETTINGS_FILE]` - Settings configuration
- `[LOGGER_FILE]` - Logger utility

**Files to create:**
- `[ERROR_TRACKING_UTIL]` - Error tracking utility (optional)

**Files to modify:**
- `[MAIN_APP_FILE]` - Initialize [ERROR_TRACKING_SERVICE], add middleware
- `[SERVICE_2_MAIN]` - Initialize [ERROR_TRACKING_SERVICE] (if applicable)
- `[SETTINGS_FILE]` - Add [ERROR_TRACKING_SERVICE] configuration
- `[REQUIREMENTS_FILE_1]` - Add SDK dependency
- `[REQUIREMENTS_FILE_2]` - Add SDK dependency (if multi-service)
- `[ENV_EXAMPLE_1]` - Document configuration
- `[ENV_EXAMPLE_2]` - Document configuration (if multi-service)

## Requirements

### 1. DISCOVERY PHASE

**A. Analyze Current Error Handling**

Read `[MAIN_APP_FILE]`:
- Note any existing exception handlers
- Identify lifecycle managers (startup/shutdown)
- Understand middleware setup
- Note application configuration

Read `[SERVICE_2_MAIN]` (if applicable):
- Understand service initialization
- Identify how work is processed
- Note error handling patterns

Read `[SETTINGS_FILE]`:
- Understand Settings class structure
- Note environment variable patterns
- Check existing integration configs

**B. Research [ERROR_TRACKING_SERVICE] SDK**

SDK requirements:
- Package: `[SDK_PACKAGE_NAME]`
- Version: [SDK_VERSION]
- Official docs: [DOCS_URL]
- [FRAMEWORK] integration available: Yes/No

**C. Identify Integration Points**

For [SERVICE_1]:
- Initialize [ERROR_TRACKING_SERVICE] before app creation
- Configure [FRAMEWORK] integration (if available)
- Add user context middleware
- Optionally enhance exception handler

For [SERVICE_2] (if applicable):
- Initialize [ERROR_TRACKING_SERVICE] in service entry point
- Configure service-specific integration
- Add context specific to service type

### 2. ANALYSIS PHASE

**Extract Integration Pattern:**

From [ERROR_TRACKING_SERVICE] documentation and [FRAMEWORK] best practices:

1. **Initialization**:
   - Import SDK at top of entry file
   - Initialize before app creation
   - Configure DSN/API key, environment, release
   - Enable performance monitoring (if supported)

2. **[FRAMEWORK] Integration**:
   - Use [FRAMEWORK] integration from SDK (if available)
   - Automatically captures exceptions
   - Captures request data
   - Performance/tracing support

3. **User Context**:
   - Add middleware to set user context from auth
   - Include user ID, email, role in error events

4. **Environment Configuration**:
   - [ERROR_TRACKING_DSN_VAR] - Service project DSN/API key
   - ENVIRONMENT - Already exists (development/staging/production)
   - Optional: [SAMPLE_RATE_VAR]

**[ERROR_TRACKING_SERVICE]-Specific Considerations:**

- Only initialize if DSN/API key is provided (skip in local dev)
- Use environment-specific sample rates for performance
- Respect is_production flag to avoid sending dev errors
- Add custom tags (service: [SERVICE_1]/[SERVICE_2])
- Set release version from APP_VERSION

### 3. IMPLEMENTATION PHASE

#### A. Update Settings

**Modify `[SETTINGS_FILE]`:**

Add after existing integrations:

```python
# [ERROR_TRACKING_SERVICE] Error Tracking
[ERROR_TRACKING_DSN_VAR]: Optional[str] = Field(default=None)
[SAMPLE_RATE_VAR]: float = Field(default=[DEFAULT_SAMPLE_RATE])  # [SAMPLE_RATE_DESCRIPTION]
```

#### B. Integrate in [SERVICE_1]

**Modify `[MAIN_APP_FILE]`:**

Add imports at top (after existing imports):

```python
[ERROR_TRACKING_IMPORTS]
```

Add initialization BEFORE app creation:

```python
# Initialize [ERROR_TRACKING_SERVICE]
if settings.[ERROR_TRACKING_DSN_VAR]:
    [ERROR_TRACKING_INIT_CODE]
```

Add user context middleware (if applicable):

```python
# User context middleware for [ERROR_TRACKING_SERVICE]
@app.middleware("http")
async def add_error_tracking_context(request, call_next):
    """Add user context to error tracking events."""
    # Try to get user from request state (set by auth middleware)
    if hasattr(request.state, "user") and request.state.user:
        user = request.state.user
        [SET_USER_CONTEXT_CODE]

    response = await call_next(request)
    return response
```

Optionally enhance exception handler:

```python
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    # [ERROR_TRACKING_SERVICE] will auto-capture, but we can add extra context
    if settings.[ERROR_TRACKING_DSN_VAR]:
        [CAPTURE_EXCEPTION_CODE]

    return JSONResponse(
        status_code=500,
        content={"error": {"message": "An unexpected error occurred"}},
    )
```

#### C. Integrate in [SERVICE_2] (if applicable)

**Modify `[SERVICE_2_MAIN]`:**

Add imports at top:

```python
[ERROR_TRACKING_IMPORTS]
```

Add initialization:

```python
# Initialize [ERROR_TRACKING_SERVICE] for [SERVICE_2]
if settings.[ERROR_TRACKING_DSN_VAR]:
    [SERVICE_2_INIT_CODE]

    # Add custom tag to distinguish service events
    [SET_SERVICE_TAG_CODE]
```

In service job functions, optionally add context:

```python
def process_task(task_id: int):
    """Process task."""
    [ADD_TASK_CONTEXT_CODE]

    # Existing job logic
    # ...
```

#### D. Update Requirements

**Add to `[REQUIREMENTS_FILE_1]`:**

```
[SDK_PACKAGE_NAME]==[SDK_VERSION]  # Error tracking and monitoring
```

**Add to `[REQUIREMENTS_FILE_2]`** (if applicable):

```
[SDK_PACKAGE_NAME]==[SDK_VERSION]  # Error tracking and monitoring
```

#### E. Update Environment Examples

**Add to `[ENV_EXAMPLE_1]`:**

```bash
# [ERROR_TRACKING_SERVICE] Error Tracking (optional)
[ERROR_TRACKING_DSN_VAR]=[EXAMPLE_DSN]  # From [WHERE_TO_GET_DSN]
[SAMPLE_RATE_VAR]=[DEFAULT_SAMPLE_RATE]  # [SAMPLE_RATE_DESCRIPTION]
```

**Add to `[ENV_EXAMPLE_2]`** (if applicable):

```bash
# [ERROR_TRACKING_SERVICE] Error Tracking (optional - same DSN)
[ERROR_TRACKING_DSN_VAR]=[EXAMPLE_DSN]
[SAMPLE_RATE_VAR]=[DEFAULT_SAMPLE_RATE]
```

### 4. VALIDATION PHASE

Verify:

- [ ] Settings updated with DSN and configuration fields
- [ ] [ERROR_TRACKING_SERVICE] initialized in [MAIN_APP_FILE]
- [ ] [ERROR_TRACKING_SERVICE] initialized in [SERVICE_2_MAIN] (if applicable)
- [ ] [FRAMEWORK] integration added (if available)
- [ ] User context middleware added
- [ ] Exception handler optionally enhanced
- [ ] Requirements updated (all services)
- [ ] Environment examples documented
- [ ] Syntax check passed
- [ ] Imports correct
- [ ] Only initializes when DSN/API key is set

**Test Plan:**

To verify [ERROR_TRACKING_SERVICE] works:
1. Set [ERROR_TRACKING_DSN_VAR] in .env
2. Trigger an exception: `raise Exception("Test error")`
3. Check [ERROR_TRACKING_SERVICE] dashboard for event
4. Verify user context is attached (if applicable)
5. Verify environment and release are correct

## Deliverables

Return a comprehensive report with:

### 1. Discovery Summary
- Current error handling: [DESCRIPTION]
- Integration points identified: [LIST]
- [ERROR_TRACKING_SERVICE] SDK version: [VERSION]

### 2. Implementation Summary
- Files modified: [LIST_WITH_CHANGES]
- Lines of code added: [NUMBER]
- Services integrated: [LIST]

### 3. Configuration

**Environment Variables Added:**
- `[ERROR_TRACKING_DSN_VAR]`: [DESCRIPTION]
- `[SAMPLE_RATE_VAR]`: [DESCRIPTION] (if applicable)

**[ERROR_TRACKING_SERVICE] Configuration:**
- Environment: Uses existing ENVIRONMENT setting
- Release: `[APP_NAME]@[APP_VERSION]`
- Service tags: [SERVICE_1] vs [SERVICE_2]
- Integrations: [INTEGRATIONS_LIST]

### 4. Features Enabled

- [x] Exception capture (automatic)
- [x] Performance monitoring (if supported)
- [x] Request context
- [x] User context (ID, email, role)
- [x] Service/job tracking
- [x] Environment tagging
- [x] Release tracking
- [x] Breadcrumbs
- [x] Stacktraces

### 5. Usage Guide

**Setup:**
1. Create [ERROR_TRACKING_SERVICE] project at [DASHBOARD_URL]
2. Copy DSN/API key
3. Add to .env: `[ERROR_TRACKING_DSN_VAR]=[value]`
4. Restart all services
5. Errors automatically sent to [ERROR_TRACKING_SERVICE]

**Testing:**
```[LANGUAGE]
# In any handler
raise Exception("Test [ERROR_TRACKING_SERVICE] integration")
```

**Viewing Errors:**
- Go to [ERROR_TRACKING_SERVICE] dashboard
- See errors with full context
- User info, request data, stacktrace
- Performance data (if supported)

### 6. Best Practices Implemented

- Only enabled when DSN is configured
- Respects environment (dev/staging/prod)
- Sample rates configurable (if applicable)
- User privacy: PII handling documented
- Service tagging for multi-service apps
- Release tracking for deploy correlation

### 7. Next Steps

**Optional Enhancements:**
- Custom breadcrumbs for key operations
- Custom tags for business logic
- Source maps (if frontend applicable)
- Release deployment tracking
- Alert rules in dashboard

## Success Criteria

- ✅ [ERROR_TRACKING_SERVICE] SDK installed in all services
- ✅ [ERROR_TRACKING_SERVICE] initialized correctly with DSN, environment, release
- ✅ Framework integrations active
- ✅ User context middleware working (if applicable)
- ✅ Exceptions automatically captured
- ✅ Performance monitoring enabled (if supported)
- ✅ Environment variables documented
- ✅ No syntax errors
- ✅ Only initializes when DSN is set (graceful degradation)

---

**Execute this task autonomously and return the comprehensive report described above.**

---

## Fill-In Guide

Replace these placeholders before sending:

### Service Details
- `[ERROR_TRACKING_SERVICE]`: e.g., "Sentry", "Rollbar", "Bugsnag", "DataDog"
- `[PROJECT_NAME]`: Your project name
- `[SERVICES_LIST]`: e.g., "API and worker services"
- `[SERVICE_1]`: e.g., "API", "Web App"
- `[SERVICE_2]`: e.g., "Worker", "Background Jobs"
- `[FRAMEWORK]`: e.g., "FastAPI", "Django", "Express"
- `[LANGUAGE]`: e.g., "Python", "Node.js"
- `[ADDITIONAL_TECH]`: Other technologies

### Current State
- `[EXCEPTION_HANDLER_LOCATION]`: Where exception handling exists
- `[SERVICE_1_DESCRIPTION]`: What service 1 does
- `[SERVICE_2_DESCRIPTION]`: What service 2 does
- `[LOGGER_PATH]`: Path to logger utility

### File Paths
- `[MAIN_APP_FILE]`: e.g., "api/app/main.py"
- `[SERVICE_2_MAIN]`: e.g., "worker/main.py"
- `[SETTINGS_FILE]`: e.g., "api/app/config/settings.py"
- `[LOGGER_FILE]`: e.g., "api/app/utils/logger.py"
- `[ERROR_TRACKING_UTIL]`: Optional utility file path
- `[REQUIREMENTS_FILE_1]`: e.g., "api/requirements.txt"
- `[REQUIREMENTS_FILE_2]`: e.g., "worker/requirements.txt"
- `[ENV_EXAMPLE_1]`: e.g., "api/.env.example"
- `[ENV_EXAMPLE_2]`: e.g., "worker/.env.example"

### SDK Details
- `[SDK_PACKAGE_NAME]`: e.g., "sentry-sdk[fastapi]", "rollbar"
- `[SDK_VERSION]`: e.g., "1.40.0"
- `[DOCS_URL]`: Official documentation URL
- `[ERROR_TRACKING_DSN_VAR]`: e.g., "SENTRY_DSN", "ROLLBAR_TOKEN"
- `[SAMPLE_RATE_VAR]`: e.g., "SENTRY_TRACES_SAMPLE_RATE"
- `[DEFAULT_SAMPLE_RATE]`: e.g., "0.1" (10%)
- `[SAMPLE_RATE_DESCRIPTION]`: What sample rate controls

### Implementation
- `[ERROR_TRACKING_IMPORTS]`: Import statements
- `[ERROR_TRACKING_INIT_CODE]`: Initialization code
- `[SET_USER_CONTEXT_CODE]`: Code to set user context
- `[CAPTURE_EXCEPTION_CODE]`: Code to manually capture exception
- `[SERVICE_2_INIT_CODE]`: Service 2 initialization
- `[SET_SERVICE_TAG_CODE]`: Code to tag service
- `[ADD_TASK_CONTEXT_CODE]`: Code to add task context

### Configuration
- `[EXAMPLE_DSN]`: Example DSN format
- `[WHERE_TO_GET_DSN]`: Where to obtain DSN
- `[DASHBOARD_URL]`: Dashboard URL
- `[INTEGRATIONS_LIST]`: Available integrations

---

*Created: 2025-11-07*
*Last Updated: 2025-11-07*
*Pattern: Service Integration*
*Real Example: ScriptRipper+ Agent #5 (Sentry)*

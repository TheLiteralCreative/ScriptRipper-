# Ready-to-Use: Generate Integration Test Suite

**Pattern**: Comprehensive Generation (Pattern #3)
**Expected Time**: 1-2 hours
**Use For**: Building complete test coverage for APIs

## Instructions

1. Fill in all `[PLACEHOLDERS]` below
2. Copy the entire filled-in prompt
3. Send to Task tool with `subagent_type="general-purpose"`
4. Review the comprehensive report

---

# Task: Generate Complete Integration Test Suite for [PROJECT_NAME]

## Objective

Build a comprehensive, production-ready integration test suite for [PROJECT_NAME] from scratch, achieving [TARGET_COVERAGE]% coverage of [TOTAL_ENDPOINTS] API endpoints.

## Context

- **Project**: [PROJECT_NAME]
- **Tech Stack**: [FRAMEWORK], [ORM], [TEST_FRAMEWORK], [DATABASE]
- **Current State**:
  - [TOTAL_ENDPOINTS] API endpoints across [ROUTE_FILE_COUNT] route files
  - [TOTAL_MODELS] database models
  - No integration tests exist (or: Limited test coverage)
- **Target State**:
  - Complete test suite with [TARGET_COVERAGE]%+ endpoint coverage
  - All critical paths tested ([CRITICAL_PATHS])
  - CI/CD integration ready
  - Reusable fixtures and utilities

## Scope

**Areas to analyze:**
- `[ROUTES_DIRECTORY]` - All route files ([TOTAL_ENDPOINTS] endpoints)
- `[MODELS_DIRECTORY]` - Database models ([TOTAL_MODELS] models)
- `[SERVICES_DIRECTORY]` - Business logic services

**Endpoint Breakdown:**
- [CATEGORY_1]: [COUNT] endpoints - [EXAMPLES]
- [CATEGORY_2]: [COUNT] endpoints - [EXAMPLES]
- [CATEGORY_3]: [COUNT] endpoints - [EXAMPLES]
- [CATEGORY_4]: [COUNT] endpoints - [EXAMPLES]

**Files to create:**
- `[TEST_DIRECTORY]/conftest.py` - Shared fixtures
- `[TEST_DIRECTORY]/test_[category_1].py` - [CATEGORY_1] tests
- `[TEST_DIRECTORY]/test_[category_2].py` - [CATEGORY_2] tests
- `[TEST_DIRECTORY]/test_[category_3].py` - [CATEGORY_3] tests
- `[CI_CONFIG_FILE]` - CI/CD workflow
- (Approximately [TOTAL_TEST_FILES] files)

**Files to modify:**
- `[REQUIREMENTS_FILE]` - Add test dependencies
- `[CONFIG_FILE]` - Add test configuration

## Requirements

### 1. DISCOVERY PHASE

**A. Analyze All Endpoints**

Search `[ROUTES_DIRECTORY]` and extract ALL endpoints:

For each endpoint, document:
- HTTP method (GET, POST, PUT, DELETE)
- Path (e.g., `/api/users`, `/api/auth/login`)
- Route file location
- Authentication required (yes/no)
- [AUTH_TYPE] requirements (e.g., user/admin roles)
- Request parameters (body, query, path)
- Response structure
- Possible status codes (200, 400, 401, 404, etc.)
- Business logic dependencies (database, external APIs)

**B. Analyze Database Models**

Read `[MODELS_DIRECTORY]` and identify:
- All model classes
- Relationships (foreign keys, many-to-many)
- Required vs. optional fields
- Enums and choices
- Constraints

**C. Analyze Services**

Examine `[SERVICES_DIRECTORY]`:
- [SERVICE_1]: [DESCRIPTION]
- [SERVICE_2]: [DESCRIPTION]
- External dependencies (APIs, queues)

**D. Categorize Endpoints**

Group endpoints by logical category:
- **[CATEGORY_1]** ([COUNT] endpoints): [LIST]
- **[CATEGORY_2]** ([COUNT] endpoints): [LIST]
- **[CATEGORY_3]** ([COUNT] endpoints): [LIST]

**E. Identify Critical Paths**

Priority 1 (Must test):
- [CRITICAL_PATH_1]
- [CRITICAL_PATH_2]
- [CRITICAL_PATH_3]

Priority 2 (Should test):
- [IMPORTANT_PATH_1]
- [IMPORTANT_PATH_2]

Priority 3 (Nice to have):
- [EDGE_CASE_1]
- [EDGE_CASE_2]

### 2. ANALYSIS PHASE

**A. Test Architecture Design**

Structure:
```
[TEST_DIRECTORY]/
├── conftest.py           - Shared fixtures ([N] lines)
├── test_[category_1].py  - [CATEGORY_1] tests ([N] tests)
├── test_[category_2].py  - [CATEGORY_2] tests ([N] tests)
├── test_[category_3].py  - [CATEGORY_3] tests ([N] tests)
└── utils/
    └── helpers.py        - Test utilities
```

**B. Fixture Planning**

Required fixtures:
- `[FIXTURE_1]`: [PURPOSE] (e.g., `db_session` - Database session for tests)
- `[FIXTURE_2]`: [PURPOSE] (e.g., `test_client` - HTTP client)
- `[FIXTURE_3]`: [PURPOSE] (e.g., `test_user` - Authenticated user)
- `[FIXTURE_4]`: [PURPOSE] (e.g., `admin_user` - Admin user)
- `[FIXTURE_5]`: [PURPOSE] (e.g., `auth_headers` - Auth headers)

**C. Test Case Breakdown**

**[CATEGORY_1] Tests** ([COUNT] tests):
1. Test [ENDPOINT_1] - [SCENARIO_1]
2. Test [ENDPOINT_1] - [SCENARIO_2] (error case)
3. Test [ENDPOINT_2] - [SCENARIO_1]
[... complete list ...]

**[CATEGORY_2] Tests** ([COUNT] tests):
[Similar breakdown]

**D. Coverage Goals**

- Total endpoints: [TOTAL_ENDPOINTS]
- Target coverage: [TARGET_COVERAGE]% ([TARGET_COUNT] endpoints)
- Critical path coverage: 100% ([CRITICAL_COUNT] endpoints)
- Target test count: [TARGET_TEST_COUNT]+ tests

### 3. IMPLEMENTATION PHASE

#### A. Create Shared Fixtures

**File: `[TEST_DIRECTORY]/conftest.py`**

Purpose: Shared pytest fixtures for all tests

```python
"""Shared test fixtures for integration tests."""

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models import [MODEL_IMPORTS]
from app.auth import [AUTH_IMPORTS]


# Database fixtures
@pytest_asyncio.fixture(scope="session")
async def db_engine():
    """Create test database engine."""
    [DB_ENGINE_SETUP]

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Cleanup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine) -> AsyncSession:
    """Create clean database session for each test."""
    [DB_SESSION_SETUP]

    async with session() as s:
        yield s
        await s.rollback()


# HTTP Client fixtures
@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncClient:
    """Create test HTTP client."""
    [CLIENT_SETUP]

    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac


# User fixtures
@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession):
    """Create test user."""
    [TEST_USER_CREATION]

    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def admin_user(db_session: AsyncSession):
    """Create admin user."""
    [ADMIN_USER_CREATION]

    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)
    return admin


# Authentication fixtures
@pytest_asyncio.fixture
async def auth_headers(test_user):
    """Get authentication headers for test user."""
    [AUTH_HEADERS_CREATION]
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def admin_headers(admin_user):
    """Get authentication headers for admin user."""
    [ADMIN_HEADERS_CREATION]
    return {"Authorization": f"Bearer {token}"}


# [Additional fixtures as needed]
```

Estimated lines: [CONFTEST_LINES]

#### B. Create [CATEGORY_1] Tests

**File: `[TEST_DIRECTORY]/test_[category_1].py`**

Purpose: Test [CATEGORY_1] endpoints

```python
"""Integration tests for [CATEGORY_1]."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
class Test[Category1]:
    """Test [CATEGORY_1] endpoints."""

    async def test_[endpoint_1]_success(
        self, client: AsyncClient, [FIXTURES_NEEDED]
    ):
        """Test [ENDPOINT_1] - success case."""
        [TEST_IMPLEMENTATION]

        response = await client.[method]("[path]", [PARAMS])

        assert response.status_code == [EXPECTED_CODE]
        assert [ASSERTION_1]
        assert [ASSERTION_2]

    async def test_[endpoint_1]_[error_case](
        self, client: AsyncClient, [FIXTURES_NEEDED]
    ):
        """Test [ENDPOINT_1] - [error case description]."""
        [TEST_IMPLEMENTATION]

        response = await client.[method]("[path]", [PARAMS])

        assert response.status_code == [ERROR_CODE]
        assert [ERROR_ASSERTION]

    async def test_[endpoint_2]_success(
        self, client: AsyncClient, [FIXTURES_NEEDED]
    ):
        """Test [ENDPOINT_2] - success case."""
        [TEST_IMPLEMENTATION]

    # [Additional tests for category 1]
```

Test count: [COUNT]
Estimated lines: [LINES]

#### C. Create [CATEGORY_2] Tests

**File: `[TEST_DIRECTORY]/test_[category_2].py`**

[Similar structure for category 2]

#### D. Create [CATEGORY_3] Tests

**File: `[TEST_DIRECTORY]/test_[category_3].py`**

[Similar structure for category 3]

#### E. Create CI/CD Configuration

**File: `[CI_CONFIG_FILE]`**

Purpose: Automate test execution in CI/CD

```yaml
[CI_CONFIG_CONTENT]
```

#### F. Update Dependencies

**Add to `[REQUIREMENTS_FILE]`**:
```
[TEST_FRAMEWORK]==[VERSION]
[ASYNC_CLIENT]==[VERSION]
[COVERAGE_TOOL]==[VERSION]
[ADDITIONAL_DEPS]
```

#### G. Update Configuration

**Add to `[CONFIG_FILE]`** (if needed):
```[LANGUAGE]
[TEST_CONFIG_ADDITIONS]
```

### 4. VALIDATION PHASE

**A. Coverage Calculation**

- Total endpoints in codebase: [TOTAL_ENDPOINTS]
- Endpoints tested: [TESTED_ENDPOINTS]
- Coverage: [COVERAGE_PERCENT]%
- Target ([TARGET_COVERAGE]%): ✅ Met / ❌ Not Met

**B. Test Execution**

Run tests:
```bash
[TEST_COMMAND]
```

Verify:
- [ ] All tests pass
- [ ] No syntax errors
- [ ] Fixtures work correctly
- [ ] Database setup/teardown works
- [ ] Authentication works

**C. Quality Checks**

- [ ] All critical paths tested (100%)
- [ ] Success cases covered
- [ ] Error cases covered (401, 403, 404, etc.)
- [ ] Authentication tested
- [ ] Authorization tested
- [ ] Input validation tested
- [ ] Fixtures reusable
- [ ] Tests isolated (no interdependencies)
- [ ] CI/CD configured

**D. Gap Analysis**

**Endpoints NOT tested** ([COUNT]):
- [UNTESTED_1]: [REASON]
- [UNTESTED_2]: [REASON]

**Future improvements**:
- [IMPROVEMENT_1]
- [IMPROVEMENT_2]

## Deliverables

Return a comprehensive report with:

### 1. Discovery Summary

**Total Endpoints Found**: [TOTAL_ENDPOINTS]

**Breakdown by Category**:
- [CATEGORY_1]: [COUNT] endpoints
- [CATEGORY_2]: [COUNT] endpoints
- [CATEGORY_3]: [COUNT] endpoints

**Authentication Requirements**:
- Public: [COUNT] endpoints
- Authenticated: [COUNT] endpoints
- Admin only: [COUNT] endpoints

### 2. Test Suite Architecture

**Structure Created**:
```
[DIRECTORY_TREE]
```

**Files Created** ([COUNT] total):
1. `conftest.py` ([LINES] lines) - Shared fixtures
2. `test_[category_1].py` ([LINES] lines) - [COUNT] tests
3. `test_[category_2].py` ([LINES] lines) - [COUNT] tests
[... complete list ...]

### 3. Coverage Report

| Category | Endpoints | Tested | Coverage |
|----------|-----------|--------|----------|
| [CATEGORY_1] | [N] | [N] | [N]% |
| [CATEGORY_2] | [N] | [N] | [N]% |
| [CATEGORY_3] | [N] | [N] | [N]% |
| **TOTAL** | **[N]** | **[N]** | **[N]%** |

### 4. Test Breakdown

**Total Tests Written**: [COUNT]

- Success cases: [COUNT]
- Error cases: [COUNT]
- Authentication tests: [COUNT]
- Authorization tests: [COUNT]
- Validation tests: [COUNT]

### 5. Fixtures Created

1. `[FIXTURE_1]` - [PURPOSE]
2. `[FIXTURE_2]` - [PURPOSE]
3. `[FIXTURE_3]` - [PURPOSE]
[... complete list ...]

### 6. Usage Guide

**Run all tests**:
```bash
[COMMAND_ALL]
```

**Run specific category**:
```bash
[COMMAND_CATEGORY]
```

**Run with coverage**:
```bash
[COMMAND_COVERAGE]
```

### 7. CI/CD Integration

**Workflow**: `[CI_CONFIG_FILE]`
- Triggers: [TRIGGERS]
- Database: [DB_SETUP]
- Test command: [COMMAND]
- Coverage reporting: [COVERAGE_SETUP]

### 8. Gap Analysis

**Not Tested** ([COUNT] endpoints):
- [ENDPOINT_1]: [REASON]
- [ENDPOINT_2]: [REASON]

**Recommended Next Steps**:
1. [RECOMMENDATION_1]
2. [RECOMMENDATION_2]

## Success Criteria

- ✅ [TARGET_COVERAGE]%+ endpoint coverage achieved
- ✅ All critical paths tested (100%)
- ✅ [TARGET_TEST_COUNT]+ tests written
- ✅ All tests pass
- ✅ Shared fixtures created and reusable
- ✅ Authentication/authorization tested
- ✅ Error cases covered
- ✅ CI/CD workflow configured
- ✅ No syntax errors
- ✅ Database fixtures work correctly
- ✅ Tests are isolated
- ✅ Comprehensive report provided

---

**Execute this task autonomously and return the comprehensive report described above.**

---

## Fill-In Guide

Replace these placeholders before sending:

- `[PROJECT_NAME]`: Your project name
- `[TARGET_COVERAGE]`: Target percentage (e.g., 80, 90)
- `[TOTAL_ENDPOINTS]`: Number of API endpoints
- `[ROUTE_FILE_COUNT]`: Number of route files
- `[TOTAL_MODELS]`: Number of database models
- `[FRAMEWORK]`: Web framework (e.g., FastAPI, Express, Django)
- `[ORM]`: ORM used (e.g., SQLAlchemy, Prisma, Django ORM)
- `[TEST_FRAMEWORK]`: Testing framework (e.g., pytest, jest, unittest)
- `[DATABASE]`: Database (e.g., PostgreSQL, MySQL, MongoDB)
- `[CRITICAL_PATHS]`: Critical functionality (e.g., "auth, analyze, billing")
- `[ROUTES_DIRECTORY]`: Path to routes (e.g., "api/app/routes")
- `[MODELS_DIRECTORY]`: Path to models
- `[SERVICES_DIRECTORY]`: Path to services
- `[CATEGORY_1/2/3/4]`: Endpoint categories (e.g., "Authentication", "Users", "Billing")
- `[COUNT]`: Specific numbers
- `[EXAMPLES]`: Example endpoints
- `[TEST_DIRECTORY]`: Where tests go (e.g., "api/tests")
- `[TOTAL_TEST_FILES]`: Estimated file count
- `[CI_CONFIG_FILE]`: CI workflow file (e.g., ".github/workflows/test.yml")
- `[REQUIREMENTS_FILE]`: Dependency file (e.g., "requirements.txt", "package.json")
- `[CONFIG_FILE]`: Config file to update
- `[AUTH_TYPE]`: Authentication type (e.g., JWT, OAuth)
- `[SERVICE_1/2]`: Service names
- `[CRITICAL_PATH_1/2/3]`: Must-test functionality
- `[FIXTURE_1/2/3/4/5]`: Fixture names and purposes
- `[CONFTEST_LINES]`: Estimated lines in conftest.py
- `[LANGUAGE]`: Programming language
- `[TEST_COMMAND]`: How to run tests
- `[COVERAGE_PERCENT]`: Actual coverage achieved
- `[TESTED_ENDPOINTS]`: Number tested
- `[COVERAGE_TOOL]`: Coverage tool (e.g., "pytest-cov", "coverage")

---

*Created: 2025-11-07*
*Last Updated: 2025-11-07*
*Pattern: Comprehensive Generation (#3)*
*Real Example: docs/AGENT_DEMO_TESTS.md*

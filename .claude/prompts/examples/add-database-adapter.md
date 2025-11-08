# Ready-to-Use: Add Database Adapter

**Pattern**: Template Replication (Pattern #2)
**Expected Time**: 40-60 minutes
**Use For**: Adding MongoDB, Redis, DynamoDB, Firebase, etc.

## Instructions

1. Fill in all `[PLACEHOLDERS]` below
2. Copy the entire filled-in prompt
3. Send to Task tool with `subagent_type="general-purpose"`
4. Review the comprehensive report

---

# Task: Implement [DATABASE_NAME] Database Adapter

## Objective

Implement a production-ready [DATABASE_NAME] database adapter for [PROJECT_NAME] by following the existing [TEMPLATE_ADAPTER] adapter pattern. This adapter must implement the BaseDatabaseAdapter interface and integrate seamlessly with the existing data layer.

## Context

- **Project**: [PROJECT_NAME]
- **Tech Stack**: [FRAMEWORK], [LANGUAGE], async/await
- **Current State**:
  - [EXISTING_ADAPTER_1] and [EXISTING_ADAPTER_2] adapters implemented
  - [DATABASE_NAME] not yet supported
  - Primary database: [PRIMARY_DB]
  - Need [DATABASE_NAME] for [USE_CASE] (e.g., caching, sessions, real-time data)
- **Target State**:
  - Fully functional [DATABASE_NAME] adapter following same interface
  - Factory can instantiate [DATABASE_NAME] adapter
  - Supports CRUD operations
  - Connection pooling and error handling
  - Health check endpoint

## Scope

**Files to analyze:**
- `[PATH_TO_BASE_INTERFACE]` - Interface definition (BaseDatabaseAdapter)
- `[PATH_TO_TEMPLATE_ADAPTER]` - Template implementation
- `[PATH_TO_FACTORY]` - Database factory to update

**Files to create:**
- `[PATH_TO_NEW_ADAPTER]` - New [DATABASE_NAME] adapter
- `[PATH_TO_MODELS]` - Data models/schemas (if needed)

**Files to modify:**
- `[PATH_TO_FACTORY]` - Enable [DATABASE_NAME] in factory
- `[PATH_TO_CONFIG]` - Add database configuration
- `api/requirements.txt` - Add [SDK_NAME]
- `api/.env.example` - Document connection string
- `docker-compose.yml` - Add [DATABASE_NAME] service (optional)

## Requirements

### 1. DISCOVERY PHASE

**A. Analyze the Interface**

Read `[PATH_TO_BASE_INTERFACE]` and extract:
- Required methods to implement
- `connect()` signature
- `disconnect()` signature
- `create()` / `insert()` signature
- `read()` / `find()` signature
- `update()` signature
- `delete()` signature
- `health_check()` signature
- Connection management requirements
- Error handling expectations

**B. Study the Template**

Read `[PATH_TO_TEMPLATE_ADAPTER]` and understand:
- Initialization pattern (connection string, pool size)
- Connection lifecycle management
- How CRUD operations work
- Query building approach
- Error handling patterns
- Transaction support (if applicable)
- Health check implementation
- Logger integration
- Resource cleanup (connection closing)

**C. Check [DATABASE_NAME] SDK**

Research:
- SDK version: [SDK_NAME]==[VERSION]
- Official documentation: [DOCS_URL]
- Connection string format
- Async support (native or wrapper needed)
- Connection pooling options
- Authentication methods
- Common error types

### 2. ANALYSIS PHASE

**Extract Implementation Pattern:**

From [TEMPLATE_ADAPTER], identify:

1. **Initialization pattern**:
   - Connection string parsing
   - Pool configuration
   - Credential handling
   - Database selection

2. **Connection management**:
   - How to establish connection
   - Connection pooling setup
   - Connection validation
   - Graceful shutdown

3. **CRUD operations**:
   - Create/Insert pattern
   - Read/Find pattern
   - Update pattern
   - Delete pattern
   - Bulk operations

4. **Error handling**:
   - Connection errors
   - Query errors
   - Timeout handling
   - Retry logic

5. **Health check**:
   - What to verify
   - How to report status

**[DATABASE_NAME]-Specific Considerations:**

Identify differences:
- [DIFFERENCE_1] (e.g., "MongoDB uses collections instead of tables")
- [DIFFERENCE_2] (e.g., "Redis is key-value, not relational")
- [DIFFERENCE_3] (e.g., "DynamoDB uses partition keys")
- Data modeling differences
- Query language differences (SQL vs. NoSQL)
- Transaction support differences

### 3. IMPLEMENTATION PHASE

#### A. Create [DATABASE_NAME] Adapter

Create `[PATH_TO_NEW_ADAPTER]`:

```python
"""[DATABASE_NAME] database adapter."""

from typing import Optional, List, Dict, Any
from [SDK_IMPORT] import [CLIENT_CLASS]

from app.database.base import BaseDatabaseAdapter
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


class [DATABASE_NAME]Adapter(BaseDatabaseAdapter):
    """[DATABASE_NAME] database adapter implementation."""

    def __init__(
        self,
        connection_string: str,
        database_name: Optional[str] = None,
        pool_size: int = 10,
        **kwargs,
    ):
        """Initialize [DATABASE_NAME] adapter.

        Args:
            connection_string: [DATABASE_NAME] connection string
            database_name: Database name
            pool_size: Connection pool size
            **kwargs: Additional [DATABASE_NAME] parameters
        """
        super().__init__(connection_string, database_name)
        self.pool_size = pool_size
        self.client: Optional[[CLIENT_CLASS]] = None
        self.db = None
        self.[ADDITIONAL_PROPERTIES]

    async def connect(self) -> None:
        """Establish connection to [DATABASE_NAME]."""
        try:
            logger.info(f"Connecting to [DATABASE_NAME]: {self.database_name}")

            # [CONNECTION_LOGIC]
            # Initialize client
            # Set up connection pool
            # Select database
            # Verify connection

            logger.info("[DATABASE_NAME] connection established")

        except Exception as e:
            logger.error(f"Failed to connect to [DATABASE_NAME]: {e}")
            raise

    async def disconnect(self) -> None:
        """Close [DATABASE_NAME] connection."""
        try:
            if self.client:
                logger.info("Closing [DATABASE_NAME] connection")
                # [DISCONNECT_LOGIC]
                self.client = None
                logger.info("[DATABASE_NAME] connection closed")
        except Exception as e:
            logger.error(f"Error closing [DATABASE_NAME] connection: {e}")
            raise

    async def create(
        self,
        collection: str,
        data: Dict[str, Any],
        **kwargs,
    ) -> [RETURN_TYPE]:
        """Insert a document/record.

        Args:
            collection: Collection/table name
            data: Data to insert
            **kwargs: Additional parameters

        Returns:
            [RETURN_TYPE] (e.g., inserted ID, document)
        """
        try:
            logger.debug(f"Inserting into {collection}: {data}")

            # [CREATE_LOGIC]
            # Build insert query/command
            # Execute
            # Return result

            logger.debug(f"Inserted successfully: {result}")
            return result

        except Exception as e:
            logger.error(f"Insert failed: {e}")
            raise

    async def read(
        self,
        collection: str,
        query: Dict[str, Any],
        limit: Optional[int] = None,
        **kwargs,
    ) -> List[Dict[str, Any]]:
        """Find documents/records.

        Args:
            collection: Collection/table name
            query: Query filter
            limit: Maximum results
            **kwargs: Additional parameters

        Returns:
            List of matching documents/records
        """
        try:
            logger.debug(f"Querying {collection}: {query}")

            # [READ_LOGIC]
            # Build query
            # Execute
            # Parse results

            logger.debug(f"Found {len(results)} results")
            return results

        except Exception as e:
            logger.error(f"Query failed: {e}")
            raise

    async def update(
        self,
        collection: str,
        query: Dict[str, Any],
        update_data: Dict[str, Any],
        **kwargs,
    ) -> int:
        """Update documents/records.

        Args:
            collection: Collection/table name
            query: Query filter
            update_data: Update data
            **kwargs: Additional parameters

        Returns:
            Number of updated records
        """
        try:
            logger.debug(f"Updating {collection}: {query} with {update_data}")

            # [UPDATE_LOGIC]
            # Build update query/command
            # Execute
            # Return count

            logger.debug(f"Updated {count} records")
            return count

        except Exception as e:
            logger.error(f"Update failed: {e}")
            raise

    async def delete(
        self,
        collection: str,
        query: Dict[str, Any],
        **kwargs,
    ) -> int:
        """Delete documents/records.

        Args:
            collection: Collection/table name
            query: Query filter
            **kwargs: Additional parameters

        Returns:
            Number of deleted records
        """
        try:
            logger.debug(f"Deleting from {collection}: {query}")

            # [DELETE_LOGIC]
            # Build delete query/command
            # Execute
            # Return count

            logger.debug(f"Deleted {count} records")
            return count

        except Exception as e:
            logger.error(f"Delete failed: {e}")
            raise

    async def health_check(self) -> bool:
        """Check [DATABASE_NAME] connection health.

        Returns:
            True if healthy, False otherwise
        """
        try:
            # [HEALTH_CHECK_LOGIC]
            # Ping database
            # Or execute simple query
            # Return status

            return True

        except Exception as e:
            logger.error(f"[DATABASE_NAME] health check failed: {e}")
            return False

    @property
    def adapter_name(self) -> str:
        """Get adapter name."""
        return "[DATABASE_NAME_LOWER]"
```

**NOTE**: This is a skeleton. Agent should fill in all method implementations based on [TEMPLATE_ADAPTER] pattern and [DATABASE_NAME] SDK docs.

#### B. Update Factory

Modify `[PATH_TO_FACTORY]`:

**Add import:**
```python
from [IMPORT_PATH] import [DATABASE_NAME]Adapter
```

**Add factory method:**
```python
def get_[DATABASE_NAME_LOWER]_adapter() -> [DATABASE_NAME]Adapter:
    """Get [DATABASE_NAME] adapter instance."""
    if not settings.[DATABASE_NAME_UPPER]_CONNECTION_STRING:
        raise ValueError("[DATABASE_NAME] connection string not configured")

    adapter = [DATABASE_NAME]Adapter(
        connection_string=settings.[DATABASE_NAME_UPPER]_CONNECTION_STRING,
        database_name=settings.[DATABASE_NAME_UPPER]_DATABASE,
        pool_size=settings.[DATABASE_NAME_UPPER]_POOL_SIZE or 10,
    )

    return adapter
```

#### C. Update Configuration

**Add to `[PATH_TO_CONFIG]` (settings.py or config.py):**

```python
# [DATABASE_NAME] Configuration
[DATABASE_NAME_UPPER]_CONNECTION_STRING: str = Field(
    default="",
    env="[DATABASE_NAME_UPPER]_CONNECTION_STRING"
)
[DATABASE_NAME_UPPER]_DATABASE: str = Field(
    default="[DEFAULT_DB_NAME]",
    env="[DATABASE_NAME_UPPER]_DATABASE"
)
[DATABASE_NAME_UPPER]_POOL_SIZE: int = Field(
    default=10,
    env="[DATABASE_NAME_UPPER]_POOL_SIZE"
)
```

#### D. Add Health Check Endpoint

**Add to `[PATH_TO_ROUTES]`:**

```python
@router.get("/health/[DATABASE_NAME_LOWER]")
async def [DATABASE_NAME_LOWER]_health():
    """Check [DATABASE_NAME] connection health."""
    adapter = get_[DATABASE_NAME_LOWER]_adapter()

    try:
        await adapter.connect()
        healthy = await adapter.health_check()
        await adapter.disconnect()

        if healthy:
            return {"status": "healthy", "database": "[DATABASE_NAME]"}
        else:
            raise HTTPException(status_code=503, detail="[DATABASE_NAME] unhealthy")

    except Exception as e:
        logger.error(f"[DATABASE_NAME] health check error: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"[DATABASE_NAME] unavailable: {str(e)}"
        )
```

#### E. Update Requirements

**Add to `api/requirements.txt`**:
```
[SDK_NAME]==[VERSION]  # [DATABASE_NAME] driver
```

#### F. Update Environment Examples

**Add to `api/.env.example`:**
```bash
# [DATABASE_NAME] Database
[DATABASE_NAME_UPPER]_CONNECTION_STRING=[EXAMPLE_CONNECTION_STRING]
[DATABASE_NAME_UPPER]_DATABASE=[DEFAULT_DB_NAME]
[DATABASE_NAME_UPPER]_POOL_SIZE=10
```

#### G. Add Docker Service (Optional)

**Add to `docker-compose.yml`:**

```yaml
[DATABASE_NAME_LOWER]:
  image: [DOCKER_IMAGE]
  container_name: [DATABASE_NAME_LOWER]
  ports:
    - "[HOST_PORT]:[CONTAINER_PORT]"
  environment:
    - [ENV_VAR_1]=[VALUE_1]
    - [ENV_VAR_2]=[VALUE_2]
  volumes:
    - [DATABASE_NAME_LOWER]_data:/[DATA_PATH]

volumes:
  [DATABASE_NAME_LOWER]_data:
```

### 4. VALIDATION PHASE

Verify:

- [ ] All abstract methods implemented
- [ ] Factory integration complete
- [ ] Connection lifecycle works (connect/disconnect)
- [ ] CRUD operations implemented
- [ ] Health check works
- [ ] Syntax check passed
- [ ] Imports correct
- [ ] Logging integrated
- [ ] Error handling robust
- [ ] Connection pooling configured
- [ ] All [DATABASE_NAME]-specific requirements handled

## Deliverables

Return a comprehensive report with:

### 1. Discovery Summary
- Interface analysis: [KEY_FINDINGS]
- Template analysis: [PATTERNS_IDENTIFIED]
- [DATABASE_NAME] SDK version: [VERSION]
- Key differences from [TEMPLATE_ADAPTER]: [LIST]

### 2. Implementation Summary
- Files created: [LIST_WITH_LINE_COUNTS]
- Files modified: [LIST_WITH_CHANGES]
- Lines of code added: [NUMBER]
- Operations supported: [LIST]

### 3. Supported Operations

- **Connection Management**: ✅ Implemented
- **Create/Insert**: ✅ Implemented
- **Read/Find**: ✅ Implemented
- **Update**: ✅ Implemented
- **Delete**: ✅ Implemented
- **Health Check**: ✅ Implemented
- **Transactions**: ✅/❌ Implemented (if applicable)

### 4. Configuration

**Connection String Format**:
```
[CONNECTION_STRING_FORMAT]
```

**Example**:
```
[EXAMPLE_CONNECTION_STRING]
```

**Environment Variables**:
- `[DATABASE_NAME_UPPER]_CONNECTION_STRING`: [DESCRIPTION]
- `[DATABASE_NAME_UPPER]_DATABASE`: [DESCRIPTION]
- `[DATABASE_NAME_UPPER]_POOL_SIZE`: [DESCRIPTION]

### 5. Usage Example

**Initialize adapter**:
```python
[USAGE_EXAMPLE_INIT]
```

**CRUD operations**:
```python
[USAGE_EXAMPLE_CRUD]
```

**Health check**:
```python
[USAGE_EXAMPLE_HEALTH]
```

### 6. Key Differences from [TEMPLATE_ADAPTER]

- [DIFFERENCE_1]
- [DIFFERENCE_2]
- [DIFFERENCE_3]

### 7. Docker Integration

**Service added**: ✅/❌
**Port**: [PORT]
**Image**: [DOCKER_IMAGE]

## Success Criteria

- ✅ [DATABASE_NAME]Adapter class created and implements BaseDatabaseAdapter
- ✅ Factory successfully creates [DATABASE_NAME] instances
- ✅ Connection lifecycle works correctly
- ✅ All CRUD operations implemented
- ✅ Health check endpoint added and working
- ✅ Error handling robust
- ✅ Connection pooling configured
- ✅ Logger integrated throughout
- ✅ Environment variables documented
- ✅ Docker service added (if applicable)
- ✅ No syntax errors

---

**Execute this task autonomously and return the comprehensive report described above.**

---

## Fill-In Guide

Replace these placeholders before sending:

- `[DATABASE_NAME]`: e.g., "MongoDB", "Redis", "DynamoDB"
- `[PROJECT_NAME]`: Your project name
- `[TEMPLATE_ADAPTER]`: e.g., "PostgreSQL", "MySQL" (which to copy)
- `[EXISTING_ADAPTER_1/2]`: e.g., "PostgreSQL", "SQLite"
- `[SDK_NAME]`: e.g., "motor", "redis", "boto3"
- `[VERSION]`: SDK version number
- `[FRAMEWORK]`: e.g., "FastAPI", "Django"
- `[LANGUAGE]`: e.g., "Python", "Node.js"
- `[PRIMARY_DB]`: Main database (e.g., "PostgreSQL")
- `[USE_CASE]`: Why adding this DB (e.g., "caching", "real-time data")
- `[PATH_TO_*]`: Actual file paths in your project
- `[SDK_IMPORT]`: e.g., "motor.motor_asyncio", "redis.asyncio"
- `[CLIENT_CLASS]`: e.g., "AsyncIOMotorClient", "Redis"
- `[DOCS_URL]`: Official documentation URL
- `[DIFFERENCE_1/2/3]`: Important differences
- `[RETURN_TYPE]`: Return type for create() method
- `[DATABASE_NAME_UPPER]`: e.g., "MONGODB", "REDIS"
- `[DATABASE_NAME_LOWER]`: e.g., "mongodb", "redis"
- `[IMPORT_PATH]`: e.g., "app.database.mongodb"
- `[DEFAULT_DB_NAME]`: Default database name
- `[EXAMPLE_CONNECTION_STRING]`: Example connection string
- `[CONNECTION_STRING_FORMAT]`: Format description
- `[DOCKER_IMAGE]`: Docker image name (e.g., "mongo:7", "redis:7-alpine")
- `[HOST_PORT]`: Host port (e.g., "27017", "6379")
- `[CONTAINER_PORT]`: Container port
- `[ENV_VAR_1/2]`: Docker environment variables
- `[DATA_PATH]`: Data volume path in container

---

*Created: 2025-11-07*
*Last Updated: 2025-11-07*
*Pattern: Template Replication (#2)*

# Ready-to-Use: Refactor Logging

**Pattern**: Systematic Replacement (Pattern #1)
**Expected Time**: 20-30 minutes
**Use For**: Replacing print() with structured logging, upgrading logging libraries

## Instructions

1. Fill in all `[PLACEHOLDERS]` below
2. Copy the entire filled-in prompt
3. Send to Task tool with `subagent_type="general-purpose"`
4. Review the comprehensive report

---

# Task: Replace print() with Structured Logging in [PROJECT_NAME]

## Objective

Find and replace ALL instances of `print()` with proper structured logging across [SCOPE] in the [PROJECT_NAME] codebase.

## Context

- **Project**: [PROJECT_NAME]
- **Tech Stack**: [LANGUAGE], [FRAMEWORK]
- **Current State**: Code uses `print()` for debugging and output
- **Target State**: All instances use structured logger (`logger.debug/info/warning/error`)
- **Reason for Change**: Production readiness - need structured, configurable logging

## Scope

**Directories to search:**
- `[DIRECTORY_1]` - [DESCRIPTION] (e.g., "API routes and services")
- `[DIRECTORY_2]` - [DESCRIPTION] (e.g., "Background worker tasks")

**File types to include:**
- `.py` (or `.js`, `.ts`, etc.)

**Exclusions:**
- `tests/` - Test files can keep print for now
- `[VENV_DIR]` - Virtual environment / node_modules
- `[EXCLUDED_DIR]` - [REASON]

## Requirements

### 1. DISCOVERY PHASE

**A. Find All print() Statements**

Use Grep to search for ALL occurrences of `print()`:
- Search pattern: `print\(`
- Directories: [DIRECTORY_LIST]
- File types: [FILE_TYPES]

**B. Categorize Findings**

Group instances by context:
- **Debug messages**: Temporary debugging statements
- **Info messages**: General information flow
- **Warning messages**: Potential issues
- **Error messages**: Error reporting

Also categorize by file type:
- **Routes/Controllers**: [COUNT] instances
- **Services/Business Logic**: [COUNT] instances
- **Worker Tasks**: [COUNT] instances
- **Utilities**: [COUNT] instances

**C. Count and Report**

Return:
- Total instances found: [N]
- Files affected: [N]
- Breakdown by category
- Breakdown by severity

### 2. ANALYSIS PHASE

**A. Before/After Examples**

Provide examples for each category:

**Example 1: Debug Messages**

Before:
```python
print(f"Processing user: {user_id}")
```

After:
```python
logger.debug(f"Processing user: {user_id}")
```

**Example 2: Info Messages**

Before:
```python
print("Service started successfully")
```

After:
```python
logger.info("Service started successfully")
```

**Example 3: Warning Messages**

Before:
```python
print(f"Warning: Rate limit approaching for user {user_id}")
```

After:
```python
logger.warning(f"Rate limit approaching for user {user_id}")
```

**Example 4: Error Messages**

Before:
```python
print(f"Error: Failed to process: {error}")
```

After:
```python
logger.error(f"Failed to process: {error}")
```

**B. Logger Setup Requirements**

Determine if logger setup is needed:

**Option 1: Logger already exists**
- Import statement: `[IMPORT_STATEMENT]`
- Usage: `logger = [SETUP_CALL]`

**Option 2: Create new logger utility**

Create `[LOGGER_FILE_PATH]`:

```python
"""Centralized logging configuration."""

import logging
import os
from typing import Optional


def setup_logger(
    name: str,
    level: Optional[str] = None,
    format_string: Optional[str] = None
) -> logging.Logger:
    """Configure and return a logger instance.

    Args:
        name: Logger name (usually __name__)
        level: Log level (DEBUG/INFO/WARNING/ERROR)
        format_string: Custom format string

    Returns:
        Configured logger instance
    """
    if format_string is None:
        format_string = (
            "%(asctime)s - %(name)s - %(levelname)s - "
            "%(filename)s:%(lineno)d - %(message)s"
        )

    logger = logging.getLogger(name)

    # Set level from parameter or environment
    if level is None:
        level = os.getenv("LOG_LEVEL", "INFO").upper()
    logger.setLevel(getattr(logging, level))

    # Avoid duplicate handlers
    if logger.handlers:
        return logger

    # Console handler
    handler = logging.StreamHandler()
    handler.setLevel(getattr(logging, level))

    # Format
    formatter = logging.Formatter(format_string)
    handler.setFormatter(formatter)

    logger.addHandler(handler)

    return logger
```

**C. Import Requirements**

For each file modified:
- Add import: `from [LOGGER_IMPORT] import setup_logger`
- Add logger setup: `logger = setup_logger(__name__)`

### 3. IMPLEMENTATION PHASE

**A. Create Logger Utility** (if needed)

Create `[LOGGER_FILE_PATH]` with the logger setup code above.

**B. Replace print() Statements**

For each file with print() statements:

1. Add logger import at the top:
   ```python
   from [LOGGER_IMPORT] import setup_logger
   ```

2. Initialize logger after imports:
   ```python
   logger = setup_logger(__name__)
   ```

3. Replace each print() with appropriate logger call:
   - `print("debug info")` → `logger.debug("debug info")`
   - `print("info")` → `logger.info("info")`
   - `print("Warning:")` → `logger.warning(...)`
   - `print("Error:")` → `logger.error(...)`

4. Preserve:
   - Original message content
   - f-string formatting
   - Variables and context
   - Code indentation

**C. Update Environment Configuration**

Add to `[ENV_EXAMPLE_FILE_1]`:
```bash
# Logging Configuration
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR
```

Add to `[ENV_EXAMPLE_FILE_2]` (if multiple services):
```bash
# Logging Configuration
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR
```

**D. Handle Special Cases**

Special cases to consider:
- `print()` in docstrings/comments (leave as-is)
- `print()` in test files (can leave or replace based on preference)
- `print()` with multiple arguments (convert to f-string first)
- `print()` with sep/end parameters (adapt formatting)

### 4. VALIDATION PHASE

**A. Verify Completeness**

Search again for `print\(`:
- Expected result: 0 instances in production code
- Acceptable: print() in tests, comments, strings

**B. Syntax Verification**

For each modified file:
- [ ] File passes syntax check (`python -m py_compile [file]`)
- [ ] Imports are correct
- [ ] Logger is initialized
- [ ] No undefined references

**C. Create Summary**

Return statistics:
- Total print() statements found: [N]
- Statements replaced: [N]
- Files modified: [N]
- Logger utility created: Yes/No
- Remaining print() statements: [N] (with justification)

## Deliverables

Return a comprehensive report with:

### 1. Discovery Summary

**Total print() Statements Found**: [N]

**Files Affected** ([N] total):
- `[FILE_1]`: [N] instances
- `[FILE_2]`: [N] instances
[... complete list ...]

**Category Breakdown**:
- Debug messages: [N]
- Info messages: [N]
- Warning messages: [N]
- Error messages: [N]

### 2. Implementation Summary

**Logger Utility**:
- Created: `[LOGGER_FILE_PATH]` ([N] lines)
- Or: Using existing logger from `[EXISTING_PATH]`

**Files Modified** ([N] total):
1. `[FILE_1]` - [N] replacements
2. `[FILE_2]` - [N] replacements
[... complete list ...]

**Total Changes**:
- Lines modified: [N]
- Imports added: [N]
- Logger initializations added: [N]

### 3. Before/After Examples

**Example 1: [FILE_NAME_1]**

Before:
```python
[OLD_CODE_1]
```

After:
```python
[NEW_CODE_1]
```

**Example 2: [FILE_NAME_2]**

Before:
```python
[OLD_CODE_2]
```

After:
```python
[NEW_CODE_2]
```

[Show 3-5 representative examples]

### 4. Verification Results

**Remaining print() Statements**: [N]
- In test files: [N] (acceptable)
- In comments/strings: [N] (acceptable)
- Requiring manual review: [N]

**Syntax Check**: ✅ All files pass compilation

**Files Requiring Manual Review**:
- `[FILE_1]`: [REASON]
- `[FILE_2]`: [REASON]

### 5. Usage Guide

**Log Levels**:
- `DEBUG`: Detailed diagnostic information
- `INFO`: General informational messages
- `WARNING`: Warning messages for potentially harmful situations
- `ERROR`: Error messages for serious problems

**Configuration**:
Set `LOG_LEVEL` environment variable:
```bash
export LOG_LEVEL=DEBUG  # For development
export LOG_LEVEL=INFO   # For production
```

**In Code**:
```python
from [LOGGER_IMPORT] import setup_logger

logger = setup_logger(__name__)

logger.debug("Detailed debug information")
logger.info("General information")
logger.warning("Warning message")
logger.error("Error message")
```

### 6. Statistics Table

| Metric | Count |
|--------|-------|
| Total print() found | [N] |
| Replaced with logger | [N] |
| Files modified | [N] |
| Lines changed | [N] |
| Remaining (acceptable) | [N] |
| Coverage | [N]% |

## Success Criteria

- ✅ All print() statements in production code found
- ✅ [TARGET_PERCENTAGE]% successfully replaced (target: 100%)
- ✅ Logger utility created (if needed)
- ✅ All modified files pass syntax validation
- ✅ Imports added correctly
- ✅ Logger initialized in each file
- ✅ Environment variables documented
- ✅ Grep search returns 0 instances in production code
- ✅ Comprehensive report provided

---

**Execute this task autonomously and return the comprehensive report described above.**

---

## Fill-In Guide

Replace these placeholders before sending:

- `[PROJECT_NAME]`: Your project name
- `[SCOPE]`: Scope description (e.g., "API and worker services")
- `[LANGUAGE]`: Programming language (e.g., Python, JavaScript)
- `[FRAMEWORK]`: Framework if applicable (e.g., FastAPI, Express)
- `[DIRECTORY_1/2]`: Directories to search (e.g., "api/app/", "worker/")
- `[DESCRIPTION]`: What's in each directory
- `[VENV_DIR]`: Virtual env / dependencies dir (e.g., "venv/", "node_modules/")
- `[EXCLUDED_DIR]`: Other dirs to exclude
- `[DIRECTORY_LIST]`: Space-separated directory list
- `[FILE_TYPES]`: File extensions to include
- `[LOGGER_FILE_PATH]`: Where to create logger utility (e.g., "app/utils/logger.py")
- `[IMPORT_STATEMENT]`: Logger import (e.g., "from app.utils.logger import setup_logger")
- `[LOGGER_IMPORT]`: Import path
- `[SETUP_CALL]`: How to initialize (e.g., "setup_logger(__name__)")
- `[ENV_EXAMPLE_FILE_1/2]`: .env.example file paths
- `[TARGET_PERCENTAGE]`: Expected success rate (usually 100)
- `[N]`: Placeholder for actual numbers
- `[FILE_1/2]`: Actual file paths
- `[OLD_CODE_1/2]`: Before code examples
- `[NEW_CODE_1/2]`: After code examples
- `[REASON]`: Explanation for special cases

---

*Created: 2025-11-07*
*Last Updated: 2025-11-07*
*Pattern: Systematic Replacement (#1)*
*Real Example: docs/AGENT_DEMO_LOGGING.md*

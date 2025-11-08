# Pattern #1: Systematic Replacement

**Use Case**: Find and replace all instances of X with Y throughout the codebase

**Expected Time**: 20-30 minutes

**Best For**:
- Refactoring deprecated APIs
- Upgrading library versions
- Modernizing syntax
- Adding type hints
- Migrating from callbacks to async/await

---

## Instructions

1. Fill in all `[PLACEHOLDERS]` below
2. Copy the entire filled-in prompt
3. Send to Task tool with `subagent_type="general-purpose"`
4. Review the comprehensive report

---

# Task: Systematic Replacement of [OLD_PATTERN] with [NEW_PATTERN]

## Objective

Find and replace ALL instances of `[OLD_PATTERN]` with `[NEW_PATTERN]` across [SCOPE_DESCRIPTION] in the [PROJECT_NAME] codebase.

## Context

- **Project**: [PROJECT_NAME]
- **Tech Stack**: [TECH_STACK]
- **Current State**: Code uses deprecated/outdated [OLD_PATTERN]
- **Target State**: All instances replaced with modern [NEW_PATTERN]
- **Reason for Change**: [WHY_CHANGING]

## Scope

**Directories to search:**
- `[DIRECTORY_1]` - [DESCRIPTION]
- `[DIRECTORY_2]` - [DESCRIPTION]
- `[DIRECTORY_N]` - [DESCRIPTION]

**File types to include:**
- [FILE_EXTENSION_1] (e.g., `.py`, `.ts`, `.js`)
- [FILE_EXTENSION_2]

**Exclusions:**
- `[EXCLUDED_DIR_1]` - [REASON]
- `[EXCLUDED_DIR_2]` - [REASON]

## Requirements

### 1. DISCOVERY PHASE

**A. Find All Instances**

Use Grep to search for ALL occurrences of `[OLD_PATTERN]`:
- Search pattern: `[GREP_PATTERN]`
- Directories: [DIRECTORIES_LIST]
- File types: [FILE_TYPES]

**B. Categorize Findings**

Group instances by:
- File location
- Context (e.g., error handling, logging, API calls)
- Complexity (simple vs. requires additional changes)

**C. Count and Report**

Return:
- Total instances found
- Files affected
- Breakdown by category

### 2. ANALYSIS PHASE

**A. Before/After Examples**

For each category, provide before/after examples:

**Example 1: [CONTEXT_1]**

Before:
```[LANGUAGE]
[OLD_CODE_EXAMPLE_1]
```

After:
```[LANGUAGE]
[NEW_CODE_EXAMPLE_1]
```

**Example 2: [CONTEXT_2]**

Before:
```[LANGUAGE]
[OLD_CODE_EXAMPLE_2]
```

After:
```[LANGUAGE]
[NEW_CODE_EXAMPLE_2]
```

**B. Edge Cases**

Identify special cases requiring custom handling:
- [EDGE_CASE_1]
- [EDGE_CASE_2]
- [EDGE_CASE_3]

**C. Dependencies**

Check if replacements require:
- New imports: [IMPORTS_NEEDED]
- Configuration changes: [CONFIG_CHANGES]
- Additional files: [FILES_NEEDED]

### 3. IMPLEMENTATION PHASE

**A. Make Replacements**

For each file:
1. Replace `[OLD_PATTERN]` with `[NEW_PATTERN]`
2. Add required imports if needed
3. Preserve code context and indentation
4. Maintain existing comments

**B. Handle Special Cases**

For edge cases identified in analysis:
- [SPECIAL_HANDLING_1]
- [SPECIAL_HANDLING_2]

**C. Update Dependencies**

If needed:
- Modify imports
- Update configuration files
- Add new utility files

### 4. VALIDATION PHASE

**A. Verify Completeness**

Search again for `[OLD_PATTERN]`:
- Expected result: 0 instances (or [EXPECTED_REMAINING] if some are intentional)
- If any remain, explain why they weren't replaced

**B. Syntax Verification**

- [ ] All files pass syntax check
- [ ] No broken imports
- [ ] No undefined references

**C. Create Summary**

Return statistics:
- Total replacements made
- Files modified
- Lines changed
- Instances remaining (if any)
- Edge cases handled

## Deliverables

Return a comprehensive report with:

### 1. Discovery Summary
- Total instances found: [NUMBER]
- Files affected: [NUMBER]
- Categories identified: [LIST]

### 2. Implementation Summary
- Replacements made: [NUMBER]
- Files modified: [LIST]
- Special cases handled: [NUMBER]

### 3. Before/After Examples
Show 3-5 representative examples

### 4. Verification Results
- Remaining instances: [NUMBER]
- Syntax check: ✅ PASSED / ❌ FAILED
- Files that need manual review: [LIST]

### 5. Statistics Table

| Metric | Count |
|--------|-------|
| Total instances found | [N] |
| Instances replaced | [N] |
| Files modified | [N] |
| Lines changed | [N] |
| Special cases | [N] |
| Remaining instances | [N] |

## Success Criteria

- ✅ All instances of `[OLD_PATTERN]` found
- ✅ [TARGET_PERCENTAGE]% successfully replaced (e.g., 100%, 95%)
- ✅ Grep search returns [EXPECTED_RESULT] instances
- ✅ All modified files pass syntax validation
- ✅ Imports updated correctly
- ✅ No broken references
- ✅ Edge cases documented
- ✅ Comprehensive report provided

---

**Execute this task autonomously and return the comprehensive report described above.**

---

## Fill-In Guide

Replace these placeholders before sending:

- `[OLD_PATTERN]`: What to find (e.g., `print()`, `var `, `callback(`)
- `[NEW_PATTERN]`: What to replace with (e.g., `logger.info()`, `const `, `await `)
- `[PROJECT_NAME]`: Your project name
- `[TECH_STACK]`: Technologies used (e.g., Python/FastAPI, Node/Express)
- `[SCOPE_DESCRIPTION]`: What part of codebase (e.g., "all API routes", "backend services")
- `[WHY_CHANGING]`: Reason for change (e.g., "deprecation", "best practices")
- `[DIRECTORY_1/2/N]`: Directories to search
- `[FILE_EXTENSION_1/2]`: File types (e.g., `.py`, `.ts`)
- `[EXCLUDED_DIR_1/2]`: Directories to exclude (e.g., `node_modules`, `venv`)
- `[GREP_PATTERN]`: Regex pattern for search
- `[DIRECTORIES_LIST]`: Space-separated list
- `[FILE_TYPES]`: Comma-separated extensions
- `[CONTEXT_1/2]`: Categories (e.g., "Error Handling", "API Calls")
- `[LANGUAGE]`: Programming language for code blocks
- `[OLD_CODE_EXAMPLE_1/2]`: Actual code snippets showing current state
- `[NEW_CODE_EXAMPLE_1/2]`: Actual code snippets showing desired state
- `[EDGE_CASE_1/2/3]`: Special situations (e.g., "print() in docstrings")
- `[IMPORTS_NEEDED]`: Required imports (e.g., `from app.utils.logger import setup_logger`)
- `[CONFIG_CHANGES]`: Configuration updates needed
- `[FILES_NEEDED]`: New files to create
- `[SPECIAL_HANDLING_1/2]`: How to handle edge cases
- `[EXPECTED_REMAINING]`: If some instances should stay (e.g., 0, 3)
- `[TARGET_PERCENTAGE]`: Expected success rate (e.g., 100%, 95%)
- `[EXPECTED_RESULT]`: Final grep count (e.g., 0, "0 in production code")

---

## Example: Real-World Usage

**Task**: Replace all `print()` with structured logging

```markdown
# Task: Systematic Replacement of print() with Structured Logging

## Objective
Find and replace ALL instances of `print()` with proper logging calls across the API and worker services in ScriptRipper+.

## Context
- **Project**: ScriptRipper+
- **Tech Stack**: Python 3.11, FastAPI, Redis Queue
- **Current State**: Code uses print() for debugging
- **Target State**: All instances use logger.debug/info/warning/error
- **Reason for Change**: Production readiness - need structured logging

## Scope

**Directories to search:**
- `api/app/` - API routes and services
- `worker/` - Background worker tasks

**File types to include:**
- `.py`

**Exclusions:**
- `tests/` - Test files can keep print for now
- `venv/` - Virtual environment

[... rest of filled-in template ...]
```

---

*Created: 2025-11-07*
*Pattern: Systematic Replacement*
*Estimated Time: 20-30 minutes*

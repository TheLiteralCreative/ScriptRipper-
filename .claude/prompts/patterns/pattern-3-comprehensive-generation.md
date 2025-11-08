# Pattern #3: Comprehensive Generation

**Use Case**: Build complete feature or suite from scratch across multiple files

**Expected Time**: 1-2 hours

**Best For**:
- Generating complete test suites
- Building admin panels
- Creating documentation sites
- Scaffolding microservices
- Building authentication systems
- Generating API documentation

---

## Instructions

1. Fill in all `[PLACEHOLDERS]` below
2. Copy the entire filled-in prompt
3. Send to Task tool with `subagent_type="general-purpose"`
4. Review the comprehensive report

---

# Task: Generate Complete [FEATURE_NAME] for [PROJECT_NAME]

## Objective

Build a comprehensive, production-ready [FEATURE_NAME] for [PROJECT_NAME] from scratch. This should include [COMPONENT_COUNT] components covering [COVERAGE_DESCRIPTION].

## Context

- **Project**: [PROJECT_NAME]
- **Tech Stack**: [TECH_STACK]
- **Current State**:
  - [CURRENT_STATE_1]
  - [CURRENT_STATE_2]
  - No [FEATURE_NAME] currently exists
- **Target State**:
  - Complete [FEATURE_NAME] with [TARGET_METRIC_1]
  - [TARGET_METRIC_2] (e.g., "80%+ coverage")
  - [TARGET_METRIC_3] (e.g., "All critical paths tested")
  - CI/CD integration ready

## Scope

**Areas to analyze:**
- `[AREA_1]` - [DESCRIPTION] ([N] [ITEMS])
- `[AREA_2]` - [DESCRIPTION] ([N] [ITEMS])
- `[AREA_3]` - [DESCRIPTION] ([N] [ITEMS])

**Files to create:**
- `[NEW_FILE_1]` - [PURPOSE]
- `[NEW_FILE_2]` - [PURPOSE]
- `[NEW_FILE_N]` - [PURPOSE]
- (Approximately [TOTAL_FILE_COUNT] files)

**Files to modify:**
- `[MODIFIED_FILE_1]` - [CHANGES]
- `[MODIFIED_FILE_2]` - [CHANGES]

## Requirements

### 1. DISCOVERY PHASE (Exploratory)

**A. Comprehensive Analysis**

Analyze ALL relevant code in:
- `[DIRECTORY_1]` - Identify all [ITEMS_TO_FIND]
- `[DIRECTORY_2]` - Map all [ITEMS_TO_FIND]
- `[DIRECTORY_3]` - Discover all [ITEMS_TO_FIND]

For each [ITEM] discovered, extract:
- Name and location
- [ATTRIBUTE_1] (e.g., "Parameters", "Dependencies")
- [ATTRIBUTE_2] (e.g., "Return types", "Side effects")
- [ATTRIBUTE_3] (e.g., "Authentication requirements", "Error cases")
- Complexity level (simple/medium/complex)

**B. Categorization**

Group [ITEMS] by:
- [CATEGORY_1] ([N] items) - [DESCRIPTION]
- [CATEGORY_2] ([N] items) - [DESCRIPTION]
- [CATEGORY_3] ([N] items) - [DESCRIPTION]

**C. Prioritization**

Rank [ITEMS] by:
- Critical path (must-have)
- Common use cases (should-have)
- Edge cases (nice-to-have)

**D. Dependency Mapping**

Identify:
- [DEPENDENCY_1] dependencies (e.g., "Database models")
- [DEPENDENCY_2] dependencies (e.g., "Authentication")
- [DEPENDENCY_3] dependencies (e.g., "External services")
- Shared utilities needed

### 2. ANALYSIS PHASE (Strategic)

**A. Architecture Design**

Design the structure:

```
[FEATURE_NAME]/
├── [COMPONENT_1]/
│   ├── [FILE_1_1] - [PURPOSE]
│   ├── [FILE_1_2] - [PURPOSE]
│   └── [FILE_1_N] - [PURPOSE]
├── [COMPONENT_2]/
│   ├── [FILE_2_1] - [PURPOSE]
│   └── [FILE_2_N] - [PURPOSE]
└── [SHARED_FILE] - [PURPOSE]
```

**B. Component Planning**

For each component:

**[COMPONENT_1]: [DESCRIPTION]**
- Purpose: [PURPOSE]
- Coverage: [N] [ITEMS]
- Dependencies: [DEPENDENCIES]
- Estimated lines: [LINES]

**[COMPONENT_2]: [DESCRIPTION]**
- Purpose: [PURPOSE]
- Coverage: [N] [ITEMS]
- Dependencies: [DEPENDENCIES]
- Estimated lines: [LINES]

**C. Shared Infrastructure**

Plan shared components:
- [SHARED_COMPONENT_1]: [PURPOSE]
- [SHARED_COMPONENT_2]: [PURPOSE]
- [SHARED_COMPONENT_3]: [PURPOSE]

**D. Success Metrics**

Define measurable goals:
- [METRIC_1]: [TARGET] (e.g., "Coverage: 80%+")
- [METRIC_2]: [TARGET] (e.g., "Response time: <100ms")
- [METRIC_3]: [TARGET] (e.g., "Error handling: 100%")

### 3. IMPLEMENTATION PHASE (Multi-file)

#### A. Create Shared Infrastructure

**File: `[SHARED_FILE_1]`**

Purpose: [PURPOSE]

```[LANGUAGE]
"""[DESCRIPTION]."""

[COMPLETE_CODE_TEMPLATE_1]

# [COMPONENT_1_NAME]
[COMPONENT_1_CODE]

# [COMPONENT_2_NAME]
[COMPONENT_2_CODE]

# [COMPONENT_N_NAME]
[COMPONENT_N_CODE]
```

Estimated lines: [N]

#### B. Create [COMPONENT_1]

**File: `[COMPONENT_1_FILE_1]`**

Purpose: [PURPOSE]

```[LANGUAGE]
"""[DESCRIPTION]."""

[COMPLETE_CODE_TEMPLATE_2]
```

Template should include:
- [REQUIREMENT_1] (e.g., "All critical paths")
- [REQUIREMENT_2] (e.g., "Error cases")
- [REQUIREMENT_3] (e.g., "Edge cases")

Estimated lines: [N]

**File: `[COMPONENT_1_FILE_2]`**

Purpose: [PURPOSE]

```[LANGUAGE]
"""[DESCRIPTION]."""

[COMPLETE_CODE_TEMPLATE_3]
```

Estimated lines: [N]

#### C. Create [COMPONENT_2]

**File: `[COMPONENT_2_FILE_1]`**

Purpose: [PURPOSE]

```[LANGUAGE]
"""[DESCRIPTION]."""

[COMPLETE_CODE_TEMPLATE_4]
```

Template should include:
- [REQUIREMENT_1]
- [REQUIREMENT_2]
- [REQUIREMENT_3]

Estimated lines: [N]

#### D. Create [COMPONENT_N]

[Repeat structure for each component]

#### E. Update Configuration/Integration

**Modify: `[CONFIG_FILE_1]`**

Add:
```[LANGUAGE]
[CONFIG_ADDITIONS]
```

**Modify: `[CONFIG_FILE_2]`**

Add:
```[LANGUAGE]
[CONFIG_ADDITIONS]
```

#### F. Create Documentation

**File: `[DOCUMENTATION_FILE]`**

```markdown
# [FEATURE_NAME] Documentation

## Overview
[DESCRIPTION]

## Structure
[FILE_STRUCTURE]

## Usage
[USAGE_EXAMPLES]

## [SECTION_1]
[CONTENT]

## [SECTION_2]
[CONTENT]
```

### 4. VALIDATION PHASE (Comprehensive)

**A. Coverage Analysis**

Calculate coverage:
- Total [ITEMS] in codebase: [N]
- [ITEMS] covered: [N]
- Coverage percentage: [N]%
- Target met: ✅/❌

**B. Quality Checks**

Verify:
- [ ] All [CRITICAL_ITEMS] covered
- [ ] [QUALITY_METRIC_1] met (e.g., "All tests pass")
- [ ] [QUALITY_METRIC_2] met (e.g., "No syntax errors")
- [ ] [QUALITY_METRIC_3] met (e.g., "Consistent patterns")
- [ ] Documentation complete
- [ ] Configuration integrated

**C. Gap Analysis**

Identify gaps:
- [MISSING_ITEM_1]: [WHY_MISSING]
- [MISSING_ITEM_2]: [WHY_MISSING]
- Recommended next steps: [RECOMMENDATIONS]

**D. Statistics Summary**

Generate metrics:
- Files created: [N]
- Total lines of code: [N]
- [CUSTOM_METRIC_1]: [N]
- [CUSTOM_METRIC_2]: [N]
- [CUSTOM_METRIC_3]: [N]

## Deliverables

Return a comprehensive report with:

### 1. Discovery Summary

**Total [ITEMS] Found**: [N]

**Breakdown by [CATEGORY]**:
- [CATEGORY_1]: [N] [ITEMS]
- [CATEGORY_2]: [N] [ITEMS]
- [CATEGORY_3]: [N] [ITEMS]

**Dependency Analysis**:
- [DEPENDENCY_TYPE_1]: [LIST]
- [DEPENDENCY_TYPE_2]: [LIST]

### 2. Architecture Summary

**Structure Created**:
```
[DIRECTORY_TREE]
```

**Components**:
- [COMPONENT_1]: [N] files, [N] lines
- [COMPONENT_2]: [N] files, [N] lines
- Total: [N] files, [N] lines

### 3. Implementation Summary

**Files Created** ([N] total):
1. `[FILE_1]` ([N] lines) - [PURPOSE]
2. `[FILE_2]` ([N] lines) - [PURPOSE]
[... complete list ...]

**Files Modified** ([N] total):
1. `[FILE_1]` - [CHANGES]
2. `[FILE_2]` - [CHANGES]

### 4. Coverage Report

| Category | Total | Covered | % |
|----------|-------|---------|---|
| [CATEGORY_1] | [N] | [N] | [N]% |
| [CATEGORY_2] | [N] | [N] | [N]% |
| [CATEGORY_3] | [N] | [N] | [N]% |
| **TOTAL** | **[N]** | **[N]** | **[N]%** |

### 5. Quality Metrics

- [METRIC_1]: [VALUE] (Target: [TARGET])
- [METRIC_2]: [VALUE] (Target: [TARGET])
- [METRIC_3]: [VALUE] (Target: [TARGET])

### 6. Usage Guide

**How to [USE_FEATURE]**:

```[LANGUAGE]
[USAGE_EXAMPLE_CODE]
```

**How to [EXTEND_FEATURE]**:

```[LANGUAGE]
[EXTENSION_EXAMPLE_CODE]
```

### 7. Gap Analysis

**Not Covered** ([N] items):
- [GAP_1]: [REASON]
- [GAP_2]: [REASON]

**Recommended Next Steps**:
1. [RECOMMENDATION_1]
2. [RECOMMENDATION_2]

### 8. Integration Checklist

- [ ] [INTEGRATION_ITEM_1] (e.g., "CI/CD configured")
- [ ] [INTEGRATION_ITEM_2] (e.g., "Documentation generated")
- [ ] [INTEGRATION_ITEM_3] (e.g., "Dependencies installed")

## Success Criteria

- ✅ [TARGET_METRIC_1] achieved (e.g., "80%+ coverage")
- ✅ [TARGET_METRIC_2] achieved (e.g., "All critical paths covered")
- ✅ All [COMPONENT_COUNT] components created
- ✅ Shared infrastructure implemented
- ✅ No syntax errors
- ✅ [QUALITY_CHECK_1] passed (e.g., "All tests pass")
- ✅ [QUALITY_CHECK_2] passed (e.g., "Documentation complete")
- ✅ Configuration integrated
- ✅ Comprehensive report provided
- ✅ [CUSTOM_SUCCESS_CRITERIA]

---

**Execute this task autonomously and return the comprehensive report described above.**

---

## Fill-In Guide

Replace these placeholders before sending:

### Feature Details
- `[FEATURE_NAME]`: e.g., "Integration Test Suite", "Admin Dashboard"
- `[PROJECT_NAME]`: Your project name
- `[COMPONENT_COUNT]`: Number of major components (e.g., "14", "8")
- `[COVERAGE_DESCRIPTION]`: What will be covered (e.g., "all API endpoints")
- `[TOTAL_FILE_COUNT]`: Estimated files to create

### Current State
- `[TECH_STACK]`: Technologies used
- `[CURRENT_STATE_1/2]`: Current situation
- `[TARGET_METRIC_1/2/3]`: Goals to achieve

### Scope
- `[AREA_1/2/3]`: Areas to analyze
- `[N]`: Specific counts
- `[ITEMS]`: What to count (e.g., "endpoints", "models")
- `[ITEMS_TO_FIND]`: What to discover
- `[NEW_FILE_1/2/N]`: Files to create
- `[MODIFIED_FILE_1/2]`: Files to change

### Discovery
- `[DIRECTORY_1/2/3]`: Directories to explore
- `[ATTRIBUTE_1/2/3]`: Attributes to extract
- `[CATEGORY_1/2/3]`: Categorization scheme
- `[DEPENDENCY_1/2/3]`: Types of dependencies

### Architecture
- `[COMPONENT_1/2/N]`: Component names
- `[FILE_1_1]`: File naming pattern
- `[PURPOSE]`: Purpose of each file
- `[SHARED_FILE]`: Shared infrastructure file
- `[SHARED_COMPONENT_1/2/3]`: Shared utilities
- `[LINES]`: Estimated line count

### Implementation
- `[LANGUAGE]`: Programming language
- `[COMPLETE_CODE_TEMPLATE_1/2/3/4]`: Full code templates (100+ lines each)
- `[REQUIREMENT_1/2/3]`: Requirements for each component
- `[CONFIG_FILE_1/2]`: Configuration files
- `[CONFIG_ADDITIONS]`: What to add to config
- `[DOCUMENTATION_FILE]`: Doc file path
- `[SECTION_1/2]`: Documentation sections

### Validation
- `[CRITICAL_ITEMS]`: Must-have items
- `[QUALITY_METRIC_1/2/3]`: Quality checks
- `[MISSING_ITEM_1/2]`: Known gaps
- `[WHY_MISSING]`: Reason for gaps
- `[CUSTOM_METRIC_1/2/3]`: Custom measurements

### Deliverables
- `[DIRECTORY_TREE]`: ASCII directory structure
- `[METRIC_1/2/3]`: Metrics to measure
- `[TARGET]`: Target values
- `[USE_FEATURE]`: How to use
- `[EXTEND_FEATURE]`: How to extend
- `[GAP_1/2]`: Gaps identified
- `[RECOMMENDATION_1/2]`: Next steps
- `[INTEGRATION_ITEM_1/2/3]`: Integration tasks
- `[QUALITY_CHECK_1/2]`: Quality gates
- `[CUSTOM_SUCCESS_CRITERIA]`: Project-specific success criteria

---

## Example: Real-World Usage

**Task**: Generate Integration Test Suite

```markdown
# Task: Generate Complete Integration Test Suite for ScriptRipper+

## Objective
Build a comprehensive, production-ready integration test suite for ScriptRipper+ from scratch. This should include 10+ test files covering 80%+ of API endpoints.

## Context
- **Project**: ScriptRipper+
- **Tech Stack**: FastAPI, SQLAlchemy (async), Pytest, PostgreSQL
- **Current State**:
  - 26 API endpoints across 6 route files
  - No integration tests exist
  - Unit tests incomplete
- **Target State**:
  - Complete test suite with 80%+ endpoint coverage
  - All critical paths tested (auth, analyze, billing)
  - CI/CD integration ready

## Scope

**Areas to analyze:**
- `api/app/routes/` - All route files (26 endpoints)
- `api/app/models/` - Database models (8 models)
- `api/app/services/` - Business logic (LLM, Stripe)

[... rest of filled-in template ...]
```

---

*Created: 2025-11-07*
*Pattern: Comprehensive Generation*
*Estimated Time: 1-2 hours*

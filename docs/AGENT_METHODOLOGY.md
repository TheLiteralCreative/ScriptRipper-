# Agent Methodology Guide

## Overview

This document explains how to use autonomous agents for systematic code refactoring and implementation tasks. This methodology was developed during the ScriptRipper+ production readiness phase.

## When to Use Agents

Use agents for tasks that require:
1. **Systematic exploration** - Finding patterns across many files
2. **Consistent implementation** - Applying same pattern repeatedly
3. **Comprehensive coverage** - Ensuring nothing is missed
4. **Well-defined scope** - Clear start and end states
5. **Autonomous execution** - Can complete without human intervention

### ✅ Good Agent Tasks
- Replace all print() statements with logging
- Implement a provider following an existing pattern
- Write tests for all API endpoints
- Refactor deprecated API calls
- Add type hints to untyped functions
- Security audit and fix common vulnerabilities

### ❌ Poor Agent Tasks
- "Make the app better" (too vague)
- One-off bug fixes (not systematic)
- Architecture decisions (needs human judgment)
- UI/UX design (subjective)

## The Agent Pattern

### Phase 1: Craft the Prompt

Create a detailed, structured prompt with these sections:

#### Template Structure

```
# Task: [Clear, Action-Oriented Title]

## Objective
[One paragraph describing the goal and why it matters]

## Context
- **Project**: [Project name and description]
- **Tech Stack**: [Languages, frameworks]
- **Current State**: [What exists now]
- **Target State**: [What should exist]

## Scope
[Specific directories/files to process]
[What to exclude]

## Requirements

### 1. DISCOVERY PHASE
[How to find all instances of the thing to change]
[Use Grep, Glob, or exploration tools]

### 2. ANALYSIS PHASE
[How to categorize/prioritize findings]
[Decision criteria]

### 3. IMPLEMENTATION PHASE
[Step-by-step instructions]
[Code examples of before/after]
[File templates if needed]

### 4. VALIDATION PHASE
[How to verify success]
[Testing steps]

## Deliverables

[Detailed list of expected outputs]
- Discovery summary with statistics
- Implementation summary
- Files created/modified
- Verification results
- Documentation updates

## Constraints
[What NOT to do]
[Edge cases to handle]

## Success Criteria
- ✅ [Measurable outcome 1]
- ✅ [Measurable outcome 2]
- ✅ [Measurable outcome 3]

---

**Execute this task autonomously and return the comprehensive report described above.**
```

### Phase 2: Launch the Agent

Use the Task tool with the `general-purpose` subagent type for complex multi-step tasks.

**Key Parameters:**
- `subagent_type`: "general-purpose" (for most tasks)
- `description`: Short 3-5 word summary
- `prompt`: Your detailed prompt from Phase 1

The agent will:
1. Read the prompt and understand the objective
2. Use tools autonomously (Grep, Read, Edit, Write, Bash)
3. Execute all phases sequentially
4. Return a comprehensive report

### Phase 3: Review the Report

The agent returns a detailed report with:
- Discovery statistics
- Files modified
- Verification results
- Success criteria checklist

Review this carefully to ensure quality.

## Real-World Example: Logging Refactor

### Prompt Used

See the actual prompt in action (from ScriptRipper+ logging task):

**Objective:** Replace all print() statements with structured logging

**Key Sections:**
1. **Discovery**: Used Grep to find all `print\(` patterns
2. **Analysis**: Categorized by log level (DEBUG, INFO, WARNING, ERROR)
3. **Implementation**: Created logger.py, replaced 24 print statements
4. **Validation**: Verified 0 remaining print() in production code

**Results:**
- 6 files modified
- 1 new file created (logger.py)
- 24 print statements → 24 logger calls
- 0 syntax errors
- 100% coverage

## Best Practices

### 1. Be Extremely Specific

❌ Bad: "Add logging to the app"
✅ Good: "Replace all print() statements in api/app/ and worker/ with structured logging using Python's logging module"

### 2. Provide Examples

Always include before/after code examples in your prompt:

```python
# Before
print(f"Error: {e}")

# After
logger.error(f"Analysis failed: {e}", exc_info=True)
```

### 3. Define Success Criteria

Make them measurable and verifiable:
- ✅ Zero print() statements in production code
- ✅ All files compile without errors
- ✅ LOG_LEVEL configurable via environment

### 4. Specify What NOT to Do

```
## Constraints
- Do NOT modify print() in test files
- Do NOT change comments mentioning "print"
- Do NOT modify third-party code
```

### 5. Request a Detailed Report

Always ask for:
- Statistics (files modified, lines changed)
- Verification results
- Files created/modified checklist
- Success criteria validation

## Agent Subagent Types

### general-purpose
- For complex multi-step tasks
- Can research, search, and execute
- Best for refactoring, implementation

### Explore
- For codebase exploration
- Quick searches and pattern finding
- Best for discovery phase only

### Plan
- For planning implementation
- Doesn't execute, just plans
- Use before complex features

## Common Patterns

### Pattern 1: Systematic Replacement

**Use Case:** Replace deprecated API, refactor code patterns

**Prompt Structure:**
1. Discovery: Find all occurrences
2. Analysis: Categorize by complexity
3. Implementation: Replace one by one
4. Validation: Search for remaining instances

### Pattern 2: Implement Following Pattern

**Use Case:** Add new provider/adapter following existing one

**Prompt Structure:**
1. Discovery: Analyze existing implementation (e.g., GeminiProvider)
2. Analysis: Extract interface and patterns
3. Implementation: Create new implementation (e.g., OpenAIProvider)
4. Validation: Verify interface compatibility

### Pattern 3: Comprehensive Testing

**Use Case:** Write tests for all endpoints

**Prompt Structure:**
1. Discovery: List all API endpoints
2. Analysis: Categorize by authentication/complexity
3. Implementation: Write test for each endpoint
4. Validation: Run tests, check coverage

## Troubleshooting

### Agent Didn't Find All Instances

**Solution:** Make your search pattern more explicit in the prompt.

```
Use Grep with pattern: `print\(`
Search in: api/app/**/*.py, worker/**/*.py
Exclude: **/test_*.py, **/tests/
```

### Agent Made Unwanted Changes

**Solution:** Be more specific in constraints section.

```
## Constraints
- ONLY modify files in api/app/routes/
- Do NOT touch database models
- Preserve all existing functionality
```

### Agent's Solution Doesn't Compile

**Solution:** Add validation step to prompt.

```
### 4. VALIDATION PHASE
After all replacements:
1. Run syntax check: python -m py_compile <file>
2. Import each modified module
3. Report any errors and fix them
```

## Measuring Success

Good agent tasks should have:
- **Clear metrics**: "24 statements replaced"
- **Binary outcomes**: "0 remaining print() calls"
- **Verification**: "All files compile successfully"
- **Documentation**: "Updated .env.example"

## Scaling the Pattern

### For Larger Codebases

1. **Break into chunks**: Process one directory at a time
2. **Test incrementally**: Validate after each chunk
3. **Use multiple agents**: Run in parallel for independent changes

### For Complex Tasks

1. **Use Plan agent first**: Create implementation plan
2. **Break into phases**: Discovery → Implementation → Validation
3. **Review between phases**: Check results before proceeding

## Templates

### Quick Task Template

```
# Task: [TITLE]

Find all [PATTERN] in [DIRECTORY] and replace with [NEW_PATTERN].

Before:
[CODE EXAMPLE]

After:
[CODE EXAMPLE]

Verify 0 remaining instances.
```

### Comprehensive Task Template

Use the full template from Phase 1 above for complex tasks.

## Examples from ScriptRipper+

1. **Logging Refactor** ✅ Complete
   - 24 print() → logger calls
   - Created centralized logger
   - 6 files modified

2. **OpenAI Provider** (Next)
   - Follow Gemini pattern
   - Implement same interface
   - Add tests

3. **Integration Tests** (Planned)
   - Test all endpoints
   - Cover auth flows
   - Achieve 80%+ coverage

## Further Reading

- [Task Tool Documentation](https://docs.claude.com/claude-code)
- [Agent Best Practices](#) (link to official docs)
- ScriptRipper+ commit history for examples

---

**Remember:** Good prompts = Good results. Invest time in crafting detailed, specific prompts for best outcomes.

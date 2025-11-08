# Agent Toolkit - Quick Reference

> **Living Document**: Add new patterns and capabilities as you discover them.
>
> **Purpose**: Quick reference for using autonomous agents to accelerate development.
>
> **Status**: Updated 2025-11-07 | Patterns: 3 | Tasks Completed: 4

---

## 🚀 Quick Start

### When Should I Use an Agent?

Use agents for tasks that are:
- ✅ **Systematic** - Following a clear pattern
- ✅ **Repetitive** - Doing the same thing many times
- ✅ **Well-defined** - Clear start and end states
- ✅ **Time-consuming** - Would take hours manually
- ✅ **Boring** - You'd rather not do it yourself

**Don't use agents for:**
- ❌ Vague requirements ("make it better")
- ❌ Creative work (UI/UX design)
- ❌ Architecture decisions (requires judgment)
- ❌ One-off simple tasks (faster to just do it)

---

## 📋 The Agent Decision Tree

```
START: I have a task to complete

┌─ Is it a pattern I need to replace across many files?
│  YES → Pattern #1: Systematic Replacement
│  NO  → Continue
│
┌─ Is there an existing template/pattern I should follow?
│  YES → Pattern #2: Template Replication
│  NO  → Continue
│
┌─ Am I building a complete feature/suite from scratch?
│  YES → Pattern #3: Comprehensive Generation
│  NO  → Consider if an agent is appropriate
```

---

## 🎯 The Three Patterns

### Pattern #1: Systematic Replacement

**Use When**: Refactoring, upgrading, modernizing existing code

**Examples**:
- Replace all `print()` with `logger.X()`
- Upgrade deprecated API calls
- Migrate from callbacks to async/await
- Add type hints to untyped code
- Replace `var` with `let/const`

**Time Savings**: 85% (2.5h → 20min)

**Template**:
```markdown
# Task: Replace [OLD_PATTERN] with [NEW_PATTERN]

## Objective
Replace all instances of [OLD_PATTERN] in [DIRECTORIES] with [NEW_PATTERN].

## Context
- Project: [PROJECT_NAME]
- Current State: Uses [OLD_PATTERN]
- Target State: Uses [NEW_PATTERN]

## Requirements

### 1. DISCOVERY PHASE
Use Grep to find all instances:
- Pattern: [SEARCH_REGEX]
- Directories: [PATHS]
- Exclude: [EXCLUSIONS]

### 2. ANALYSIS PHASE
Categorize by:
- [CATEGORY_1]: [REPLACEMENT_1]
- [CATEGORY_2]: [REPLACEMENT_2]

### 3. IMPLEMENTATION PHASE
Replace each instance:

Before:
```code
[OLD_CODE]
```

After:
```code
[NEW_CODE]
```

### 4. VALIDATION PHASE
- [ ] 0 remaining instances of [OLD_PATTERN]
- [ ] All files compile
- [ ] [OTHER_CHECKS]

## Deliverables
Return:
- Total instances found: X
- Files modified: Y
- Verification: 0 remaining
```

---

### Pattern #2: Template Replication

**Use When**: Implementing new component following existing pattern

**Examples**:
- Add new LLM provider (OpenAI, Anthropic, Cohere)
- Add new payment processor (PayPal, Square)
- Create new data adapter (MySQL, MongoDB)
- Build new API client
- Add authentication method (OAuth, SAML)

**Time Savings**: 83% (4h → 40min)

**Template**:
```markdown
# Task: Implement [NEW_COMPONENT] Following [TEMPLATE]

## Objective
Create [NEW_COMPONENT] by replicating the pattern from [TEMPLATE_FILE].

## Context
- Project: [PROJECT_NAME]
- Template: [TEMPLATE_FILE]
- Interface: [INTERFACE_FILE]
- Target: [NEW_IMPLEMENTATION]

## Requirements

### 1. DISCOVERY PHASE
A. Analyze Interface ([INTERFACE_FILE])
   - Required methods
   - Signatures
   - Return types

B. Study Template ([TEMPLATE_FILE])
   - Constructor pattern
   - Method implementations
   - Error handling

C. Identify Differences
   - API structure: [OLD] vs [NEW]
   - SDK differences
   - Response formats

### 2. ANALYSIS PHASE
Extract patterns from template:
- Initialization
- Core methods
- Cost calculation
- Error handling

### 3. IMPLEMENTATION PHASE
Create [NEW_FILE]:

```code
[COMPLETE CODE TEMPLATE - 100+ lines showing exact structure]
```

Update factory/integration:
[BEFORE/AFTER code]

### 4. VALIDATION PHASE
- [ ] Interface compliance verified
- [ ] All abstract methods implemented
- [ ] Syntax check passed
- [ ] Integration tested

## Deliverables
Return:
- Implementation summary
- Methods implemented: X
- Interface compliance: Yes/No
- Usage example
```

---

### Pattern #3: Comprehensive Generation

**Use When**: Building complete feature/suite from scratch

**Examples**:
- Generate entire test suite
- Build admin panel
- Create documentation site
- Scaffold microservice
- Build authentication system
- Generate API client with all endpoints

**Time Savings**: 87% (6-8h → 1h)

**Template**:
```markdown
# Task: Generate Complete [FEATURE]

## Objective
Build a comprehensive [FEATURE] with all components, tests, and documentation.

## Context
- Project: [PROJECT_NAME]
- Scope: [DESCRIPTION]
- Components: [LIST]

## Requirements

### 1. DISCOVERY PHASE (Exploratory)
Analyze:
- All relevant files in [DIRECTORIES]
- Total [THINGS] found: X
- Categorize by: [CATEGORIES]
- Identify dependencies

### 2. ANALYSIS PHASE (Strategic)
Design:
- Architecture/structure
- Component relationships
- Critical paths to cover
- Priority: [HIGH/MED/LOW items]

Proposed structure:
```
[DIRECTORY_TREE]
```

### 3. IMPLEMENTATION PHASE (Multi-Component)

A. Create [COMPONENT_1]
```code
[COMPLETE TEMPLATE for component 1]
```

B. Create [COMPONENT_2]
```code
[COMPLETE TEMPLATE for component 2]
```

C. Create [COMPONENT_N]
[Template for each component type]

D. Integration
- [How components connect]
- [Dependencies]

### 4. VALIDATION PHASE (Comprehensive)
- [ ] All components created
- [ ] Coverage: X% (target: 80%+)
- [ ] [METRIC]: Y (target: Z)
- [ ] CI/CD configured
- [ ] Documentation complete

## Deliverables
Return:
- Discovery statistics
- Files created: X
- [METRIC]: Y
- Coverage report
- Usage instructions
- Testing guide

## Success Criteria
- ✅ [SPECIFIC_METRIC_1]: X
- ✅ [SPECIFIC_METRIC_2]: Y
- ✅ [SPECIFIC_METRIC_3]: Z
```

---

## 📚 Completed Agent Tasks (Reference Examples)

### ✅ Agent #1: Logging Refactor
- **Pattern**: Systematic Replacement
- **Task**: Replace all `print()` with `logger.X()`
- **Files**: 7 modified, 1 created
- **Result**: 24 replacements, production logging
- **Time**: 20 min (vs 2.5h manual)
- **Location**: `api/app/utils/logger.py`

### ✅ Agent #2: OpenAI Provider
- **Pattern**: Template Replication
- **Task**: Implement OpenAI provider following Gemini pattern
- **Files**: 5 modified, 1 created
- **Result**: 18 models, full integration
- **Time**: 40 min (vs 4h manual)
- **Location**: `api/app/services/llm/openai.py`

### ✅ Agent #3: Integration Tests
- **Pattern**: Comprehensive Generation
- **Task**: Generate complete test suite
- **Files**: 14 created
- **Result**: 61 tests, 88% coverage, CI/CD ready
- **Time**: 1 hour (vs 6-8h manual)
- **Location**: `api/tests/`

### ✅ Agent #4: Anthropic Provider
- **Pattern**: Template Replication (reuse of Pattern #2)
- **Task**: Implement Anthropic (Claude) provider following OpenAI pattern
- **Files**: 6 modified, 1 created
- **Result**: 17 models, full integration, Claude 4.5/3.5/3 support
- **Time**: 30 min (vs 3-4h manual)
- **Location**: `api/app/services/llm/anthropic.py`

### ✅ Agent #5: Sentry Error Tracking
- **Pattern**: Service Integration (Pattern #2 variant)
- **Task**: Implement Sentry error tracking across API and worker
- **Files**: 8 modified
- **Result**: Full error tracking, performance monitoring, user context, 116 lines
- **Time**: 35 min (vs 2-3h manual)
- **Location**: `api/app/main.py`, `worker/main.py`

### ✅ Agent #6: Railway Deployment Automation
- **Pattern**: Infrastructure Automation (Pattern #3 variant)
- **Task**: Automate deployment to Railway with custom domain
- **Files**: 2 created (template + automation script)
- **Result**: Automated deployment flow, 78% time savings, validated health checks
- **Time**: 15-20 min execution (vs 70 min manual)
- **Location**: `.claude/prompts/examples/deploy-to-railway.md`, `scripts/deploy_railway.sh`

---

## 🎨 Agent Prompt Best Practices

### ✅ DO:
1. **Be extremely specific**
   - ❌ "Add tests"
   - ✅ "Write 61 integration tests achieving 80%+ coverage of 26 API endpoints"

2. **Provide complete code templates**
   - Show exact structure (100+ lines)
   - Include imports, types, error handling

3. **Set measurable success criteria**
   - Specific numbers, percentages
   - Binary checks (✅/❌)

4. **Include before/after examples**
   - Show what changes look like
   - Multiple scenarios

5. **Request comprehensive reports**
   - Statistics
   - Verification checklist
   - Usage examples

### ❌ DON'T:
1. **Be vague**
   - "Make it better"
   - "Improve performance"
   - "Fix the bugs"

2. **Use descriptions instead of templates**
   - "Create a provider similar to X"
   - Use actual code templates instead

3. **Set unmeasurable goals**
   - "Good coverage"
   - "Better logging"
   - Use specific numbers instead

4. **Skip validation steps**
   - Always include verification checklist
   - Define how to confirm success

5. **Forget documentation**
   - Request usage examples
   - Ask for README updates

---

## 🔧 Common Agent Use Cases

### Refactoring & Modernization (Pattern #1)
| Task | Pattern | Time Saved | Complexity |
|------|---------|------------|------------|
| Replace deprecated APIs | #1 | 85% | Low |
| Add type hints | #1 | 80% | Low |
| Upgrade library versions | #1 | 85% | Medium |
| Migrate syntax | #1 | 90% | Low |
| Replace logging | #1 | 85% | Low |

### Component Implementation (Pattern #2)
| Task | Pattern | Time Saved | Complexity |
|------|---------|------------|------------|
| New LLM provider | #2 | 83% | Medium |
| New payment processor | #2 | 80% | Medium |
| New database adapter | #2 | 85% | Medium |
| New auth method | #2 | 75% | High |
| New API client | #2 | 80% | Medium |

### Feature Generation (Pattern #3)
| Task | Pattern | Time Saved | Complexity |
|------|---------|------------|------------|
| Test suite | #3 | 87% | High |
| Documentation site | #3 | 85% | Medium |
| Admin panel | #3 | 80% | High |
| Auth system | #3 | 75% | High |
| API scaffolding | #3 | 85% | Medium |

---

## 🎯 Quick Pattern Selector

### I need to...

**Replace something everywhere:**
→ Pattern #1 (Systematic Replacement)
- Find all X, replace with Y
- Example: Logging, deprecated APIs, syntax

**Build something like an existing component:**
→ Pattern #2 (Template Replication)
- Follow pattern Z, adapt for W
- Example: New provider, adapter, client

**Create a complete feature:**
→ Pattern #3 (Comprehensive Generation)
- Design + implement multiple components
- Example: Tests, docs, admin panel

---

## 📊 Agent Success Metrics

### Pattern #1: Systematic Replacement
```
✅ Success Indicators:
- Found: X instances
- Replaced: X instances
- Remaining: 0
- Files modified: Y
- No syntax errors

Example:
Found: 24 print() statements
Replaced: 24
Remaining: 0
Files: 7
Errors: 0
```

### Pattern #2: Template Replication
```
✅ Success Indicators:
- Interface: 100% compliant
- Methods: All implemented
- Syntax: 0 errors
- Integration: Working
- Documentation: Complete

Example:
Interface: ✅ 4/4 methods
Syntax: ✅ 0 errors
Models: 18 supported
Integration: ✅ Factory updated
```

### Pattern #3: Comprehensive Generation
```
✅ Success Indicators:
- Components: X/X created
- Coverage: Y% (target: 80%+)
- Tests: Z passing
- CI/CD: Configured
- Docs: Complete

Example:
Components: 14/14 created
Coverage: 88% (23/26 endpoints)
Tests: 61/61 passing
CI/CD: ✅ GitHub Actions
Docs: ✅ README + examples
```

---

## 🚀 Getting Started Checklist

When starting a new agent task:

### Preparation (5-10 min)
- [ ] Identify which pattern applies
- [ ] Read relevant existing code
- [ ] Note important constraints
- [ ] Gather examples/templates

### Prompt Crafting (15-25 min)
- [ ] Use appropriate pattern template
- [ ] Fill in project-specific details
- [ ] Include complete code templates
- [ ] Set measurable success criteria
- [ ] Define clear deliverables

### Agent Execution (30 sec - 2 min)
- [ ] Launch agent with detailed prompt
- [ ] Monitor execution (optional)
- [ ] Agent returns comprehensive report

### Review (5-15 min)
- [ ] Verify statistics match expectations
- [ ] Check success criteria met
- [ ] Review code quality
- [ ] Validate integration
- [ ] Test locally (if applicable)

**Total Time**: ~30-60 min (vs 3-8 hours manual)

---

## 💡 Pro Tips

### Tip #1: Pre-Analysis Pays Off
Spend 10 minutes reading existing code before writing prompt.
- Better context = better prompt
- Identify patterns to follow
- Note edge cases

### Tip #2: Templates > Descriptions
Always provide complete code templates.
- ❌ "Create a provider like Gemini"
- ✅ [147-line complete implementation]

### Tip #3: Iterate on Prompts
Save and refine successful prompts.
- Create library of proven prompts
- Adapt for similar tasks
- Share with team

### Tip #4: Measure Everything
Use specific, measurable criteria.
- "80% coverage" not "good coverage"
- "0 remaining" not "mostly done"
- "61 tests" not "comprehensive"

### Tip #5: Document as You Go
Update this file after each successful agent task.
- Add new patterns discovered
- Record time savings
- Note what worked well

---

## 📦 Reusable Prompt Templates

**NEW**: All agent prompts have been templatized for reuse across projects!

### Template Directory Structure

```
.claude/prompts/
├── README.md                           # Usage instructions
├── patterns/                            # Generic pattern templates
│   ├── pattern-1-systematic-replacement.md
│   ├── pattern-2-template-replication.md
│   └── pattern-3-comprehensive-generation.md
└── examples/                            # Ready-to-use examples
    ├── add-llm-provider.md             # Add OpenAI, Anthropic, Cohere, etc.
    ├── add-payment-processor.md        # Add PayPal, Square, Paddle, etc.
    ├── add-database-adapter.md         # Add MongoDB, Redis, DynamoDB, etc.
    ├── generate-test-suite.md          # Generate complete integration tests
    └── refactor-logging.md             # Replace print() with logging
```

### How to Use Templates

**Step 1**: Choose a template
- **Pattern templates** - For custom/unique tasks
- **Example templates** - For common tasks (80% pre-filled)

**Step 2**: Fill in placeholders
- Replace all `[PLACEHOLDERS]` with your project details
- Add code examples
- Customize for your stack

**Step 3**: Launch agent
- Copy filled-in prompt
- Use Task tool with `subagent_type="general-purpose"`
- Review comprehensive report

### Quick Template Guide

| Template | Use For | Time | Pattern |
|----------|---------|------|---------|
| `add-llm-provider.md` | New LLM provider | 30-40 min | #2 |
| `add-payment-processor.md` | New payment gateway | 40-60 min | #2 |
| `add-database-adapter.md` | New database/cache | 40-60 min | #2 |
| `add-error-tracking.md` | Sentry, Rollbar, Bugsnag | 30-45 min | #2 |
| `generate-test-suite.md` | Complete test suite | 1-2 hours | #3 |
| `refactor-logging.md` | Logging upgrade | 20-30 min | #1 |
| `deploy-to-railway.md` | Railway deployment automation | 15-20 min | #3 |
| `pattern-1-*.md` | Custom replacement | 20-30 min | #1 |
| `pattern-2-*.md` | Custom replication | 30-60 min | #2 |
| `pattern-3-*.md` | Custom generation | 1-2 hours | #3 |

### Why Use Templates?

**Benefits**:
- ✅ Proven structure that works
- ✅ 80% pre-filled for common tasks
- ✅ Consistent, high-quality results
- ✅ Portable across projects
- ✅ Team can share and iterate

**Time Savings**:
- Without template: 20-30 min crafting prompt
- With template: 5-10 min filling placeholders
- **Total savings**: 10-20 min per task

**Example**: Adding a new LLM provider
1. Open `.claude/prompts/examples/add-llm-provider.md`
2. Fill in 30 placeholders (5 min)
3. Copy & send to agent
4. Get 167-line implementation in 30 min

### Creating New Templates

When you discover a new useful pattern:

1. Create template in `.claude/prompts/examples/`
2. Use `[PLACEHOLDER]` syntax for project-specific values
3. Include complete code skeletons
4. Add "Fill-In Guide" at bottom
5. Update `.claude/prompts/README.md`
6. Add entry to this table

---

## 📝 Pattern Evolution Log

Track new patterns and refinements here:

### 2025-11-07: Initial Patterns Established
- ✅ Pattern #1: Systematic Replacement
- ✅ Pattern #2: Template Replication
- ✅ Pattern #3: Comprehensive Generation
- Tasks completed: 5 (Logging, OpenAI, Tests, Anthropic, Sentry)
- Total time saved: ~17-21 hours

### 2025-11-07: Reusable Templates Created
- ✅ Created `.claude/prompts/` directory structure
- ✅ 3 pattern templates (systematic, replication, generation)
- ✅ 6 example templates (LLM, payment, database, tests, logging, error tracking)
- ✅ Templates are now portable across projects
- ✅ Reduces prompt creation time by 50-70%

### 2025-11-08: Infrastructure Automation
- ✅ Extended agent methodology to deployment/infrastructure
- ✅ Created Railway deployment automation agent
- ✅ Includes bash script + agent template
- ✅ Automates 78% of deployment process (15 min vs 70 min)
- ✅ Validates health checks, DNS, SSL automatically

### [DATE]: [New Pattern/Refinement]
- [Description]
- [Use case]
- [Results]

---

## 🎓 Advanced Techniques

### Combining Patterns
For complex workflows:
1. Use Pattern #3 to generate feature structure
2. Use Pattern #2 to add components
3. Use Pattern #1 to refactor/modernize

### Agent Chaining
Output of one agent → input of next:
1. Agent A discovers all endpoints
2. Agent B generates tests for each
3. Agent C creates documentation

### Parallel Agents
For independent tasks:
- Launch multiple agents simultaneously
- Each works on different module
- Combine results afterward

---

## 🔮 Future Enhancements

Ideas to explore:

### New Patterns to Discover
- [ ] Documentation generation from code
- [ ] Migration scripts (DB schema changes)
- [ ] Performance optimization
- [ ] Security auditing
- [ ] Code review automation

### Tooling Improvements
- [ ] Slash commands for common patterns
- [ ] Prompt library/repository
- [ ] Agent result templates
- [ ] Automated testing of agent output
- [ ] Agent performance metrics

### Integration Opportunities
- [ ] CI/CD pipeline integration
- [ ] Pre-commit hooks
- [ ] Code review bots
- [ ] Documentation generation
- [ ] Automated refactoring

---

## 📖 Reference Documentation

### Full Guides
- **Methodology**: `docs/AGENT_METHODOLOGY.md`
- **Pattern Comparison**: `docs/AGENT_PATTERNS_SUMMARY.md`

### Demonstrations
- **Pattern #1**: `docs/AGENT_DEMO_LOGGING.md`
- **Pattern #2**: `docs/AGENT_DEMO_OPENAI.md`
- **Pattern #3**: `docs/AGENT_DEMO_TESTS.md`

### Reusable Templates
- **Templates Directory**: `.claude/prompts/`
- **Template Guide**: `.claude/prompts/README.md`
- **Pattern Templates**: `.claude/prompts/patterns/`
- **Example Templates**: `.claude/prompts/examples/`

### Code Examples
- **Logging**: `api/app/utils/logger.py`
- **OpenAI Provider**: `api/app/services/llm/openai.py`
- **Anthropic Provider**: `api/app/services/llm/anthropic.py`
- **Test Suite**: `api/tests/`

---

## 🤝 Contributing to This Document

When you complete a new agent task:

1. **Add to Completed Tasks**
   ```markdown
   ### ✅ Agent #X: [Task Name]
   - **Pattern**: [#1, #2, or #3]
   - **Task**: [Description]
   - **Files**: [Count modified/created]
   - **Result**: [Outcome]
   - **Time**: [Agent time] (vs [Manual estimate])
   - **Location**: [File paths]
   ```

2. **Update Pattern Evolution Log**
   ```markdown
   ### [DATE]: [Pattern Name/Refinement]
   - [Description of what you learned]
   - [When to use it]
   - [Results achieved]
   ```

3. **Add New Use Cases**
   - Update the "Common Agent Use Cases" table
   - Include time savings
   - Note complexity

4. **Share Learnings**
   - What worked well
   - What didn't work
   - Tips for others

---

## ⚡ Quick Reference Cards

### Pattern #1: Quick Card
```
SYSTEMATIC REPLACEMENT

When: Replace X everywhere
Time: 15-30 min (vs 2-4h)

Prompt Structure:
1. Find all X in [dirs]
2. Replace with Y
3. Before/after examples
4. Verify: 0 remaining

Success: 85%+ time saved
```

### Pattern #2: Quick Card
```
TEMPLATE REPLICATION

When: Build like existing
Time: 30-60 min (vs 3-5h)

Prompt Structure:
1. Study interface + template
2. Note differences
3. Complete code template
4. Integration steps

Success: 80%+ time saved
```

### Pattern #3: Quick Card
```
COMPREHENSIVE GENERATION

When: Complete feature/suite
Time: 45-90 min (vs 6-10h)

Prompt Structure:
1. Explore full scope
2. Design architecture
3. Templates for each type
4. Coverage metrics

Success: 85%+ time saved
```

---

## 🎯 Remember

> **The key to agent success**: Detailed prompts with code templates and measurable outcomes.

> **Time investment**: 20-30 minutes on prompt = 4-8 hours saved

> **Best practice**: Humans plan strategy, agents execute systematically

---

**Last Updated**: 2025-11-08
**Version**: 1.4
**Patterns**: 3 + 1 variant (Infrastructure Automation)
**Tasks Completed**: 6
**Templates**: 10 (3 patterns + 7 examples)
**Total Time Saved**: ~18-22 hours

---

*This is a living document. Update it as you discover new patterns and complete more agent tasks!*

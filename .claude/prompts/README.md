# Agent Prompt Templates

This directory contains **reusable prompt templates** for autonomous agents that you can use on ANY project.

## 📁 Directory Structure

```
.claude/prompts/
├── README.md (this file)
├── patterns/
│   ├── pattern-1-systematic-replacement.md
│   ├── pattern-2-template-replication.md
│   └── pattern-3-comprehensive-generation.md
└── examples/
    ├── add-llm-provider.md
    ├── add-payment-processor.md
    ├── generate-test-suite.md
    ├── refactor-logging.md
    └── add-database-adapter.md
```

## 🚀 How to Use These Templates

### Step 1: Choose Your Pattern

Identify which pattern fits your task:

- **Pattern #1** (Systematic Replacement): Replace X with Y everywhere
- **Pattern #2** (Template Replication): Build new component following existing pattern
- **Pattern #3** (Comprehensive Generation): Create complete feature from scratch

### Step 2: Start with a Template

**Option A: Use a Pattern Template** (for custom tasks)
- Open the appropriate pattern file from `patterns/`
- Fill in the bracketed placeholders `[LIKE_THIS]`
- Customize for your specific needs

**Option B: Use a Ready-Made Example** (for common tasks)
- Open the appropriate example from `examples/`
- Modify the specific details (names, paths, etc.)
- Send to agent immediately

### Step 3: Launch the Agent

```
1. Copy the filled-in prompt
2. Use the Task tool with subagent_type="general-purpose"
3. Paste the prompt
4. Watch the agent execute
5. Review the comprehensive report
```

### Step 4: Update Documentation

After successful completion:
- Add to AGENT_TOOLKIT.md (Completed Tasks section)
- Update the Pattern Evolution Log
- Share learnings with team

## 📋 Quick Reference

### When to Use Which Template

| Task | Template to Use | Expected Time |
|------|----------------|---------------|
| Replace deprecated API | `patterns/pattern-1-*.md` | 20-30 min |
| Add new LLM provider | `examples/add-llm-provider.md` | 30-40 min |
| Add payment processor | `examples/add-payment-processor.md` | 40-60 min |
| Generate test suite | `examples/generate-test-suite.md` | 1-2 hours |
| Add database adapter | `examples/add-database-adapter.md` | 40-60 min |
| Custom refactoring | `patterns/pattern-1-*.md` | 20-60 min |
| Build admin panel | `patterns/pattern-3-*.md` | 1-2 hours |

## 💡 Pro Tips

1. **Pre-analysis first**: Spend 10 minutes reading existing code before filling in template
2. **Be specific**: Replace ALL placeholders with actual values
3. **Include code templates**: Paste actual code examples, not descriptions
4. **Set measurable goals**: Use numbers ("80% coverage" not "good coverage")
5. **Request comprehensive reports**: Always ask for statistics and verification

## 🎯 Template Checklist

Before sending prompt to agent, verify:

- [ ] All `[PLACEHOLDERS]` replaced with actual values
- [ ] Code templates included (100+ lines for Pattern #2)
- [ ] File paths are absolute and correct
- [ ] Success criteria are measurable
- [ ] Deliverables section is specific
- [ ] Validation steps defined

## 🔄 Maintenance

### Adding New Templates

When you discover a new pattern or common task:

1. Create new file in appropriate directory
2. Follow existing template structure
3. Include 4 phases: Discovery → Analysis → Implementation → Validation
4. Add example usage
5. Update this README

### Sharing Templates

These templates are **project-agnostic** and can be:
- Copied to new projects
- Shared with team members
- Version controlled
- Customized per project

## 📚 Related Documentation

- **AGENT_TOOLKIT.md** - Quick reference for agent methodology
- **docs/AGENT_METHODOLOGY.md** - Complete methodology guide
- **docs/AGENT_PATTERNS_SUMMARY.md** - Pattern comparison
- **docs/AGENT_DEMO_*.md** - Real-world demonstrations

## 🎓 Learning Path

1. **Start here**: Read this README
2. **Understand patterns**: Read `AGENT_TOOLKIT.md`
3. **See examples**: Review demonstration files in `docs/`
4. **Try a template**: Use `examples/add-llm-provider.md`
5. **Customize patterns**: Modify templates for your needs
6. **Create new templates**: Document new patterns you discover

---

**Remember**: These prompts are tools. The quality of output depends on:
- How well you fill in the details
- How specific your requirements are
- How clear your success criteria are

**Time investment**: 20-30 minutes on prompt = 4-8 hours saved on execution

---

*Created: 2025-11-07*
*Last Updated: 2025-11-07*
*Templates: 8*
*Patterns: 3*

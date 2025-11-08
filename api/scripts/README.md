# Database Seed Scripts

Scripts for seeding the ScriptRipper+ database with initial data.

## Seed Prompts

Seeds the database with predefined analysis prompts for meetings and presentations.

### Data Files

- `meetings_prompts.json` - 11 meeting analysis prompts
- `presentations_prompts.json` - 9 presentation analysis prompts

### Usage

```bash
cd api
python3 scripts/seed_prompts.py
```

### Output

```
✅ Seeded 11 meetings prompts
✅ Seeded 9 presentations prompts
```

### Prompts Included

**Meetings** (11 prompts):
- One-Paragraph Summary
- Overview-Summary
- Participants & Roles
- Deep-Outline
- Key Decisions Log
- Action Items Table
- Client-Expectations
- Disagreements & Unresolved Issues
- Key-Insights
- Important Quotes
- Next-Steps_and_Project-Update
- Full-Record-Markdown

**Presentations** (9 prompts):
- Expanded Outline
- Structural_Contextual Metadata
- Content_Nuggets
- Relationship_Dependency Mapping
- Audience-Activation Artifacts
- Quality_and_Credibility_Signals
- Processing_Health_Check
- Top 3 Takeaways
- Key Terminology & Definitions

### When to Use

Run this script:
- On first deployment to initialize prompt database
- After dropping/recreating the database
- To reset prompts to defaults

### Notes

- The script uses async SQLAlchemy for database operations
- All prompts are marked as `is_active=True` by default
- Prompts are categorized as either "meetings" or "presentations"
- Each prompt has a unique `task_name` and detailed instructions

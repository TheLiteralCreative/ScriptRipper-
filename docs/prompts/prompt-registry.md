# Prompt Registry

This document tracks all prompts available in ScriptRipper+.

**Last Updated:** 2025-11-19

## Statistics

- **Total Prompts:** 18
- **Meetings Prompts:** 11
- **Presentations Prompts:** 7
- **Active Prompts:** 18
- **Custom Prompts (Pending):** 0
- **Custom Prompts (Approved):** 0

---

## Meetings Prompts

| Task Name | Status | Last Updated | Description |
|-----------|--------|--------------|-------------|
| Action Items Tracker | Active | 2025-11-19 | Finds every concrete to-do with owner, due date, and live status |
| Key Decisions Log | Active | 2025-11-19 | Logs every final decision and distills the three biggest implications |
| Client Expectations Report | Active | 2025-11-19 | Pulls the client's concrete asks, unspoken relational signals, and emotional tone |
| Friction & Foresight Report | Active | 2025-11-19 | Flags current disputes and likely flashpoints—each paired with advice |
| Communication Insights (SSC) | Active | 2025-11-19 | Surfaces team dynamics and turns them into a Start–Stop–Continue plan |
| Full Record Markdown | Active | 2025-11-19 | Converts raw transcript into clean, shareable Markdown |
| Timestamped Outline & Recipes | Active | 2025-11-19 | Full, timestamped outline with optional recipes/CTA/quotes/takeaways |
| Important Quotes | Active | 2025-11-19 | Pulls the 3–5 lines that matter most—word-for-word |
| Participants & Roles | Active | 2025-11-19 | Identifies everyone involved and their roles (when stated) |
| One-Paragraph Summary | Active | 2025-11-19 | Compresses the whole talk into one tight paragraph |
| Overview Summary | Active | 2025-11-19 | Narrative brief from purpose to outcomes |

---

## Presentations Prompts

| Task Name | Status | Last Updated | Description |
|-----------|--------|--------------|-------------|
| Audience Activation Artifacts | Active | 2025-11-19 | Spins the talk into tweets, social snippets, slide bullets, FAQs, exercises, and more |
| Tutorial Step-Down & Actionable How-To Extractor | Active | 2025-11-19 | Converts tutorials hidden in the talk into step-by-step guides with inputs, parameters, and validation |
| Content Nuggets | Active | 2025-11-19 | Harvests high-value tidbits—tools, stats, steps, frameworks, lessons |
| Relationship & Dependency Map | Active | 2025-11-19 | Shows how ideas and tools connect and in what order |
| Structural & Contextual Metadata | Active | 2025-11-19 | Builds a complete metadata header for discovery |
| Quality & Credibility Signals | Active | 2025-11-19 | Scores expertise, evidence style, consensus, and bias |
| Processing Health Check | Active | 2025-11-19 | Rates how cleanly the transcript can be mined |

---

## Change History

### 2025-11-19
- **Database cleaned and standardized** - Removed 2 orphaned prompts ("Audience-Activation Artifacts", "Big-Time How-To")
- **All 18 prompts synced** with standardized What/Why/How/Who descriptions
- **Frontend unified** - Configure page now displays all prompts in consistent styled format
- Source of truth: `ScriptRipper_Tightened-Prompts_(20251118).md`
- Archived old version to `prompt-archive/versions/2025-11-19T15-11-27`

### 2025-11-18
- Initial registry created
- Added 18 tightened prompts with What/Why/How/Who format
- Updated UI mappings in configure page
- All prompts validated and active

---

## Custom Prompts Queue

### Pending Review
*No custom prompts pending*

### Recently Approved
*No custom prompts approved yet*

---

## Maintenance Notes

- Prompts are stored in `/web/src/app/configure/prompts/`
- Archives are stored in `/prompt-archive/versions/`
- Custom prompts are stored in `/prompt-archive/custom/`
- Use `/prompt-manager` command for management tasks
- Use `scripts/prompt-tools.js` for CLI operations

---

## Version Archive

| Date | Version | Summary |
|------|---------|---------|
| 2025-11-18 | Initial | First version with tightened prompts |

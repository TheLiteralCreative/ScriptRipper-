# ScriptRipper+ Claude Code Agents

This directory contains specialized Claude Code agents (slash commands) for managing and deploying the ScriptRipper+ application across multiple platforms.

## Available Agents

### 1. `/render-oversight`
**Purpose:** Manage Render.com services (API, database, Redis, worker)

**Use when you need to:**
- Check service health and status
- Review deployment logs
- Execute database scripts (seeding, cleaning)
- Update environment variables
- Troubleshoot API issues
- Monitor service performance

**Example:**
```
User: /render-oversight
Agent: [Checks all Render services, analyzes logs, reports status]
```

---

### 2. `/vercel-oversight`
**Purpose:** Manage Vercel deployments and domain configuration

**Use when you need to:**
- Deploy new frontend code
- Check deployment status
- Configure custom domains
- Update environment variables
- Troubleshoot build failures
- Monitor performance metrics

**Example:**
```
User: /vercel-oversight
Agent: [Checks deployment status, verifies domains, runs build tests]
```

---

### 3. `/godaddy-dns`
**Purpose:** Configure and troubleshoot GoDaddy DNS records

**Use when you need to:**
- Set up DNS for new domains
- Fix DNS configuration issues
- Troubleshoot domain propagation
- Detect DNS conflicts
- Verify DNS records are correct

**Example:**
```
User: /godaddy-dns
Agent: [Analyzes DNS configuration, suggests fixes, guides through changes]
```

---

### 4. `/dns-orchestrator`
**Purpose:** Coordinate full system infrastructure across Vercel, Render, and GoDaddy

**Use when you need to:**
- Verify entire system is working
- Troubleshoot cross-platform issues
- Set up new infrastructure
- Understand what's broken and where
- Get comprehensive system status

**Example:**
```
User: /dns-orchestrator
Agent: [Checks all platforms, identifies issues, provides action plan]
```

---

### 5. `/database-oversight`
**Purpose:** Monitor and manage database health, connections, and data integrity

**Use when you need to:**
- Check database connectivity and health
- Monitor connection pool status
- Verify data integrity (duplicates, orphans, nulls)
- Manage database migrations
- Review database performance
- Clean up stale data
- Verify backup status

**Example:**
```
User: /database-oversight
Agent: [Checks database health, finds duplicates, reviews migrations, reports status]
```

---

### 6. `/auth-oversight`
**Purpose:** Monitor authentication, tokens, permissions, and security

**Use when you need to:**
- Test login/logout flows
- Verify token generation and validation
- Check CORS configuration
- Debug authentication failures
- Review session management
- Audit OAuth integration
- Check for security vulnerabilities

**Example:**
```
User: /auth-oversight
Agent: [Tests auth endpoints, validates tokens, checks CORS, reports security status]
```

---

### 7. `/admin-oversight`
**Purpose:** Monitor admin access, privileges, and security

**Use when you need to:**
- Audit admin users
- Verify admin endpoints are protected
- Check for privilege escalation vulnerabilities
- Review admin action logs
- Test permission boundaries
- Ensure proper admin security

**Example:**
```
User: /admin-oversight
Agent: [Lists admins, tests endpoints, checks for vulnerabilities, reports security status]
```

---

## How These Agents Work

**Slash commands** are stored in `.md` files in this directory. When you type a slash command like `/render-oversight`, Claude Code:

1. Reads the corresponding `.md` file
2. Uses those instructions as a detailed prompt
3. Executes the instructions autonomously
4. Uses tools (CLI, APIs, file operations) to complete tasks
5. Reports results back to you

## Usage Patterns

### Quick Status Check
```
User: /dns-orchestrator
```
Gets a comprehensive view of all services across all platforms.

### Targeted Troubleshooting
```
User: The API is returning 500 errors
User: /render-oversight
```
Agent will check Render logs, database status, and identify the issue.

### Deployment Workflow
```
# After pushing code to GitHub:
User: /vercel-oversight
# Agent verifies build succeeded and is live

# Then check backend:
User: /render-oversight
# Agent verifies API deployed correctly
```

### DNS Configuration
```
# Setting up new domain:
User: /godaddy-dns
# Agent guides through DNS record setup

# Then verify it worked:
User: /vercel-oversight
# Agent checks domain shows "Valid" in Vercel
```

## Agent Capabilities

### What Agents CAN Do (Autonomously)
- ✅ Execute CLI commands (vercel, render, dig, curl)
- ✅ Read and analyze logs
- ✅ Check service status via APIs
- ✅ Run database scripts
- ✅ Analyze screenshots you provide
- ✅ Provide step-by-step fix instructions
- ✅ Verify configurations
- ✅ Test endpoints

### What Agents NEED Help With
- 🔐 Logging into dashboards (requires your credentials)
- 🖱️ Clicking UI buttons (you need to do this)
- 📸 Seeing dashboard state (provide screenshots)
- 🔑 API keys (provide when prompted)

## Reusing These Agents in Other Projects

**To copy these agents to a new project:**

```bash
# From ScriptRipper+ directory
cp -r .claude/commands /path/to/new-project/.claude/

# Or copy specific agents
cp .claude/commands/render-oversight.md /path/to/new-project/.claude/commands/
cp .claude/commands/vercel-oversight.md /path/to/new-project/.claude/commands/
cp .claude/commands/godaddy-dns.md /path/to/new-project/.claude/commands/
cp .claude/commands/dns-orchestrator.md /path/to/new-project/.claude/commands/
cp .claude/commands/database-oversight.md /path/to/new-project/.claude/commands/
cp .claude/commands/auth-oversight.md /path/to/new-project/.claude/commands/
cp .claude/commands/admin-oversight.md /path/to/new-project/.claude/commands/
```

**That's it! No customization needed.**

These agents are **project-agnostic** and auto-detect:
- Project name (from directory or package.json)
- Service names (from render.yaml, .vercel/project.json)
- Domain names (from vercel.json or asking you)
- Framework (Next.js, Django, Rails, etc.)
- Platform configuration (Vercel, Render, or others)

**They work with ANY stack:**
- Vercel + Render (like ScriptRipper+)
- Netlify + Railway
- AWS + Supabase
- Any combination

Just copy and use immediately!

## Integration with Existing Commands

These agents work alongside existing slash commands:
- `/integrate-stripe` - Stripe SDK integration
- `/integrate-mail` - Purelymail SDK integration

You can invoke multiple agents in sequence:
```
/render-oversight
/vercel-oversight
/dns-orchestrator
```

## Best Practices

1. **Start with `/dns-orchestrator`** when unsure what's wrong - it will triage and route to the right agent

2. **Provide screenshots** when possible - agents can analyze visual state

3. **Run agents after major changes** - verify deployments, DNS changes, etc.

4. **Use specific agents for targeted issues** - don't always use the orchestrator

5. **Let agents complete fully** - they often run multiple checks and provide comprehensive reports

## Troubleshooting the Agents Themselves

**If an agent doesn't work:**

1. **Check it exists:**
   ```bash
   ls .claude/commands/
   ```

2. **Verify markdown is valid:**
   ```bash
   cat .claude/commands/render-oversight.md
   ```

3. **Restart Claude Code** (sometimes needed to register new commands)

4. **Check spelling** - `/render-oversight` not `/render-oversigth`

## Future Enhancements

These agents can be extended with:
- Render API integration (when API keys available)
- Automated health checks on schedule
- Performance monitoring integrations
- Error alerting
- Deployment rollback automation
- Database backup verification

## Contributing

To improve these agents:
1. Edit the `.md` files directly
2. Test your changes
3. Commit to the repo
4. Agents update immediately (no rebuild needed)

---

**Created:** 2025-11-13
**Project:** ScriptRipper+
**Purpose:** Reduce deployment friction and improve operational efficiency across MVP projects

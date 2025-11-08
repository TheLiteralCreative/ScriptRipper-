# Run ScriptRipper+ Locally

Quick guide to running ScriptRipper+ on your local machine.

---

## 🚀 Fastest Way (1 Command)

```bash
docker-compose up
```

**Wait 30-60 seconds**, then open:
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

Press `Ctrl+C` to stop.

---

## 📋 What You'll See

### Frontend (localhost:3000)
- Landing page
- User registration/login
- Dashboard
- Analysis interface
- Subscription/billing pages

### API Docs (localhost:8000/docs)
- Interactive Swagger UI
- All endpoints documented
- "Try it out" buttons to test APIs
- Request/response examples

### Health Check (localhost:8000/health)
```json
{
  "api": "ok",
  "database": "ok",
  "redis": "ok"
}
```

---

## 🛠️ Services Running

| Service | Port | URL |
|---------|------|-----|
| Next.js Frontend | 3000 | http://localhost:3000 |
| FastAPI Backend | 8000 | http://localhost:8000 |
| API Documentation | 8000 | http://localhost:8000/docs |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| Worker | - | (background) |

---

## 🎯 What to Test Locally

### 1. Browse the Frontend
```
http://localhost:3000
```
- See the landing page
- Click "Sign Up" to create account
- Try the analysis interface
- View pricing page

### 2. Explore the API
```
http://localhost:8000/docs
```
- Expand endpoints to see details
- Click "Try it out" to test
- See request/response formats

### 3. Test Authentication
1. Go to API docs: http://localhost:8000/docs
2. Find `POST /api/v1/auth/register`
3. Click "Try it out"
4. Fill in test email/password
5. Click "Execute"
6. See the response with access token

### 4. Test Analysis
1. Register/login first (to get token)
2. Find `POST /api/v1/analyze/custom`
3. Click "Authorize" button (top right)
4. Paste your access token
5. Click "Try it out" on analyze endpoint
6. Paste a sample transcript
7. Submit and see results

---

## ⚙️ Environment Setup

### First Time Setup

1. **API Environment**:
```bash
cd api
cp .env.example .env
# Edit .env with your local keys (Gemini, Stripe, etc.)
```

2. **Web Environment**:
```bash
cd web
cp .env.local.example .env.local
# Should already have: NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. **Database Initialization**:
```bash
# Start services
docker-compose up -d postgres redis

# Run migrations
cd api
alembic upgrade head

# Seed prompts (optional)
python3 scripts/seed_prompts.py
```

---

## 🔧 Development Commands

### Start Everything
```bash
docker-compose up
```

### Start in Background
```bash
docker-compose up -d
```

### Stop Everything
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f worker
docker-compose logs -f postgres
```

### Restart a Service
```bash
docker-compose restart api
docker-compose restart worker
```

### Rebuild After Code Changes
```bash
docker-compose up --build
```

---

## 🐛 Troubleshooting

### "Port 5432 already in use"
PostgreSQL is already running locally.

**Fix**:
```bash
# Option 1: Stop local PostgreSQL
brew services stop postgresql

# Option 2: Use different port in docker-compose.yml
ports:
  - "5433:5432"  # Change 5432 to 5433
```

### "Port 3000 already in use"
Something else is using port 3000.

**Fix**:
```bash
# Find what's using it
lsof -i :3000

# Kill it
kill -9 <PID>
```

### "Database connection failed"
Database not ready yet.

**Fix**:
Wait 10-20 seconds for PostgreSQL to fully start, then try again.

### "Module not found" errors
Missing Python dependencies.

**Fix**:
```bash
cd api
pip install -r requirements.txt
```

### Frontend build errors
Missing Node packages.

**Fix**:
```bash
cd web
rm -rf node_modules package-lock.json
npm install
```

---

## 🎨 Frontend Development

### Run Frontend Separately (Hot Reload)
```bash
cd web
npm run dev
```

### Build for Production Preview
```bash
cd web
npm run build
npm run start
```

---

## ⚡ API Development

### Run API with Hot Reload
```bash
cd api

# Start databases
docker-compose up postgres redis -d

# Run API with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Run Worker Separately
```bash
cd worker
python3 main.py
```

### Run Tests
```bash
cd api
pytest
```

### Run Tests with Coverage
```bash
cd api
pytest --cov=app --cov-report=html
open htmlcov/index.html
```

---

## 🗄️ Database Commands

### Access PostgreSQL
```bash
# Using Docker
docker-compose exec postgres psql -U scriptripper -d scriptripper_dev

# Or directly (if PostgreSQL client installed)
psql -U scriptripper -h localhost -p 5432 scriptripper_dev
# Password: dev_password
```

### Run Migrations
```bash
cd api
alembic upgrade head
```

### Create New Migration
```bash
cd api
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Seed Database
```bash
cd api
python3 scripts/seed_prompts.py
```

### Reset Database
```bash
docker-compose down -v  # Destroys volumes (ALL DATA LOST!)
docker-compose up -d postgres
cd api
alembic upgrade head
python3 scripts/seed_prompts.py
```

---

## 🧪 Testing the Full Flow

### 1. Register User
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User"
  }'
```

Save the `access_token` from response.

### 2. Analyze Transcript
```bash
curl -X POST http://localhost:8000/api/v1/analyze/custom \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "transcript": "This is a sample meeting transcript...",
    "analysis_type": "meetings",
    "custom_prompt": "Summarize the key points"
  }'
```

### 3. Check Health
```bash
curl http://localhost:8000/health
```

---

## 📊 API Endpoints to Try

### Authentication
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/password-reset/request` - Reset password

### Analysis
- `GET /api/v1/prompts` - List available prompts
- `POST /api/v1/analyze/custom` - Analyze with custom prompt
- `POST /api/v1/analyze/batch` - Batch analysis

### Jobs
- `POST /api/v1/jobs/analyze` - Create async job
- `GET /api/v1/jobs/{job_id}` - Check job status
- `DELETE /api/v1/jobs/{job_id}` - Cancel job

### Billing
- `POST /api/v1/billing/create-checkout-session` - Start subscription
- `GET /api/v1/billing/subscription-status` - Check status

### Admin (requires admin user)
- `GET /api/v1/admin/users` - List users
- `GET /api/v1/admin/prompts` - List prompts
- `POST /api/v1/admin/prompts` - Create prompt

---

## 🎯 Sample Data

### Sample Transcript
```
Meeting Transcript - Product Team Standup

John: Good morning everyone. Let's start with our standup. Sarah, what did you work on yesterday?

Sarah: I finished the user authentication flow. It's now ready for testing. I also started working on the dashboard analytics.

John: Great! Any blockers?

Sarah: Not right now, but I'll need the API endpoints for analytics by end of week.

Mike: I can have those ready by Thursday.

John: Perfect. Mike, what's your update?

Mike: I completed the payment integration with Stripe. All three subscription tiers are now working. I'll start on the analytics endpoints today.

John: Excellent work, team. Let's reconvene tomorrow.
```

### Sample Custom Prompt
```
Analyze this meeting transcript and provide:
1. List of participants
2. Key decisions made
3. Action items with assignees
4. Any blockers mentioned
```

---

## 🔐 Test Stripe Payments Locally

### Setup Stripe CLI
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to http://localhost:8000/api/v1/billing/webhook

# Copy the webhook secret (whsec_...) to api/.env
```

### Test Payment Flow
1. Go to http://localhost:3000
2. Register/login
3. Click "Upgrade to Pro"
4. Use test card: `4242 4242 4242 4242`
5. Expiry: Any future date
6. CVC: Any 3 digits
7. ZIP: Any 5 digits

---

## 🚀 Quick Reference

| Task | Command |
|------|---------|
| Start everything | `docker-compose up` |
| Stop everything | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Rebuild | `docker-compose up --build` |
| Run API only | `cd api && uvicorn app.main:app --reload` |
| Run frontend only | `cd web && npm run dev` |
| Run tests | `cd api && pytest` |
| Access database | `docker-compose exec postgres psql -U scriptripper -d scriptripper_dev` |
| Reset database | `docker-compose down -v && docker-compose up -d` |

---

## 📱 URLs Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Web interface |
| API Docs | http://localhost:8000/docs | Interactive API documentation |
| API Root | http://localhost:8000 | API base URL |
| Health | http://localhost:8000/health | Health check endpoint |
| Ready | http://localhost:8000/ready | Readiness check |

---

## 💡 Pro Tips

1. **Use API Docs for Testing**: http://localhost:8000/docs is the easiest way to test endpoints - no curl needed!

2. **Check Logs for Errors**: `docker-compose logs -f api` shows real-time API logs

3. **Hot Reload**: Both frontend and backend support hot reload - your changes appear immediately

4. **Test Before Deploy**: Test everything locally before deploying to production

5. **Reset Often**: `docker-compose down -v` gives you a fresh start if things get messy

---

**Enjoy exploring ScriptRipper+ locally!** 🚀

When ready to deploy to production: See `START_HERE_TOMORROW.md`

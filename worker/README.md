# ScriptRipper Worker

Background job processing service using Redis Queue (RQ).

## Overview

The worker processes transcript analysis jobs asynchronously, preventing HTTP timeouts on long transcripts and enabling better scalability.

## Architecture

```
API → Redis Queue → Worker → LLM Provider → Results
```

- **API**: Enqueues jobs and returns job ID immediately
- **Redis**: Stores job queue and results
- **Worker**: Processes jobs in background
- **Results**: Stored in Redis, fetched by API

## Quick Start

### 1. Install Dependencies

```bash
cd worker
pip install -r requirements.txt
```

### 2. Set Environment Variables

Create `worker/.env`:

```bash
# Database
DATABASE_URL=postgresql://scriptripper:dev_password@localhost:5432/scriptripper_dev

# Redis
REDIS_URL=redis://localhost:6379

# LLM Providers
GEMINI_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here  # Optional
# ANTHROPIC_API_KEY=your_key_here  # Optional

# Environment
ENVIRONMENT=development
LOG_LEVEL=info
```

### 3. Start the Worker

```bash
# From worker directory
python -m worker.main

# Or from project root
cd worker && python main.py
```

### 4. Using Docker Compose

```bash
# Start all services including worker
docker-compose up -d

# View worker logs
docker-compose logs -f worker

# Restart worker only
docker-compose restart worker
```

## Usage

### API: Enqueue a Job

```bash
curl -X POST http://localhost:8000/api/v1/jobs/analyze \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "Your transcript here...",
    "provider": "gemini",
    "model": "gemini-2.5-flash",
    "tasks": {
      "summary": "Provide a brief summary",
      "key_points": "Extract key points"
    }
  }'
```

Response:
```json
{
  "job_id": "abc-123-def",
  "status": "queued",
  "message": "Job queued for processing"
}
```

### API: Check Job Status

```bash
curl http://localhost:8000/api/v1/jobs/abc-123-def \
  -H "Authorization: Bearer $TOKEN"
```

Response (finished):
```json
{
  "job_id": "abc-123-def",
  "status": "finished",
  "result": {
    "results": {
      "summary": "The transcript discusses...",
      "key_points": "1. Point one\n2. Point two"
    },
    "metadata": {
      "provider": "gemini",
      "model": "gemini-2.5-flash",
      "total_cost": 0.0123
    }
  }
}
```

## Queue Priorities

The worker listens to three queues in priority order:

1. **high** - Priority jobs (paid users, small transcripts)
2. **default** - Normal jobs
3. **low** - Batch jobs, large transcripts

## Task Types

### 1. Single Analysis

Analyzes a transcript with multiple tasks from a profile.

```python
from worker.tasks.analysis import analyze_transcript_task

result = analyze_transcript_task(
    transcript="...",
    provider="gemini",
    model="gemini-2.5-flash",
    system_prompt="You are an expert...",
    tasks={
        "summary": "Provide a summary",
        "decisions": "List key decisions"
    }
)
```

### 2. Batch Analysis

Processes multiple prompts in one job.

```python
from worker.tasks.analysis import analyze_batch_task

result = analyze_batch_task(
    transcript="...",
    provider="gemini",
    model="gemini-2.5-flash",
    tasks=[
        {"task_name": "Summary", "prompt": "Summarize..."},
        {"task_name": "Action Items", "prompt": "List action items..."}
    ]
)
```

## Monitoring

### View Queue Status

```python
from redis import Redis
from rq import Queue

redis_conn = Redis.from_url("redis://localhost:6379")
queue = Queue("default", connection=redis_conn)

print(f"Jobs in queue: {len(queue)}")
print(f"Failed jobs: {len(queue.failed_job_registry)}")
```

### Worker Dashboard (RQ Dashboard)

Install and run RQ Dashboard for a web UI:

```bash
pip install rq-dashboard
rq-dashboard
```

Then visit http://localhost:9181

## Troubleshooting

### Worker not picking up jobs

1. Check Redis is running: `redis-cli ping`
2. Check worker logs: `docker-compose logs worker`
3. Verify REDIS_URL in worker/.env matches docker-compose
4. Ensure API and worker use same Redis instance

### Jobs failing

1. Check worker logs for errors
2. Verify LLM API keys are set correctly
3. Check job status in API: `GET /api/v1/jobs/{job_id}`
4. Inspect failed jobs in RQ Dashboard

### Import errors

Make sure the worker can import from the API:

```python
# worker/tasks/analysis.py adds this:
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "api"))
```

This allows worker to use `from app.services.llm import LLMProviderFactory`

## Production Deployment

### Scaling Workers

Run multiple worker processes:

```bash
# Terminal 1
python main.py

# Terminal 2
python main.py

# Terminal 3
python main.py
```

Or use a process manager like Supervisor:

```ini
[program:scriptripper-worker]
command=python /app/worker/main.py
directory=/app/worker
numprocs=3
process_name=%(program_name)s_%(process_num)02d
autostart=true
autorestart=true
```

### Docker

The `docker-compose.yml` already configures the worker service. To scale:

```bash
docker-compose up -d --scale worker=3
```

### Environment Variables

Production `.env`:

```bash
DATABASE_URL=postgresql://user:pass@prod-db:5432/scriptripper
REDIS_URL=redis://prod-redis:6379
GEMINI_API_KEY=your_prod_key
ENVIRONMENT=production
LOG_LEVEL=warning
```

## Development

### Adding New Tasks

1. Create task function in `worker/tasks/`
2. Import in `worker/tasks/__init__.py`
3. Create enqueue method in `api/app/utils/queue.py`
4. Add API endpoint in `api/app/routes/jobs.py`

Example:

```python
# worker/tasks/summarize.py
def summarize_task(text: str) -> str:
    # Your logic here
    return summary
```

## References

- [RQ Documentation](https://python-rq.org/)
- [Redis Documentation](https://redis.io/docs/)
- [ScriptRipper API Docs](http://localhost:8000/docs)

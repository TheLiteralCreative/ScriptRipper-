"""Worker main entry point - Processes background jobs from Redis queue."""

import os
import sys
from pathlib import Path

# Add parent directory to path for shared imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from redis import Redis
from rq import Worker, Queue, Connection
from dotenv import load_dotenv
import sentry_sdk
from sentry_sdk.integrations.rq import RqIntegration

# Add API path for logger import
sys.path.insert(0, str(Path(__file__).parent.parent / "api"))
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

# Load environment variables
load_dotenv()

# Initialize Sentry for worker
SENTRY_DSN = os.getenv("SENTRY_DSN")
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        environment=os.getenv("ENVIRONMENT", "development"),
        release=f"ScriptRipper@{os.getenv('APP_VERSION', '0.1.0')}",
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
        profiles_sample_rate=float(os.getenv("SENTRY_PROFILES_SAMPLE_RATE", "0.1")),
        integrations=[
            RqIntegration(),
        ],
        attach_stacktrace=True,
        enable_tracing=True,
    )

    # Add custom tag to distinguish worker events
    sentry_sdk.set_tag("service", "worker")
    logger.info("Sentry initialized for worker")

def main():
    """Start the RQ worker to process jobs."""
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")

    logger.info(f"Starting ScriptRipper Worker")
    logger.info(f"Redis URL: {redis_url}")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")

    # Connect to Redis
    redis_conn = Redis.from_url(redis_url)

    # Listen to multiple queues in priority order
    queues = [
        Queue('high', connection=redis_conn),    # Priority jobs
        Queue('default', connection=redis_conn),  # Normal jobs
        Queue('low', connection=redis_conn),      # Batch/background jobs
    ]

    logger.info(f"Listening to queues: {[q.name for q in queues]}")

    # Start worker
    with Connection(redis_conn):
        worker = Worker(queues)
        logger.info("Worker started and listening for jobs...")
        worker.work(with_scheduler=True)


if __name__ == "__main__":
    main()

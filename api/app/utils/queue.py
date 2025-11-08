"""Redis queue utilities for background job processing."""

import os
from typing import Any, Dict
from redis import Redis
from rq import Queue
from rq.job import Job


class QueueService:
    """Service for managing background jobs with Redis Queue."""

    def __init__(self):
        """Initialize Redis connection and queues."""
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis_conn = Redis.from_url(redis_url)

        # Define queue priorities
        self.high_queue = Queue("high", connection=self.redis_conn)
        self.default_queue = Queue("default", connection=self.redis_conn)
        self.low_queue = Queue("low", connection=self.redis_conn)

    def enqueue_analysis(
        self,
        transcript: str,
        provider: str,
        model: str,
        system_prompt: str,
        tasks: Dict[str, str],
        priority: str = "default",
        timeout: int = 600,  # 10 minutes
    ) -> Job:
        """Enqueue a transcript analysis job.

        Args:
            transcript: Raw transcript text
            provider: LLM provider name
            model: Model identifier
            system_prompt: System prompt
            tasks: Dictionary of {task_name: task_prompt}
            priority: Queue priority ('high', 'default', 'low')
            timeout: Job timeout in seconds

        Returns:
            RQ Job instance
        """
        # Import here to avoid circular imports
        from worker.tasks.analysis import analyze_transcript_task

        # Select queue based on priority
        queue = self._get_queue(priority)

        # Enqueue job
        job = queue.enqueue(
            analyze_transcript_task,
            transcript=transcript,
            provider=provider,
            model=model,
            system_prompt=system_prompt,
            tasks=tasks,
            job_timeout=timeout,
            result_ttl=3600,  # Keep results for 1 hour
            failure_ttl=86400,  # Keep failures for 24 hours
        )

        return job

    def enqueue_batch_analysis(
        self,
        transcript: str,
        provider: str,
        model: str,
        tasks: list,
        priority: str = "default",
        timeout: int = 900,  # 15 minutes for batch
    ) -> Job:
        """Enqueue a batch transcript analysis job.

        Args:
            transcript: Raw transcript text
            provider: LLM provider name
            model: Model identifier
            tasks: List of {task_name: str, prompt: str} dicts
            priority: Queue priority
            timeout: Job timeout in seconds

        Returns:
            RQ Job instance
        """
        from worker.tasks.analysis import analyze_batch_task

        queue = self._get_queue(priority)

        job = queue.enqueue(
            analyze_batch_task,
            transcript=transcript,
            provider=provider,
            model=model,
            tasks=tasks,
            job_timeout=timeout,
            result_ttl=3600,
            failure_ttl=86400,
        )

        return job

    def get_job_status(self, job_id: str) -> Dict[str, Any]:
        """Get the status of a job.

        Args:
            job_id: Job ID

        Returns:
            Dictionary with job status and result (if complete)

        Example:
            {
                "job_id": "abc123",
                "status": "finished",  # queued, started, finished, failed
                "result": {...},  # if finished
                "error": "...",  # if failed
                "progress": 0.5,  # if available
            }
        """
        job = Job.fetch(job_id, connection=self.redis_conn)

        status_data = {
            "job_id": job.id,
            "status": job.get_status(),
            "created_at": job.created_at.isoformat() if job.created_at else None,
            "started_at": job.started_at.isoformat() if job.started_at else None,
            "ended_at": job.ended_at.isoformat() if job.ended_at else None,
        }

        # Add result if finished
        if job.is_finished:
            status_data["result"] = job.result

        # Add error if failed
        if job.is_failed:
            status_data["error"] = str(job.exc_info)

        return status_data

    def cancel_job(self, job_id: str) -> bool:
        """Cancel a queued job.

        Args:
            job_id: Job ID

        Returns:
            True if cancelled, False otherwise
        """
        try:
            job = Job.fetch(job_id, connection=self.redis_conn)
            job.cancel()
            return True
        except Exception:
            return False

    def _get_queue(self, priority: str) -> Queue:
        """Get queue by priority."""
        if priority == "high":
            return self.high_queue
        elif priority == "low":
            return self.low_queue
        else:
            return self.default_queue

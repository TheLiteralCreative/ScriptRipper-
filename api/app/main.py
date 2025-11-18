"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration

from app.config.settings import get_settings
from app.config.database import init_db, close_db
from app.routes import health, auth, analyze, admin, billing, jobs, debug_admin

settings = get_settings()

# Initialize Sentry
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        release=f"{settings.APP_NAME}@{settings.APP_VERSION}",
        traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
        profiles_sample_rate=settings.SENTRY_PROFILES_SAMPLE_RATE,
        integrations=[
            StarletteIntegration(transaction_style="endpoint"),
            FastApiIntegration(transaction_style="endpoint"),
        ],
        # Send PII (user data) to Sentry
        send_default_pii=True,
        # Additional options
        attach_stacktrace=True,
        enable_tracing=True,
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    if settings.is_development:
        await init_db()

    yield

    # Shutdown
    await close_db()


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Transcript analysis and filtering API",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# User context middleware for Sentry
@app.middleware("http")
async def add_sentry_context(request, call_next):
    """Add user context to Sentry events."""
    # Try to get user from request state (set by auth middleware)
    if settings.SENTRY_DSN and hasattr(request.state, "user") and request.state.user:
        user = request.state.user
        sentry_sdk.set_user({
            "id": str(user.id),
            "email": user.email,
            "username": user.email,
            "role": user.role.value if hasattr(user, "role") else None,
        })

    response = await call_next(request)
    return response


# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(analyze.router, prefix="/api/v1", tags=["Analysis"])
app.include_router(jobs.router, prefix="/api/v1", tags=["Jobs"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])
app.include_router(billing.router, prefix="/api/v1/billing", tags=["Billing"])
app.include_router(debug_admin.router, prefix="/api/v1", tags=["Debug Admin"])


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    # Sentry will auto-capture, but we can add extra context
    if settings.SENTRY_DSN:
        with sentry_sdk.push_scope() as scope:
            scope.set_context("request", {
                "url": str(request.url),
                "method": request.method,
                "headers": dict(request.headers),
            })
            sentry_sdk.capture_exception(exc)

    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "internal_server_error",
                "message": "An unexpected error occurred",
                "retryable": False,
            }
        },
    )


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }

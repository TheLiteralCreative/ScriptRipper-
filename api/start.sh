#!/bin/bash
set -e

echo "🚀 Starting ScriptRipper API..."

# Fix Redis URL format if needed
# Render might provide REDIS_URL without a scheme or in internal format
if [ -n "$REDIS_URL" ]; then
    # Check if REDIS_URL starts with redis:// or rediss://
    if [[ ! "$REDIS_URL" =~ ^redis:// ]] && [[ ! "$REDIS_URL" =~ ^rediss:// ]]; then
        echo "⚠️  Fixing Redis URL format..."
        # If it's just hostname:port, add redis:// scheme
        export REDIS_URL="redis://${REDIS_URL}"
        echo "✅ Redis URL fixed: redis://[host]:[port]"
    fi
fi

# Run database migrations
echo "📊 Running database migrations..."
alembic upgrade head || {
    echo "❌ Migration failed, but continuing..."
}

# Seed database with initial prompts (skip if already seeded)
echo "🌱 Seeding database with prompts..."
python3 scripts/seed_prompts.py || {
    echo "⚠️  Seed script failed (might already be seeded), continuing..."
}

# Start the application
echo "✅ Starting Uvicorn server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000

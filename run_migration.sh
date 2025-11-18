#!/bin/bash

# Script to run the database migration for subscription source tracking

echo "🔄 Running database migration for subscription source tracking..."
echo ""

# Check if we're using Docker
if command -v docker-compose &> /dev/null && docker-compose ps | grep -q "postgres"; then
    echo "✅ Using Docker Compose..."
    docker-compose exec api alembic upgrade head
elif [ -f "api/.env" ]; then
    echo "✅ Using local Python environment..."
    cd api

    # Try to activate virtual environment if it exists
    if [ -d "venv" ]; then
        source venv/bin/activate
    elif [ -d ".venv" ]; then
        source .venv/bin/activate
    fi

    # Install alembic if not present
    if ! python3 -c "import alembic" 2>/dev/null; then
        echo "📦 Installing alembic..."
        pip install alembic
    fi

    # Run migration
    alembic upgrade head
else
    echo "❌ Error: Cannot find database configuration"
    echo ""
    echo "Please either:"
    echo "  1. Start Docker: docker-compose up -d"
    echo "  2. Or set up Python environment and run: cd api && alembic upgrade head"
    exit 1
fi

echo ""
echo "✅ Migration complete!"
echo ""
echo "New fields added to users table:"
echo "  - subscription_source (tracks: none/stripe/admin/promotional)"
echo "  - display_name"
echo "  - stripe_customer_id"
echo "  - stripe_subscription_id"

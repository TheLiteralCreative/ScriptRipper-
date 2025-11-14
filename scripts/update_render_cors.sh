#!/bin/bash
# Update Render API CORS settings via API

set -e

# Render API details
SERVICE_ID="srv-d47mub9r0fns73finib0"  # Your scriptripper-api service ID
RENDER_API_KEY="${RENDER_API_KEY:-}"  # Set via: export RENDER_API_KEY=your_key

# New CORS origins
NEW_CORS_ORIGINS="https://script-ripper.vercel.app,https://www.scriptripper.com,https://scriptripper.com"

if [ -z "$RENDER_API_KEY" ]; then
    echo "Error: RENDER_API_KEY environment variable not set"
    echo ""
    echo "To get your Render API key:"
    echo "1. Go to: https://dashboard.render.com/u/settings/api-keys"
    echo "2. Click 'Create API Key'"
    echo "3. Copy the key and run: export RENDER_API_KEY=rnd_xxxxx"
    echo ""
    exit 1
fi

echo "Updating CORS_ORIGINS for service: $SERVICE_ID"
echo "New value: $NEW_CORS_ORIGINS"
echo ""

# Update environment variable via Render API
curl -X PUT "https://api.render.com/v1/services/$SERVICE_ID/env-vars/CORS_ORIGINS" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"value\": \"$NEW_CORS_ORIGINS\"}"

echo ""
echo "✅ CORS_ORIGINS updated successfully!"
echo ""
echo "The API will automatically redeploy with the new settings."
echo "Monitor deployment at: https://dashboard.render.com/web/$SERVICE_ID"

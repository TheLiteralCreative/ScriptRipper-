#!/bin/bash
# Automated Vercel domain setup for ScriptRipper+

set -e

WEB_DIR="/Users/superiorcommunicator/Agents/ScriptRipper/ScriptRipper+/web"
DOMAIN_WWW="www.scriptripper.com"
DOMAIN_APEX="scriptripper.com"

cd "$WEB_DIR"

echo "=================================="
echo "Vercel Domain Setup - ScriptRipper+"
echo "=================================="
echo ""

# Check if logged in
if ! vercel whoami &>/dev/null; then
    echo "❌ Not logged into Vercel. Run: vercel login"
    exit 1
fi

echo "✅ Logged into Vercel as: $(vercel whoami)"
echo ""

# List current domains
echo "📋 Current domains:"
vercel domains ls 2>/dev/null || echo "No domains configured yet"
echo ""

# Add www domain
echo "➕ Adding domain: $DOMAIN_WWW"
if vercel domains add "$DOMAIN_WWW" --yes 2>/dev/null; then
    echo "✅ $DOMAIN_WWW added successfully"
else
    echo "⚠️  $DOMAIN_WWW may already exist or failed to add"
fi
echo ""

# Add apex domain
echo "➕ Adding domain: $DOMAIN_APEX"
if vercel domains add "$DOMAIN_APEX" --yes 2>/dev/null; then
    echo "✅ $DOMAIN_APEX added successfully"
else
    echo "⚠️  $DOMAIN_APEX may already exist or failed to add"
fi
echo ""

# Get DNS records
echo "=================================="
echo "📝 DNS Records Needed"
echo "=================================="
echo ""
echo "Add these records to GoDaddy DNS:"
echo ""
echo "For $DOMAIN_WWW:"
echo "  Type: CNAME"
echo "  Name: www"
echo "  Value: cname.vercel-dns.com"
echo "  TTL: 3600 (or default)"
echo ""
echo "For $DOMAIN_APEX:"
echo "  Type: A"
echo "  Name: @"
echo "  Value: 76.76.21.21"
echo "  TTL: 3600 (or default)"
echo ""
echo "=================================="
echo "📍 Next Steps"
echo "=================================="
echo ""
echo "1. Go to GoDaddy DNS: https://dcc.godaddy.com/control/scriptripper.com/dns"
echo "2. Add/update the DNS records above"
echo "3. Wait 5-30 minutes for DNS propagation"
echo "4. Check status: vercel domains inspect $DOMAIN_WWW"
echo "5. SSL certificates will be auto-provisioned once DNS verifies"
echo ""
echo "Vercel Dashboard: https://vercel.com/literal-creative-projects/scriptripper-web/settings/domains"
echo ""

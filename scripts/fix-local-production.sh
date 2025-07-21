#!/bin/bash

# Fix NEXTAUTH_URL for local production testing

echo "🔧 Fixing NEXTAUTH_URL for local production testing..."
echo ""

# Backup current .env.production
cp .env.production .env.production.backup

# Update NEXTAUTH_URL to localhost for testing
sed -i '' 's|NEXTAUTH_URL=https://www.simple-budget.pro|NEXTAUTH_URL=http://localhost:3000|g' .env.production

echo "✅ Updated NEXTAUTH_URL to http://localhost:3000"
echo ""

# Show the change
echo "📋 Updated .env.production:"
grep NEXTAUTH_URL .env.production
echo ""

echo "🎯 Now restart the production server:"
echo "1. Stop the current server (Ctrl+C)"
echo "2. Run: ./scripts/simulate-production.sh"
echo "3. Test authentication flow"
echo ""
echo "⚠️  Note: This is for local testing only."
echo "   For actual production, use: https://www.simple-budget.pro" 
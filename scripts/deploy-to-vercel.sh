#!/bin/bash

# Deploy to Vercel with proper configuration

echo "🚀 Deploying to Vercel..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in project root directory"
    exit 1
fi

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production not found!"
    echo "Run: ./scripts/populate-production-env.sh first"
    exit 1
fi

echo "📋 Checking environment variables..."
source .env.production

# Verify critical variables
required_vars=(
    "NEXTAUTH_URL"
    "NEXTAUTH_SECRET"
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
    "MONGODB_URI"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing required environment variable: $var"
        exit 1
    else
        echo "✅ $var is set"
    fi
done

echo ""
echo "🔧 Pre-deployment checklist:"
echo "1. ✅ Environment variables verified"
echo "2. ⚠️  Make sure Google OAuth is configured for production domain"
echo "3. ⚠️  Verify domain is configured in Vercel"
echo ""

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "🚀 Deploying to Vercel..."
echo ""

# Deploy to Vercel
vercel --prod

echo ""
echo "🎯 Post-deployment steps:"
echo "1. Go to Vercel Dashboard → Project Settings → Environment Variables"
echo "2. Verify all environment variables are set correctly"
echo "3. Test authentication at your domain"
echo "4. Check Vercel Function Logs for any errors"
echo ""
echo "🔍 Debug commands:"
echo "curl https://your-domain.com/api/auth/providers"
echo "curl https://your-domain.com/api/auth/session" 
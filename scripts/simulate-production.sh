#!/bin/bash

# Production Environment Simulation Script
# This script sets up production-like environment variables and runs the app

echo "🚀 Setting up production environment simulation..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production file not found!"
    echo "Please create .env.production with your production environment variables:"
    echo ""
    echo "NODE_ENV=production"
    echo "NEXTAUTH_URL=https://www.simple-budget.pro"
    echo "NEXTAUTH_SECRET=your-production-secret"
    echo "GOOGLE_CLIENT_ID=your-production-client-id"
    echo "GOOGLE_CLIENT_SECRET=your-production-client-secret"
    echo "MONGODB_URI=your-production-mongodb-uri"
    echo "OPENAI_API_KEY=your-openai-key"
    echo "STRIPE_SECRET_KEY=your-stripe-key"
    echo "STRIPE_WEBHOOK_SECRET=your-webhook-secret"
    echo "STRIPE_PRICE_ID=your-price-id"
    echo "NEXT_PUBLIC_APP_URL=https://www.simple-budget.pro"
    echo ""
    exit 1
fi

# Export production environment variables
echo "📋 Loading production environment variables..."
export $(cat .env.production | grep -v '^#' | xargs)

# Set NODE_ENV to production
export NODE_ENV=production

# Verify critical environment variables
echo "🔍 Verifying environment variables..."
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
echo "🎯 Production environment variables loaded:"
echo "NODE_ENV: $NODE_ENV"
echo "NEXTAUTH_URL: $NEXTAUTH_URL"
echo "MONGODB_URI: ${MONGODB_URI:0:20}..."
echo ""

# Build the application
echo "🔨 Building application for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"

# Start the production server
echo "🚀 Starting production server..."
echo "Access your app at: http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""

npm start 
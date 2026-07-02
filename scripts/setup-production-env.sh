#!/bin/bash

# Setup script for production environment simulation

echo "🚀 Setting up production environment simulation..."
echo ""

# Check if .env.production already exists
if [ -f .env.production ]; then
    echo "⚠️  .env.production already exists!"
    echo "Do you want to overwrite it? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

echo "📝 Creating .env.production template..."
echo ""

# Create .env.production template
cat > .env.production << 'EOF'
# Production Environment Variables
# Fill in your actual production values below

# Node Environment
NODE_ENV=production

# NextAuth Configuration
NEXTAUTH_URL=https://www.presusimple.com
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Google OAuth (Production)
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret

# Database (Production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Stripe Configuration (Production)
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRICE_ID=price_your-price-id

# App Configuration
NEXT_PUBLIC_APP_URL=https://www.presusimple.pro
EOF

echo "✅ .env.production template created!"
echo ""
echo "🔧 Next Steps:"
echo "1. Edit .env.production and replace placeholder values with your actual production values"
echo "2. Make sure your Google OAuth configuration includes:"
echo "   - Authorized redirect URIs: https://www.presusimple.pro/api/auth/callback/google"
echo "   - Authorized JavaScript origins: https://www.presusimple.pro"
echo "3. Run: ./scripts/simulate-production.sh"
echo ""
echo "📋 Required values to fill in:"
echo "   - NEXTAUTH_SECRET: Generate with: openssl rand -base64 32"
echo "   - GOOGLE_CLIENT_ID: From Google Cloud Console"
echo "   - GOOGLE_CLIENT_SECRET: From Google Cloud Console"
echo "   - MONGODB_URI: Your production MongoDB connection string"
echo "   - OPENAI_API_KEY: Your OpenAI API key"
echo "   - STRIPE_*: Your production Stripe keys"
echo ""
echo "🎯 After filling in the values, run:"
echo "   ./scripts/simulate-production.sh" 
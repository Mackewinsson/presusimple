# Presusimple - Personal Finance Management

A modern, full-stack budget management application built with Next.js, TypeScript, and MongoDB.

## Features

- 🔐 Secure authentication with NextAuth.js
- 💰 Budget tracking and expense management
- 📊 Visual insights and analytics
- 🎯 Savings goals tracking (coming soon)
- 💳 Lemon Squeezy subscription integration
- 📱 Responsive design
- 🌙 Dark/Light theme support

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js with Google OAuth
- **Payments**: Lemon Squeezy
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- Google OAuth credentials
- Lemon Squeezy account (for payments)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd presusimple
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`

5. Run the development server:
```bash
npm run dev
```

## Environment Variables

Copy `env.example` to `.env.local` and configure the following variables:

### Required Variables
- `MONGODB_URI`: Your MongoDB connection string
- `NEXTAUTH_URL`: Your application URL
- `NEXTAUTH_SECRET`: A random secret for NextAuth
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `LEMONSQUEEZY_API_KEY`: Lemon Squeezy API key
- `LEMONSQUEEZY_STORE_ID`: Lemon Squeezy store ID
- `LEMONSQUEEZY_VARIANT_ID`: Pro subscription variant ID
- `LEMONSQUEEZY_WEBHOOK_SECRET`: Lemon Squeezy webhook signing secret

### Optional Variables
- `NEXT_PUBLIC_APP_URL`: Your application URL for client-side use

## Production Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run lint:fix` - Fix ESLint issues

## Security Features

- Authentication middleware for protected routes
- Security headers configuration
- CSRF protection
- Rate limiting (via Vercel)
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

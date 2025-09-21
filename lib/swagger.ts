import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Simple Budget API',
      version: '1.0.0',
      description: `# Simple Budget API Documentation

A comprehensive personal finance management tool API with authentication, budget tracking, expense management, and AI-powered features.

## 🔐 Authentication Guide

This API supports two authentication methods:

### 1. JWT Bearer Token (Mobile Apps)
- **Method**: JWT token in Authorization header
- **Format**: \`Bearer <your-jwt-token>\`
- **How to get a token**:
  1. Use the \`/api/mobile-login\` endpoint to authenticate
  2. Copy the \`token\` from the response
  3. Click the "Authorize" button in Swagger UI
  4. Enter: \`Bearer <your-token>\`

### 2. NextAuth Cookie (Web Apps)
- **Method**: NextAuth session cookie
- **Format**: \`next-auth.session-token=<cookie-value>\`
- **How to get a cookie**:
  1. Login through your web app at \`/auth/login\`
  2. Open browser dev tools → Application → Cookies
  3. Copy the \`next-auth.session-token\` value
  4. Click "Authorize" in Swagger UI
  5. Enter: \`next-auth.session-token=<cookie-value>\`

## 🚀 Quick Start

1. **Get a JWT token**:
   \`\`\`bash
   curl -X POST http://localhost:3000/api/mobile-login \\
     -H "Content-Type: application/json" \\
     -d '{"email":"your-email@example.com","password":"your-password"}'
   \`\`\`

2. **Authorize in Swagger UI**:
   - Click the "Authorize" button (🔒) at the top right
   - In the "BearerAuth" field, enter: \`Bearer <your-jwt-token>\`
   - Click "Authorize" → "Close"

3. **Test protected endpoints**:
   - Try the \`/api/mobile-example\` endpoint
   - You should see: \`"Mobile authentication successful"\`

## 📚 API Features

- **Authentication**: JWT and NextAuth session support
- **Budget Management**: Create, read, update, delete budgets
- **Expense Tracking**: Full CRUD operations for expenses
- **AI Features**: AI-powered budget creation and transaction parsing
- **Payment Processing**: Stripe integration for subscriptions
- **User Management**: Profile and currency preferences
- **Monthly Budgets**: Track monthly budget performance

## 🔧 Development

- **Base URL**: \`http://localhost:3000\` (development)
- **Production URL**: \`https://simple-budget.vercel.app\`
- **Rate Limiting**: AI endpoints have rate limits (5-10 requests/minute)
- **Error Handling**: Comprehensive error responses with details`,
      contact: {
        name: 'Simple Budget API Support',
        email: 'support@simplebudget.com',
      },
    },
    servers: [
      {
        url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://simple-budget.vercel.app',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for mobile app authentication',
        },
        NextAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token',
          description: 'NextAuth session token for web authentication',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Additional error details',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            name: {
              type: 'string',
              description: 'User display name',
            },
            plan: {
              type: 'string',
              enum: ['free', 'pro'],
              description: 'User subscription plan',
            },
            isPaid: {
              type: 'boolean',
              description: 'Whether user has paid subscription',
            },
            trialEnd: {
              type: 'string',
              format: 'date-time',
              description: 'Trial end date',
            },
          },
        },
        Budget: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Budget ID',
            },
            name: {
              type: 'string',
              description: 'Budget name',
            },
            sections: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/BudgetSection',
              },
            },
            totalAmount: {
              type: 'number',
              description: 'Total budget amount',
            },
            spentAmount: {
              type: 'number',
              description: 'Amount spent so far',
            },
            remainingAmount: {
              type: 'number',
              description: 'Remaining budget amount',
            },
          },
        },
        BudgetSection: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Section ID',
            },
            name: {
              type: 'string',
              description: 'Section name',
            },
            amount: {
              type: 'number',
              description: 'Section budget amount',
            },
            spent: {
              type: 'number',
              description: 'Amount spent in this section',
            },
            categories: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Category',
              },
            },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Category ID',
            },
            name: {
              type: 'string',
              description: 'Category name',
            },
            amount: {
              type: 'number',
              description: 'Category budget amount',
            },
            spent: {
              type: 'number',
              description: 'Amount spent in this category',
            },
            color: {
              type: 'string',
              description: 'Category color',
            },
            icon: {
              type: 'string',
              description: 'Category icon',
            },
          },
        },
        Expense: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Expense ID',
            },
            amount: {
              type: 'number',
              description: 'Expense amount',
            },
            description: {
              type: 'string',
              description: 'Expense description',
            },
            category: {
              type: 'string',
              description: 'Category ID',
            },
            date: {
              type: 'string',
              format: 'date',
              description: 'Expense date',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'User password',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'User password',
            },
            name: {
              type: 'string',
              description: 'User display name',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT authentication token',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        PasswordSetupRequest: {
          type: 'object',
          required: ['password'],
          properties: {
            password: {
              type: 'string',
              minLength: 8,
              description: 'New password for mobile login',
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
      {
        NextAuth: [],
      },
    ],
  },
  apis: [
    './app/api/**/*.ts', // Path to the API files
  ],
};

export const swaggerSpec = swaggerJSDoc(options);

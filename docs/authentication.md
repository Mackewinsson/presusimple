# Authentication Documentation

## Authentication UI Components

### Pages
- `/auth/login`: Email and social login
- `/auth/register`: New account creation
- `/auth/reset-password`: Password recovery

### Components
- `AuthStatus`: User status display and menu
- `AuthLayout`: Consistent layout for auth pages

## Authentication Flow

### Login Methods
1. Email/Password
2. GitHub OAuth
3. Magic Links (planned)

### Protected Routes
Routes under `/app/*` require authentication:
```typescript
// Example middleware implementation (to be added)
export function middleware(request: NextRequest) {
  const token = request.cookies.get('session');
  
  if (!token && request.nextUrl.pathname.startsWith('/app')) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}
```

### User Session Management
```typescript
// Example session handling (to be implemented)
interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  expires: Date;
}
```

### Security Considerations
- CSRF Protection
- HTTP-only cookies
- Rate limiting
- Password hashing
- Session management

## Integration Steps

1. Configure authentication provider
2. Add middleware for protected routes
3. Implement API routes for auth actions
4. Connect UI components to auth logic
5. Add session management
6. Set up security headers

## Environment Variables
Required variables for auth setup:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```
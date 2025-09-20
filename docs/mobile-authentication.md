# Mobile Authentication Bridge

This document explains how to use the mobile authentication bridge that allows your Expo app to authenticate using your existing NextAuth setup.

## Overview

The mobile authentication bridge consists of:
1. **Temporary code store** (`app/api/mobile/_store.ts`) - Stores one-time codes
2. **Finish route** (`app/api/mobile/finish/route.ts`) - Redirects after NextAuth with a one-time code
3. **Exchange route** (`app/api/mobile/exchange/route.ts`) - Exchanges code for mobile JWT
4. **JWT verifier** (`lib/verifyMobileJwt.ts`) - Verifies mobile JWTs

## Environment Variables

Add to your `.env.local`:
```bash
MOBILE_JWT_SECRET=your-strong-random-secret-here
```

## Mobile App Integration

### 1. Expo Configuration

Update your `app.config.ts`:
```ts
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  scheme: "myapp", // Must match the redirect URL
  extra: {
    API_BASE_URL: process.env.API_BASE_URL, // e.g. https://yourdomain.com
  },
});
```

### 2. Authentication Hook

Create `src/auth/useMobileAuth.ts`:
```ts
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { ENV } from "@/src/lib/env";

WebBrowser.maybeCompleteAuthSession();

export function useMobileAuth() {
  const signIn = async () => {
    const finish = `${ENV.API_BASE_URL}/api/mobile/finish?redirect=myapp://auth/callback`;
    const signinUrl = `${ENV.API_BASE_URL}/api/auth/signin?callbackUrl=${encodeURIComponent(finish)}`;

    const sub = Linking.addEventListener("url", async ({ url }) => {
      try {
        const parsed = Linking.parse(url);
        const code = parsed.queryParams?.code as string | undefined;
        if (!code) return;
        
        const { data } = await axios.get(`${ENV.API_BASE_URL}/api/mobile/exchange`, { 
          params: { code } 
        });
        await SecureStore.setItemAsync("auth_token", data.token);
      } finally {
        WebBrowser.dismissBrowser();
        sub.remove();
      }
    });

    await WebBrowser.openAuthSessionAsync(signinUrl, "myapp://auth/callback");
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync("auth_token");
  };

  return { signIn, signOut };
}
```

### 3. API Client with Authentication

Create `src/api/client.ts`:
```ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { ENV } from "@/src/lib/env";

export const client = axios.create({ baseURL: ENV.API_BASE_URL });

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Protecting Your API Routes

To protect existing API routes for mobile consumption, add mobile JWT verification:

### Example: Protecting an existing route

```ts
// app/api/expenses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { verifyMobileJwt } from "@/lib/verifyMobileJwt";

export async function GET(request: NextRequest) {
  // Check for mobile JWT first
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  
  let userId: string | null = null;
  
  if (token) {
    // Mobile authentication
    try {
      const user = await verifyMobileJwt(token);
      userId = user.sub;
    } catch {
      return NextResponse.json({ error: "Invalid mobile token" }, { status: 401 });
    }
  } else {
    // Web authentication (existing NextAuth)
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }
    userId = String(session.user.id);
  }
  
  // Continue with your existing logic using userId
  // ...
}
```

## Testing the Flow

1. **Web Login**: Visit `/api/auth/signin?callbackUrl=/api/mobile/finish?redirect=myapp://auth/callback`
2. **Complete Auth**: After Google OAuth, you should be redirected to `myapp://auth/callback?code=...`
3. **Exchange Code**: Call `/api/mobile/exchange?code=...` to get the JWT
4. **Use JWT**: Include `Authorization: Bearer <jwt>` in API requests

## Production Considerations

1. **Replace in-memory store** with Redis/Upstash for the code store
2. **Use HTTPS** everywhere
3. **Rotate MOBILE_JWT_SECRET** regularly
4. **Add rate limiting** to prevent code abuse
5. **Consider adding state/nonce** for additional security

## Security Notes

- One-time codes expire in 60 seconds
- Codes are single-use (consumed after exchange)
- Mobile JWTs expire in 7 days (configurable)
- The bridge maintains separation between web and mobile authentication

# PWA Safe Wiring Implementation

This document describes the safe wiring approach implemented for web push notifications in Simple Budget.

## Overview

The safe wiring implementation provides a non-conflicting, additive approach to web push notifications that doesn't break existing features.

## Key Features

### 1. Safe Service Worker
- **Guarded registration**: Uses `__SB_PUSH_WIRED__` flag to prevent duplicate listeners
- **Simplified handlers**: Clean, minimal push and notification click handlers
- **No conflicts**: Extends existing service worker without breaking current functionality

### 2. Namespaced API Routes
- **New namespace**: All new routes under `/api/pwa/*` to avoid conflicts
- **Node.js runtime**: Uses `runtime = "nodejs"` for web-push compatibility
- **Simple endpoints**: Minimal subscribe/unsubscribe/push endpoints

### 3. Standalone Push Client
- **Independent utility**: `lib/pushClient.ts` can be used from any page
- **Safe base64 conversion**: Proper VAPID key handling
- **Error handling**: Graceful fallbacks for unsupported browsers

### 4. In-Memory Store
- **Simple storage**: `lib/pushStore.ts` for development/testing
- **Easy migration**: Can be replaced with database storage later
- **Type-safe**: Proper TypeScript types for push subscriptions

## Usage

### Development Setup

1. **Generate VAPID keys**:
   ```bash
   node scripts/generate-vapid-keys-simple.js
   ```

2. **Add to .env.local**:
   ```env
   WEBPUSH_PUBLIC_KEY=your_public_key
   WEBPUSH_PRIVATE_KEY=your_private_key
   WEBPUSH_CONTACT_EMAIL=mailto:your-email@example.com
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
   ENABLE_PWA_DEV=false
   ```

3. **Enable PWA in development** (optional):
   ```bash
   ENABLE_PWA_DEV=true pnpm dev
   ```

### Testing

1. **Visit test page**: `/dev-tools`
2. **Enable notifications**: Click "Enable Notifications"
3. **Send test push**: Click "Send test push"

### Integration

Use the push client in any component:

```typescript
import { subscribeUser, unsubscribeUser } from '@/lib/pushClient';

// Subscribe
const subscription = await subscribeUser();

// Unsubscribe
await unsubscribeUser();
```

## What This Won't Break

- ✅ Existing pages, auth, and Stripe flows remain unchanged
- ✅ Current notification system continues to work
- ✅ No conflicts with existing API endpoints
- ✅ Service worker handlers are additive and guarded
- ✅ All paths are namespaced under `/api/pwa/*`

## Production Notes

- **HTTPS required**: Works on localhost without HTTPS
- **iOS support**: Requires installed PWA (iOS 16.4+)
- **Cleanup**: Remove dead subscriptions (410/404 errors)
- **Scale**: Replace in-memory store with database for production

## Migration Path

This implementation provides a foundation that can be extended:

1. **Replace in-memory store** with MongoDB integration
2. **Add user-specific subscriptions** linked to user accounts
3. **Implement notification preferences** and categories
4. **Add analytics** and notification tracking
5. **Integrate with existing notification system** for unified experience

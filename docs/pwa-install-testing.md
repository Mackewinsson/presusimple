# PWA Install Prompt Testing Guide

## Issue: PWA Install Prompt Not Showing

### Root Cause ✅
**PWA is disabled in development mode** in `next.config.js`, which prevents the service worker from registering and the install prompt from appearing.

### Solutions Implemented

#### 1. Created PWA Debug Page
- **URL**: `http://localhost:3003/pwa-debug`
- **Purpose**: Debug PWA installation status and force show install prompt
- **Features**: 
  - Real-time PWA status display
  - Debug information about browser capabilities
  - Storage status (dismissal/acceptance tracking)
  - Force show prompt button
  - Clear storage functionality

#### 2. Created PWA Test Script
- **File**: `scripts/test-pwa.js`
- **Purpose**: Check PWA configuration and provide testing instructions
- **Usage**: `node scripts/test-pwa.js`

#### 3. Modified Next.js Configuration
- **File**: `next.config.js`
- **Change**: Enabled PWA in development mode
- **Result**: Service worker will now register in development

### Testing Steps

#### Step 1: Enable PWA in Development
```bash
# Option A: Enable for this session only
ENABLE_PWA_DEV=true npm run dev

# Option B: Permanently enable (already done)
npm run dev
```

#### Step 2: Clear Browser Data
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear Storage" → "Clear site data"
4. Reload the page

#### Step 3: Test PWA Installation
1. **Visit the debug page**: `http://localhost:3003/pwa-debug`
2. **Check PWA status**: Verify all conditions are met
3. **Simulate user interaction**: Click "Simulate User Interaction" button
4. **Force show prompt**: Click "Force Show Prompt" button
5. **Test installation**: Follow the browser's install prompt

#### Step 4: Test on Different Pages
1. **Home page**: `http://localhost:3003/`
2. **Budget page**: `http://localhost:3003/budget`
3. **PWA test page**: `http://localhost:3003/pwa-test`

### PWA Install Prompt Conditions

The install prompt will show when **ALL** of these conditions are met:

1. ✅ **User has interacted** with the page (click, scroll, etc.)
2. ✅ **App is not already installed** (not in standalone mode)
3. ✅ **Prompt not recently dismissed** (14-day cooldown)
4. ✅ **Browser supports PWA** (Chrome, Edge, Safari, Firefox)
5. ✅ **Service worker is registered** (now enabled in development)
6. ✅ **Manifest.json is valid** (✅ confirmed)
7. ✅ **HTTPS or localhost** (✅ localhost in development)

### Browser Requirements

#### Chrome/Edge (Android/Desktop)
- Shows native install prompt
- Uses `beforeinstallprompt` event
- Requires user interaction

#### Safari (iOS)
- Shows custom install instructions
- Uses "Add to Home Screen" flow
- Requires manual Share → Add to Home Screen

#### Firefox
- Limited PWA support
- May not show install prompt

### Troubleshooting

#### Issue: "Service Worker not supported"
- **Solution**: Use a modern browser (Chrome, Edge, Safari)

#### Issue: "Prompt not showing after user interaction"
- **Solution**: 
  1. Clear browser storage
  2. Reload page
  3. Interact with page (click, scroll)
  4. Wait 1-2 seconds

#### Issue: "App already installed"
- **Solution**: 
  1. Check if app is in standalone mode
  2. Clear storage and reload
  3. Check browser's "Installed apps" section

#### Issue: "Prompt dismissed recently"
- **Solution**: 
  1. Clear localStorage: `localStorage.removeItem('pwa-install-dismissed')`
  2. Or wait 14 days
  3. Or use "Clear Storage" in DevTools

### Testing Commands

```bash
# Test PWA configuration
node scripts/test-pwa.js

# Test notifications
node scripts/test-notifications.js

# Start with PWA enabled
ENABLE_PWA_DEV=true npm run dev

# Check service worker status
curl http://localhost:3003/api/debug/service-worker
```

### Expected Behavior

#### First Visit
1. User visits the app
2. User interacts with the page (clicks, scrolls)
3. After 1-2 seconds, install prompt appears
4. User can install or dismiss

#### After Installation
1. App opens in standalone mode
2. Install prompt no longer shows
3. App behaves like a native app

#### After Dismissal
1. Prompt won't show again for 14 days
2. User can manually trigger via debug page
3. Storage tracks dismissal timestamp

### Next Steps

1. **Test the install prompt** using the debug page
2. **Verify notifications work** after PWA installation
3. **Test on mobile devices** for full PWA experience
4. **Deploy to production** with PWA enabled

---

**Status**: ✅ PWA enabled in development, debug tools created
**Next Action**: Test install prompt at `http://localhost:3003/pwa-debug`

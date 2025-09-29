# Notification Troubleshooting Guide

## Issue: Notifications Not Received for mackewinsson@gmail.com

### Root Cause Identified ✅
The main issue was that **PWA is disabled in development mode**, which prevents the service worker from registering and handling push notifications.

### Server-Side Status ✅
- ✅ VAPID keys are properly configured
- ✅ User subscription exists in database
- ✅ Notification sending works (confirmed by diagnostic script)
- ✅ All API endpoints are functioning correctly

### Solutions Implemented

#### 1. Enable PWA in Development
Modified `next.config.js` to allow PWA in development when needed:
```javascript
disable: process.env.NODE_ENV === 'development' && !process.env.ENABLE_PWA_DEV
```

#### 2. Testing Steps

**To test notifications in development:**

1. **Enable PWA in development:**
   ```bash
   ENABLE_PWA_DEV=true npm run dev
   ```

2. **Or permanently enable (for testing):**
   ```bash
   # Edit next.config.js and set disable: false
   npm run dev
   ```

3. **Clear browser cache and reload:**
   - Open DevTools (F12)
   - Go to Application tab
   - Clear Storage → Clear site data
   - Reload the page

4. **Check service worker registration:**
   - Go to Application tab → Service Workers
   - Verify `/sw.js` is registered and active
   - Check console for any errors

5. **Test notification subscription:**
   - Visit `/dev-tools` page
   - Click "Subscribe to Notifications"
   - Grant permission when prompted
   - Verify subscription is successful

6. **Send test notification:**
   - Use the diagnostic script: `node scripts/test-notifications.js`
   - Or use the admin panel at `/admin/notifications`
   - Or send via API: `POST /api/notifications/send`

### Browser Requirements

**For notifications to work:**
- ✅ HTTPS or localhost (secure context)
- ✅ Browser supports push notifications
- ✅ User has granted notification permission
- ✅ Service worker is registered and active
- ✅ PWA is enabled (not disabled in development)

### Common Issues & Solutions

#### Issue: "Service Worker not supported"
- **Solution**: Use a modern browser (Chrome, Firefox, Safari, Edge)

#### Issue: "Push Manager not supported"
- **Solution**: Ensure you're on HTTPS or localhost

#### Issue: "Permission denied"
- **Solution**: 
  1. Check browser notification settings
  2. Clear site data and re-grant permission
  3. Ensure notifications are enabled in browser settings

#### Issue: "Subscription expired" (410 error)
- **Solution**: Re-subscribe to notifications (subscription needs renewal)

#### Issue: "Subscription not found" (404 error)
- **Solution**: Clear database subscription and re-subscribe

### Testing Commands

```bash
# Run diagnostic script
node scripts/test-notifications.js

# Test with PWA enabled in development
ENABLE_PWA_DEV=true npm run dev

# Check VAPID configuration
curl http://localhost:3000/api/debug/vapid

# Check service worker status
curl http://localhost:3000/api/debug/service-worker
```

### Production Deployment

For production, ensure:
1. PWA is enabled (disable: false or remove the disable option)
2. VAPID keys are set in production environment
3. HTTPS is enabled
4. Service worker is properly deployed

### Monitoring

Check these logs for debugging:
- Browser console (F12)
- Service worker console (Application tab → Service Workers)
- Server logs (notification API calls)
- Database (user subscription status)

### Next Steps

1. **Immediate**: Enable PWA in development and test notifications
2. **Verify**: Check that notifications appear in browser
3. **Production**: Ensure PWA is enabled in production build
4. **Monitor**: Set up logging to track notification delivery

---

**Status**: ✅ Issue identified and solutions provided
**Next Action**: Test notifications with PWA enabled in development

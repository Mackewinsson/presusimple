// Custom Service Worker Extensions for Presusimple PWA
// This extends the auto-generated next-pwa service worker with notification functionality
// Based on next-pwa web-push example: https://github.com/shadowwalker/next-pwa/tree/master/examples/web-push

/* eslint-disable no-restricted-globals */
self.__WB_DISABLE_DEV_LOGS = true;

// Import workbox modules
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// Ensure workbox is loaded
if (workbox) {
  console.log('✅ Workbox loaded successfully');
} else {
  console.error('❌ Workbox failed to load');
}

// ===== NOTIFICATION HANDLING =====

// Gate registration with a flag to avoid duplicate listeners on rebuilds
if (!self.__SB_PUSH_WIRED__) {
  self.__SB_PUSH_WIRED__ = true;

  // Ensure event listeners are registered when service worker activates
  self.addEventListener('activate', (event) => {
    console.log('🔧 Service worker activated - registering event listeners');
    event.waitUntil(self.clients.claim());
  });

  // Handle push events
  self.addEventListener('push', (event) => {
    console.log('🔔 Push event received:', event);
    
    const data = (() => {
      try { 
        const jsonData = event.data?.json() ?? {};
        console.log('📦 Push data parsed:', jsonData);
        return jsonData;
      } catch (error) {
        console.log('⚠️ Failed to parse push data as JSON, using text:', error);
        return { body: event.data?.text() || 'You have a new update.' };
      }
    })();

    const optionsData = data.options || {};
    const defaultActionUrl = data.default_action_url || data.defaultActionUrl || data.url || optionsData.default_action_url || '/';
    const declaredActions = Array.isArray(optionsData.actions) && optionsData.actions.some((action) => action && action.url)
      ? optionsData.actions
      : Array.isArray(data.actions)
        ? data.actions
        : Array.isArray(optionsData.actions)
          ? optionsData.actions
          : [];
    const actions = declaredActions.map((action) => ({
      action: action.action,
      title: action.title,
      icon: action.icon
    }));

    const actionUrlMap = declaredActions.reduce((map, action) => {
      if (action && action.action) {
        map[action.action] = action.url || defaultActionUrl;
      }
      return map;
    }, {});

    const mergedData = {
      ...data.data,
      ...(optionsData.data || {}),
      url: data.url || optionsData.data?.url || defaultActionUrl,
      defaultActionUrl,
      actionUrls: Object.keys(actionUrlMap).length > 0 ? actionUrlMap : (data.data?.actionUrls || optionsData.data?.actionUrls || {})
    };

    const options = {
      body: data.body ?? optionsData.body ?? 'You have a new update.',
      icon: data.icon ?? optionsData.icon ?? '/icons/icon-192x192.png',
      badge: data.badge ?? optionsData.badge ?? '/icons/icon-192x192.png',
      data: mergedData,
      actions: actions.length > 0 ? actions : [
        {
          action: 'view',
          title: 'View'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      requireInteraction: data.requireInteraction ?? optionsData.requireInteraction ?? false,
      silent: data.silent ?? optionsData.silent ?? false,
      tag: data.tag ?? optionsData.tag ?? 'budget-notification',
      renotify: data.renotify ?? optionsData.renotify ?? false,
      vibrate: data.vibrate ?? optionsData.vibrate ?? [200, 100, 200]
    };

    const title = data.title || optionsData.title || 'Presusimple';

    console.log('📤 Showing notification:', { title, options });

    event.waitUntil(
      self.registration.showNotification(title, options)
        .then(() => {
          console.log('✅ Notification shown successfully');
        })
        .catch((error) => {
          console.error('❌ Failed to show notification:', error);
        })
    );
  });

  // Handle notification clicks
  self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked:', event.notification.title);
    event.notification.close();
    
    const actionUrls = event.notification.data?.actionUrls || {};
    const fallbackUrl = event.notification.data?.defaultActionUrl || event.notification.data?.url || '/';
    const action = event.action;
    const targetUrl = action && actionUrls[action] ? actionUrls[action] : fallbackUrl;
    
    event.waitUntil((async () => {
      // Handle notification actions
      if (action === 'dismiss') {
        console.log('🔕 Notification dismissed');
        return;
      }
      
      if (!action || action === 'view' || actionUrls[action]) {
        // Try to focus existing window or open new one
        const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });

        // Look for existing window with the same URL
        for (const client of all) {
          if (client.url.includes(targetUrl) || targetUrl === '/') {
            console.log('🔄 Focusing existing window:', client.url);
            return client.focus();
          }
        }
        
        // Open new window if no existing window found
        if (self.clients.openWindow) {
          console.log('🆕 Opening new window:', targetUrl);
          return self.clients.openWindow(targetUrl);
        }
      }
    })());
  });

  // Handle notification close events
  self.addEventListener('notificationclose', (event) => {
    console.log('🔕 Notification closed:', event.notification.title);
  });

  // Handle messages from main thread (for testing)
  self.addEventListener('message', (event) => {
    console.log('📨 Message received in service worker:', event.data);
    
    if (event.data.type === 'TEST_MESSAGE') {
      // Respond to test message
      event.ports[0]?.postMessage({
        success: true,
        message: 'Service worker is responding correctly',
        timestamp: Date.now(),
        data: event.data
      });
    }
  });
}

console.log('✅ Custom service worker extensions loaded with notification support');

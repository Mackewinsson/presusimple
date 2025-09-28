// Custom Service Worker with Notification Support
// This will be used instead of the auto-generated one

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// Enable workbox
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

// Skip waiting and claim clients
self.skipWaiting();
workbox.clientsClaim();

// Clean up outdated caches
workbox.precaching.cleanupOutdatedCaches();

// Register routes for caching
workbox.routing.registerRoute(
  '/',
  new workbox.strategies.NetworkFirst({
    cacheName: 'start-url',
    plugins: [
      {
        cacheWillUpdate: async ({ request, response, event, state }) => {
          return response && response.type === 'opaque-redirect' 
            ? new Response(response.body, {
                status: 200,
                statusText: 'OK',
                headers: response.headers
              })
            : response;
        }
      }
    ]
  }),
  'GET'
);

// Cache static assets
workbox.routing.registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new workbox.strategies.CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 4,
        maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
      })
    ]
  }),
  'GET'
);

workbox.routing.registerRoute(
  /^https:\/\/fonts\.gstatic\.com\/.*/i,
  new workbox.strategies.CacheFirst({
    cacheName: 'google-fonts-static',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 4,
        maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
      })
    ]
  }),
  'GET'
);

workbox.routing.registerRoute(
  /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-font-assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 4,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
      })
    ]
  }),
  'GET'
);

workbox.routing.registerRoute(
  /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-image-assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 64,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  }),
  'GET'
);

workbox.routing.registerRoute(
  /\/_next\/image\?url=.+$/i,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'next-image',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 64,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  }),
  'GET'
);

workbox.routing.registerRoute(
  /\.(?:mp3|wav|ogg)$/i,
  new workbox.strategies.CacheFirst({
    rangeRequests: true,
    cacheName: 'static-audio-assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  }),
  'GET'
);

workbox.routing.registerRoute(
  /\.(?:mp4)$/i,
  new workbox.strategies.CacheFirst({
    rangeRequests: true,
    cacheName: 'static-video-assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  }),
  'GET'
);

workbox.routing.registerRoute(
  /\.(?:js)$/i,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-js-assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 48,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  }),
  'GET'
);

workbox.routing.registerRoute(
  /\.(?:css|less)$/i,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-style-assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  }),
  'GET'
);

workbox.routing.registerRoute(
  /\.(?:json|xml|csv)$/i,
  new workbox.strategies.NetworkFirst({
    cacheName: 'static-data-assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  }),
  'GET'
);

workbox.routing.registerRoute(
  /^\/api\/.*/,
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60 // 5 minutes for API calls
      })
    ]
  }),
  'GET'
);

workbox.routing.registerRoute(
  /^https?.*/,
  new workbox.strategies.NetworkFirst({
    cacheName: 'offlineCache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  }),
  'GET'
);

// ===== NOTIFICATION HANDLING =====

// Handle push events
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('Push data:', data);
      
      const options = {
        body: data.body || 'You have a new notification',
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/icon-72x72.png',
        vibrate: data.vibrate || [200, 100, 200],
        data: {
          url: data.url || '/budget',
          timestamp: Date.now(),
          ...data.data
        },
        actions: data.actions || [
          {
            action: 'view',
            title: 'View Details'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ],
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        tag: data.tag || 'budget-notification',
        renotify: data.renotify || false
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'Budget App', options)
      );
    } catch (error) {
      console.error('Error parsing push data:', error);
      
      // Fallback notification
      const options = {
        body: 'You have a new notification from Budget App',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: {
          url: '/budget',
          timestamp: Date.now()
        }
      };
      
      event.waitUntil(
        self.registration.showNotification('Budget App', options)
      );
    }
  } else {
    // No data, show default notification
    const options = {
      body: 'You have a new notification from Budget App',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: {
        url: '/budget',
        timestamp: Date.now()
      }
    };
    
    event.waitUntil(
      self.registration.showNotification('Budget App', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const url = event.notification.data?.url || '/budget';
  const action = event.action;
  
  if (action === 'dismiss') {
    // Just close the notification, don't open anything
    return;
  }
  
  // Handle different actions
  if (action === 'view' || !action) {
    // Open the app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no existing window, open a new one
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // You can track notification dismissal here if needed
  // For example, send analytics data
});

// Handle background sync (for offline notifications)
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event);
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Handle any pending notification tasks
      Promise.resolve()
    );
  }
});

// Handle message events from the main thread
self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Custom service worker loaded with notification support');

// Custom Service Worker Extensions for Simple Budget PWA
// This extends the auto-generated next-pwa service worker with notification functionality

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

console.log('Custom service worker extensions loaded with notification support');

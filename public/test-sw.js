// Simple test service worker for push notifications
console.log('🧪 Test service worker loaded');

// Handle push events
self.addEventListener('push', (event) => {
  console.log('🔔 PUSH EVENT RECEIVED IN TEST SW:', event);
  console.log('🔔 Event data exists:', !!event.data);
  
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('📦 Parsed push data:', data);
      
      const options = {
        body: data.body || 'Test notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: {
          url: data.url || '/budget',
          timestamp: Date.now(),
        }
      };
      
      console.log('🎯 Showing notification with options:', options);
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'Test Notification', options)
          .then(() => {
            console.log('✅ Test notification shown successfully');
          })
          .catch((error) => {
            console.error('❌ Test notification failed:', error);
          })
      );
    } catch (error) {
      console.error('❌ Error parsing push data:', error);
    }
  } else {
    console.log('⚠️ No push data received');
    event.waitUntil(
      self.registration.showNotification('Test Notification', {
        body: 'No data received',
        icon: '/icons/icon-192x192.png'
      })
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event);
  event.notification.close();
  
  const url = event.notification.data?.url || '/budget';
  event.waitUntil(
    clients.openWindow(url)
  );
});

console.log('✅ Test service worker ready');

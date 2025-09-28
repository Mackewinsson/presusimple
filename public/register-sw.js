// Manual service worker registration for development
if ('serviceWorker' in navigator) {
  console.log('🔧 Manually registering service worker...');
  
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('✅ Service worker registered successfully:', registration);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 New service worker available, reloading...');
              window.location.reload();
            }
          });
        }
      });
      
    } catch (error) {
      console.error('❌ Service worker registration failed:', error);
    }
  });
} else {
  console.log('❌ Service Worker not supported');
}

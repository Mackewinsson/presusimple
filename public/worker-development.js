/******/ (() => { // webpackBootstrap
// Custom Service Worker Extensions for Simple Budget PWA
// This extends the auto-generated next-pwa service worker with notification functionality

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
  self.addEventListener('activate', event => {
    console.log('🔧 Service worker activated - registering event listeners');
    event.waitUntil(self.clients.claim());
  });

  // Handle push events
  self.addEventListener('push', event => {
    const data = (() => {
      try {
        var _event$data$json, _event$data;
        return (_event$data$json = (_event$data = event.data) === null || _event$data === void 0 ? void 0 : _event$data.json()) !== null && _event$data$json !== void 0 ? _event$data$json : {};
      } catch (_unused) {
        var _event$data2;
        return {
          body: (_event$data2 = event.data) === null || _event$data2 === void 0 ? void 0 : _event$data2.text()
        };
      }
    })();
    const title = data.title || 'Simple Budget';
    const options = {
      body: data.body || 'You have a new update.',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: data.badge || '/icons/icon-192x192.png',
      data: {
        url: data.url || '/'
      }
    };
    event.waitUntil(self.registration.showNotification(title, options));
  });

  // Handle notification clicks
  self.addEventListener('notificationclick', event => {
    var _event$notification$d;
    event.notification.close();
    const url = ((_event$notification$d = event.notification.data) === null || _event$notification$d === void 0 ? void 0 : _event$notification$d.url) || '/';
    event.waitUntil((async () => {
      const all = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });
      for (const client of all) {
        if (client.url === url || url === '/') return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })());
  });
}
console.log('✅ Custom service worker extensions loaded with notification support');
/******/ })()
;
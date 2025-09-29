/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toPropertyKey = __webpack_require__(2);
function _defineProperty(e, r, t) {
  return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 2 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(3)["default"]);
var toPrimitive = __webpack_require__(4);
function toPropertyKey(t) {
  var i = toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}
module.exports = toPropertyKey, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 3 */
/***/ ((module) => {

function _typeof(o) {
  "@babel/helpers - typeof";

  return module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof(o);
}
module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),
/* 4 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(3)["default"]);
function toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
module.exports = toPrimitive, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var _defineProperty = __webpack_require__(1);
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
// Custom Service Worker Extensions for Simple Budget PWA
// This extends the auto-generated next-pwa service worker with notification functionality

// Import workbox modules
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// Ensure workbox is loaded
if (workbox) {
  console.log('✅ Workbox loaded successfully');
} else {
  console.error('❌ Workbox failed to load');
}

// ===== NOTIFICATION HANDLING =====

// Ensure event listeners are registered when service worker activates
self.addEventListener('activate', event => {
  console.log('🔧 Service worker activated - registering event listeners');
  event.waitUntil(self.clients.claim());
});

// Handle push events
self.addEventListener('push', event => {
  console.log('🔔 Push event received:', event);
  console.log('🔔 Event data exists:', !!event.data);
  console.log('🔔 Event data type:', typeof event.data);
  if (event.data) {
    try {
      const data = event.data.json();
      console.log('📦 Parsed push data:', data);
      console.log('📦 Data title:', data.title);
      console.log('📦 Data body:', data.body);
      const options = {
        body: data.body || 'You have a new notification',
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/icon-72x72.png',
        vibrate: data.vibrate || [200, 100, 200],
        data: _objectSpread({
          url: data.url || '/budget',
          timestamp: Date.now()
        }, data.data),
        actions: data.actions || [{
          action: 'view',
          title: 'View Details'
        }, {
          action: 'dismiss',
          title: 'Dismiss'
        }],
        requireInteraction: data.requireInteraction || false,
        silent: data.silent || false,
        tag: data.tag || 'budget-notification',
        renotify: data.renotify || false
      };
      console.log('🎯 About to show notification with options:', options);

      // Check if we can show notifications
      if (!self.registration.showNotification) {
        console.error('❌ showNotification is not available');
        return;
      }
      event.waitUntil(self.registration.showNotification(data.title || 'Budget App', options).then(() => {
        console.log('✅ Notification shown successfully');
        console.log('✅ Notification title:', data.title || 'Budget App');
        console.log('✅ Notification body:', options.body);
      }).catch(error => {
        console.error('❌ Error showing notification:', error);
        console.error('❌ Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }));
    } catch (error) {
      console.error('❌ Error parsing push data:', error);
      console.error('❌ Raw event data:', event.data);

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
      console.log('🔄 Showing fallback notification...');
      event.waitUntil(self.registration.showNotification('Budget App', options).then(() => {
        console.log('✅ Fallback notification shown successfully');
      }).catch(fallbackError => {
        console.error('❌ Fallback notification failed:', fallbackError);
      }));
    }
  } else {
    // No data, show default notification
    console.log('⚠️ No push data received, showing default notification');
    const options = {
      body: 'You have a new notification from Budget App',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      data: {
        url: '/budget',
        timestamp: Date.now()
      }
    };
    event.waitUntil(self.registration.showNotification('Budget App', options).then(() => {
      console.log('✅ Default notification shown successfully');
    }).catch(error => {
      console.error('❌ Default notification failed:', error);
    }));
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  var _event$notification$d;
  console.log('Notification clicked:', event);
  event.notification.close();
  const url = ((_event$notification$d = event.notification.data) === null || _event$notification$d === void 0 ? void 0 : _event$notification$d.url) || '/budget';
  const action = event.action;
  if (action === 'dismiss') {
    // Just close the notification, don't open anything
    return;
  }

  // Handle different actions
  if (action === 'view' || !action) {
    // Open the app
    event.waitUntil(clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
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
    }));
  }
});

// Handle notification close
self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event);

  // You can track notification dismissal here if needed
  // For example, send analytics data
});

// Handle background sync (for offline notifications)
self.addEventListener('sync', event => {
  console.log('Background sync:', event);
  if (event.tag === 'notification-sync') {
    event.waitUntil(
    // Handle any pending notification tasks
    Promise.resolve());
  }
});

// Handle message events from the main thread
self.addEventListener('message', event => {
  var _event$data;
  console.log('📨 Service worker received message:', event.data);
  console.log('📨 Message type:', (_event$data = event.data) === null || _event$data === void 0 ? void 0 : _event$data.type);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ Skipping waiting...');
    self.skipWaiting();
  }

  // Respond to test messages
  if (event.data && event.data.type === 'TEST_MESSAGE') {
    var _event$ports$;
    console.log('✅ Test message received successfully!');
    // Send response back to main thread
    (_event$ports$ = event.ports[0]) === null || _event$ports$ === void 0 || _event$ports$.postMessage({
      success: true,
      message: 'Service worker is responding to messages'
    });
  }
});
console.log('✅ Custom service worker extensions loaded with notification support');
})();

/******/ })()
;
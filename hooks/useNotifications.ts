'use client';

import { useState, useEffect, useCallback } from 'react';

export interface NotificationState {
  permission: NotificationPermission;
  isSupported: boolean;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationActions {
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
  clearError: () => void;
}

export type NotificationHookReturn = NotificationState & NotificationActions;

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function useNotifications(): NotificationHookReturn {
  const [state, setState] = useState<NotificationState>({
    permission: 'default',
    isSupported: false,
    isSubscribed: false,
    subscription: null,
    isLoading: false,
    error: null,
  });

  // Initialize notification state
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : 'denied',
    }));

    // Check existing subscription
    if (isSupported) {
      checkSubscription();
    }
  }, []);

  const checkSubscription = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        isSubscribed: !!subscription,
        subscription,
      }));
    } catch (error) {
      console.error('Error checking subscription:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to check subscription status',
      }));
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({ ...prev, error: 'Notifications not supported' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission, isLoading: false }));
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting permission:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to request notification permission',
        isLoading: false,
      }));
      return false;
    }
  }, [state.isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    console.log('🔔 Starting subscription process...');
    console.log('📱 Is supported:', state.isSupported);
    console.log('🔐 Permission:', state.permission);
    
    if (!state.isSupported || state.permission !== 'granted') {
      setState(prev => ({ ...prev, error: 'Permission not granted' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('⚙️ Getting service worker registration...');
      console.log('🔍 Service worker support:', 'serviceWorker' in navigator);
      console.log('🔍 Push manager support:', 'PushManager' in window);
      
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
      }
      
      if (!('PushManager' in window)) {
        throw new Error('Push Manager not supported');
      }
      
      console.log('⏳ Waiting for service worker to be ready...');
      
      // Add timeout to prevent hanging
      const registrationPromise = navigator.serviceWorker.ready;
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Service worker ready timeout')), 10000)
      );
      
      const registration = await Promise.race([registrationPromise, timeoutPromise]);
      console.log('✅ Service worker ready');
      console.log('🔍 Service worker scope:', registration.scope);
      console.log('🔍 Service worker active:', registration.active?.state);
      console.log('🔍 Service worker installing:', registration.installing?.state);
      console.log('🔍 Service worker waiting:', registration.waiting?.state);
      console.log('🔍 Push manager available:', !!registration.pushManager);
      
      // Get VAPID public key
      console.log('🔑 Getting VAPID public key...');
      const response = await fetch('/api/notifications/vapid-public-key');
      console.log('🔍 VAPID response status:', response.status);
      console.log('🔍 VAPID response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ VAPID key fetch failed:', errorText);
        throw new Error('Failed to get VAPID public key');
      }
      
      const vapidPublicKey = await response.text();
      console.log('✅ VAPID public key received');
      console.log('🔍 VAPID key length:', vapidPublicKey.length);
      console.log('🔍 VAPID key preview:', vapidPublicKey.substring(0, 20) + '...');
      
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      console.log('✅ VAPID key converted to Uint8Array');

      // Subscribe to push notifications
      console.log('📱 Subscribing to push notifications...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
      console.log('✅ Push subscription created:', subscription.endpoint);

      // Send subscription to server
      console.log('💾 Saving subscription to server...');
      const subscribeResponse = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      if (!subscribeResponse.ok) {
        const errorText = await subscribeResponse.text();
        console.error('❌ Failed to save subscription:', errorText);
        throw new Error('Failed to save subscription');
      }
      console.log('✅ Subscription saved to server');

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscription,
        isLoading: false,
      }));

      console.log('🎉 Subscription completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Error subscribing to notifications:', error);
      console.error('❌ Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to subscribe to notifications',
        isLoading: false,
      }));
      return false;
    }
  }, [state.isSupported, state.permission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.subscription) {
      setState(prev => ({ ...prev, error: 'No active subscription' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Unsubscribe from push notifications
      await state.subscription.unsubscribe();

      // Remove subscription from server
      await fetch('/api/notifications/unsubscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(state.subscription),
      });

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to unsubscribe from notifications',
        isLoading: false,
      }));
      return false;
    }
  }, [state.subscription]);

  const sendTestNotification = useCallback(async (): Promise<void> => {
    if (!state.isSubscribed) {
      setState(prev => ({ ...prev, error: 'Not subscribed to notifications' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'test',
          message: 'This is a test notification from your PWA!',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Error sending test notification:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to send test notification',
        isLoading: false,
      }));
    }
  }, [state.isSubscribed]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    clearError,
  };
}

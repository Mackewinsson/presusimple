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
    if (!state.isSupported || state.permission !== 'granted') {
      setState(prev => ({ ...prev, error: 'Permission not granted' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Get VAPID public key
      const response = await fetch('/api/notifications/vapid-public-key');
      if (!response.ok) {
        throw new Error('Failed to get VAPID public key');
      }
      const vapidPublicKey = await response.text();
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      // Send subscription to server
      const subscribeResponse = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

      if (!subscribeResponse.ok) {
        throw new Error('Failed to save subscription');
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscription,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to subscribe to notifications',
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
          title: 'Test Notification',
          body: 'This is a test notification from your PWA!',
          icon: '/icons/icon-192x192.png',
          url: '/pwa-test',
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

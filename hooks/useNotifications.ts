'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ensureServiceWorkerRegistered } from '@/lib/push-subscription';

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
  enableNotifications: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
  clearError: () => void;
}

export type NotificationHookReturn = NotificationState & NotificationActions;

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
  return outputArray as Uint8Array;
}

function isPushSupportedInBrowser(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
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

  const checkSubscription = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setState(prev => ({ ...prev, isSubscribed: false, subscription: null }));
        return;
      }
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

  // Cache the SW registration so the user never waits for activation.
  // Pre-warmed silently on mount; used instantly when subscribe is called.
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isSupported = isPushSupportedInBrowser();

    setState(prev => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : 'denied',
    }));

    if (isSupported) {
      checkSubscription();
      // Pre-warm service worker registration silently in background.
      // By the time the user clicks "Enable", the SW will already be active.
      ensureServiceWorkerRegistered().then((reg) => {
        swRegistrationRef.current = reg;
      });
    }
  }, [checkSubscription]);

  const performSubscribe = useCallback(async (): Promise<boolean> => {
    if (!isPushSupportedInBrowser()) {
      setState(prev => ({ ...prev, error: 'Notifications not supported' }));
      return false;
    }

    if (Notification.permission !== 'granted') {
      setState(prev => ({ ...prev, error: 'Permission not granted' }));
      return false;
    }

    if (!window.isSecureContext) {
      setState(prev => ({
        ...prev,
        error: 'Push notifications require HTTPS or localhost',
      }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Use cached registration if available (pre-warmed on mount).
      // Only fall back to a fresh call if cache is empty.
      let registration = swRegistrationRef.current;
      if (!registration) {
        registration = await ensureServiceWorkerRegistered();
        swRegistrationRef.current = registration;
      }

      if (!registration) {
        setState(prev => ({
          ...prev,
          error: 'Service worker not available. Please refresh the page.',
          isLoading: false,
        }));
        return false;
      }

      const response = await fetch('/api/notifications/vapid-public-key');
      if (!response.ok) {
        throw new Error('Failed to get VAPID public key');
      }

      const vapidPublicKey = await response.text();
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as BufferSource,
      });

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
        permission: Notification.permission,
        isSubscribed: true,
        subscription,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to subscribe to notifications',
        isLoading: false,
      }));
      return false;
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isPushSupportedInBrowser()) {
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
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    return performSubscribe();
  }, [performSubscribe]);

  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!isPushSupportedInBrowser()) {
      setState(prev => ({ ...prev, error: 'Notifications not supported' }));
      return false;
    }

    setState(prev => ({ ...prev, error: null }));

    try {
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        setState(prev => ({ ...prev, permission }));

        if (permission !== 'granted') {
          setState(prev => ({
            ...prev,
            error: 'Permission not granted',
          }));
          return false;
        }
      }

      return await performSubscribe();
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to enable notifications',
        isLoading: false,
      }));
      return false;
    }
  }, [performSubscribe]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.subscription) {
      setState(prev => ({ ...prev, error: 'No active subscription' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await state.subscription.unsubscribe();

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
    enableNotifications,
    unsubscribe,
    sendTestNotification,
    clearError,
  };
}

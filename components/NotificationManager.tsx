'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// We'll use the existing API routes instead of Server Actions to avoid client-side import issues

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray as Uint8Array
}

export default function NotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
    setIsSupported(supported)
    
    if (supported) {
      setPermission(Notification.permission)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking subscription:', error)
    }
  }

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Notifications not supported')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)
      setIsLoading(false)
      return permission === 'granted'
    } catch (error) {
      console.error('Error requesting permission:', error)
      setError('Failed to request notification permission')
      setIsLoading(false)
      return false
    }
  }

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported || permission !== 'granted') {
      setError('Permission not granted')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get service worker registration
      let registration = await navigator.serviceWorker.getRegistration()
      
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })
      }
      
      // Wait for service worker to be ready
      registration = await navigator.serviceWorker.ready
      
      // Get VAPID public key
      const response = await fetch('/api/notifications/vapid-public-key')
      if (!response.ok) {
        throw new Error('Failed to get VAPID public key')
      }
      
      const vapidPublicKey = await response.text()
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as BufferSource,
      })

      // Send subscription to server using API route
      const subscribeResponse = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      })

      if (!subscribeResponse.ok) {
        const errorText = await subscribeResponse.text()
        throw new Error('Failed to save subscription: ' + errorText)
      }
      
      setIsSubscribed(true)
      setIsLoading(false)
      return true
    } catch (error) {
      console.error('Error subscribing to notifications:', error)
      setError(error instanceof Error ? error.message : 'Failed to subscribe to notifications')
      setIsLoading(false)
      return false
    }
  }

  const unsubscribe = async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error('Failed to unsubscribe: ' + errorText)
      }
      
      setIsSubscribed(false)
      setIsLoading(false)
      return true
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error)
      setError(error instanceof Error ? error.message : 'Failed to unsubscribe from notifications')
      setIsLoading(false)
      return false
    }
  }

  const sendTestNotification = async (): Promise<void> => {
    if (!isSubscribed) {
      setError('Not subscribed to notifications')
      return
    }

    setIsLoading(true)
    setError(null)

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
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error('Failed to send test notification: ' + errorText)
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('Error sending test notification:', error)
      setError(error instanceof Error ? error.message : 'Failed to send test notification')
      setIsLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Push Notifications</CardTitle>
        <CardDescription>Test notification functionality</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
              <Button 
                onClick={clearError} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Clear Error
              </Button>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                permission === 'granted' ? 'bg-green-500' : 
                permission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm">
                Permission: {permission}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm">
                Subscribed: {isSubscribed ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isSupported ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">
                Supported: {isSupported ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {!isSupported && (
              <p className="text-sm text-red-600">
                Notifications are not supported in this browser
              </p>
            )}
            
            {isSupported && permission !== 'granted' && (
              <Button 
                onClick={requestPermission} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Requesting...' : 'Request Permission'}
              </Button>
            )}
            
            {permission === 'granted' && !isSubscribed && (
              <Button 
                onClick={subscribe} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe to Notifications'}
              </Button>
            )}
            
            {isSubscribed && (
              <div className="space-y-2">
                <Button 
                  onClick={sendTestNotification} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Sending...' : 'Send Test Notification'}
                </Button>
                <Button 
                  onClick={unsubscribe} 
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

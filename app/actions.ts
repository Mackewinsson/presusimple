'use server'

import webpush from 'web-push'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongoose'
import User from '@/models/User'
import { getVAPIDPrivateKey, getVAPIDSubject, validateVAPIDConfig } from '@/lib/vapid'

// Initialize web-push with VAPID keys
function initializeWebPush(): boolean {
  if (!validateVAPIDConfig()) {
    console.error('VAPID configuration validation failed')
    return false
  }

  try {
    webpush.setVapidDetails(
      getVAPIDSubject(),
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      getVAPIDPrivateKey()
    )
    return true
  } catch (error) {
    console.error('Error initializing web-push:', error)
    return false
  }
}

let subscription: any = null

export async function subscribeUser(sub: any) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' }
    }

    // Connect to database
    await dbConnect()

    // Update user with push subscription
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        pushSubscription: sub,
        notificationEnabled: true,
        lastNotificationUpdate: new Date(),
      },
      { new: true, upsert: false }
    )

    if (!updatedUser) {
      return { success: false, error: 'User not found' }
    }

    subscription = sub
    console.log(`Push subscription saved for user: ${session.user.email}`)
    return { success: true }
  } catch (error) {
    console.error('Error saving push subscription:', error)
    return { success: false, error: 'Failed to save push subscription' }
  }
}

export async function unsubscribeUser() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return { success: false, error: 'Unauthorized' }
    }

    // Connect to database
    await dbConnect()

    // Remove push subscription from user
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $unset: { pushSubscription: 1 },
        notificationEnabled: false,
        lastNotificationUpdate: new Date(),
      },
      { new: true, upsert: false }
    )

    if (!updatedUser) {
      return { success: false, error: 'User not found' }
    }

    subscription = null
    console.log(`Push subscription removed for user: ${session.user.email}`)
    return { success: true }
  } catch (error) {
    console.error('Error removing push subscription:', error)
    return { success: false, error: 'Failed to remove push subscription' }
  }
}

export async function sendNotification(message: string) {
  if (!subscription) {
    return { success: false, error: 'No subscription available' }
  }

  if (!initializeWebPush()) {
    return { success: false, error: 'Web-push not initialized' }
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Test Notification',
        body: message,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        data: {
          url: '/budget',
          timestamp: Date.now(),
        },
        actions: [
          {
            action: 'view',
            title: 'View Details'
          },
          {
            action: 'dismiss',
            title: 'Dismiss'
          }
        ],
      })
    )
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}

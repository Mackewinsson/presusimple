import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import { sendNotificationToUsers, NotificationPayload } from '@/lib/notifications';

// List of authorized admin emails
const AUTHORIZED_ADMINS = [
  "mackewinsson@gmail.com", // Your email
  // Add more admin emails here
];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (!AUTHORIZED_ADMINS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse notification data
    const notificationData = await request.json();
    
    if (!notificationData) {
      return NextResponse.json(
        { error: 'Invalid notification data' },
        { status: 400 }
      );
    }

    if (!notificationData.title || !notificationData.body) {
      return NextResponse.json(
        { error: 'Title and body are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get all users with push subscriptions
    const users = await User.find({
      pushSubscription: { $exists: true },
      notificationEnabled: true,
    });

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'No users subscribed to notifications' },
        { status: 400 }
      );
    }

    // Prepare notification payload
    const payload: NotificationPayload = {
      title: notificationData.title,
      body: notificationData.body,
      icon: notificationData.icon || '/icons/icon-192x192.png',
      badge: notificationData.badge || '/icons/icon-72x72.png',
      url: notificationData.url || '/budget',
      data: notificationData.data || {},
      actions: notificationData.actions || [
        {
          action: 'view',
          title: 'View Details',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
      requireInteraction: notificationData.requireInteraction || false,
      silent: notificationData.silent || false,
      tag: notificationData.tag || 'admin-notification',
      renotify: notificationData.renotify || false,
      vibrate: notificationData.vibrate || [200, 100, 200],
    };

    // Get all push subscriptions
    const subscriptions = users
      .map(user => user.pushSubscription)
      .filter(subscription => subscription);

    // Send notifications
    const result = await sendNotificationToUsers(subscriptions, payload);

    // Log the notification (you might want to store this in a database)
    console.log(`Admin notification sent by ${session.user.email}:`, {
      title: notificationData.title,
      body: notificationData.body,
      recipients: subscriptions.length,
      success: result.success,
      sent: result.sent,
      failed: result.failed,
      errors: result.errors,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Notification sent successfully to ${result.sent} users`,
        stats: {
          sent: result.sent,
          failed: result.failed,
          total: subscriptions.length,
        },
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Some notifications failed to send',
          stats: {
            sent: result.sent,
            failed: result.failed,
            total: subscriptions.length,
            errors: result.errors,
          }
        },
        { status: 207 } // Multi-status
      );
    }
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

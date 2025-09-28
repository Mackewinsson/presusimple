import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';
import { sendNotificationToUser, sendTestNotification, NotificationPayload } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Notification send API called');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    console.log('👤 Session:', session?.user?.email ? 'Authenticated' : 'Not authenticated');
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse notification data
    const notificationData = await request.json();
    console.log('📝 Notification data:', notificationData);
    
    if (!notificationData) {
      return NextResponse.json(
        { error: 'Invalid notification data' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get user's push subscription
    const user = await User.findOne({ email: session.user.email });
    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('🔔 User push subscription:', user.pushSubscription ? 'Exists' : 'Missing');
    if (!user.pushSubscription) {
      return NextResponse.json(
        { error: 'User not subscribed to notifications' },
        { status: 400 }
      );
    }

    let result;

    // Handle different notification types
    if (notificationData.type === 'test') {
      result = await sendTestNotification(
        user.pushSubscription,
        notificationData.message
      );
    } else {
      // Send custom notification
      const payload: NotificationPayload = {
        title: notificationData.title || 'Budget App Notification',
        body: notificationData.body || 'You have a new notification',
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
        tag: notificationData.tag || 'budget-notification',
        renotify: notificationData.renotify || false,
        vibrate: notificationData.vibrate || [200, 100, 200],
      };

      result = await sendNotificationToUser(user.pushSubscription, payload);
    }

    if (result.success) {
      console.log(`Notification sent successfully to user: ${session.user.email}`);
      return NextResponse.json({
        success: true,
        message: 'Notification sent successfully',
      });
    } else {
      console.error(`Failed to send notification to user: ${session.user.email}`, result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to send notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';

// List of authorized admin emails
const AUTHORIZED_ADMINS = [
  "mackewinsson@gmail.com", // Your email
  // Add more admin emails here
];

export async function GET() {
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

    // Connect to database
    await dbConnect();

    // Get notification statistics
    const totalSubscribers = await User.countDocuments({
      pushSubscription: { $exists: true },
    });

    const activeSubscribers = await User.countDocuments({
      pushSubscription: { $exists: true },
      notificationEnabled: true,
    });

    // Get the most recent notification update
    const lastNotificationUser = await User.findOne({
      lastNotificationUpdate: { $exists: true },
    }).sort({ lastNotificationUpdate: -1 });

    const lastNotificationSent = lastNotificationUser?.lastNotificationUpdate || null;

    // For now, we'll use a simple count based on lastNotificationUpdate
    // In a real app, you might want to store notification history in a separate collection
    const notificationsSent = await User.countDocuments({
      lastNotificationUpdate: { $exists: true },
    });

    return NextResponse.json({
      totalSubscribers,
      activeSubscribers,
      notificationsSent,
      lastNotificationSent,
    });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    return NextResponse.json(
      { error: 'Failed to get notification statistics' },
      { status: 500 }
    );
  }
}

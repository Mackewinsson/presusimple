import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    // For now, return empty history since we don't have a notification history collection
    // In a real app, you would store notification history in a separate collection
    const history = [
      // Example entries (remove in production)
      {
        id: '1',
        title: 'Welcome to Budget App',
        body: 'Thank you for subscribing to notifications!',
        sentAt: new Date().toISOString(),
        recipients: 1,
        success: true,
      },
    ];

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error getting notification history:', error);
    return NextResponse.json(
      { error: 'Failed to get notification history' },
      { status: 500 }
    );
  }
}

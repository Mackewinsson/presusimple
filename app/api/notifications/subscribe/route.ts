import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Subscribe API called');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    console.log('👤 Session:', session?.user?.email ? 'Authenticated' : 'Not authenticated');
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse subscription data
    const subscription = await request.json();
    console.log('📱 Subscription data received:', subscription ? 'Valid' : 'Invalid');
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Update user with push subscription
    console.log('💾 Saving subscription to database...');
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        pushSubscription: subscription,
        notificationEnabled: true,
        lastNotificationUpdate: new Date(),
      },
      { new: true, upsert: false }
    );

    console.log('👤 User update result:', updatedUser ? 'Success' : 'Failed');
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Push subscription saved for user: ${session.user.email}`);
    console.log('🔔 Subscription endpoint:', subscription.endpoint);

    return NextResponse.json({
      success: true,
      message: 'Push subscription saved successfully',
    });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save push subscription' },
      { status: 500 }
    );
  }
}

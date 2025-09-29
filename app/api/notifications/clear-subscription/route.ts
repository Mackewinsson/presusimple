import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';

/**
 * @swagger
 * /api/notifications/clear-subscription:
 *   post:
 *     summary: Clear user's push subscription
 *     description: Removes the current user's push subscription from the database
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Subscription cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Push subscription cleared successfully"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Clear subscription API called');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    console.log('👤 Session:', session?.user?.email ? 'Authenticated' : 'Not authenticated');
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Clear the user's push subscription
    console.log('🗑️ Clearing push subscription...');
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $unset: { pushSubscription: 1 },
        notificationEnabled: false,
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

    console.log(`✅ Push subscription cleared for user: ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Push subscription cleared successfully',
    });
  } catch (error) {
    console.error('Error clearing push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to clear push subscription' },
      { status: 500 }
    );
  }
}

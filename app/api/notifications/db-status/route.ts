import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/mongoose';
import User from '@/models/User';

/**
 * @swagger
 * /api/notifications/db-status:
 *   get:
 *     summary: Get notification database status
 *     description: Returns the current status of notification subscriptions in the database
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Database status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                   example: 10
 *                 usersWithSubscriptions:
 *                   type: number
 *                   example: 1
 *                 usersWithNotificationsEnabled:
 *                   type: number
 *                   example: 1
 *                 subscriptions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       email:
 *                         type: string
 *                         example: "user@example.com"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       notificationEnabled:
 *                         type: boolean
 *                         example: true
 *                       lastNotificationUpdate:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00.000Z"
 *                       hasValidSubscription:
 *                         type: boolean
 *                         example: true
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Notification DB Status API called');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    console.log('👤 Session:', session?.user?.email ? 'Authenticated' : 'Not authenticated');
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await dbConnect();

    // Get comprehensive notification statistics
    const totalUsers = await User.countDocuments();
    const usersWithSubscriptions = await User.countDocuments({
      pushSubscription: { $exists: true, $ne: null }
    });
    const usersWithNotificationsEnabled = await User.countDocuments({
      notificationEnabled: true
    });

    // Get detailed subscription information
    const subscriptions = await User.find({
      pushSubscription: { $exists: true, $ne: null }
    }).select('email name notificationEnabled lastNotificationUpdate pushSubscription');

    const subscriptionDetails = subscriptions.map(user => ({
      email: user.email,
      name: user.name,
      notificationEnabled: user.notificationEnabled,
      lastNotificationUpdate: user.lastNotificationUpdate,
      hasValidSubscription: !!(user.pushSubscription?.endpoint && user.pushSubscription?.keys),
      subscriptionEndpoint: user.pushSubscription?.endpoint ? 
        user.pushSubscription.endpoint.substring(0, 50) + '...' : null
    }));

    // Get recent notification activity
    const recentActivity = await User.find({
      lastNotificationUpdate: { $exists: true, $ne: null }
    })
    .sort({ lastNotificationUpdate: -1 })
    .limit(5)
    .select('email name lastNotificationUpdate notificationEnabled');

    const stats = {
      totalUsers,
      usersWithSubscriptions,
      usersWithNotificationsEnabled,
      subscriptionRate: totalUsers > 0 ? (usersWithSubscriptions / totalUsers * 100).toFixed(1) : 0,
      enabledRate: totalUsers > 0 ? (usersWithNotificationsEnabled / totalUsers * 100).toFixed(1) : 0,
      subscriptions: subscriptionDetails,
      recentActivity: recentActivity.map(user => ({
        email: user.email,
        name: user.name,
        lastNotificationUpdate: user.lastNotificationUpdate,
        notificationEnabled: user.notificationEnabled
      }))
    };

    console.log(`✅ Database status retrieved: ${totalUsers} total users, ${usersWithSubscriptions} with subscriptions`);

    return NextResponse.json({
      success: true,
      message: 'Database status retrieved successfully',
      stats
    });
  } catch (error) {
    console.error('Error getting notification database status:', error);
    return NextResponse.json(
      { error: 'Failed to get database status' },
      { status: 500 }
    );
  }
}

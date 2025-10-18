/**
 * @swagger
 * /api/features:
 *   get:
 *     summary: Get user's applicable feature flags
 *     description: Retrieve feature flags that apply to the current user based on their plan, platform, and targeting rules
 *     tags: [Feature Flags]
 *     security:
 *       - BearerAuth: []
 *       - NextAuth: []
 *     parameters:
 *       - in: query
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [web, mobile]
 *         description: Platform requesting feature flags
 *     responses:
 *       200:
 *         description: User's applicable feature flags
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 features:
 *                   type: object
 *                   additionalProperties:
 *                     type: boolean
 *                   description: Object with feature keys as properties and boolean values indicating if feature is enabled for user
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     plan:
 *                       type: string
 *                       enum: [free, pro]
 *                     platform:
 *                       type: string
 *                       enum: [web, mobile]
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Bad request - Platform parameter required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireAuth } from '@/lib/auth-middleware';
import { dbConnect } from '@/lib/mongoose';
import Feature from '@/models/Feature';
import User from '@/models/User';

// GET /api/features - Get feature flags for the current user
export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await dbConnect();

    let user = null;
    let userEmail = null;

    // Check for JWT Bearer token (mobile apps)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      console.log('[Features API] JWT Bearer token detected');
      const authResult = requireAuth(request);
      if ("error" in authResult) {
        return authResult.error;
      }
      userEmail = authResult.user.email;
      console.log('[Features API] JWT user email:', userEmail);
    } else {
      // Check for NextAuth session (web apps)
      console.log('[Features API] Checking NextAuth session');
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userEmail = session.user.email;
      console.log('[Features API] NextAuth user email:', userEmail);
    }

    // Get user information
    user = await User.findOne({ email: userEmail });
    if (!user) {
      console.log('[Features API] User not found for email:', userEmail);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('[Features API] User found:', user._id, 'Plan:', user.subscriptionStatus);

    // Determine user type
    const userType = user.subscriptionStatus === 'active' ? 'pro' : 'free';
    
    // Get platform from query parameter or default to web
    const url = new URL(request.url);
    const platform = url.searchParams.get('platform') || 'web';
    console.log('[Features API] Platform:', platform, 'User type:', userType);

    // Get all enabled features for this user type and platform
    const features = await Feature.find({
      enabled: true,
      platforms: platform,
      userTypes: userType,
    });
    console.log('[Features API] Found features:', features.length, features.map(f => f.key));

    // Filter features based on rollout percentage and user targeting
    const userFeatures: Record<string, boolean> = {};
    
    for (const feature of features) {
      let shouldEnable = true;

      // Check if user is explicitly excluded
      if (feature.excludeUsers?.includes(user._id.toString())) {
        shouldEnable = false;
      }
      // Check if user is explicitly targeted
      else if (feature.targetUsers?.length > 0) {
        shouldEnable = feature.targetUsers.includes(user._id.toString());
      }
      // Check rollout percentage
      else if (feature.rolloutPercentage < 100) {
        // Use user ID to create a consistent hash for rollout
        const hash = hashString(user._id.toString() + feature.key);
        shouldEnable = (hash % 100) < feature.rolloutPercentage;
      }

      userFeatures[feature.key] = shouldEnable;
    }

    console.log('[Features API] Final user features:', userFeatures);

    // Add test feature flag "aa" for testing
    userFeatures['aa'] = true;
    console.log('[Features API] Added test feature flag "aa":', userFeatures['aa']);

    return NextResponse.json({
      features: userFeatures,
      userType,
      platform,
      userId: user._id.toString(),
    });
  } catch (error) {
    console.error('Error getting user features:', error);
    return NextResponse.json(
      { error: 'Failed to get features' },
      { status: 500 }
    );
  }
}

// Simple hash function for consistent rollout
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

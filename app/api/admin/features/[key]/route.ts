/**
 * @swagger
 * /api/admin/features/{key}:
 *   get:
 *     summary: Get a specific feature flag
 *     description: Retrieve a feature flag by its unique key
 *     tags: [Admin - Feature Flags]
 *     security:
 *       - BearerAuth: []
 *       - NextAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature flag key
 *     responses:
 *       200:
 *         description: Feature flag details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feature'
 *       401:
 *         description: Unauthorized - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Feature flag not found
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
 *   put:
 *     summary: Update a feature flag
 *     description: Update an existing feature flag configuration
 *     tags: [Admin - Feature Flags]
 *     security:
 *       - BearerAuth: []
 *       - NextAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature flag key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeatureCreateRequest'
 *     responses:
 *       200:
 *         description: Feature flag updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feature'
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Feature flag not found
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
 *   delete:
 *     summary: Delete a feature flag
 *     description: Delete a feature flag by its key
 *     tags: [Admin - Feature Flags]
 *     security:
 *       - BearerAuth: []
 *       - NextAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature flag key
 *     responses:
 *       200:
 *         description: Feature flag deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Feature flag deleted successfully"
 *       401:
 *         description: Unauthorized - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Feature flag not found
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
import { dbConnect } from '@/lib/mongoose';
import Feature from '@/models/Feature';

// List of authorized admin emails
const AUTHORIZED_ADMINS = [
  "mackewinsson@gmail.com", // Your email
  // Add more admin emails here
];

// GET /api/admin/features/[key] - Get a specific feature flag
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
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

    // Get feature by key
    const { key } = await params;
    const feature = await Feature.findOne({ key });
    
    if (!feature) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(feature);
  } catch (error) {
    console.error('Error getting feature:', error);
    return NextResponse.json(
      { error: 'Failed to get feature' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/features/[key] - Update a specific feature flag
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
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

    // Parse request body
    const updateData = await request.json();
    
    if (!updateData) {
      return NextResponse.json(
        { error: 'Invalid update data' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find and update feature
    const { key } = await params;
    const feature = await Feature.findOneAndUpdate(
      { key },
      { 
        ...updateData,
        lastModifiedBy: session.user.email,
      },
      { new: true, runValidators: true }
    );
    
    if (!feature) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(feature);
  } catch (error) {
    console.error('Error updating feature:', error);
    return NextResponse.json(
      { error: 'Failed to update feature' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/features/[key] - Delete a specific feature flag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
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

    // Delete feature
    const { key } = await params;
    const feature = await Feature.findOneAndDelete({ key });
    
    if (!feature) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Feature deleted successfully' });
  } catch (error) {
    console.error('Error deleting feature:', error);
    return NextResponse.json(
      { error: 'Failed to delete feature' },
      { status: 500 }
    );
  }
}

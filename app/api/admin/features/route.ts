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

// GET /api/admin/features - Get all feature flags
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

    // Get all features
    const features = await Feature.find({}).sort({ createdAt: -1 });

    return NextResponse.json(features);
  } catch (error) {
    console.error('Error getting features:', error);
    return NextResponse.json(
      { error: 'Failed to get features' },
      { status: 500 }
    );
  }
}

// POST /api/admin/features - Create a new feature flag
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

    // Parse request body
    const featureData = await request.json();
    
    if (!featureData) {
      return NextResponse.json(
        { error: 'Invalid feature data' },
        { status: 400 }
      );
    }

    // Validate required fields
    const { key, name, description, platforms, userTypes } = featureData;
    
    if (!key || !name || !description || !platforms || !userTypes) {
      return NextResponse.json(
        { error: 'Missing required fields: key, name, description, platforms, userTypes' },
        { status: 400 }
      );
    }

    // Validate platforms
    const validPlatforms = ['web', 'mobile'];
    if (!platforms.every((platform: string) => validPlatforms.includes(platform))) {
      return NextResponse.json(
        { error: 'Invalid platforms. Must be web and/or mobile' },
        { status: 400 }
      );
    }

    // Validate user types
    const validUserTypes = ['free', 'pro', 'admin'];
    if (!userTypes.every((type: string) => validUserTypes.includes(type))) {
      return NextResponse.json(
        { error: 'Invalid user types. Must be free, pro, and/or admin' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Check if feature with this key already exists
    const existingFeature = await Feature.findOne({ key });
    if (existingFeature) {
      return NextResponse.json(
        { error: 'Feature with this key already exists' },
        { status: 409 }
      );
    }

    // Create new feature
    const newFeature = new Feature({
      ...featureData,
      createdBy: session.user.email,
      lastModifiedBy: session.user.email,
    });

    await newFeature.save();

    return NextResponse.json(newFeature, { status: 201 });
  } catch (error) {
    console.error('Error creating feature:', error);
    return NextResponse.json(
      { error: 'Failed to create feature' },
      { status: 500 }
    );
  }
}

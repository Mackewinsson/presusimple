import { NextResponse } from 'next/server';
import { getVAPIDPublicKey } from '@/lib/vapid';

export async function GET() {
  try {
    const publicKey = getVAPIDPublicKey();
    // Return as plain text to match the Next.js PWA documentation
    return new NextResponse(publicKey, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    return NextResponse.json(
      { error: 'VAPID configuration error' },
      { status: 500 }
    );
  }
}

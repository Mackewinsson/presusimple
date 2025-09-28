import { NextResponse } from 'next/server';
import { getVAPIDPublicKey } from '@/lib/vapid';

export async function GET() {
  try {
    const publicKey = getVAPIDPublicKey();
    return NextResponse.json({ publicKey });
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    return NextResponse.json(
      { error: 'VAPID configuration error' },
      { status: 500 }
    );
  }
}

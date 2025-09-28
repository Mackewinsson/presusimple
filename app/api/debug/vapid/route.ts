import { NextResponse } from 'next/server';
import { validateVAPIDConfig, getVAPIDPublicKey, getVAPIDPrivateKey, getVAPIDSubject } from '@/lib/vapid';

export async function GET() {
  try {
    const isValid = validateVAPIDConfig();
    const publicKey = getVAPIDPublicKey();
    const privateKey = getVAPIDPrivateKey();
    const subject = getVAPIDSubject();

    return NextResponse.json({
      isValid,
      publicKey: publicKey ? 'Set' : 'Missing',
      privateKey: privateKey ? 'Set' : 'Missing',
      subject,
      publicKeyValue: publicKey,
      environment: {
        NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? 'Set' : 'Missing',
        VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY ? 'Set' : 'Missing',
        VAPID_SUBJECT: process.env.VAPID_SUBJECT ? 'Set' : 'Missing',
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      isValid: false
    }, { status: 500 });
  }
}

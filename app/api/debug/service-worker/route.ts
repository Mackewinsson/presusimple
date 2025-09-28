import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // This endpoint just returns information about the service worker setup
    return NextResponse.json({
      message: 'Service Worker Debug Info',
      serviceWorkerUrl: '/sw.js',
      customServiceWorkerPath: '/public/custom-sw.js',
      pwaEnabled: true,
      timestamp: new Date().toISOString(),
      instructions: [
        '1. Open browser DevTools (F12)',
        '2. Go to Application tab',
        '3. Check Service Workers section',
        '4. Look for service worker at /sw.js',
        '5. Check if it shows as "activated"',
        '6. Try subscribing to notifications on /pwa-test page',
        '7. Check console for any errors'
      ]
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get service worker debug info' },
      { status: 500 }
    );
  }
}

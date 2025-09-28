/**
 * VAPID (Voluntary Application Server Identification) Configuration
 * Used for push notification authentication
 */

// VAPID keys for push notifications
// In production, these should be stored in environment variables
export const VAPID_KEYS = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
  subject: process.env.VAPID_SUBJECT || 'mailto:admin@yourdomain.com',
};

// Validate VAPID configuration
export function validateVAPIDConfig(): boolean {
  if (!VAPID_KEYS.publicKey || !VAPID_KEYS.privateKey) {
    console.error('VAPID keys are not configured. Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.');
    return false;
  }
  
  if (!VAPID_KEYS.subject) {
    console.error('VAPID subject is not configured. Please set VAPID_SUBJECT environment variable.');
    return false;
  }
  
  return true;
}

// Get VAPID public key for client-side use
export function getVAPIDPublicKey(): string {
  if (!VAPID_KEYS.publicKey) {
    throw new Error('VAPID public key is not configured');
  }
  return VAPID_KEYS.publicKey;
}

// Get VAPID private key for server-side use
export function getVAPIDPrivateKey(): string {
  if (!VAPID_KEYS.privateKey) {
    throw new Error('VAPID private key is not configured');
  }
  return VAPID_KEYS.privateKey;
}

// Get VAPID subject
export function getVAPIDSubject(): string {
  return VAPID_KEYS.subject;
}

// Generate VAPID keys (for development/setup)
// Run this once to generate keys and add them to your .env file
export function generateVAPIDKeys(): { publicKey: string; privateKey: string } {
  // This is a placeholder - in real implementation, you would use a library like 'web-push'
  // to generate proper VAPID keys
  console.log(`
To generate VAPID keys, install web-push and run:

npm install web-push
npx web-push generate-vapid-keys

Then add the keys to your .env file:
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
  `);
  
  return {
    publicKey: '',
    privateKey: '',
  };
}

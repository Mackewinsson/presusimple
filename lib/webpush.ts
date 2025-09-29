import webpush from "web-push";
import { getVAPIDSubject, getVAPIDPrivateKey, validateVAPIDConfig } from './vapid';

// Initialize web-push with VAPID keys using the centralized configuration
if (validateVAPIDConfig()) {
  webpush.setVapidDetails(
    getVAPIDSubject(),
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    getVAPIDPrivateKey()
  );
} else {
  console.error('❌ VAPID configuration is invalid. Push notifications will not work.');
}

export { webpush };

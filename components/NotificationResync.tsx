"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { resyncPushSubscription } from "@/lib/push-subscription";

/**
 * Silently repairs the push subscription on app open.
 *
 * When the server prunes an expired subscription, the user still has
 * notification permission granted but no subscription in the database. This
 * component re-subscribes the browser and saves the new subscription without
 * any user interaction. Users who never granted permission are untouched
 * (NotificationPrompt handles asking them).
 */
export default function NotificationResync() {
  const { data: session, status } = useSession();
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    resyncPushSubscription().then((result) => {
      if (result === "resynced") {
        console.log("[push] Push subscription restored automatically");
      }
    });
  }, [status, session?.user?.email]);

  return null;
}

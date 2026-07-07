"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { trackSignUp } from "@/lib/analytics/events";
import { isAnalyticsEnabled } from "@/lib/analytics/gtag";

const SIGN_UP_TRACKED_KEY = "presusimple_sign_up_tracked";

export function SignUpTracker() {
  const { data: session } = useSession();
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || !session?.isNewUser || !isAnalyticsEnabled()) return;

    const alreadyTracked = sessionStorage.getItem(SIGN_UP_TRACKED_KEY);
    if (alreadyTracked) {
      tracked.current = true;
      return;
    }

    trackSignUp("google");
    sessionStorage.setItem(SIGN_UP_TRACKED_KEY, "1");
    tracked.current = true;
  }, [session?.isNewUser]);

  return null;
}

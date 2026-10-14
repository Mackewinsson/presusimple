"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import {
  REFERRAL_QUERY_PARAM,
  normalizeReferralCode,
} from "@/lib/referrals/constants";

function ReferralInviteBannerContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const code = normalizeReferralCode(searchParams.get(REFERRAL_QUERY_PARAM));

  if (!code) return null;

  return (
    <div role="status" className="bg-accent text-accent-foreground">
      <p className="container mx-auto px-4 py-2 text-center text-sm font-medium">
        {t("referralInviteBanner")}
      </p>
    </div>
  );
}

export function ReferralInviteBanner() {
  return (
    <div className="w-full">
      <Suspense fallback={null}>
        <ReferralInviteBannerContent />
      </Suspense>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { REFERRAL_QUERY_PARAM, buildReferralCookie } from "@/lib/referrals/constants";

const PRIVATE_CACHE_CONTROL = "private, no-store";

/**
 * Persist a valid `?ref=` code on the response.
 * Invalid values are ignored so arbitrary query strings never become cookies.
 * Responses that set the cookie are marked private so a shared cache cannot
 * replay one visitor's referral onto someone else.
 */
export function applyReferralCookie(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const cookie = buildReferralCookie(
    request.nextUrl.searchParams.get(REFERRAL_QUERY_PARAM)
  );
  if (!cookie) return response;

  response.cookies.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    sameSite: cookie.sameSite,
    secure: cookie.secure,
    path: cookie.path,
    maxAge: cookie.maxAge,
  });
  response.headers.set("Cache-Control", PRIVATE_CACHE_CONTROL);
  return response;
}

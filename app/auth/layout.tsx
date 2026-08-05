import { ReactNode } from "react";
import type { Metadata } from "next";

// Auth pages (login/register/reset-password/signin) are private app screens,
// not content — they should never appear in search results. robots.ts allows
// crawling this path specifically so Googlebot can see this tag and drop
// /auth/login from the index (it was previously indexed despite the old
// robots.txt disallow, which blocks crawling but not indexing).
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

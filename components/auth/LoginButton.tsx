"use client";

import Link from "next/link";

export default function LoginButton() {
  return (
    <div className="flex items-center gap-4">
      <Link
        href="/api/auth/login"
        className="text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        Login
      </Link>
      <Link
        href="/api/auth/logout"
        className="text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        Logout
      </Link>
    </div>
  );
}

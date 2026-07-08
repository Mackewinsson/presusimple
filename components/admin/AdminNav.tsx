"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";

const ADMIN_LINKS: Array<{ href: string; label: string; exact?: boolean }> = [
  { href: "/admin", label: "Dashboard", exact: true },
];

export function AdminNav() {
  const pathname = usePathname();

  const linkClass = (href: string, exact = false) => {
    const isActive = exact
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

    return isActive
      ? "rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm"
      : "rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors";
  };

  return (
    <nav className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
      <div className="flex items-center gap-2 mr-2 text-sm font-semibold text-foreground">
        <Shield className="h-4 w-4 text-accent-foreground bg-accent rounded p-0.5" />
        <span>Platform Admin</span>
      </div>
      {ADMIN_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={linkClass(link.href, link.exact)}
        >
          {link.label}
        </Link>
      ))}
      <Link
        href="/budget"
        className="ml-auto rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
      >
        Back to app
      </Link>
    </nav>
  );
}

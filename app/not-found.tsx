import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | Presusimple",
  description: "The page you're looking for doesn't exist. Navigate back to Presusimple.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto max-w-md space-y-6">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-accent">
          <span className="text-4xl font-bold text-accent-foreground">P</span>
        </div>

        {/* Error message */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <p className="text-xl text-muted-foreground">
            Page not found
          </p>
          <p className="text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            Go to Homepage
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Read the Blog
          </Link>
        </nav>

        {/* Spanish alternative */}
        <p className="pt-2 text-xs text-muted-foreground">
          ¿Buscas la versión en español?{" "}
          <Link href="/es" className="text-accent underline underline-offset-2 hover:opacity-80">
            Ir a inicio
          </Link>
        </p>
      </div>
    </div>
  );
}

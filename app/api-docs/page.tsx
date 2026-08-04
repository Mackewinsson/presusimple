import type { Metadata } from "next";
import Link from "next/link";
import { SwaggerUiClient } from "@/components/api-docs/SwaggerUiClient";
import { getApiDocsJsonLd, getApiDocsMetadata } from "@/lib/seo";

export const metadata: Metadata = getApiDocsMetadata("en");

export default function ApiDocsPage() {
  const jsonLd = getApiDocsJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <p className="mb-2 text-sm text-muted-foreground">
              <Link href="/developers" className="underline hover:text-foreground">
                Developers
              </Link>
              {" / "}
              API Docs
            </p>
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              Presusimple API Documentation
            </h1>
            <p className="mb-6 text-muted-foreground">
              OpenAPI / Swagger reference for budgets, expenses, categories, and
              authentication. Prefer the{" "}
              <Link href="/developers" className="underline hover:text-foreground">
                developers overview
              </Link>{" "}
              for integration guides.
            </p>

            <div className="mb-8 rounded-lg border border-border bg-muted/40 p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Authentication
              </h2>
              <div className="space-y-4 text-sm text-foreground">
                <div>
                  <h3 className="mb-2 font-medium">JWT Bearer Token (recommended)</h3>
                  <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
                    <li>
                      POST{" "}
                      <code className="rounded bg-background px-1">
                        /api/mobile-login
                      </code>{" "}
                      with email and password
                    </li>
                    <li>Copy the token from the response</li>
                    <li>
                      Click Authorize in Swagger UI and enter{" "}
                      <code className="rounded bg-background px-1">
                        Bearer &lt;token&gt;
                      </code>
                    </li>
                  </ol>
                </div>
                <div>
                  <h3 className="mb-2 font-medium">NextAuth cookie (web apps)</h3>
                  <p className="text-muted-foreground">
                    Sign in at{" "}
                    <code className="rounded bg-background px-1">/auth/login</code>,
                    then use the session cookie for browser-based calls.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <SwaggerUiClient />
        </div>
      </div>
    </>
  );
}

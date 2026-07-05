import Link from "next/link";
import type { LegalDocument } from "@/lib/legal/documents";

interface LegalDocumentPageProps {
  document: LegalDocument;
  locale?: "en" | "es";
}

export function LegalDocumentPage({ document, locale = "en" }: LegalDocumentPageProps) {
  const homeHref = locale === "es" ? "/es" : "/";
  const privacyHref = locale === "es" ? "/es/privacy" : "/privacy";
  const termsHref = locale === "es" ? "/es/terms" : "/terms";
  const backLabel = locale === "es" ? "Volver al inicio" : "Back to home";
  const updatedLabel = locale === "es" ? "Última actualización" : "Last updated";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href={homeHref} className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← {backLabel}
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href={privacyHref} className="text-muted-foreground hover:text-foreground">
              {locale === "es" ? "Privacidad" : "Privacy"}
            </Link>
            <Link href={termsHref} className="text-muted-foreground hover:text-foreground">
              {locale === "es" ? "Términos" : "Terms"}
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">{document.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {updatedLabel}: {document.lastUpdated}
        </p>
        <p className="mt-6 leading-7 text-muted-foreground">{document.intro}</p>

        <div className="mt-10 space-y-8">
          {document.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 leading-7 text-muted-foreground">
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground">
                  {section.list.map((item) => (
                    <li key={item} className="leading-7">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

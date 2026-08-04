import Link from "next/link";
import { PRODUCTION_APP_URL } from "@/lib/constants/branding";

type DevelopersContentProps = {
  locale: "en" | "es";
};

const COPY = {
  en: {
    eyebrow: "Presusimple Developers",
    h1: "Budget & Expense Tracker API",
    lead: "REST API for budgets, expenses, and categories. JWT auth, OpenAPI/Swagger docs, ready for mobile apps and integrations.",
    ctaDocs: "Open API docs (Swagger)",
    ctaLogin: "Create a developer account",
    sections: [
      {
        title: "Authentication",
        body: "Use JWT Bearer tokens from /api/mobile-login for mobile and third-party clients. Web sessions use NextAuth cookies.",
      },
      {
        title: "Core resources",
        body: "Budgets, expenses, categories, and monthly budget snapshots — the same models powering the Presusimple app.",
      },
      {
        title: "OpenAPI first",
        body: "Interactive Swagger UI at /api-docs and raw OpenAPI JSON at /api/swagger for codegen and contract tests.",
      },
    ],
    curlTitle: "Quick start (curl)",
    curlHint: "Replace credentials, then call protected endpoints with Authorization: Bearer <token>.",
    faqTitle: "FAQ",
    faqs: [
      {
        q: "Is there a public budgeting API?",
        a: "Yes. Presusimple exposes a REST API for budgets and expense tracking with JWT authentication and OpenAPI documentation.",
      },
      {
        q: "Where is the OpenAPI / Swagger spec?",
        a: "Interactive docs live at /api-docs. The machine-readable spec is at /api/swagger.",
      },
      {
        q: "Can I integrate from a mobile app?",
        a: "Yes. Use /api/mobile-login (or mobile-register) to obtain a JWT, then call resource endpoints with a Bearer token.",
      },
    ],
    langSwitch: "Español",
    langHref: "/es/developers",
  },
  es: {
    eyebrow: "Presusimple Developers",
    h1: "API de presupuestos y control de gastos",
    lead: "API REST para presupuestos, gastos y categorías. Auth JWT, docs OpenAPI/Swagger, lista para apps móviles e integraciones.",
    ctaDocs: "Abrir docs API (Swagger)",
    ctaLogin: "Crear cuenta",
    sections: [
      {
        title: "Autenticación",
        body: "Usa tokens JWT Bearer desde /api/mobile-login para móvil y clientes externos. Las sesiones web usan cookies de NextAuth.",
      },
      {
        title: "Recursos principales",
        body: "Presupuestos, gastos, categorías y snapshots mensuales — los mismos modelos de la app Presusimple.",
      },
      {
        title: "OpenAPI primero",
        body: "Swagger UI interactivo en /api-docs y JSON OpenAPI en /api/swagger para codegen y tests de contrato.",
      },
    ],
    curlTitle: "Inicio rápido (curl)",
    curlHint:
      "Sustituye credenciales y llama endpoints protegidos con Authorization: Bearer <token>.",
    faqTitle: "Preguntas frecuentes",
    faqs: [
      {
        q: "¿Hay una API pública de presupuestos?",
        a: "Sí. Presusimple expone una API REST para presupuestos y gastos con autenticación JWT y documentación OpenAPI.",
      },
      {
        q: "¿Dónde está el spec OpenAPI / Swagger?",
        a: "La documentación interactiva está en /api-docs. El spec en JSON está en /api/swagger.",
      },
      {
        q: "¿Puedo integrar desde una app móvil?",
        a: "Sí. Usa /api/mobile-login (o mobile-register) para obtener un JWT y llama a los recursos con un Bearer token.",
      },
    ],
    langSwitch: "English",
    langHref: "/developers",
  },
} as const;

export function DevelopersContent({ locale }: DevelopersContentProps) {
  const t = COPY[locale];
  const homeHref = locale === "es" ? "/es" : "/";
  const curlExample = `curl -X POST ${PRODUCTION_APP_URL}/api/mobile-login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"you@example.com","password":"your-password"}'`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href={homeHref} className="font-semibold tracking-tight">
            Presusimple
          </Link>
          <Link
            href={t.langHref}
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            {t.langSwitch}
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <p className="mb-3 text-sm font-medium text-muted-foreground">
          {t.eyebrow}
        </p>
        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {t.h1}
        </h1>
        <p className="mb-8 text-lg text-muted-foreground">{t.lead}</p>

        <div className="mb-12 flex flex-wrap gap-3">
          <Link
            href="/api-docs"
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            {t.ctaDocs}
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted"
          >
            {t.ctaLogin}
          </Link>
        </div>

        <section className="mb-12 space-y-8">
          {t.sections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-2 text-xl font-semibold">{section.title}</h2>
              <p className="text-muted-foreground">{section.body}</p>
            </div>
          ))}
        </section>

        <section className="mb-12">
          <h2 className="mb-2 text-xl font-semibold">{t.curlTitle}</h2>
          <p className="mb-3 text-sm text-muted-foreground">{t.curlHint}</p>
          <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-xs sm:text-sm">
            <code>{curlExample}</code>
          </pre>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">{t.faqTitle}</h2>
          <dl className="space-y-6">
            {t.faqs.map((item) => (
              <div key={item.q}>
                <dt className="font-medium">{item.q}</dt>
                <dd className="mt-1 text-muted-foreground">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </div>
  );
}

import Link from "next/link";
import type { BlogLocale, BlogPostMeta } from "@/lib/blog";

interface BlogIndexProps {
  locale: BlogLocale;
  posts: BlogPostMeta[];
}

export function BlogIndex({ locale, posts }: BlogIndexProps) {
  const homeHref = locale === "es" ? "/es" : "/";
  const blogBase = locale === "es" ? "/es/blog" : "/blog";
  const backLabel = locale === "es" ? "Volver al inicio" : "Back to home";
  const title = locale === "es" ? "Blog" : "Blog";
  const subtitle =
    locale === "es"
      ? "Consejos de finanzas personales, presupuestos y control de gastos."
      : "Personal finance tips, budgeting advice, and expense tracking guides.";
  const emptyLabel =
    locale === "es" ? "Aún no hay artículos publicados." : "No articles published yet.";
  const readLabel = locale === "es" ? "Leer artículo" : "Read article";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href={homeHref} className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← {backLabel}
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href={locale === "es" ? "/blog" : "/es/blog"} className="text-muted-foreground hover:text-foreground">
              {locale === "es" ? "English" : "Español"}
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>

        {posts.length === 0 ? (
          <p className="mt-10 text-muted-foreground">{emptyLabel}</p>
        ) : (
          <ul className="mt-10 space-y-8">
            {posts.map((post) => (
              <li key={post.slug} className="border-b border-border pb-8 last:border-0">
                <article>
                  <time dateTime={post.date} className="text-sm text-muted-foreground">
                    {new Date(post.date).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <h2 className="mt-2 text-xl font-semibold">
                    <Link href={`${blogBase}/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 leading-7 text-muted-foreground">{post.description}</p>
                  {post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`${blogBase}/${post.slug}`}
                    className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
                  >
                    {readLabel} →
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

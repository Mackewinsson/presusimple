import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mdxComponents from "@/components/blog/mdxComponents";
import type { BlogLocale, BlogPost } from "@/lib/blog";

interface BlogPostViewProps {
  locale: BlogLocale;
  post: BlogPost;
}

export function BlogPostView({ locale, post }: BlogPostViewProps) {
  const homeHref = locale === "es" ? "/es" : "/";
  const blogHref = locale === "es" ? "/es/blog" : "/blog";
  const backLabel = locale === "es" ? "Volver al blog" : "Back to blog";
  const byLabel = locale === "es" ? "Por" : "By";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href={blogHref} className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← {backLabel}
          </Link>
          <Link href={homeHref} className="text-sm text-muted-foreground hover:text-foreground">
            Presusimple
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-10">
        <article>
          <header>
            <time dateTime={post.date} className="text-sm text-muted-foreground">
              {new Date(post.date).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{post.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {byLabel} {post.author}
            </p>
            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
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
          </header>

          <div className="mt-10">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdxComponents}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </main>
    </div>
  );
}

import { notFound } from "next/navigation";
import { BlogPostView } from "@/components/blog/BlogPostView";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import { getBlogPostJsonLd, getBlogPostMetadata } from "@/lib/seo";

interface SpanishBlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs("es").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: SpanishBlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug("es", slug);
  if (!post) {
    return {};
  }
  return getBlogPostMetadata("es", post);
}

export default async function SpanishBlogPostPage({ params }: SpanishBlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug("es", slug);

  if (!post) {
    notFound();
  }

  const jsonLd = getBlogPostJsonLd("es", post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostView locale="es" post={post} />
    </>
  );
}

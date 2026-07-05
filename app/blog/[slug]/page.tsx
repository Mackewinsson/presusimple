import { notFound } from "next/navigation";
import { BlogPostView } from "@/components/blog/BlogPostView";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import { getBlogPostJsonLd, getBlogPostMetadata } from "@/lib/seo";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs("en").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug("en", slug);
  if (!post) {
    return {};
  }
  return getBlogPostMetadata("en", post);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug("en", slug);

  if (!post) {
    notFound();
  }

  const jsonLd = getBlogPostJsonLd("en", post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostView locale="en" post={post} />
    </>
  );
}

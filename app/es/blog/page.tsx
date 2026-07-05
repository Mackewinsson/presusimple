import { BlogIndex } from "@/components/blog/BlogIndex";
import { getAllPosts } from "@/lib/blog";
import { getBlogIndexMetadata } from "@/lib/seo";

export const metadata = getBlogIndexMetadata("es");

export default function SpanishBlogPage() {
  const posts = getAllPosts("es");
  return <BlogIndex locale="es" posts={posts} />;
}

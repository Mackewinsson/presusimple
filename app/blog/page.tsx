import { BlogIndex } from "@/components/blog/BlogIndex";
import { getAllPosts } from "@/lib/blog";
import { getBlogIndexMetadata } from "@/lib/seo";

export const metadata = getBlogIndexMetadata("en");

export default function BlogPage() {
  const posts = getAllPosts("en");
  return <BlogIndex locale="en" posts={posts} />;
}

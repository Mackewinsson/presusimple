import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type BlogLocale = "en" | "es";

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  /** Slug of the translated counterpart in the other locale (optional). */
  translationSlug?: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content/blog");

function getLocaleDir(locale: BlogLocale): string {
  return path.join(CONTENT_DIR, locale);
}

function parsePostFile(filePath: string, slug: string): BlogPost {
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: String(data.date ?? new Date().toISOString().slice(0, 10)),
    author: String(data.author ?? "Presusimple"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    translationSlug: data.translationSlug ? String(data.translationSlug) : undefined,
    content,
  };
}

export function getAllPosts(locale: BlogLocale): BlogPostMeta[] {
  const dir = getLocaleDir(locale);
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const post = parsePostFile(path.join(dir, file), slug);
      const { content: _content, ...meta } = post;
      return meta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(locale: BlogLocale, slug: string): BlogPost | null {
  const filePath = path.join(getLocaleDir(locale), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  return parsePostFile(filePath, slug);
}

export function getAllSlugs(locale: BlogLocale): string[] {
  return getAllPosts(locale).map((post) => post.slug);
}


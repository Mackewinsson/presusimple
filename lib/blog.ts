import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type BlogLocale = "en" | "es";

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  faqs?: BlogFaq[];
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content/blog");

function getLocaleDir(locale: BlogLocale): string {
  return path.join(CONTENT_DIR, locale);
}

function parseFaqs(data: Record<string, unknown>): BlogFaq[] | undefined {
  if (!Array.isArray(data.faqs)) {
    return undefined;
  }

  const faqs = data.faqs
    .filter(
      (item): item is { question: string; answer: string } =>
        typeof item === "object" &&
        item !== null &&
        "question" in item &&
        "answer" in item &&
        typeof item.question === "string" &&
        typeof item.answer === "string"
    )
    .map((item) => ({
      question: item.question,
      answer: item.answer,
    }));

  return faqs.length > 0 ? faqs : undefined;
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
    faqs: parseFaqs(data as Record<string, unknown>),
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

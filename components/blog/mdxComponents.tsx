import type { Components } from "react-markdown";
import Link from "next/link";

const mdxComponents: Components = {
  h2: ({ children }) => (
    <h2 className="mt-10 text-2xl font-semibold tracking-tight">{children}</h2>
  ),
  h3: ({ children }) => <h3 className="mt-8 text-xl font-semibold">{children}</h3>,
  p: ({ children }) => <p className="mt-4 leading-7 text-muted-foreground">{children}</p>,
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-muted-foreground">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  a: ({ href, children }) => {
    const isExternal = href?.startsWith("http");
    if (isExternal) {
      return (
        <a
          href={href}
          className="font-medium text-primary underline underline-offset-4"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href ?? "#"} className="font-medium text-primary underline underline-offset-4">
        {children}
      </Link>
    );
  },
};

export default mdxComponents;

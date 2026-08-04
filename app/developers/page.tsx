import type { Metadata } from "next";
import { DevelopersContent } from "@/components/developers/DevelopersContent";
import { getDevelopersJsonLd, getDevelopersMetadata } from "@/lib/seo";

export const metadata: Metadata = getDevelopersMetadata("en");

export default function DevelopersPage() {
  const jsonLd = getDevelopersJsonLd("en");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DevelopersContent locale="en" />
    </>
  );
}

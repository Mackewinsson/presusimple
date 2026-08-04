import type { Metadata } from "next";
import { DevelopersContent } from "@/components/developers/DevelopersContent";
import { getDevelopersJsonLd, getDevelopersMetadata } from "@/lib/seo";

export const metadata: Metadata = getDevelopersMetadata("es");

export default function SpanishDevelopersPage() {
  const jsonLd = getDevelopersJsonLd("es");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DevelopersContent locale="es" />
    </>
  );
}

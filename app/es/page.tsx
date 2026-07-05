import type { Metadata } from "next";
import PWALandingPage from "@/components/PWALandingPage";
import { getLandingJsonLd, getSpanishLandingMetadata } from "@/lib/seo";

export const metadata: Metadata = getSpanishLandingMetadata();

export default function SpanishLandingPage() {
  const jsonLd = getLandingJsonLd("es");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PWALandingPage />
    </>
  );
}

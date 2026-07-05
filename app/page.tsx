import type { Metadata } from "next";
import PWALandingPage from "@/components/PWALandingPage";
import { getEnglishLandingMetadata, getLandingJsonLd } from "@/lib/seo";

export const metadata: Metadata = getEnglishLandingMetadata();

export default function LandingPage() {
  const jsonLd = getLandingJsonLd("en");

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

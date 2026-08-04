import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { termsOfServiceEn } from "@/lib/legal/documents";
import { getTermsMetadata } from "@/lib/seo";

export const metadata: Metadata = getTermsMetadata("en");

export default function TermsPage() {
  return <LegalDocumentPage document={termsOfServiceEn} locale="en" />;
}


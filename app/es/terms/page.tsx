import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { termsOfServiceEs } from "@/lib/legal/documents";
import { getTermsMetadata } from "@/lib/seo";

export const metadata: Metadata = getTermsMetadata("es");

export default function TermsPageEs() {
  return <LegalDocumentPage document={termsOfServiceEs} locale="es" />;
}


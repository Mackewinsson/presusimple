import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { privacyPolicyEs } from "@/lib/legal/documents";
import { getPrivacyMetadata } from "@/lib/seo";

export const metadata: Metadata = getPrivacyMetadata("es");

export default function PrivacyPageEs() {
  return <LegalDocumentPage document={privacyPolicyEs} locale="es" />;
}


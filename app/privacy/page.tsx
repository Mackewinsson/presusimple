import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { privacyPolicyEn } from "@/lib/legal/documents";
import { getPrivacyMetadata } from "@/lib/seo";

export const metadata: Metadata = getPrivacyMetadata("en");

export default function PrivacyPage() {
  return <LegalDocumentPage document={privacyPolicyEn} locale="en" />;
}


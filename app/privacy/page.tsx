import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { privacyPolicyEn } from "@/lib/legal/documents";

export const metadata: Metadata = {
  title: "Privacy Policy | Presusimple",
  description: "How Presusimple collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return <LegalDocumentPage document={privacyPolicyEn} locale="en" />;
}

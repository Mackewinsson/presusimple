import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { termsOfServiceEn } from "@/lib/legal/documents";

export const metadata: Metadata = {
  title: "Terms of Service | Presusimple",
  description: "Terms of Service for using Presusimple personal finance software.",
};

export default function TermsPage() {
  return <LegalDocumentPage document={termsOfServiceEn} locale="en" />;
}

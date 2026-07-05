import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { privacyPolicyEs } from "@/lib/legal/documents";

export const metadata: Metadata = {
  title: "Política de Privacidad | Presusimple",
  description: "Cómo Presusimple recopila, usa y protege tus datos personales.",
};

export default function PrivacyPageEs() {
  return <LegalDocumentPage document={privacyPolicyEs} locale="es" />;
}

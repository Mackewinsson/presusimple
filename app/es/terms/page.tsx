import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { termsOfServiceEs } from "@/lib/legal/documents";

export const metadata: Metadata = {
  title: "Términos de Servicio | Presusimple",
  description: "Términos de Servicio para usar Presusimple.",
};

export default function TermsPageEs() {
  return <LegalDocumentPage document={termsOfServiceEs} locale="es" />;
}

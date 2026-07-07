export interface FaqItem {
  question: string;
  answer: string;
}

export const LANDING_FAQS: Record<"en" | "es", FaqItem[]> = {
  en: [
    {
      question: "What is zero-based budgeting?",
      answer:
        "Zero-based budgeting assigns every dollar of income to a specific category before you spend it. At month-end, income minus planned spending equals zero—not because you spent everything, but because every dollar had a job.",
    },
    {
      question: "Is Presusimple free?",
      answer:
        "Presusimple offers a 30-day free trial with full Pro features. After the trial, you can subscribe to Pro or use the free tier for core budgeting and expense tracking.",
    },
    {
      question: "Does Presusimple work in Spanish?",
      answer:
        "Yes. Presusimple is fully available in English and Spanish, including the UI, blog, and support for multiple currencies.",
    },
    {
      question: "Can I use Presusimple on my phone?",
      answer:
        "Yes. Presusimple is a Progressive Web App (PWA) you can install on iOS and Android for an app-like experience with offline support.",
    },
  ],
  es: [
    {
      question: "¿Qué es el presupuesto base cero?",
      answer:
        "El presupuesto base cero asigna cada euro de ingreso a una categoría específica antes de gastarlo. Al cierre del mes, ingresos menos gasto planificado es cero—no porque hayas gastado todo, sino porque cada euro tenía un trabajo.",
    },
    {
      question: "¿Presusimple es gratis?",
      answer:
        "Presusimple ofrece 30 días de prueba gratis con funciones Pro. Tras la prueba, puedes suscribirte a Pro o usar el plan gratuito para presupuesto y control de gastos básicos.",
    },
    {
      question: "¿Presusimple funciona en español?",
      answer:
        "Sí. Presusimple está disponible en inglés y español, incluida la interfaz, el blog y soporte para varias monedas.",
    },
    {
      question: "¿Puedo usar Presusimple en el móvil?",
      answer:
        "Sí. Presusimple es una aplicación web progresiva (PWA) que puedes instalar en iOS y Android con experiencia similar a una app y soporte sin conexión.",
    },
  ],
};

export function buildFaqPageJsonLd(faqs: FaqItem[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

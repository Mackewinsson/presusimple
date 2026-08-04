export interface LegalSection {
  title: string;
  paragraphs: string[];
  list?: string[];
}

export interface LegalDocument {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

const CONTACT_EMAIL = "mackewinsson@gmail.com";
const APP_NAME = "Presusimple";
const APP_URL = "https://www.presusimple.com";

export const privacyPolicyEn: LegalDocument = {
  title: "Privacy Policy",
  lastUpdated: "July 7, 2026",
  intro: `${APP_NAME} ("we", "us", or "our") operates the personal finance web application at ${APP_URL}. This Privacy Policy explains how we collect, use, and protect your information when you use our service.`,
  sections: [
    {
      title: "Information we collect",
      paragraphs: ["When you use Presusimple, we may collect:"],
      list: [
        "Account information such as your name, email address, and authentication provider details when you sign in with Google or email credentials.",
        "Financial data you enter in the app, including budgets, categories, expenses, and related preferences.",
        "Usage and device information such as browser type, app interactions, and notification subscription tokens if you enable push notifications.",
        "Payment-related identifiers from Lemon Squeezy when you subscribe to Pro (for example customer and subscription IDs). We do not store full payment card details.",
      ],
    },
    {
      title: "How we use your information",
      paragraphs: ["We use your information to:"],
      list: [
        "Provide, maintain, and improve the Presusimple budgeting service.",
        "Authenticate your account and keep your session secure.",
        "Process Pro subscriptions and manage billing through Lemon Squeezy.",
        "Send service-related notifications you opt into.",
        "Provide AI-powered budgeting features when you use Pro functionality.",
        "Respond to support requests and protect the security of our platform.",
      ],
    },
    {
      title: "Legal basis (EEA users)",
      paragraphs: [
        "If you are in the European Economic Area, we process personal data based on contract performance (providing the service), legitimate interests (security and product improvement), and consent where required (for example optional notifications).",
      ],
    },
    {
      title: "Third-party services",
      paragraphs: [
        "We use trusted providers to operate Presusimple, including:",
      ],
      list: [
        "Google — OAuth sign-in (subject to Google's privacy policy).",
        "Google Analytics — anonymized usage analytics when you accept cookies (Consent Mode v2).",
        "MongoDB Atlas — database hosting for account and budget data.",
        "Vercel — application hosting.",
        "Lemon Squeezy — subscription checkout, billing, and customer portal.",
        "Google AI (Gemini) — AI budgeting features for eligible Pro users.",
      ],
    },
    {
      title: "Cookies and analytics",
      paragraphs: [
        "We use essential cookies for authentication and session management. Analytics cookies from Google Analytics are only set if you accept them via our cookie banner. We do not send financial details, email addresses, or other personally identifying information to analytics providers.",
      ],
    },
    {
      title: "Third-party processing",
      paragraphs: [
        "These providers process data only as needed to deliver their services to us.",
      ],
    },
    {
      title: "Data retention",
      paragraphs: [
        "We retain your account and budget data while your account is active. You may request deletion of your account and associated data by contacting us.",
      ],
    },
    {
      title: "Your rights",
      paragraphs: [
        "Depending on your location, you may have rights to access, correct, delete, or restrict processing of your personal data, and to object to certain processing or request portability.",
        `To exercise these rights, contact us at ${CONTACT_EMAIL}. You may also lodge a complaint with your local data protection authority.`,
      ],
    },
    {
      title: "Security",
      paragraphs: [
        "We use industry-standard measures to protect your data, including encrypted connections and access controls. No method of transmission or storage is completely secure.",
      ],
    },
    {
      title: "Children",
      paragraphs: [
        "Presusimple is not intended for children under 16. We do not knowingly collect personal data from children.",
      ],
    },
    {
      title: "Changes",
      paragraphs: [
        "We may update this Privacy Policy from time to time. We will post the updated version on this page with a revised date.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [`Questions about this Privacy Policy: ${CONTACT_EMAIL}`],
    },
  ],
};

export const privacyPolicyEs: LegalDocument = {
  title: "Política de Privacidad",
  lastUpdated: "7 de julio de 2026",
  intro: `${APP_NAME} ("nosotros") opera la aplicación web de finanzas personales en ${APP_URL}. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos tu información.`,
  sections: [
    {
      title: "Información que recopilamos",
      paragraphs: ["Cuando usas Presusimple, podemos recopilar:"],
      list: [
        "Información de cuenta como nombre, correo electrónico y datos de autenticación al iniciar sesión con Google o credenciales.",
        "Datos financieros que introduces: presupuestos, categorías, gastos y preferencias.",
        "Información de uso y dispositivo, incluidos tokens de notificaciones push si las activas.",
        "Identificadores de pago de Lemon Squeezy al suscribirte a Pro. No almacenamos datos completos de tarjetas.",
      ],
    },
    {
      title: "Cómo usamos tu información",
      paragraphs: ["Usamos tu información para:"],
      list: [
        "Prestar, mantener y mejorar el servicio de presupuestos.",
        "Autenticar tu cuenta y mantener la seguridad de la sesión.",
        "Gestionar suscripciones Pro y facturación a través de Lemon Squeezy.",
        "Enviar notificaciones del servicio que aceptes.",
        "Ofrecer funciones de presupuesto con IA para usuarios Pro.",
        "Responder solicitudes de soporte y proteger la plataforma.",
      ],
    },
    {
      title: "Base legal (usuarios del EEE)",
      paragraphs: [
        "Si estás en el Espacio Económico Europeo, tratamos datos personales por ejecución de contrato, interés legítimo (seguridad y mejora del producto) y consentimiento cuando sea necesario.",
      ],
    },
    {
      title: "Servicios de terceros",
      paragraphs: ["Usamos proveedores de confianza, incluidos:"],
      list: [
        "Google — inicio de sesión con OAuth.",
        "Google Analytics — analítica de uso anonimizada cuando aceptas cookies (Consent Mode v2).",
        "MongoDB Atlas — alojamiento de base de datos.",
        "Vercel — alojamiento de la aplicación.",
        "Lemon Squeezy — pagos y suscripciones.",
        "Google AI (Gemini) — funciones de presupuesto con IA para usuarios Pro.",
      ],
    },
    {
      title: "Cookies y analítica",
      paragraphs: [
        "Usamos cookies esenciales para autenticación y sesión. Las cookies de analítica de Google Analytics solo se activan si las aceptas en nuestro banner. No enviamos datos financieros, correos electrónicos ni otra información personal identificable a proveedores de analítica.",
      ],
    },
    {
      title: "Conservación de datos",
      paragraphs: [
        "Conservamos tus datos mientras tu cuenta esté activa. Puedes solicitar la eliminación contactándonos.",
      ],
    },
    {
      title: "Tus derechos",
      paragraphs: [
        "Puedes tener derecho de acceso, rectificación, supresión, limitación u oposición al tratamiento, y portabilidad según tu ubicación.",
        `Contacto: ${CONTACT_EMAIL}. También puedes reclamar ante tu autoridad de protección de datos.`,
      ],
    },
    {
      title: "Seguridad",
      paragraphs: [
        "Aplicamos medidas estándar del sector, incluidas conexiones cifradas y controles de acceso.",
      ],
    },
    {
      title: "Menores",
      paragraphs: [
        "Presusimple no está dirigida a menores de 16 años.",
      ],
    },
    {
      title: "Cambios",
      paragraphs: [
        "Podemos actualizar esta política. Publicaremos la versión revisada en esta página.",
      ],
    },
    {
      title: "Contacto",
      paragraphs: [`Preguntas: ${CONTACT_EMAIL}`],
    },
  ],
};

export const termsOfServiceEn: LegalDocument = {
  title: "Terms of Service",
  lastUpdated: "July 5, 2026",
  intro: `These Terms of Service ("Terms") govern your use of ${APP_NAME} at ${APP_URL}. By creating an account or using the service, you agree to these Terms.`,
  sections: [
    {
      title: "The service",
      paragraphs: [
        "Presusimple is a personal finance and zero-based budgeting web application. Features may include expense tracking, budgets, analytics, and optional AI-assisted budgeting for Pro subscribers.",
      ],
    },
    {
      title: "Accounts",
      paragraphs: [
        "You must provide accurate account information and keep your credentials secure. You are responsible for activity under your account.",
      ],
    },
    {
      title: "Free trial and Pro subscription",
      paragraphs: [
        "New users may receive a 30-day app-managed free trial with access to Pro features. No credit card is required to start the trial.",
        "After the trial, Pro features require a paid subscription processed by Lemon Squeezy. Subscription fees, billing intervals, and renewals are shown at checkout. You can manage or cancel your subscription through the Lemon Squeezy customer portal.",
      ],
    },
    {
      title: "Acceptable use",
      paragraphs: ["You agree not to:"],
      list: [
        "Use the service for unlawful purposes or to violate applicable laws.",
        "Attempt to access other users' data or disrupt the platform.",
        "Reverse engineer, scrape, or abuse the service beyond normal personal use.",
        "Upload malicious code or interfere with security measures.",
      ],
    },
    {
      title: "Your data",
      paragraphs: [
        "You retain ownership of the financial data you enter. You grant us a limited license to host and process that data solely to provide the service.",
        "Our Privacy Policy explains how we handle personal data.",
      ],
    },
    {
      title: "Disclaimer",
      paragraphs: [
        "Presusimple is a budgeting tool, not financial, tax, or investment advice. We do not guarantee accuracy of calculations or outcomes. Use the service at your own discretion.",
      ],
    },
    {
      title: "Availability and changes",
      paragraphs: [
        "We may modify, suspend, or discontinue features with reasonable notice when possible. We strive for high availability but do not guarantee uninterrupted service.",
      ],
    },
    {
      title: "Termination",
      paragraphs: [
        "You may stop using the service at any time. We may suspend or terminate accounts that violate these Terms or pose security or legal risk.",
      ],
    },
    {
      title: "Limitation of liability",
      paragraphs: [
        "To the maximum extent permitted by law, Presusimple and its operator are not liable for indirect, incidental, or consequential damages arising from use of the service. Our total liability is limited to the amount you paid us in the twelve months before the claim, or zero if you use the free tier.",
      ],
    },
    {
      title: "Governing law",
      paragraphs: [
        "These Terms are governed by the laws of Spain, without regard to conflict-of-law principles. Disputes shall be subject to the courts of Spain, unless mandatory consumer protection laws in your country require otherwise.",
      ],
    },
    {
      title: "Contact",
      paragraphs: [`Questions about these Terms: ${CONTACT_EMAIL}`],
    },
  ],
};

export const termsOfServiceEs: LegalDocument = {
  title: "Términos de Servicio",
  lastUpdated: "5 de julio de 2026",
  intro: `Estos Términos de Servicio ("Términos") regulan el uso de ${APP_NAME} en ${APP_URL}. Al crear una cuenta o usar el servicio, aceptas estos Términos.`,
  sections: [
    {
      title: "El servicio",
      paragraphs: [
        "Presusimple es una aplicación web de finanzas personales y presupuesto base cero. Las funciones pueden incluir seguimiento de gastos, presupuestos, analítica y presupuesto asistido por IA para suscriptores Pro.",
      ],
    },
    {
      title: "Cuentas",
      paragraphs: [
        "Debes proporcionar información veraz y mantener seguras tus credenciales. Eres responsable de la actividad en tu cuenta.",
      ],
    },
    {
      title: "Prueba gratuita y suscripción Pro",
      paragraphs: [
        "Los nuevos usuarios pueden recibir una prueba gratuita de 30 días gestionada por la app con acceso a funciones Pro, sin tarjeta de crédito.",
        "Tras la prueba, las funciones Pro requieren suscripción de pago procesada por Lemon Squeezy. Puedes gestionar o cancelar tu suscripción en el portal de cliente de Lemon Squeezy.",
      ],
    },
    {
      title: "Uso aceptable",
      paragraphs: ["Te comprometes a no:"],
      list: [
        "Usar el servicio con fines ilegales.",
        "Acceder a datos de otros usuarios o interrumpir la plataforma.",
        "Realizar ingeniería inversa, scraping o abuso más allá del uso personal normal.",
        "Subir código malicioso o interferir con medidas de seguridad.",
      ],
    },
    {
      title: "Tus datos",
      paragraphs: [
        "Conservas la propiedad de los datos financieros que introduces. Nos concedes una licencia limitada para alojarlos y procesarlos solo para prestar el servicio.",
      ],
    },
    {
      title: "Descargo de responsabilidad",
      paragraphs: [
        "Presusimple es una herramienta de presupuesto, no asesoramiento financiero, fiscal o de inversión. Usa el servicio bajo tu propio criterio.",
      ],
    },
    {
      title: "Disponibilidad y cambios",
      paragraphs: [
        "Podemos modificar, suspender o discontinuar funciones cuando sea razonable. No garantizamos disponibilidad ininterrumpida.",
      ],
    },
    {
      title: "Terminación",
      paragraphs: [
        "Puedes dejar de usar el servicio en cualquier momento. Podemos suspender cuentas que violen estos Términos.",
      ],
    },
    {
      title: "Limitación de responsabilidad",
      paragraphs: [
        "En la medida permitida por la ley, no somos responsables de daños indirectos o consecuentes. La responsabilidad total se limita a lo pagado en los doce meses anteriores, o cero en el plan gratuito.",
      ],
    },
    {
      title: "Ley aplicable",
      paragraphs: [
        "Estos Términos se rigen por las leyes de España. Los tribunales españoles serán competentes salvo que la normativa de consumo de tu país exija lo contrario.",
      ],
    },
    {
      title: "Contacto",
      paragraphs: [`Preguntas: ${CONTACT_EMAIL}`],
    },
  ],
};

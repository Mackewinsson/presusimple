/**
 * FAQ / HowTo enrichment for high-priority blog posts (GSC commercial clusters).
 * Kept out of MDX so schema stays typed and DRY with visible FAQ copy.
 */

export type FaqItem = {
  question: string;
  answer: string;
};

export type HowToStep = {
  name: string;
  text: string;
};

export type BlogSeoEnrichment = {
  faqs: FaqItem[];
  howTo?: {
    name: string;
    description: string;
    totalTime?: string;
    steps: HowToStep[];
  };
};

const ENRICHMENT: Record<string, BlogSeoEnrichment> = {
  "es:fondo-de-emergencia-cuanto-ahorrar": {
    faqs: [
      {
        question: "¿Cuánto debe ser el ahorro para emergencias?",
        answer:
          "La mayoría de expertos recomienda 3–6 meses de gastos esenciales. Empieza con un mini fondo de 1.000 € y constrúyelo mes a mes.",
      },
      {
        question: "¿Fondo de emergencia o pagar deuda primero?",
        answer:
          "Mini fondo de 1.000 €, luego deuda de alto interés (tarjetas por encima del 15 %). Con la deuda controlada, crece el fondo a 3 meses.",
      },
      {
        question: "¿Dónde guardar el ahorro para emergencias?",
        answer:
          "En una cuenta de ahorro líquida y separada de la corriente, no en inversiones de riesgo ni en crédito disponible.",
      },
      {
        question: "¿Puedo contar el crédito disponible como fondo de emergencia?",
        answer:
          "No. El crédito es deuda con intereses. Solo el efectivo es fondo de emergencia de verdad.",
      },
    ],
  },
  "es:presupuesto-en-pareja-dividir-gastos": {
    faqs: [
      {
        question: "¿Cómo compartir gastos en pareja de forma justa?",
        answer:
          "Puedes usar 50/50, división proporcional a ingresos, o un presupuesto conjunto con categorías compartidas y personales. Lo importante es acordar el método y revisarlo cada mes.",
      },
      {
        question: "¿Qué es un presupuesto en pareja?",
        answer:
          "Es un plan mensual donde ambos definen ingresos, gastos compartidos (alquiler, comida, servicios) y límites por categoría para evitar sorpresas y discusiones.",
      },
      {
        question: "¿Cómo dividir gastos proporcionalmente?",
        answer:
          "Sumen ingresos netos, calculen el % de cada uno sobre el total y apliquen ese % a los gastos compartidos. Así ambos sienten el mismo esfuerzo relativo.",
      },
      {
        question: "¿Qué app sirve para dividir gastos en pareja?",
        answer:
          "Presusimple permite crear categorías compartidas, registrar gastos diarios y ver el presupuesto del mes en un solo lugar. Hay prueba gratuita de 30 días.",
      },
    ],
  },
  "en:budgeting-for-couples-split-expenses": {
    faqs: [
      {
        question: "How should couples split expenses fairly?",
        answer:
          "Use a 50/50 split if incomes are similar, or a proportional split based on each partner’s share of household income. Agree on the method and review it monthly.",
      },
      {
        question: "What is a joint budget for couples?",
        answer:
          "A monthly plan where both partners define shared income, shared bills (rent, groceries, utilities), and category limits so spending stays aligned.",
      },
      {
        question: "How do you split expenses proportionally?",
        answer:
          "Add net incomes, calculate each person’s percentage of the total, and apply that percentage to shared costs so both feel the same relative effort.",
      },
      {
        question: "What app helps couples manage shared expenses?",
        answer:
          "Presusimple lets you track shared categories, log daily expenses, and see household budget limits in one place. Free 30-day trial available.",
      },
    ],
  },
  "es:como-controlar-gastos-diarios": {
    faqs: [
      {
        question: "¿Cómo llevar un control de gastos diarios?",
        answer:
          "Registra cada gasto una vez al día, usa pocas categorías y revisa el total semanal. Una app como Presusimple acelera el registro desde el móvil.",
      },
      {
        question: "¿Cuánto tarda en sentirse automático?",
        answer:
          "La mayoría necesita 3–4 semanas de registro diario. Hacia la semana 6 verás patrones antes de anotarlos — ahí el hábito está fijo.",
      },
      {
        question: "¿Puedo registrar gastos diarios sin presupuesto?",
        answer:
          "Sí, pero ayuda menos. El registro dice adónde fue el dinero; el presupuesto dice adónde debería ir. Juntos cambian el comportamiento.",
      },
      {
        question: "¿Y si comparto gastos con mi pareja?",
        answer:
          "Usen un sistema para los dos: categorías compartidas para casa y super, individuales para gasto personal, y una revisión dominical corta.",
      },
    ],
    howTo: {
      name: "Cómo controlar gastos diarios",
      description: "Rutina de 5 minutos para registrar y revisar gastos diarios.",
      totalTime: "PT5M",
      steps: [
        {
          name: "Registra el gasto al momento o al final del día",
          text: "Anota importe, categoría y nota justo después de pagar, o haz un resumen de 5 minutos por la noche.",
        },
        {
          name: "Usa categorías amplias",
          text: "Comida, transporte, hogar, ocio. Evita decenas de microcategorías el primer mes.",
        },
        {
          name: "Revisa 5–10 minutos el domingo",
          text: "Compara gasto vs presupuesto semanal y ajusta una categoría para la semana siguiente.",
        },
      ],
    },
  },
  "en:how-to-track-expenses-daily": {
    faqs: [
      {
        question: "How to track daily expenses without burning out?",
        answer:
          "Log spending once a day (or right after you pay), keep categories broad, and spend five minutes reviewing on Sunday.",
      },
      {
        question: "What is the best way to track daily spending?",
        answer:
          "Log expenses right after you spend or do an end-of-day recap, use 6 starter categories, and compare against monthly limits weekly.",
      },
      {
        question: "Can I track expenses without a budget?",
        answer:
          "You can, but it’s less useful. Tracking shows where money went; budgets show where it should go.",
      },
      {
        question: "How long until expense tracking feels automatic?",
        answer:
          "Most people need 3–4 weeks of daily logging. By week 6, patterns become obvious before you log them.",
      },
    ],
    howTo: {
      name: "How to track expenses daily",
      description: "A 5-minute routine to log and review daily spending.",
      totalTime: "PT5M",
      steps: [
        {
          name: "Log as you go or end-of-day",
          text: "Enter amount and category right after paying, or scan the day’s bank transactions at night.",
        },
        {
          name: "Keep categories broad",
          text: "Start with about six categories so the habit sticks.",
        },
        {
          name: "Do a Sunday review",
          text: "Compare spent vs limits, spot one pattern, and make one adjustment for next week.",
        },
      ],
    },
  },
  "es:como-hacer-un-presupuesto-mensual": {
    faqs: [
      {
        question: "¿Cómo hacer un presupuesto mensual gratis?",
        answer:
          "Suma ingresos netos, lista gastos, asigna límites por categoría, revisa cada semana y evalúa al cierre del mes. Puedes hacerlo en papel, Excel o una app online gratis como Presusimple.",
      },
      {
        question: "¿Presupuesto online vs Excel?",
        answer:
          "Excel sirve si te gusta personalizar informes. Una app online gana en velocidad de registro diario, gráficos automáticos y uso desde el móvil.",
      },
      {
        question: "¿Necesito una app de presupuesto?",
        answer:
          "No es obligatorio. Papel y hojas de cálculo funcionan. Las apps aceleran categorías, gráficos y recordatorios si las usarás cada semana.",
      },
      {
        question: "¿Cuánto tarda hacer un presupuesto mensual?",
        answer:
          "El primero lleva 1–2 horas. Después, la configuración mensual son 15–30 minutos y la revisión semanal unos 15.",
      },
    ],
  },
  "es:como-dejar-de-gastar-de-mas": {
    faqs: [
      {
        question: "¿Por qué me paso aunque tengo presupuesto?",
        answer:
          "Suele ser porque los límites son vagos, el seguimiento es mensual en vez de semanal, o no hay categoría de gustos. Un presupuesto sin feedback es lista de deseos.",
      },
      {
        question: "¿Cuánto tarda en mejorar?",
        answer:
          "La mayoría nota cambio en 4–6 semanas con revisión semanal y categorías claras. El hábito pleno tarda 2–3 meses. Una mala semana no reinicia el reloj.",
      },
      {
        question: "¿Debo cortar las tarjetas de crédito?",
        answer:
          "No necesariamente. Las tarjetas son herramientas; el problema es conducta. Prueba quitar tarjetas guardadas, límites por categoría y alertas antes de cortarlas.",
      },
      {
        question: "¿Y si mis ingresos no cubren los gastos?",
        answer:
          "Eso no es gastar de más: es problema de ingresos o costes fijos. Recorta fijos, sube ingresos o ambos. Ningún método arregla un déficit estructural sin eso.",
      },
    ],
    howTo: {
      name: "Cómo dejar de gastar de más",
      description: "7 soluciones prácticas para frenar compras impulsivas y cumplir el presupuesto.",
      steps: [
        {
          name: "Asigna cada euro a una categoría antes del mes",
          text: "Usa presupuesto base cero: comidas fuera, supermercado y gustos con límites con nombre antes del día 1.",
        },
        {
          name: "Aplica la regla de las 24 horas",
          text: "Para compras no esenciales por encima de tu umbral, espera 24 horas antes de comprar.",
        },
        {
          name: "Elimina la compra en un clic",
          text: "Borra tarjetas guardadas y desactiva compra en un clic para añadir fricción consciente.",
        },
        {
          name: "Revisa el gasto cada semana",
          text: "10 minutos cada domingo comparando gasto real vs límites para ajustar a mitad de mes, no al final.",
        },
      ],
    },
  },
  "en:how-to-make-a-monthly-budget": {
    faqs: [
      {
        question: "How do I make a monthly budget for free?",
        answer:
          "Add net income, list expenses, assign category limits, review weekly, and evaluate at month-end. Use paper, a spreadsheet, or a free online budget app like Presusimple.",
      },
      {
        question: "Online budget planner vs Excel?",
        answer:
          "Spreadsheets are great for custom reports. An online planner wins for daily logging speed, automatic charts, and mobile use.",
      },
      {
        question: "Do I need a budgeting app?",
        answer:
          "No. Paper and spreadsheets work. Apps help if you want faster categories, charts, and reminders you’ll actually open weekly.",
      },
      {
        question: "How long does it take to make a monthly budget?",
        answer:
          "The first one takes 1–2 hours. After that, monthly setup is usually 15–30 minutes plus a short weekly review.",
      },
    ],
  },
};

export function getBlogSeoEnrichment(
  locale: "en" | "es",
  slug: string
): BlogSeoEnrichment | undefined {
  return ENRICHMENT[`${locale}:${slug}`];
}

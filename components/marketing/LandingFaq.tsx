"use client";

import { usePathname } from "next/navigation";
import { LANDING_FAQS } from "@/lib/seo-faqs";
import { useTranslation } from "@/lib/i18n";

export function LandingFaq() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const locale = pathname?.startsWith("/es") ? "es" : "en";
  const faqs = LANDING_FAQS[locale];

  return (
    <section className="py-12 sm:py-16 md:py-20 border-t border-slate-300/50 dark:border-white/10">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 text-slate-900 dark:text-white">
          {t("landingFaqTitle")}
        </h2>
        <dl className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="text-base font-semibold text-slate-900 dark:text-white">
                {faq.question}
              </dt>
              <dd className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

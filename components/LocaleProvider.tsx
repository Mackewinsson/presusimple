"use client";

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { LocaleContext, Locale } from '@/lib/i18n';

interface LocaleProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export default function LocaleProvider({ children, initialLocale = 'es' }: LocaleProviderProps) {
  const pathname = usePathname();
  const locale: Locale = pathname?.startsWith('/es') ? 'es' : 'en';

  return (
    <LocaleContext.Provider value={locale}>
      {children}
    </LocaleContext.Provider>
  );
} 
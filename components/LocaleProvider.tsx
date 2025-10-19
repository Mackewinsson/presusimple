"use client";

import { useState, ReactNode } from 'react';
import { LocaleContext, Locale } from '@/lib/i18n';

interface LocaleProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export default function LocaleProvider({ children, initialLocale = 'es' }: LocaleProviderProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  return (
    <LocaleContext.Provider value={locale}>
      {children}
    </LocaleContext.Provider>
  );
} 
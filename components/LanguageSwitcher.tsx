"use client";

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLocale } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const switchToEnglish = () => {
    if (pathname.startsWith('/es')) {
      // Remove /es prefix and redirect to English version
      const englishPath = pathname.replace('/es', '') || '/';
      router.push(englishPath);
    } else {
      router.push('/');
    }
  };

  const switchToSpanish = () => {
    if (pathname.startsWith('/es')) {
      // Already on Spanish version
      return;
    } else {
      // Add /es prefix
      const spanishPath = `/es${pathname}`;
      router.push(spanishPath);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4" />
      <Button
        variant="ghost"
        size="sm"
        onClick={switchToEnglish}
        className={`text-xs ${currentLocale === 'en' ? 'bg-accent' : ''}`}
      >
        EN
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={switchToSpanish}
        className={`text-xs ${currentLocale === 'es' ? 'bg-accent' : ''}`}
      >
        ES
      </Button>
    </div>
  );
} 
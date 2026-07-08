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
        className={`text-xs ${
          currentLocale === 'en'
            ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
      >
        EN
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={switchToSpanish}
        className={`text-xs ${
          currentLocale === 'es'
            ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
      >
        ES
      </Button>
    </div>
  );
} 
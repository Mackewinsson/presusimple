import LocaleProvider from '@/components/LocaleProvider';

export default function SpanishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider initialLocale="es">
      {children}
    </LocaleProvider>
  );
} 
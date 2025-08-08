import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import LocaleProvider from "@/components/LocaleProvider";

// Load Inter font locally instead of from Google Fonts
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Simple Budget - Personal Finance Management",
  description: "Track your budget and expenses with this zero-based budgeting app",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ]
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Theme will be handled by ThemeProvider to prevent hydration mismatches */}
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <LocaleProvider initialLocale="en">
            <Providers>
              <main>{children}</main>
            </Providers>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

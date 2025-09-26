import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "@/components/Providers";
import { ThemeProvider } from "@/components/ThemeProvider";
import LocaleProvider from "@/components/LocaleProvider";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import ViewportOptimizer from "@/components/ViewportOptimizer";
import MobileBottomTab from "@/components/MobileBottomTab";

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
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Simple Budget",
    startupImage: [
      {
        url: "/icons/icon-512x512.png",
        media: "(device-width: 768px) and (device-height: 1024px)"
      }
    ]
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f172a",
  colorScheme: "dark light",
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
        <ViewportOptimizer />
        <ThemeProvider>
          <LocaleProvider initialLocale="en">
            <Providers>
              <main>{children}</main>
              <PWAInstallPrompt />
              <MobileBottomTab />
            </Providers>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Download, 
  Smartphone, 
  Zap, 
  Shield, 
  Wifi, 
  Home,
  Check,
  Share,
  Plus
} from 'lucide-react';
import { AppIcon } from '@/components/ui/app-icon';
import { usePWAStatus } from '@/hooks/usePWAStatus';
import { useViewport } from '@/hooks/useViewport';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function PWALandingPage() {
  const { data: session } = useSession();
  const { isMobile } = useViewport();
  const pwaStatus = usePWAStatus();
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

  // Show PWA-first experience for mobile users who haven't installed the app
  const shouldShowPWAFirst = pwaStatus.shouldShowPWAFirst && isMobile;

  const handleInstall = async () => {
    if (pwaStatus.pwaInstall.deferredPrompt) {
      await pwaStatus.pwaInstall.handleInstall();
    } else {
      setShowInstallInstructions(true);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleLaunchApp = () => {
    if (session) {
      window.location.href = "/budget";
    } else {
      window.location.href = "/auth/login";
    }
  };

  // PWA-First Mobile Experience
  if (shouldShowPWAFirst) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        {/* Mobile Header */}
        <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AppIcon size={24} className="h-6 w-6" />
                <h1 className="text-lg font-bold text-white">Presusimple</h1>
              </div>
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <ThemeToggle />
                {session && (
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/10"
                  >
                    Sign Out
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          {/* PWA Installation Hero */}
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Smartphone className="h-10 w-10 text-white" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">
                Install Presusimple
              </h1>
              <p className="text-slate-300 text-sm">
                Get the full app experience with offline access and faster performance
              </p>
            </div>

            {/* PWA Benefits */}
            <div className="space-y-3">
              {pwaStatus.installBenefits.common.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 text-left">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-slate-300 text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Install Button */}
            <div className="space-y-3">
              {pwaStatus.isInstallable ? (
                <Button
                  onClick={handleInstall}
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Install App
                </Button>
              ) : (
                <Button
                  onClick={() => setShowInstallInstructions(true)}
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  <Share className="h-5 w-5 mr-2" />
                  Show Install Instructions
                </Button>
              )}

              <Button
                onClick={handleLaunchApp}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                size="lg"
              >
                Continue in Browser
              </Button>
            </div>
          </div>

          {/* Install Instructions Modal */}
          {showInstallInstructions && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="w-full max-w-sm bg-white/95 backdrop-blur-sm border-white/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">Install Instructions</CardTitle>
                  <CardDescription>
                    Follow these steps to install Presusimple
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pwaStatus.installInstructions.map((instruction) => (
                    <div key={instruction.step} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {instruction.step}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{instruction.icon}</span>
                          <h4 className="font-medium text-sm">{instruction.title}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {instruction.description}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button
                    onClick={() => setShowInstallInstructions(false)}
                    className="w-full mt-4"
                    size="sm"
                  >
                    Got it!
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Standard Desktop/Web Experience
  return (
    <div className="min-h-screen gradient-bg-dark flex flex-col">
      <header className="border-b border-white/10 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity"
            >
              <AppIcon size={24} className="h-4 w-4 sm:h-6 sm:w-6" />
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Presusimple
              </h1>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <LanguageSwitcher />
              <ThemeToggle />
              {session ? (
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 bg-white/10 dark:bg-white/10 backdrop-blur-sm text-slate-900 dark:text-white border border-gray-300/50 dark:border-white/20 px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/20 transition-all duration-200 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Sign Out</span>
                  <span className="sm:hidden">Out</span>
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 bg-white/10 dark:bg-white/10 backdrop-blur-sm text-slate-900 dark:text-white border border-gray-300/50 dark:border-white/20 px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-white/20 dark:hover:bg-white/20 transition-all duration-200 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">In</span>
                </Link>
              )}
              <button
                onClick={handleLaunchApp}
                className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-gray-100 transition-all duration-200 text-xs sm:text-sm shadow-lg font-medium"
              >
                <span className="hidden sm:inline">Launch App</span>
                <span className="sm:hidden">Launch</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-8 sm:py-12 md:py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent leading-tight">
              Simple Budgeting Made Easy
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-white/80 max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 px-4">
              Take control of your finances with our simple budgeting app. Every
              dollar has a purpose, every expense is tracked.
            </p>
            <button
              onClick={handleLaunchApp}
              className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 sm:px-5 md:px-6 sm:py-3 rounded-lg text-sm sm:text-base md:text-lg font-medium hover:bg-slate-800 dark:hover:bg-gray-100 transition-all duration-200 shadow-lg transform hover:scale-105"
            >
              Start Budgeting Now
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 md:py-20 bg-white/5 dark:bg-white/5 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-12 text-slate-900 dark:text-white">
              Everything you need to succeed
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
              <div className="p-4 sm:p-6 rounded-xl glass-card hover-card shadow-lg hover:shadow-xl">
                <Home className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-slate-900 dark:text-white mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                  Monthly Planning
                </h3>
                <p className="text-sm sm:text-base text-slate-700 dark:text-white/70">
                  Plan your budget month by month, adjusting as your needs
                  change.
                </p>
              </div>

              <div className="p-4 sm:p-6 rounded-xl glass-card hover-card shadow-lg hover:shadow-xl">
                <Zap className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-slate-900 dark:text-white mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                  Expense Tracking
                </h3>
                <p className="text-sm sm:text-base text-slate-700 dark:text-white/70">
                  Track every expense in real-time with beautiful
                  visualizations.
                </p>
              </div>

              <div className="p-4 sm:p-6 rounded-xl glass-card hover-card shadow-lg hover:shadow-xl sm:col-span-2 lg:col-span-1 sm:max-w-md lg:max-w-none mx-auto w-full">
                <Shield className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-slate-900 dark:text-white mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                  Secure & Private
                </h3>
                <p className="text-sm sm:text-base text-slate-700 dark:text-white/70">
                  Your financial data stays private and secure on your device.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PWA Benefits Section - Only show if not installed */}
        {!pwaStatus.isInstalled && (
          <section className="py-12 sm:py-16 md:py-20">
            <div className="container mx-auto px-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 sm:mb-8 md:mb-12 text-slate-900 dark:text-white">
                Get the App Experience
              </h2>
              <div className="max-w-4xl mx-auto">
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-white">Install Presusimple</CardTitle>
                    <CardDescription className="text-slate-300">
                      Get the full app experience with offline access and faster performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-white">App Benefits</h3>
                        {pwaStatus.installBenefits.common.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-slate-300 text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold text-white">Install Now</h3>
                        {pwaStatus.isInstallable ? (
                          <Button
                            onClick={handleInstall}
                            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Install App
                          </Button>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-slate-300 text-sm">
                              Look for the install option in your browser menu or follow the instructions for your device.
                            </p>
                            <Button
                              onClick={() => setShowInstallInstructions(true)}
                              variant="outline"
                              className="w-full border-white/20 text-white hover:bg-white/10"
                            >
                              <Share className="h-4 w-4 mr-2" />
                              Show Instructions
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-auto py-4 sm:py-8 border-t border-slate-300/50 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-sm sticky bottom-0 sm:static">
          <div className="container mx-auto px-4 text-center">
            <p className="text-slate-600 dark:text-white/60 text-xs sm:text-sm">
              © 2025 Presusimple. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

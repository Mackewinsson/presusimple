"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  TrendingUp,
  Shield,
  Check,
} from "lucide-react";
import { AppIcon } from "@/components/ui/app-icon";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import TranslationDemo from "@/components/TranslationDemo";

export default function LandingPage() {
  const { data: session } = useSession();

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
                Simple Budget
              </h1>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <LanguageSwitcher />
              <ThemeToggle />
              {session ? (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
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
                onClick={() => {
                  if (session) {
                    window.location.href = "/budget";
                  } else {
                    window.location.href = "/auth/login";
                  }
                }}
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
              onClick={() => {
                if (session) {
                  window.location.href = "/budget";
                } else {
                  window.location.href = "/auth/login";
                }
              }}
              className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 sm:px-5 md:px-6 sm:py-3 rounded-lg text-sm sm:text-base md:text-lg font-medium hover:bg-slate-800 dark:hover:bg-gray-100 transition-all duration-200 shadow-lg transform hover:scale-105"
            >
              Start Budgeting Now
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </section>

        {/* Translation Demo Section */}
        <section className="py-8 sm:py-12 px-4 bg-white/5 dark:bg-white/5">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-slate-900 dark:text-white">
              Multi-language Support
            </h2>
            <p className="text-slate-700 dark:text-white/80 mb-8">
              Switch between English and Spanish using the language selector above.
            </p>
            <TranslationDemo />
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
                <Calendar className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-slate-900 dark:text-white mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                  Monthly Planning
                </h3>
                <p className="text-sm sm:text-base text-slate-700 dark:text-white/70">
                  Plan your budget month by month, adjusting as your needs
                  change.
                </p>
              </div>

              <div className="p-4 sm:p-6 rounded-xl glass-card hover-card shadow-lg hover:shadow-xl">
                <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-slate-900 dark:text-white mb-3 sm:mb-4" />
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

        {/* Pricing Section */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 text-slate-900 dark:text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="text-center text-slate-700 dark:text-white/70 mb-8 sm:mb-12 max-w-2xl mx-auto text-sm sm:text-base">
              Choose the plan that works best for you. All plans include our
              core features.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="rounded-xl glass-card hover-card p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-200">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                  Free
                </h3>
                <p className="text-2xl sm:text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                  $0
                  <span className="text-slate-600 dark:text-white/70 text-sm font-normal">
                    /month
                  </span>
                </p>
                <ul className="space-y-2 sm:space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-slate-900 dark:text-white flex-shrink-0" />
                    <span className="text-sm sm:text-base text-slate-700 dark:text-white/80">
                      Unlimited budgets
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-slate-900 dark:text-white flex-shrink-0" />
                    <span className="text-sm sm:text-base text-slate-700 dark:text-white/80">
                      Basic expense tracking
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-slate-900 dark:text-white flex-shrink-0" />
                    <span className="text-sm sm:text-base text-slate-700 dark:text-white/80">
                      Monthly reports
                    </span>
                  </li>
                </ul>
                <Link
                  href="/budget"
                  className="block w-full text-center py-2 px-4 rounded-lg bg-slate-900/10 dark:bg-white/20 text-slate-900 dark:text-white hover:bg-slate-900/20 dark:hover:bg-white/30 transition-all duration-200 text-sm sm:text-base border border-slate-900/20 dark:border-white/30"
                >
                  Get Started
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="rounded-xl border border-slate-900/30 dark:border-white/50 bg-slate-900/10 dark:bg-white/20 backdrop-blur-xl p-4 sm:p-6 md:p-8 relative shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white px-2 sm:px-3 py-1 rounded-full text-white dark:text-slate-900 text-xs sm:text-sm shadow-lg font-medium">
                  Most Popular
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                  Pro
                </h3>
                <p className="text-2xl sm:text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                  $9
                  <span className="text-slate-600 dark:text-white/70 text-sm font-normal">
                    /month
                  </span>
                </p>
                <ul className="space-y-2 sm:space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-slate-900 dark:text-white flex-shrink-0" />
                    <span className="text-sm sm:text-base text-slate-700 dark:text-white/80">
                      Everything in Free
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-slate-900 dark:text-white flex-shrink-0" />
                    <span className="text-sm sm:text-base text-slate-700 dark:text-white/80">
                      Advanced analytics
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-slate-900 dark:text-white flex-shrink-0" />
                    <span className="text-sm sm:text-base text-slate-700 dark:text-white/80">
                      Export reports
                    </span>
                  </li>
                </ul>
                <Link
                  href="/budget"
                  className="block w-full text-center py-2 px-4 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-gray-100 transition-all duration-200 text-sm sm:text-base shadow-lg font-medium"
                >
                  Get Pro
                </Link>
              </div>

              {/* Enterprise Plan */}
              <div className="rounded-xl glass-card hover-card p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-200">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                  Enterprise
                </h3>
                <p className="text-2xl sm:text-3xl font-bold mb-4 text-slate-900 dark:text-white">
                  $29
                  <span className="text-slate-600 dark:text-white/70 text-sm font-normal">
                    /month
                  </span>
                </p>
                <ul className="space-y-2 sm:space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-slate-900 dark:text-white flex-shrink-0" />
                    <span className="text-sm sm:text-base text-slate-700 dark:text-white/80">
                      Everything in Pro
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-slate-900 dark:text-white flex-shrink-0" />
                    <span className="text-sm sm:text-base text-slate-700 dark:text-white/80">
                      Team collaboration
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 sm:h-5 sm:w-5 text-slate-900 dark:text-white flex-shrink-0" />
                    <span className="text-sm sm:text-base text-slate-700 dark:text-white/80">
                      Priority support
                    </span>
                  </li>
                </ul>
                <Link
                  href="/budget"
                  className="block w-full text-center py-2 px-4 rounded-lg bg-slate-900/10 dark:bg-white/20 text-slate-900 dark:text-white hover:bg-slate-900/20 dark:hover:bg-white/30 transition-all duration-200 text-sm sm:text-base border border-slate-900/20 dark:border-white/30"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto py-4 sm:py-8 border-t border-slate-300/50 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-sm sticky bottom-0 sm:static">
          <div className="container mx-auto px-4 text-center">
            <p className="text-slate-600 dark:text-white/60 text-xs sm:text-sm">
              © 2025 Simple Budget. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

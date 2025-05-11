"use client";

import Link from "next/link";
import {
  ArrowRight,
  PieChart,
  Calendar,
  TrendingUp,
  Shield,
  Check,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export default function LandingPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition-opacity"
          >
            <div className="bg-primary text-primary-foreground p-1.5 sm:p-2 rounded-xl">
              <PieChart className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Simple Budget
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-secondary/90 transition-colors text-sm sm:text-base"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/auth/signin"
                className="inline-flex items-center gap-1.5 bg-secondary text-secondary-foreground px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-secondary/90 transition-colors text-sm sm:text-base"
              >
                Sign In
              </Link>
            )}
            <button
              onClick={() => {
                if (session) {
                  window.location.href = "/app";
                } else {
                  window.location.href = "/auth/signin";
                }
              }}
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm sm:text-base"
            >
              Launch App
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-12 sm:py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
              Simple Budgeting Made Easy
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 px-4">
              Take control of your finances with our simple budgeting app. Every
              dollar has a purpose, every expense is tracked.
            </p>
            <button
              onClick={() => {
                if (session) {
                  window.location.href = "/app";
                } else {
                  window.location.href = "/auth/signin";
                }
              }}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg text-base sm:text-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Start Budgeting Now
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
              Everything you need to succeed
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
              <div className="p-6 rounded-xl bg-card/50 backdrop-blur hover:bg-card/80 transition-colors">
                <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Monthly Planning
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Plan your budget month by month, adjusting as your needs
                  change.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-card/50 backdrop-blur hover:bg-card/80 transition-colors">
                <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Expense Tracking
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Track every expense in real-time with beautiful
                  visualizations.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-card/50 backdrop-blur hover:bg-card/80 transition-colors sm:col-span-2 md:col-span-1 sm:max-w-md md:max-w-none mx-auto w-full">
                <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Secure & Private
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Your financial data stays private and secure on your device.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
              Simple, Transparent Pricing
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Choose the plan that works best for you. All plans include our
              core features.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="rounded-xl border bg-card p-6 sm:p-8">
                <h3 className="text-xl font-semibold mb-2">Free</h3>
                <p className="text-3xl font-bold mb-4">
                  $0
                  <span className="text-muted-foreground text-sm font-normal">
                    /month
                  </span>
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Unlimited budgets</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Basic expense tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Monthly reports</span>
                  </li>
                </ul>
                <Link
                  href="/app"
                  className="block w-full text-center py-2 px-4 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Get Started
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="rounded-xl border bg-primary p-6 sm:p-8 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 rounded-full text-primary-foreground text-sm">
                  Most Popular
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary-foreground">
                  Pro
                </h3>
                <p className="text-3xl font-bold mb-4 text-primary-foreground">
                  $9
                  <span className="text-primary-foreground/70 text-sm font-normal">
                    /month
                  </span>
                </p>
                <ul className="space-y-3 mb-6 text-primary-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    <span>Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    <span>Custom categories</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Link
                  href="/app"
                  className="block w-full text-center py-2 px-4 rounded-lg bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors"
                >
                  Start Free Trial
                </Link>
              </div>

              {/* Enterprise Plan */}
              <div className="rounded-xl border bg-card p-6 sm:p-8">
                <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
                <p className="text-3xl font-bold mb-4">
                  $29
                  <span className="text-muted-foreground text-sm font-normal">
                    /month
                  </span>
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Team collaboration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>24/7 phone support</span>
                  </li>
                </ul>
                <Link
                  href="/app"
                  className="block w-full text-center py-2 px-4 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 bg-secondary/30">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl bg-primary/5 backdrop-blur">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                Ready to take control of your finances?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
                Join thousands of others who have transformed their financial
                lives with simple budgeting.
              </p>
              <Link
                href="/app"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg text-base sm:text-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 sm:py-8 bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Simple Budget. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

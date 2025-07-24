"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Something went wrong
                </h1>
                <p className="text-slate-300">
                  We're experiencing technical difficulties. This might be due to network issues or server problems.
                </p>
              </div>
            </div>
            
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {this.state.error?.message || "An unexpected error occurred"}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <Button
                onClick={this.resetError}
                className="w-full bg-white text-slate-900 hover:bg-gray-100 font-semibold py-3"
                size="lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                size="lg"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 
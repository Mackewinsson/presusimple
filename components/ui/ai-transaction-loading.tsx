"use client";

import { Sparkles, Brain, Zap, CheckCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface AITransactionLoadingProps {
  isProcessing: boolean;
  currentStep?: "analyzing" | "parsing" | "matching" | "complete";
  className?: string;
}

export const AITransactionLoading = ({ isProcessing, currentStep = "analyzing", className }: AITransactionLoadingProps) => {
  if (!isProcessing) return null;

  const steps = [
    { key: "analyzing", label: "Analyzing your description...", icon: Brain },
    { key: "parsing", label: "Extracting transactions...", icon: MessageSquare },
    { key: "matching", label: "Matching categories...", icon: Zap },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className={cn(
      "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center",
      className
    )}>
      <div className="glass-card p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-16 h-16 mb-4">
            {/* Animated sparkles background */}
            <div className="absolute inset-0">
              <Sparkles className="w-6 h-6 text-slate-900 dark:text-white animate-pulse absolute top-0 left-0" />
              <Sparkles className="w-4 h-4 text-slate-900/80 dark:text-white/80 animate-pulse absolute top-2 right-2" style={{ animationDelay: '0.5s' }} />
              <Sparkles className="w-5 h-5 text-slate-900/60 dark:text-white/60 animate-pulse absolute bottom-2 left-2" style={{ animationDelay: '1s' }} />
              <Sparkles className="w-3 h-3 text-slate-900/90 dark:text-white/90 animate-pulse absolute top-1 left-1/2" style={{ animationDelay: '1.5s' }} />
              <Sparkles className="w-4 h-4 text-slate-900/70 dark:text-white/70 animate-pulse absolute bottom-1 right-1" style={{ animationDelay: '2s' }} />
            </div>
            {/* Main AI icon */}
            <div className="relative z-10 bg-white rounded-full p-3 animate-pulse shadow-lg">
              <MessageSquare className="w-8 h-8 text-slate-900 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            AI Transaction Processing
          </h3>
          <p className="text-sm text-slate-700 dark:text-white/70 animate-pulse">
            Converting your text into perfect budget entries...
          </p>
        </div>

        {/* Progress steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div
                key={step.key}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg transition-all duration-300",
                  isActive && "bg-slate-100 dark:bg-white/20 border border-slate-200 dark:border-white/30",
                  isCompleted && "bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30",
                  !isActive && !isCompleted && "bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
                  isActive && "bg-slate-900 dark:bg-white text-white dark:text-slate-900 animate-pulse",
                  isCompleted && "bg-emerald-500 text-white",
                  !isActive && !isCompleted && "bg-slate-200 dark:bg-white/20 text-slate-600 dark:text-white/50"
                )}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    isActive && "text-slate-900 dark:text-white",
                    isCompleted && "text-emerald-700 dark:text-emerald-300",
                    !isActive && !isCompleted && "text-slate-600 dark:text-white/50"
                  )}>
                    {step.label}
                  </p>
                </div>
                {isActive && (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-900 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-900 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-900 dark:bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Animated progress bar */}
        <div className="mt-6">
          <div className="w-full bg-slate-200 dark:bg-white/20 rounded-full h-2">
            <div 
              className="bg-slate-900 dark:bg-white h-2 rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${((currentStepIndex + 1) / steps.length) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: `rgba(15, 23, 42, ${0.3 + Math.random() * 0.4})`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 
"use client";

import React, { useState } from "react";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { isStandaloneMode } from "@/lib/pwa-utils";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  // Create query client with PWA-aware configuration
  const [queryClient] = useState(() => {
    const isPWA = typeof window !== 'undefined' && isStandaloneMode();
    
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: isPWA ? 30 * 60 * 1000 : 5 * 60 * 1000, // 30 min for PWA, 5 min for web
          gcTime: isPWA ? 60 * 60 * 1000 : 10 * 60 * 1000, // 60 min for PWA, 10 min for web
          retry: 1,
          refetchOnWindowFocus: false,
          // For PWA: Don't refetch on mount, use cache first
          refetchOnMount: isPWA ? false : true,
          // Network mode: online first, but allow cached data when offline
          networkMode: 'online',
        },
      },
    });
  });

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}

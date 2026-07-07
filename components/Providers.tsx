"use client";

import React, { Suspense, useState, useSyncExternalStore } from "react";
import { AnalyticsPageView } from "@/components/analytics/AnalyticsPageView";
import { SignUpTracker } from "@/components/analytics/SignUpTracker";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import type { Persister } from "@tanstack/react-query-persist-client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { isStandaloneMode } from "@/lib/pwa-utils";

const CACHE_BUSTER = process.env.NEXT_PUBLIC_APP_URL ?? "presusimple";
const PERSIST_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const PERSIST_QUERY_ROOT_KEYS = ["budgets", "categories", "expenses"] as const;

let clientPersister: Persister | null = null;

function getClientPersister(): Persister {
  if (!clientPersister) {
    clientPersister = createSyncStoragePersister({ storage: window.localStorage });
  }
  return clientPersister;
}

function shouldPersistQuery(query: { queryKey: readonly unknown[] }) {
  const rootKey = query.queryKey[0];
  return (
    typeof rootKey === "string" &&
    (PERSIST_QUERY_ROOT_KEYS as readonly string[]).includes(rootKey)
  );
}

function useQueryPersister(): Persister | null {
  return useSyncExternalStore(
    () => () => {},
    getClientPersister,
    () => null
  );
}

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const persister = useQueryPersister();

  const [queryClient] = useState(() => {
    const isPWA = typeof window !== "undefined" && isStandaloneMode();

    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: isPWA ? 30 * 60 * 1000 : 5 * 60 * 1000,
          gcTime: isPWA ? 60 * 60 * 1000 : 10 * 60 * 1000,
          retry: 1,
          refetchOnWindowFocus: false,
          refetchOnMount: isPWA ? false : true,
          networkMode: "online",
        },
      },
    });
  });

  const appContent = (
    <>
      <Suspense fallback={null}>
        <AnalyticsPageView />
      </Suspense>
      <SignUpTracker />
      {children}
      <Toaster richColors />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );

  return (
    <SessionProvider>
      {persister ? (
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister,
            maxAge: PERSIST_MAX_AGE_MS,
            buster: CACHE_BUSTER,
            dehydrateOptions: {
              shouldDehydrateQuery: shouldPersistQuery,
            },
          }}
        >
          {appContent}
        </PersistQueryClientProvider>
      ) : (
        <QueryClientProvider client={queryClient}>{appContent}</QueryClientProvider>
      )}
    </SessionProvider>
  );
}

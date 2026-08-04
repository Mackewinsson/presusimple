"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    SwaggerUIBundle?: (config: Record<string, unknown>) => unknown;
  }
}

export function SwaggerUiClient() {
  const [swaggerSpec, setSwaggerSpec] = useState<Record<string, unknown> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/swagger")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: Record<string, unknown>) => {
        setSwaggerSpec(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!swaggerSpec || typeof window === "undefined") {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js";
    script.crossOrigin = "anonymous";

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css";

    document.head.appendChild(link);
    document.body.appendChild(script);

    script.onload = () => {
      if (window.SwaggerUIBundle) {
        window.SwaggerUIBundle({
          spec: swaggerSpec,
          dom_id: "#swagger-ui",
          docExpansion: "list",
          defaultModelsExpandDepth: 2,
          defaultModelExpandDepth: 2,
          displayRequestDuration: true,
          tryItOutEnabled: true,
          requestInterceptor: (request: { url: string }) => {
            if (!request.url.startsWith("http")) {
              request.url = `${window.location.origin}${request.url}`;
            }
            return request;
          },
        });
      }
    };

    return () => {
      link.remove();
      script.remove();
    };
  }, [swaggerSpec]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-primary" />
          <p className="mt-4 text-muted-foreground">Loading API documentation…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-destructive">
            Error loading documentation
          </h2>
          <p className="mb-4 text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!swaggerSpec) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            No documentation available
          </h2>
          <p className="text-muted-foreground">
            Swagger specification is empty or invalid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div id="swagger-ui" />
    </div>
  );
}

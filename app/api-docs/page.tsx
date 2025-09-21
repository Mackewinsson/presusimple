'use client';

import { useEffect, useState } from 'react';

export default function ApiDocs() {
  const [swaggerSpec, setSwaggerSpec] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Fetching swagger spec...');
    fetch('/api/swagger')
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Swagger spec received:', data);
        setSwaggerSpec(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching swagger spec:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (swaggerSpec && typeof window !== 'undefined') {
      // Load Swagger UI dynamically using the standalone method
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js';
      script.crossOrigin = 'anonymous';
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css';
      
      document.head.appendChild(link);
      document.body.appendChild(script);
      
      script.onload = () => {
        // @ts-ignore
        if (window.SwaggerUIBundle) {
          // @ts-ignore
          window.ui = window.SwaggerUIBundle({
            spec: swaggerSpec,
            dom_id: '#swagger-ui',
            docExpansion: 'list',
            defaultModelsExpandDepth: 2,
            defaultModelExpandDepth: 2,
            displayRequestDuration: true,
            tryItOutEnabled: true,
            requestInterceptor: (request: any) => {
              // Add base URL if not present
              if (!request.url.startsWith('http')) {
                request.url = `${window.location.origin}${request.url}`;
              }
              return request;
            }
          });
        }
      };
      
      return () => {
        // Cleanup
        document.head.removeChild(link);
        document.body.removeChild(script);
      };
    }
  }, [swaggerSpec]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API documentation...</p>
          <p className="mt-2 text-sm text-gray-500">Fetching from /api/swagger...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Documentation</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!swaggerSpec) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-600 mb-4">No Documentation Available</h1>
          <p className="text-gray-600">Swagger specification is empty or invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Simple Budget API Documentation
          </h1>
          <p className="text-gray-600">
            Complete API reference for the Simple Budget application
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div id="swagger-ui"></div>
        </div>
      </div>
    </div>
  );
}
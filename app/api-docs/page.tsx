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
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Available Endpoints</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium text-lg">Authentication</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div><span className="font-mono bg-gray-100 px-2 py-1 rounded">POST</span> <code>/api/mobile-login</code> - Mobile app authentication</div>
                  <div><span className="font-mono bg-gray-100 px-2 py-1 rounded">POST</span> <code>/api/mobile-register</code> - Mobile app registration</div>
                  <div><span className="font-mono bg-gray-100 px-2 py-1 rounded">GET/POST</span> <code>/api/mobile-setup-password</code> - Password setup for Google OAuth users</div>
                </div>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-medium text-lg">Budgets</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div><span className="font-mono bg-gray-100 px-2 py-1 rounded">GET</span> <code>/api/budgets</code> - List budgets (with user filtering)</div>
                  <div><span className="font-mono bg-gray-100 px-2 py-1 rounded">POST</span> <code>/api/budgets</code> - Create new budget</div>
                </div>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-medium text-lg">Expenses</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div><span className="font-mono bg-gray-100 px-2 py-1 rounded">GET</span> <code>/api/expenses</code> - List expenses (with user filtering)</div>
                  <div><span className="font-mono bg-gray-100 px-2 py-1 rounded">POST</span> <code>/api/expenses</code> - Create new expense</div>
                  <div><span className="font-mono bg-gray-100 px-2 py-1 rounded">GET</span> <code>/api/expenses/{id}</code> - Get specific expense</div>
                  <div><span className="font-mono bg-gray-100 px-2 py-1 rounded">PUT</span> <code>/api/expenses/{id}</code> - Update expense</div>
                  <div><span className="font-mono bg-gray-100 px-2 py-1 rounded">DELETE</span> <code>/api/expenses/{id}</code> - Delete expense</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Authentication</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Mobile App (JWT)</h3>
              <p className="text-sm text-gray-600 mb-2">Include JWT token in Authorization header:</p>
              <code className="text-sm bg-gray-200 px-2 py-1 rounded">Authorization: Bearer &lt;your-jwt-token&gt;</code>
              
              <h3 className="font-medium mb-2 mt-4">Web App (NextAuth)</h3>
              <p className="text-sm text-gray-600 mb-2">Include session cookie:</p>
              <code className="text-sm bg-gray-200 px-2 py-1 rounded">Cookie: next-auth.session-token=&lt;session-token&gt;</code>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Example Requests</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Mobile Login</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X POST http://localhost:3000/api/mobile-login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "password123"}'`}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Get Expenses</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
{`curl -X GET "http://localhost:3000/api/expenses?user=USER_ID" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"`}
                </pre>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-4">For interactive API testing, you can use tools like:</p>
            <div className="flex justify-center space-x-4">
              <a href="https://insomnia.rest/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Insomnia</a>
              <a href="https://www.postman.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Postman</a>
              <a href="https://httpie.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">HTTPie</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

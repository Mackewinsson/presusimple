"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TestWelcomePage() {
  const router = useRouter();

  useEffect(() => {
    // Simulate new user session
    const mockSession = {
      user: {
        email: "newuser@test.com",
        name: "New Test User",
        image: null
      },
      isNewUser: true
    };

    // Store mock session
    localStorage.setItem('test-new-user-session', JSON.stringify(mockSession));
    
    console.log('🎯 Test Welcome Page - Simulating new user');
    console.log('Session:', mockSession);
    
    // Redirect to welcome page
    setTimeout(() => {
      console.log('🔄 Redirecting to /app/welcome...');
      router.push('/app/welcome');
    }, 1000);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Testing Welcome Flow</h1>
        <p className="text-xl mb-8">Simulating new user session...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p className="mt-4 text-sm text-slate-300">
          Redirecting to welcome page in 1 second...
        </p>
      </div>
    </div>
  );
} 
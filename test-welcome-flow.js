// Temporary script to simulate new user for testing welcome flow
// Run this in browser console to simulate new user state

// Simulate new user session
const mockNewUserSession = {
  user: {
    email: "test@example.com",
    name: "Test User",
    image: null
  },
  isNewUser: true
};

// Override useSession to return new user
if (typeof window !== 'undefined') {
  // Store original useSession
  window.originalUseSession = window.originalUseSession || require('next-auth/react').useSession;
  
  // Mock useSession for new user
  const mockUseSession = () => ({
    data: mockNewUserSession,
    status: 'authenticated',
    update: () => Promise.resolve(mockNewUserSession)
  });
  
  // Replace useSession temporarily
  require('next-auth/react').useSession = mockUseSession;
  
  console.log('✅ Mocked new user session');
  console.log('Session data:', mockNewUserSession);
  
  // Navigate to welcome page
  window.location.href = '/app/welcome';
}

console.log('🎯 Ready to test welcome flow as new user!');
console.log('Navigate to /app/welcome to see the welcome screen'); 
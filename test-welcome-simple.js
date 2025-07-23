// Copy and paste this in browser console to test welcome flow
// This simulates a new user session

console.log('🎯 Testing Welcome Flow as New User');

// Simulate new user session
const mockSession = {
  user: {
    email: "newuser@test.com",
    name: "New Test User",
    image: null
  },
  isNewUser: true
};

// Override session in localStorage to simulate new user
localStorage.setItem('next-auth.session-token', JSON.stringify(mockSession));

console.log('✅ Mocked new user session in localStorage');
console.log('Session:', mockSession);

// Navigate to welcome page
console.log('🔄 Navigating to /app/welcome...');
window.location.href = '/app/welcome';

// Alternative: You can also manually navigate to:
// http://localhost:3000/app/welcome 
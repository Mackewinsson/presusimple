import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline - Presusimple',
  description: 'You are currently offline',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6 text-center">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            You're Offline
          </h1>
          <p className="text-muted-foreground mb-6">
            It looks like you're not connected to the internet. Please check your connection and try again.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
          >
            Try Again
          </button>
          
          <p className="text-sm text-muted-foreground">
            Some features may still be available offline if you've used them before.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import NotificationManager from '@/components/NotificationManager'

export default function NotificationTestPage() {
  const [testMessage, setTestMessage] = useState('Hello from your PWA!')

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Notification Test</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
            <CardDescription>
              Follow these steps to test your PWA notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>1. <strong>Request Permission:</strong> Click "Request Permission" to allow notifications</p>
              <p>2. <strong>Subscribe:</strong> Click "Subscribe to Notifications" to enable push notifications</p>
              <p>3. <strong>Test:</strong> Click "Send Test Notification" to receive a test notification</p>
              <p>4. <strong>Verify:</strong> You should see a notification appear on your device</p>
              <p>5. <strong>Click:</strong> Click the notification to open the app</p>
            </div>
          </CardContent>
        </Card>

        <NotificationManager />

        <Card>
          <CardHeader>
            <CardTitle>Requirements</CardTitle>
            <CardDescription>
              Make sure these requirements are met for notifications to work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${window.isSecureContext ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>HTTPS or localhost (Secure Context)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${'serviceWorker' in navigator ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>Service Worker Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${'PushManager' in window ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>Push Manager Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${'Notification' in window ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>Notification API Support</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
            <CardDescription>
              Common issues and solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>No notification appears:</strong> Check browser notification settings and ensure they're enabled for this site</p>
              <p><strong>Permission denied:</strong> Go to browser settings and manually enable notifications for this site</p>
              <p><strong>Service worker not found:</strong> Refresh the page and try again</p>
              <p><strong>VAPID error:</strong> Ensure VAPID keys are properly configured in environment variables</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

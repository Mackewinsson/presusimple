"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// List of authorized admin emails
const AUTHORIZED_ADMINS = [
  "mackewinsson@gmail.com", // Your email
  // Add more admin emails here
];

export default function ManualSubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [message, setMessage] = useState("");

  // Check if user is authorized
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/auth/signin");
      return;
    }

    const userEmail = session.user?.email;
    if (!userEmail || !AUTHORIZED_ADMINS.includes(userEmail)) {
      toast.error("Access denied. You are not authorized to view this page.");
      router.replace("/app");
      return;
    }
  }, [session, status, router]);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Show unauthorized message
  if (!session || !AUTHORIZED_ADMINS.includes(session.user?.email || "")) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You are not authorized to view this page.
          </p>
        </div>
      </div>
    );
  }

  const handleGetUser = async () => {
    if (!email) {
      toast.error("Please enter an email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/users/manual-subscription?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();

      if (response.ok) {
        setUserData(data);
        setMessage("");
      } else {
        setUserData(null);
        setMessage(data.error || "Failed to fetch user");
      }
    } catch (error) {
      setUserData(null);
      setMessage("Failed to fetch user");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!email || !action) {
      toast.error("Please enter email and select action");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/users/manual-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setMessage(data.message);
        // Refresh user data
        handleGetUser();
      } else {
        toast.error(data.error || "Failed to perform action");
        setMessage(data.error || "Failed to perform action");
      }
    } catch (error) {
      toast.error("Failed to perform action");
      setMessage("Failed to perform action");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">
              Manual Subscription Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage user subscriptions manually (Admin Only)
            </p>
            <p className="text-sm text-green-600 mt-1">
              Logged in as: {session.user?.email}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Get User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                  />
                </div>
                <Button onClick={handleGetUser} disabled={loading}>
                  {loading ? "Loading..." : "Get User"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {userData && (
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Email:</span> {userData.email}
                  </div>
                  <div>
                    <span className="font-medium">Is Paid:</span>{" "}
                    {userData.isPaid ? "Yes" : "No"}
                  </div>
                  <div>
                    <span className="font-medium">Trial Start:</span>{" "}
                    {userData.trialStart
                      ? new Date(userData.trialStart).toLocaleDateString()
                      : "None"}
                  </div>
                  <div>
                    <span className="font-medium">Trial End:</span>{" "}
                    {userData.trialEnd
                      ? new Date(userData.trialEnd).toLocaleDateString()
                      : "None"}
                  </div>
                  <div>
                    <span className="font-medium">Subscription Type:</span>{" "}
                    {userData.subscriptionType || "None"}
                  </div>
                  <div>
                    <span className="font-medium">Stripe Customer ID:</span>{" "}
                    {userData.stripeCustomerId || "None"}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Manage Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="action">Action</Label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activate_paid">
                      Activate Paid Subscription
                    </SelectItem>
                    <SelectItem value="activate_trial">
                      Activate 30-Day Trial
                    </SelectItem>
                    <SelectItem value="deactivate">
                      Deactivate Subscription
                    </SelectItem>
                    <SelectItem value="extend_trial">
                      Extend Trial (30 days)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAction}
                disabled={loading || !email || !action}
                className="w-full"
              >
                {loading ? "Processing..." : "Execute Action"}
              </Button>
            </CardContent>
          </Card>

          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, Crown, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface AdminUser {
  _id: string;
  email: string;
  name?: string;
  plan?: "free" | "pro";
  isPaid?: boolean;
  trialStart?: string;
  trialEnd?: string;
  subscriptionType?: string;
  lemonSqueezyCustomerId?: string;
  lemonSqueezySubscriptionId?: string;
  createdAt?: string;
}

interface UsersResponse {
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<UsersResponse["pagination"]>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async (page = 1, searchQuery = query) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: "25",
      });
      if (searchQuery) params.set("q", searchQuery);

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to load users");
      }

      const data: UsersResponse = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  const handleSearch = () => {
    setQuery(search.trim());
    loadUsers(1, search.trim());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Users
        </h1>
        <p className="text-muted-foreground mt-2">
          Browse registered users, plans, and subscription status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search users</CardTitle>
          <CardDescription>Filter by email or display name</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or name"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {pagination.total} user{pagination.total === 1 ? "" : "s"}
          </CardTitle>
          <CardDescription>
            Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground py-8 text-center">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Email</th>
                    <th className="py-2 pr-4 font-medium">Name</th>
                    <th className="py-2 pr-4 font-medium">Plan</th>
                    <th className="py-2 pr-4 font-medium">Paid</th>
                    <th className="py-2 pr-4 font-medium">Subscription</th>
                    <th className="py-2 pr-4 font-medium">Joined</th>
                    <th className="py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{user.email}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {user.name || "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={user.plan === "pro" ? "default" : "secondary"}>
                          {user.plan || "free"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        {user.isPaid ? "Yes" : "No"}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {user.subscriptionType || "—"}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-3">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin?tab=subscriptions&email=${encodeURIComponent(user.email)}`}>
                            Manage
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1 || loading}
                onClick={() => loadUsers(pagination.page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => loadUsers(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Subscription tools
          </CardTitle>
          <CardDescription>
            Use the dashboard tabs for manual subscription changes, password resets,
            and feature flags.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/admin">Open admin dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

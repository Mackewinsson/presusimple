"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
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
import {
  formatAdminDateTime,
  formatAdminRelative,
} from "@/lib/admin/user-dates";
import { AdminUserDetail } from "@/components/admin/AdminUserDetail";

export interface AdminUserRow {
  _id: string;
  email: string;
  name?: string;
  plan?: "free" | "pro";
  isPaid?: boolean;
  trialStart?: string;
  trialEnd?: string;
  subscriptionType?: string;
  streakCount?: number;
  lastActivityDate?: string;
  lastLoginAt?: string;
  joinedAt?: string | null;
  createdAt?: string;
}

interface UsersResponse {
  users: AdminUserRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface AdminUsersTableProps {
  users: AdminUserRow[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
}

function AdminUsersTable({
  users,
  selectedUserId,
  onSelectUser,
}: AdminUsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[720px]">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Email</th>
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Plan</th>
            <th className="py-2 pr-4 font-medium">Joined</th>
            <th className="py-2 pr-4 font-medium">Last login</th>
            <th className="py-2 pr-4 font-medium">Streak</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const joined = user.joinedAt ?? user.createdAt;
            const isSelected = selectedUserId === user._id;
            return (
              <tr
                key={user._id}
                onClick={() => onSelectUser(user._id)}
                className={`border-b last:border-0 align-top cursor-pointer transition-colors ${
                  isSelected ? "bg-muted/60" : "hover:bg-muted/40"
                }`}
              >
                <td className="py-3 pr-4 font-medium">{user.email}</td>
                <td className="py-3 pr-4 text-muted-foreground">
                  {user.name || "—"}
                </td>
                <td className="py-3 pr-4">
                  <Badge variant={user.plan === "pro" ? "default" : "secondary"}>
                    {user.plan || "free"}
                  </Badge>
                </td>
                <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                  <div>{formatAdminDateTime(joined)}</div>
                  <div className="text-xs">{formatAdminRelative(joined)}</div>
                </td>
                <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                  <div>{formatAdminDateTime(user.lastLoginAt)}</div>
                  <div className="text-xs">
                    {formatAdminRelative(user.lastLoginAt)}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  {user.streakCount && user.streakCount > 0
                    ? `${user.streakCount}d`
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function AdminUsersPanel({ limit = 25 }: { limit?: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UsersResponse["pagination"]>({
    page: 1,
    limit,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const updateSelectedUser = useCallback(
    (userId: string | null) => {
      setSelectedUserId(userId);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "users");
      if (userId) {
        params.set("user", userId);
      } else {
        params.delete("user");
      }
      router.replace(`/admin?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const loadUsers = useCallback(
    async (page = 1, searchQuery = query) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
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
        return data.users;
      } catch (error) {
        console.error("Error loading users:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to load users"
        );
        return [];
      } finally {
        setLoading(false);
      }
    },
    [query, limit]
  );

  useEffect(() => {
    const init = async () => {
      const emailParam = searchParams.get("email");
      const userParam = searchParams.get("user");

      if (emailParam && !userParam) {
        setSearch(emailParam);
        setQuery(emailParam);
        const results = await loadUsers(1, emailParam);
        if (results[0]) {
          updateSelectedUser(results[0]._id);
        }
        return;
      }

      await loadUsers(1);
      if (userParam) {
        setSelectedUserId(userParam);
      }
    };

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    const trimmed = search.trim();
    setQuery(trimmed);
    updateSelectedUser(null);
    await loadUsers(1, trimmed);
  };

  const handleUserUpdated = () => {
    void loadUsers(pagination.page);
  };

  if (selectedUserId) {
    return (
      <AdminUserDetail
        userId={selectedUserId}
        onBack={() => updateSelectedUser(null)}
        onUpdated={handleUserUpdated}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search users</CardTitle>
          <CardDescription>
            Click a user to view profile, subscription, and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or name"
            onKeyDown={(e) => e.key === "Enter" && void handleSearch()}
          />
          <Button onClick={() => void handleSearch()} disabled={loading}>
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
            <p className="text-muted-foreground py-8 text-center">
              Loading users...
            </p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No users found
            </p>
          ) : (
            <AdminUsersTable
              users={users}
              selectedUserId={selectedUserId}
              onSelectUser={updateSelectedUser}
            />
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1 || loading}
                onClick={() => void loadUsers(pagination.page - 1)}
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
                onClick={() => void loadUsers(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

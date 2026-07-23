"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserX, RefreshCw, Layers } from "lucide-react";
import { toast } from "sonner";

interface SharedBudget {
  _id: string;
  user: { _id: string; email: string; name?: string } | null;
  month: number;
  year: number;
  totalBudgeted: number;
  collaborators: { email: string; role: string; status: string }[];
}

export function AdminSharedBudgetsPanel() {
  const [sharedBudgets, setSharedBudgets] = useState<SharedBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  const fetchSharedBudgets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shared-budgets");
      if (res.ok) {
        const data = await res.json();
        setSharedBudgets(data.sharedBudgets || []);
      }
    } catch (err) {
      console.error("Failed to load admin shared budgets:", err);
      toast.error("Failed to load shared budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedBudgets();
  }, []);

  const handleRemoveCollaborator = async (budgetId: string, collaboratorEmail: string) => {
    setRemovingEmail(`${budgetId}-${collaboratorEmail}`);
    try {
      const res = await fetch("/api/admin/shared-budgets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budgetId, collaboratorEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove collaborator");
      }

      toast.success(`Removed ${collaboratorEmail} from budget`);
      fetchSharedBudgets();
    } catch (err: any) {
      toast.error(err.message || "Error removing collaborator");
    } finally {
      setRemovingEmail(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          Loading shared budgets...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Shared & Couple Budgets Management</CardTitle>
              <CardDescription>
                View all shared budgets across the platform and manage collaborators.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchSharedBudgets} className="gap-1.5">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sharedBudgets.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No shared budgets created yet.
            </div>
          ) : (
            <div className="space-y-4">
              {sharedBudgets.map((b) => (
                <div key={b._id} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                    <div>
                      <span className="font-semibold text-foreground">
                        Owner: {b.user?.email || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        (Period: {b.month}/{b.year})
                      </span>
                    </div>
                    <Badge variant="outline" className="w-fit">
                      {b.collaborators?.length || 0} collaborators
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Collaborators:</div>
                    <div className="space-y-1.5">
                      {b.collaborators.map((c, idx) => {
                        const isRemoving = removingEmail === `${b._id}-${c.email}`;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded border bg-card text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{c.email}</span>
                              <Badge variant="secondary" className="text-[10px]">
                                {c.role} ({c.status})
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveCollaborator(b._id, c.email)}
                              disabled={isRemoving}
                              className="h-7 text-xs text-destructive hover:bg-destructive/10 gap-1"
                            >
                              <UserX className="h-3.5 w-3.5" />
                              <span>Remove</span>
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

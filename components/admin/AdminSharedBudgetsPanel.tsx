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

interface SharedCategory {
  _id: string;
  name: string;
  budgeted: number;
  collaborators: { email: string; role: string; status: string }[];
}

export function AdminSharedBudgetsPanel() {
  const [sharedBudgets, setSharedBudgets] = useState<SharedBudget[]>([]);
  const [sharedCategories, setSharedCategories] = useState<SharedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  const fetchSharedBudgets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shared-budgets");
      if (res.ok) {
        const data = await res.json();
        setSharedBudgets(data.sharedBudgets || []);
        setSharedCategories(data.sharedCategories || []);
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

  const handleRemoveCollaborator = async (
    target: { budgetId?: string; categoryId?: string },
    collaboratorEmail: string
  ) => {
    const key = `${target.budgetId || target.categoryId}-${collaboratorEmail}`;
    setRemovingEmail(key);
    try {
      const res = await fetch("/api/admin/shared-budgets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...target, collaboratorEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove collaborator");
      }

      toast.success(`Removed ${collaboratorEmail}`);
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
          Loading shared budgets & categories...
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
              <CardTitle className="text-lg">Shared Budgets & Categories Management</CardTitle>
              <CardDescription>
                View all budget-level and category-level shared collaborators across the platform.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchSharedBudgets} className="gap-1.5">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Shared Categories Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Layers className="h-4 w-4 text-accent-foreground" />
              Shared Categories ({sharedCategories.length})
            </h3>
            {sharedCategories.length === 0 ? (
              <p className="text-xs text-muted-foreground">No individual shared categories yet.</p>
            ) : (
              <div className="space-y-3">
                {sharedCategories.map((cat) => (
                  <div key={cat._id} className="border rounded-lg p-3 space-y-2 bg-muted/20 text-xs">
                    <div className="flex justify-between items-center border-b pb-1.5">
                      <span className="font-semibold">{cat.name}</span>
                      <Badge variant="outline">{cat.collaborators.length} collaborators</Badge>
                    </div>
                    <div className="space-y-1">
                      {cat.collaborators.map((c, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 rounded border bg-card">
                          <span>{c.email} ({c.role})</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveCollaborator({ categoryId: cat._id }, c.email)}
                            disabled={removingEmail === `${cat._id}-${c.email}`}
                            className="h-6 text-[11px] text-destructive hover:bg-destructive/10 gap-1"
                          >
                            <UserX className="h-3 w-3" />
                            <span>Remove</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shared Budgets Section */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Users className="h-4 w-4 text-accent-foreground" />
              Shared Full Budgets ({sharedBudgets.length})
            </h3>
            {sharedBudgets.length === 0 ? (
              <p className="text-xs text-muted-foreground">No full shared budgets yet.</p>
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
                                onClick={() => handleRemoveCollaborator({ budgetId: b._id }, c.email)}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

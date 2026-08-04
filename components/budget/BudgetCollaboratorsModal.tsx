"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, UserPlus, Mail, Check, AlertCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useFeature } from "@/hooks/useFeatureFlags";
import { PartnerActivityCard } from "./PartnerActivityCard";

interface Collaborator {
  email: string;
  role: "editor" | "viewer";
  status: "pending" | "accepted";
}

interface BudgetCollaboratorsModalProps {
  budgetId: string;
}

export function BudgetCollaboratorsModal({ budgetId }: BudgetCollaboratorsModalProps) {
  const { t } = useTranslation();
  const isEnabled = useFeature("sharedBudgets");
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEnabled || !open || !budgetId) return;

    async function fetchCollaborators() {
      try {
        const res = await fetch(`/api/budgets/${budgetId}/members`);
        if (res.ok) {
          const data = await res.json();
          setCollaborators(data.collaborators || []);
        }
      } catch (err) {
        console.error("Failed to load budget members:", err);
      }
    }

    fetchCollaborators();
  }, [isEnabled, open, budgetId]);

  if (!isEnabled) {
    return null;
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/budgets/${budgetId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: "editor" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add member");
      }

      setCollaborators(data.collaborators || []);
      setEmail("");
      toast.success("Collaborator invited!");
    } catch (err: any) {
      toast.error(err.message || "Failed to invite member");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <Users className="h-3.5 w-3.5" />
          <span>{t("sharedBudgets")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent-foreground" />
            <span>{t("invitePartner")}</span>
          </DialogTitle>
          <DialogDescription>
            {t("referralDesc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddMember} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="collaboratorEmail">{t("invitePartner")}</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="collaboratorEmail"
                  type="email"
                  placeholder={t("collaboratorEmailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>
              <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1">
                <UserPlus className="h-4 w-4" />
                <span>{t("addCollaborator")}</span>
              </Button>
            </div>
          </div>
        </form>

        {collaborators.length > 0 && (
          <PartnerActivityCard collaborators={collaborators} />
        )}

        <div className="space-y-2 pt-3 border-t">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t("sharedBudgets")} ({collaborators.length})
          </div>

          {collaborators.length === 0 ? (
            <div className="text-xs text-muted-foreground py-2 text-center">
              No collaborators added yet. Invite your partner or roommate!
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {collaborators.map((member, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/40 border text-xs"
                >
                  <span className="font-medium text-foreground truncate max-w-[200px]">
                    {member.email}
                  </span>
                  <Badge variant={member.status === "accepted" ? "default" : "outline"} className="text-[10px]">
                    {member.status === "accepted" ? t("invited") : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

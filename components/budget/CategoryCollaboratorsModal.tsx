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
import { Share2, UserPlus, Mail, UserX } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useFeature } from "@/hooks/useFeatureFlags";

interface Collaborator {
  email: string;
  role: "editor" | "viewer";
  status: "pending" | "accepted";
}

interface CategoryCollaboratorsModalProps {
  categoryId: string;
  categoryName: string;
  collaboratorsCount?: number;
}

export function CategoryCollaboratorsModal({
  categoryId,
  categoryName,
  collaboratorsCount = 0,
}: CategoryCollaboratorsModalProps) {
  const { t } = useTranslation();
  const isEnabled = useFeature("categorySharing");
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isEnabled) {
    return null;
  }

  useEffect(() => {
    if (!open || !categoryId) return;

    async function fetchCollaborators() {
      try {
        const res = await fetch(`/api/categories/${categoryId}/members`);
        if (res.ok) {
          const data = await res.json();
          setCollaborators(data.collaborators || []);
        }
      } catch (err) {
        console.error("Failed to load category members:", err);
      }
    }

    fetchCollaborators();
  }, [open, categoryId]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/categories/${categoryId}/members`, {
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
      toast.success(`Collaborator invited to ${categoryName}!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to invite member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (collaboratorEmail: string) => {
    try {
      const res = await fetch(`/api/categories/${categoryId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: collaboratorEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove member");
      }

      setCollaborators(data.collaborators || []);
      toast.success("Collaborator removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove member");
    }
  };

  const activeCount = collaborators.length || collaboratorsCount;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
          title={t("shareCategory")}
        >
          <Share2 className="h-3.5 w-3.5" />
          {activeCount > 0 && (
            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
              {activeCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-accent-foreground" />
            <span>
              {t("shareCategory")}: <span className="text-primary">{categoryName}</span>
            </span>
          </DialogTitle>
          <DialogDescription>{t("shareCategoryDesc")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddMember} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="categoryMemberEmail">Invite Partner or Roommate</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="categoryMemberEmail"
                  type="email"
                  placeholder="roommate@example.com"
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

        <div className="space-y-2 pt-3 border-t">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Category Collaborators ({collaborators.length})
          </div>

          {collaborators.length === 0 ? (
            <div className="text-xs text-muted-foreground py-2 text-center">
              No one else has access to this category.
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
                  <div className="flex items-center gap-1.5">
                    <Badge variant={member.status === "accepted" ? "default" : "outline"} className="text-[10px]">
                      {member.status}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.email)}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    >
                      <UserX className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

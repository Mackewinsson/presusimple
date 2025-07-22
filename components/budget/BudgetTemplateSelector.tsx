"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookTemplate, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  useBudgetTemplates,
  useCreateBudgetTemplate,
  useDeleteBudgetTemplate,
  useBudget,
  useCategories,
  useExpenses,
  useResetBudget,
  useUserId,
} from "@/lib/hooks";
import { LoadingButton } from "@/components/ui/loading-skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const BudgetTemplateSelector = () => {
  const [templateName, setTemplateName] = useState("");

  const { data: userId } = useUserId();
  const { data: templates = [] } = useBudgetTemplates();
  const { data: budget } = useBudget(userId || "");
  const { data: categories = [] } = useCategories(userId || "");
  const { data: expenses = [] } = useExpenses(userId || "");

  const createTemplateMutation = useCreateBudgetTemplate();
  const deleteTemplateMutation = useDeleteBudgetTemplate();
  const resetBudgetMutation = useResetBudget();

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    if (!budget) {
      toast.error("No budget found to save as template");
      return;
    }

    createTemplateMutation.mutate({
      name: templateName.trim(),
      sections: budget.sections.map((section) => ({
        id: section._id || section.id || "",
        name: section.displayName || section.name,
      })),
      categories: categories.map((cat) => ({
        id: cat._id || cat.id || "",
        name: cat.name,
        budgeted: cat.budgeted,
        sectionId: cat.sectionId,
      })),
    });

    setTemplateName("");
  };

  const handleLoadTemplate = (template: any) => {
    // For now, just show a message since we need to implement the load functionality
    // This will be implemented when we add template loading to the backend
    toast.info("Template loading functionality will be implemented soon");
  };

  const handleDeleteTemplate = (id: string) => {
    deleteTemplateMutation.mutate(id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookTemplate className="h-5 w-5 text-primary" />
          Budget Templates
        </CardTitle>
        <CardDescription>Save and load budget templates</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Save Current Budget as Template */}
          <div className="flex gap-2">
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name"
            />
            <LoadingButton
              onClick={handleSaveTemplate}
              className="shrink-0"
              disabled={!templateName.trim()}
              loading={createTemplateMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </LoadingButton>
          </div>

          {/* Template List */}
          <div className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div>
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {template.categories.length} categories in{" "}
                    {template.sections.length} sections
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">Load</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Load Budget Template
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will clear your current budget and load the
                          selected template. Are you sure you want to continue?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleLoadTemplate(template)}
                        >
                          Load Template
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleDeleteTemplate(template.id || template._id || "")
                    }
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetTemplateSelector;

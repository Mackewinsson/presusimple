'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks/useAppSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveTemplate, deleteTemplate } from '@/lib/store/budgetTemplateSlice';
import { resetAll as resetBudget } from '@/lib/store/budgetSlice';
import { resetAll as resetExpenses } from '@/lib/store/expenseSlice';
import { BookTemplate, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
} from '@/components/ui/alert-dialog';

const BudgetTemplateSelector = () => {
  const dispatch = useAppDispatch();
  const [templateName, setTemplateName] = useState('');
  
  const templates = useAppSelector(state => state.budgetTemplates.templates);
  const currentBudget = useAppSelector(state => ({
    sections: state.budget.sections,
    categories: state.budget.categories,
  }));
  
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    
    dispatch(saveTemplate({
      name: templateName.trim(),
      sections: currentBudget.sections,
      categories: currentBudget.categories.map(cat => ({
        ...cat,
        spent: 0,
      })),
    }));
    
    setTemplateName('');
    toast.success('Budget template saved');
  };
  
  const handleLoadTemplate = (template: typeof templates[0]) => {
    dispatch(resetBudget());
    dispatch(resetExpenses());
    
    // Load the template data into the current budget
    template.sections.forEach(section => {
      dispatch({
        type: 'budget/addSection',
        payload: { name: section.name },
      });
    });
    
    template.categories.forEach(category => {
      dispatch({
        type: 'budget/addCategory',
        payload: {
          name: category.name,
          budgeted: category.budgeted,
          sectionId: category.sectionId,
        },
      });
    });
    
    toast.success(`Template "${template.name}" loaded`);
  };
  
  const handleDeleteTemplate = (id: string) => {
    dispatch(deleteTemplate({ id }));
    toast.success('Template deleted');
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
            <Button
              onClick={handleSaveTemplate}
              className="shrink-0"
              disabled={!templateName.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
          
          {/* Template List */}
          <div className="space-y-2">
            {templates.map(template => (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div>
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {template.categories.length} categories in {template.sections.length} sections
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline">Load</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Load Budget Template</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will clear your current budget and load the selected template. 
                          Are you sure you want to continue?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleLoadTemplate(template)}>
                          Load Template
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  {!template.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
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
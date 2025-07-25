"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Check, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
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

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => void;
  onDelete?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  inputClassName?: string;
  validation?: (value: string) => string | null; // Returns error message or null
  showDelete?: boolean;
}

const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  onDelete,
  onCancel,
  placeholder = "Enter value",
  className = "",
  buttonClassName = "h-8 w-8 p-0",
  inputClassName = "flex-1 text-sm sm:text-base",
  validation,
  showDelete = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleStartEdit = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    
    if (trimmedValue === "") {
      toast.error("Please enter a value");
      return;
    }

    if (trimmedValue === value) {
      setIsEditing(false);
      return;
    }

    // Run validation if provided
    if (validation) {
      const error = validation(trimmedValue);
      if (error) {
        toast.error(error);
        return;
      }
    }

    onSave(trimmedValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    onCancel?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={inputClassName}
          autoFocus
          placeholder={placeholder}
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleSave}
          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-medium">{value}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleStartEdit}
        className={buttonClassName}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      {showDelete && onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg sm:text-xl">
                Delete Item
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm sm:text-base">
                Are you sure you want to delete this item? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-sm sm:text-base">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="text-sm sm:text-base"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default InlineEdit; 
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { toast } from "sonner";

interface NewSectionFormProps {
  onComplete: (name: string) => void;
  onCancel: () => void;
}

const NewSectionForm: React.FC<NewSectionFormProps> = ({
  onComplete,
  onCancel,
}) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim() === "") {
      toast.error("Please enter a section name");
      return;
    }

    onComplete(name.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div className="flex flex-col space-y-2">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Section name (e.g., Housing, Food, Transportation)"
          className="w-full text-sm sm:text-base"
          autoFocus
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex items-center justify-center text-sm sm:text-base"
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={name.trim() === ""}
          className="text-sm sm:text-base"
        >
          Add Section
        </Button>
      </div>
    </form>
  );
};

export default NewSectionForm;

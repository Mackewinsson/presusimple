"use client";

import { useState } from "react";
import { useAppDispatch } from "@/lib/hooks/useAppDispatch";
import { addSection } from "@/lib/store/budgetSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface NewSectionFormProps {
  onComplete: () => void;
}

const NewSectionForm: React.FC<NewSectionFormProps> = ({ onComplete }) => {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim() === "") {
      return;
    }

    dispatch(addSection({ name: name.trim() }));
    setName("");
    onComplete();
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
          onClick={onComplete}
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

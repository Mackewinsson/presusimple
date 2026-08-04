"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { PRIVATE_MODE_STORAGE_KEY } from "@/lib/constants/private-mode";

type PrivateModeContextType = {
  isPrivateMode: boolean;
  togglePrivateMode: () => void;
  setPrivateMode: (enabled: boolean) => void;
};

const PrivateModeContext = createContext<PrivateModeContextType | undefined>(
  undefined
);

export function PrivateModeProvider({ children }: { children: React.ReactNode }) {
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(PRIVATE_MODE_STORAGE_KEY);
    setIsPrivateMode(saved === "true");
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    if (isPrivateMode) {
      root.classList.add("private-mode");
    } else {
      root.classList.remove("private-mode");
    }
    localStorage.setItem(PRIVATE_MODE_STORAGE_KEY, String(isPrivateMode));
  }, [isPrivateMode, mounted]);

  const togglePrivateMode = () => {
    setIsPrivateMode((prev) => !prev);
  };

  const setPrivateMode = (enabled: boolean) => {
    setIsPrivateMode(enabled);
  };

  return (
    <PrivateModeContext.Provider
      value={{ isPrivateMode, togglePrivateMode, setPrivateMode }}
    >
      {children}
    </PrivateModeContext.Provider>
  );
}

export function usePrivateMode() {
  const context = useContext(PrivateModeContext);
  if (context === undefined) {
    throw new Error("usePrivateMode must be used within a PrivateModeProvider");
  }
  return context;
}

"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { ThemeMode } from "./types";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({
  children,
  defaultMode = "dark",
}: {
  children: ReactNode;
  defaultMode?: ThemeMode;
}) {
  const [mode, setMode] = React.useState<ThemeMode>(defaultMode);
  const [mounted, setMounted] = React.useState(false);

  // Load theme from localStorage or DOM on mount
  useEffect(() => {
    const saved = localStorage.getItem("calendar-theme") as ThemeMode | null;
    if (saved && (saved === "dark" || saved === "light")) {
      setMode(saved);
    } else {
      // If no saved preference, try to match what's already on the document element
      // (which was set by our blocking script in layout.tsx)
      const isDark = document.documentElement.classList.contains("dark");
      setMode(isDark ? "dark" : "light");
    }
    setMounted(true);
  }, []);

  // Apply theme to DOM (runs only when mode changes)
  useEffect(() => {
    if (!mounted) return; // Prevent initial double-run since script handles it

    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("calendar-theme", mode);
  }, [mode, mounted]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return { mode: "dark" as ThemeMode, toggleTheme: () => {}, mounted: false };
  }
  return context;
}

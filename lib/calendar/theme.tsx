'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { ThemeMode } from './types';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({
  children,
  defaultMode = 'dark',
}: {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}) {
  const [mode, setMode] = React.useState<ThemeMode>(defaultMode);
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('calendar-theme') as ThemeMode | null;
    if (saved) {
      setMode(saved);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('calendar-theme', mode);
  }, [mode, mounted]);

  const toggleTheme = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/calendar/theme';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Home, BookOpen, FileText } from 'lucide-react';

export function Navbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { mode, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <nav className="h-16 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-4 md:px-6" />
    );
  }

  return (
    <nav className="sticky top-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">
        {/* Left: Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
              C
            </div>
          </Link>
          <div className="min-w-0">
            <h1 className="text-base md:text-lg font-semibold text-foreground truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs md:text-sm text-muted-foreground truncate hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 md:gap-2">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-muted"
              title="Home"
            >
              <Home className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/playground">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-muted"
              title="Playground"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/docs">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg hover:bg-muted"
              title="Documentation"
            >
              <BookOpen className="h-4 w-4" />
            </Button>
          </Link>

          <div className="w-px h-6 bg-border" />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-lg hover:bg-muted"
            title={mode === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {mode === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
}

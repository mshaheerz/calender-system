'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarProvider } from '@/lib/calendar/calendar-context';
import { Calendar } from '@/components/calendar';
import { mockEvents, mockResources } from '@/lib/calendar/mock-data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/calendar/theme';

export default function PlaygroundPage() {
  const { mode, toggleTheme } = useTheme();

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Navigation Bar */}
      <div className="bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Calendar Playground</h1>
            <p className="text-xs text-muted-foreground">Interactive demo with all view variants</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {mode === 'dark' ? 'Dark' : 'Light'}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
          >
            {mode === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Link href="/docs">
            <Button variant="outline" size="sm">
              Docs
            </Button>
          </Link>
        </div>
      </div>

      {/* Playground Content */}
      <div className="flex-1 overflow-hidden">
        <CalendarProvider
          initialEvents={mockEvents}
          initialResources={mockResources}
          initialViewMode="month"
          initialThemeMode={mode}
        >
          <Calendar />
        </CalendarProvider>
      </div>

      {/* Footer */}
      <div className="bg-muted/50 border-t border-border px-4 py-2 text-xs text-muted-foreground">
        <p>
          Features: Day, Week, Month views • Resource schedule • Drag & drop • Double-click to create • Theme toggle • Full dark/light support
        </p>
      </div>
    </div>
  );
}

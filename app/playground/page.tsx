'use client';

import React from 'react';
import { CalendarProvider } from '@/lib/calendar/calendar-context';
import { Calendar } from '@/components/calendar';
import { mockEvents, mockResources } from '@/lib/calendar/mock-data';
import { Navbar } from '@/components/navbar';

export default function PlaygroundPage() {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Navbar
        title="Calendar Playground"
        subtitle="Interactive demo with all view variants"
      />

      {/* Playground Content */}
      <div className="flex-1 overflow-hidden">
        <CalendarProvider
          initialEvents={mockEvents}
          initialResources={mockResources}
          initialViewMode="month"
          initialThemeMode="dark"
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

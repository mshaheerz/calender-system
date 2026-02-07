"use client";

import React from "react";
import Link from "next/link";
import { Move } from "lucide-react";
import { CalendarProvider } from "@/lib/calendar/calendar-context";
import { TimelineView } from "@/components/calendar/timeline-view";
import { mockEvents, mockResources } from "@/lib/calendar/mock-data";
import { Navbar } from "@/components/navbar";

export default function TimelineViewExample() {
  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Navbar
        title="Compact Timeline"
        subtitle="Linear event visualization for quick coordination"
      />

      <div className="bg-muted/30 border-b border-border/50 px-6 py-2 flex items-center gap-4">
        <Link
          href="/playground"
          className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-blue-500 transition-colors"
        >
          <Move className="h-3 w-3 rotate-180" /> Back to Playground
        </Link>
      </div>
      <div className="flex-1 overflow-hidden">
        <CalendarProvider
          initialEvents={mockEvents}
          initialResources={mockResources}
        >
          <TimelineView date={new Date()} />
        </CalendarProvider>
      </div>
    </div>
  );
}

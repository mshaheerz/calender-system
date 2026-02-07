"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { GanttContext } from "@/lib/gantt/gantt-context";
import { createGanttRegistry } from "@/lib/gantt/gantt-registry";
import DispatchGanttTimeline from "@/components/gantt/gantt-timeline";
import { Navbar } from "@/components/navbar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Move, Calendar as CalendarIcon, List, Zap } from "lucide-react";

export default function PlaygroundPage() {
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [registry] = useState(createGanttRegistry);
  const [instanceId] = useState(() => Symbol("gantt-instance"));
  const [isDragging, setIsDragging] = useState(false);
  const [isDragEnabled, setIsDragEnabled] = useState(true);

  const contextValue = useMemo(() => {
    return {
      instanceId,
      registerJobCard: registry.registerJobCard,
      registerTechnicianRow: registry.registerTechnicianRow,
      viewMode,
      isDragging,
      setIsDragging,
      isDragEnabled,
      setIsDragEnabled,
    };
  }, [instanceId, viewMode, isDragging, isDragEnabled, registry]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Navbar
        title="Gantt Dispatcher Playground"
        subtitle="Industrial-grade resource scheduling with reactive drag & drop"
      />

      <div className="bg-muted/30 border-b border-border/50 px-6 py-2 flex items-center gap-4">
        <Link
          href="/playground"
          className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:text-blue-500 transition-colors"
        >
          <Move className="h-3 w-3 rotate-180" /> Back to Playground
        </Link>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden p-6 gap-6">
        <GanttContext.Provider value={contextValue}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                <h1 className="text-2xl font-black tracking-tighter uppercase italic">
                  Operations Command
                </h1>
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                Real-time technician orchestration & job allocation
              </p>
            </div>

            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as any)}
              className="w-[400px]"
            >
              <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/50 rounded-xl border border-border/50 shadow-sm">
                <TabsTrigger
                  value="day"
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-[10px] tracking-widest uppercase"
                >
                  <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                  Day
                </TabsTrigger>
                <TabsTrigger
                  value="week"
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-[10px] tracking-widest uppercase"
                >
                  <List className="h-3.5 w-3.5 mr-2" />
                  Week
                </TabsTrigger>
                <TabsTrigger
                  value="month"
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold text-[10px] tracking-widest uppercase"
                >
                  <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                  Month
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 min-h-0 bg-transparent rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
            <DispatchGanttTimeline
              viewMode={viewMode}
              currentDate={new Date()}
              search=""
            />
          </div>
        </GanttContext.Provider>
      </div>

      <div className="bg-muted/30 border-t border-border/50 px-6 py-3 text-[10px] text-muted-foreground flex justify-between items-center">
        <div className="flex gap-6">
          <span className="flex items-center gap-2 font-black uppercase tracking-tighter text-blue-500 dark:text-blue-400">
            <Move className="h-3 w-3" /> DRAG TO ASSIGN
          </span>
          <span className="flex items-center gap-2 font-black uppercase tracking-tighter text-amber-500 dark:text-amber-400">
            <Move className="h-3 w-3 rotate-90" /> RESIZE DURATION
          </span>
        </div>
        <p className="font-black uppercase tracking-tight opacity-50">
          Pragmatic Engine v1.0 • Stable Build
        </p>
      </div>
    </div>
  );
}

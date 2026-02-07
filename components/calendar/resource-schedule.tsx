"use client";

import React, { useState, useMemo } from "react";
import {
  format,
  eachHourOfInterval,
  set,
  isSameDay,
  addMinutes,
  startOfDay,
  endOfDay,
  differenceInMinutes,
} from "date-fns";
import { useCalendarContext } from "@/lib/calendar/calendar-context";
import { CalendarEvent } from "@/lib/calendar/types";
import { X, Clock, ChevronDown, ChevronRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResourceScheduleProps {
  date: Date;
  startHour?: number;
  endHour?: number;
  slotDuration?: number;
}

const EVENT_COLORS: Record<string, string> = {
  meeting: "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700",
  task: "bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700",
  appointment:
    "bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700",
  deadline: "bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700",
  job: "bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700",
  break: "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700",
  maintenance:
    "bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700",
  "resource-allocation":
    "bg-indigo-100 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-700",
};

const PIXELS_PER_HOUR = 96;

export function ResourceSchedule({
  date,
  startHour = 6,
  endHour = 22,
  slotDuration = 60,
}: ResourceScheduleProps) {
  const { events, resources, deleteEvent, updateEvent } = useCalendarContext();
  const [expandedResources, setExpandedResources] = useState<Set<string>>(
    new Set(resources.map((r) => r.id)),
  );
  const [draggingEvent, setDraggingEvent] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<{
    x: number;
    time: Date;
    resourceId: string;
  } | null>(null);

  const hours = useMemo(
    () =>
      eachHourOfInterval({
        start: set(startOfDay(date), { hours: startHour }),
        end: set(endOfDay(date), { hours: endHour }),
      }),
    [date, startHour, endHour],
  );

  const toggleResource = (resourceId: string) => {
    const newExpanded = new Set(expandedResources);
    if (newExpanded.has(resourceId)) {
      newExpanded.delete(resourceId);
    } else {
      newExpanded.add(resourceId);
    }
    setExpandedResources(newExpanded);
  };

  const getResourceEvents = (resourceId: string) => {
    return events.filter(
      (e) =>
        isSameDay(new Date(e.startTime), date) &&
        (e.resourceId === resourceId || e.resourceIds?.includes(resourceId)) &&
        e.id !== draggingEvent,
    );
  };

  const getEventStyle = (event: CalendarEvent) => {
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);

    const durationMinutes = differenceInMinutes(endTime, startTime);
    const width = (durationMinutes / 60) * PIXELS_PER_HOUR;
    const leftOffset =
      (startTime.getHours() - startHour) * PIXELS_PER_HOUR +
      (startTime.getMinutes() / 60) * PIXELS_PER_HOUR;

    return {
      left: `${leftOffset}px`,
      width: `${Math.max(width, 80)}px`,
    };
  };

  const handleEventDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData("eventId", eventId);
    e.dataTransfer.effectAllowed = "move";

    const img = new Image();
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";
    e.dataTransfer.setDragImage(img, 0, 0);

    setDraggingEvent(eventId);
  };

  const handleSlotDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingEvent || !dragPreview) return;

    const event = events.find((ev) => ev.id === draggingEvent);
    if (event) {
      const duration = differenceInMinutes(
        new Date(event.endTime),
        new Date(event.startTime),
      );
      const newStartTime = dragPreview.time;
      const newEndTime = addMinutes(newStartTime, duration);

      updateEvent(draggingEvent, {
        startTime: newStartTime,
        endTime: newEndTime,
        resourceId: dragPreview.resourceId,
      });
    }
    setDraggingEvent(null);
    setDragPreview(null);
  };

  const handleDragOver = (e: React.DragEvent, resourceId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;

    // 96px per hour = 1.6px per minute
    const totalMinutes = x / 1.6;
    const hoursFromStart = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    const previewTime = set(date, {
      hours: startHour + hoursFromStart,
      minutes: Math.max(0, minutes),
      seconds: 0,
    });

    setDragPreview({ x, time: previewTime, resourceId });
  };

  return (
    <div
      className="flex h-full bg-background overflow-hidden"
      onDrop={handleSlotDrop}
    >
      {/* Left Sidebar - Resources List */}
      <div className="w-64 border-r border-border bg-muted/20 overflow-y-auto flex flex-col flex-shrink-0 sticky left-0 z-30">
        <div className="p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-md z-10 flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg uppercase tracking-tighter">
              {format(date, "MMM d")}
            </h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
              Asset Matrix
            </p>
          </div>
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex-1">
          {resources.map((resource) => {
            const isExpanded = expandedResources.has(resource.id);
            const resourceEvents = getResourceEvents(resource.id);
            return (
              <div key={resource.id} className="border-b border-border/50">
                <button
                  onClick={() => toggleResource(resource.id)}
                  className="w-full flex items-center gap-3 bg-muted/30 hover:bg-muted p-4 transition-colors text-left group"
                >
                  <div className="h-6 w-6 rounded-lg bg-background border border-border flex items-center justify-center">
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-xs uppercase tracking-tighter truncate">
                      {resource.name}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                      {resourceEvents.length} Assets Active
                    </p>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Temporal Grid */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Dynamic Header */}
        <div className="flex-shrink-0 border-b border-border px-6 py-4 sticky top-0 z-20 bg-background/95 backdrop-blur-md shadow-sm flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Resource Deployment Matrix
          </p>
          {dragPreview && (
            <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-[10px] font-black shadow-xl animate-in zoom-in-95 duration-200 uppercase tracking-widest flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              {resources.find((r) => r.id === dragPreview.resourceId)?.name} @{" "}
              {format(dragPreview.time, "HH:mm")}
            </div>
          )}
        </div>

        {/* Temporal Scale */}
        <div className="flex-shrink-0 border-b border-border overflow-x-auto bg-muted/5">
          <div className="flex min-w-max">
            {hours.map((hour, idx) => (
              <div
                key={idx}
                className="min-w-24 border-r border-border/50 text-center text-[10px] font-black tracking-widest uppercase text-muted-foreground py-4 bg-muted/5 shadow-inner"
              >
                {format(hour, "HH:00")}
              </div>
            ))}
          </div>
        </div>

        {/* Global Dispatch Area */}
        <div className="flex-1 overflow-auto relative scroll-smooth">
          {resources.map((resource) => {
            const resourceEvents = getResourceEvents(resource.id);
            const isExpanded = expandedResources.has(resource.id);
            const isOverThisResource = dragPreview?.resourceId === resource.id;

            return (
              <div
                key={resource.id}
                className="border-b border-border/50 group/row"
              >
                {/* Resource Header Bar */}
                <div
                  className={cn(
                    "flex items-center h-12 px-6 border-b border-border/30 sticky left-0 z-10 transition-colors uppercase",
                    isExpanded ? "bg-muted/10" : "bg-muted/5",
                    isOverThisResource && "bg-primary/5",
                  )}
                >
                  <div
                    className="w-2 h-2 rounded-full mr-3 shadow-sm"
                    style={{ backgroundColor: resource.color || "#9CA3AF" }}
                  />
                  <span className="text-[11px] font-black tracking-tighter truncate opacity-70 group-hover/row:opacity-100 transition-opacity">
                    {resource.name}
                  </span>
                </div>

                {/* Dispatch Lane */}
                {isExpanded && (
                  <div
                    className={cn(
                      "relative h-16 bg-background transition-colors",
                      isOverThisResource && "bg-primary/[0.02]",
                    )}
                    onDragOver={(e) => handleDragOver(e, resource.id)}
                  >
                    <div className="flex min-w-max relative h-full">
                      {hours.map((_, idx) => (
                        <div
                          key={idx}
                          className="min-w-24 border-r border-border/10 relative h-full"
                        />
                      ))}

                      {/* Precision Vertical Marker */}
                      {isOverThisResource && dragPreview && (
                        <div
                          className="absolute top-0 bottom-0 w-px bg-primary z-40 pointer-events-none shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                          style={{ left: dragPreview.x }}
                        />
                      )}

                      {/* Resource Task Modules */}
                      {resourceEvents.map((event) => {
                        const style = getEventStyle(event);
                        return (
                          <div
                            key={event.id}
                            className={cn(
                              "absolute top-1/2 -translate-y-1/2 rounded-xl border-l-[3px] p-2 text-xs transition-all pointer-events-auto shadow-sm flex flex-col h-12 overflow-hidden",
                              EVENT_COLORS[event.type] || EVENT_COLORS.meeting,
                              "z-10 hover:shadow-xl hover:z-20 group/event",
                            )}
                            style={style}
                            draggable
                            onDragStart={(e) =>
                              handleEventDragStart(e, event.id)
                            }
                            onDragEnd={() => {
                              setDraggingEvent(null);
                              setDragPreview(null);
                            }}
                          >
                            <div className="flex items-start justify-between gap-1 leading-none">
                              <p className="font-black truncate uppercase tracking-tighter text-[9px] flex-1 mt-0.5">
                                {event.title}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteEvent(event.id);
                                }}
                                className="opacity-0 group-hover/event:opacity-100 transition-opacity"
                              >
                                <X className="h-2 w-2" />
                              </button>
                            </div>
                            <div className="mt-auto px-1.5 py-0.5 rounded text-[7.5px] font-black opacity-90 bg-background/30 backdrop-blur-md w-fit border border-white/10 shadow-sm tabular-nums tracking-tighter">
                              {format(new Date(event.startTime), "HH:mm")}
                            </div>
                          </div>
                        );
                      })}

                      {/* High-Contrast Drag Ghost */}
                      {draggingEvent &&
                        isOverThisResource &&
                        dragPreview &&
                        (() => {
                          const event = events.find(
                            (e) => e.id === draggingEvent,
                          );
                          if (!event) return null;
                          const style = getEventStyle(event);
                          return (
                            <div
                              className={cn(
                                "absolute top-1/2 -translate-y-1/2 rounded-xl border-l-[3px] p-2 text-xs transition-all pointer-events-auto z-50 shadow-2xl brightness-110 border-primary flex flex-col h-12 overflow-hidden",
                                EVENT_COLORS[event.type] ||
                                  EVENT_COLORS.meeting,
                              )}
                              style={{
                                ...style,
                                left: `${dragPreview.x}px`,
                                transition: "none",
                              }}
                            >
                              <div className="flex items-start justify-between gap-1 leading-none">
                                <p className="font-black truncate uppercase tracking-tighter text-[9px] flex-1 mt-0.5">
                                  {event.title}
                                </p>
                              </div>
                              <div className="mt-auto px-1.5 py-0.5 rounded text-[7.5px] font-black opacity-90 bg-background/30 backdrop-blur-md w-fit border border-white/10 shadow-sm tabular-nums tracking-tighter text-primary">
                                {format(dragPreview.time, "HH:mm")}
                              </div>
                            </div>
                          );
                        })()}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

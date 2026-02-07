"use client";

import React, { useState, useMemo } from "react";
import {
  format,
  startOfDay,
  endOfDay,
  eachHourOfInterval,
  isSameDay,
  set,
  addMinutes,
  differenceInMinutes,
} from "date-fns";
import { useCalendarContext } from "@/lib/calendar/calendar-context";
import { CalendarEvent } from "@/lib/calendar/types";
import { X, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimelineViewProps {
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

export function TimelineView({
  date,
  startHour = 6,
  endHour = 22,
  slotDuration = 60,
}: TimelineViewProps) {
  const { events, deleteEvent, updateEvent } = useCalendarContext();
  const [draggingEvent, setDraggingEvent] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<{
    x: number;
    time: Date;
  } | null>(null);

  const dayEvents = useMemo(
    () =>
      events
        .filter((e) => isSameDay(new Date(e.startTime), date) && !e.allDay)
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        ),
    [events, date],
  );

  const hours = useMemo(
    () =>
      eachHourOfInterval({
        start: set(startOfDay(date), { hours: startHour }),
        end: set(endOfDay(date), { hours: endHour }),
      }),
    [date, startHour, endHour],
  );

  const getEventStyle = (event: CalendarEvent) => {
    const isDragging = draggingEvent === event.id;
    let startTime = new Date(event.startTime);
    let endTime = new Date(event.endTime);

    if (isDragging && dragPreview) {
      const duration = differenceInMinutes(endTime, startTime);
      startTime = dragPreview.time;
      endTime = addMinutes(startTime, duration);
    }

    const durationMinutes = differenceInMinutes(endTime, startTime);
    const width = (durationMinutes / 15) * 24; // Precision mapping

    // 96px per hour = 1.6px per minute in current grid
    const leftOffset =
      (startTime.getHours() - startHour) * 96 +
      (startTime.getMinutes() / 60) * 96;

    return {
      left: `${leftOffset}px`,
      width: `${Math.max(width, 100)}px`,
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

  const handleRowDrop = (e: React.DragEvent) => {
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
      });
    }
    setDraggingEvent(null);
    setDragPreview(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Precision mapping: 96px per hour = 1.6px per minute
    const totalMinutes = x / 1.6;
    const hoursFromStart = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    const previewTime = set(date, {
      hours: startHour + hoursFromStart,
      minutes: Math.max(0, minutes),
      seconds: 0,
    });

    setDragPreview({ x, time: previewTime });
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-background">
      {/* Top Controls */}
      <div className="flex-shrink-0 p-4 border-b border-border bg-background/95 backdrop-blur-md z-30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-black text-xl tracking-tighter uppercase tabular-nums">
              {format(date, "EEEE, MMM d")}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {dayEvents.length} Active Real-time Cycles
            </p>
          </div>
        </div>

        {dragPreview && (
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-[10px] font-black shadow-2xl animate-in zoom-in-95 duration-200 uppercase tracking-widest flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Active: {format(dragPreview.time, "HH:mm")}
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-auto">
        {/* Resource Sidebar */}
        <div className="w-80 border-r border-border bg-muted/20 sticky left-0 z-20 flex flex-col shrink-0">
          <div className="p-4 border-b border-border bg-muted/30">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              Module Matrix
            </p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {dayEvents.map((event, idx) => (
              <div
                key={event.id}
                className={cn(
                  "h-16 border-b border-border/50 flex items-center px-4 transition-colors",
                  draggingEvent === event.id
                    ? "bg-primary/5"
                    : "hover:bg-muted/10",
                )}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center font-black text-[10px] text-muted-foreground shadow-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[11px] uppercase tracking-tighter truncate">
                      {event.title}
                    </p>
                    <p className="text-[8px] font-bold text-muted-foreground">
                      {format(new Date(event.startTime), "HH:mm")} -{" "}
                      {format(new Date(event.endTime), "HH:mm")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="flex-1 relative min-w-max">
          {/* Hour Scale */}
          <div className="flex sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
            {hours.map((hour, idx) => (
              <div
                key={idx}
                className="min-w-24 border-r border-border/50 text-center text-[10px] font-black tracking-widest uppercase text-muted-foreground py-4 bg-muted/5"
              >
                {format(hour, "HH:00")}
              </div>
            ))}
          </div>

          {/* Draggable Rows */}
          <div
            className="relative"
            onDragOver={handleDragOver}
            onDrop={handleRowDrop}
          >
            {dayEvents.map((event) => {
              const isDragging = draggingEvent === event.id;
              const style = getEventStyle(event);

              return (
                <div
                  key={event.id}
                  className="h-16 border-b border-border/30 relative flex items-center group/row"
                >
                  {/* Visual Grid markers */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {hours.map((_, i) => (
                      <div
                        key={i}
                        className="min-w-24 border-r border-border/10"
                      />
                    ))}
                  </div>

                  {/* The Card */}
                  <div
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 rounded-xl border-l-[3px] p-2 text-xs transition-all pointer-events-auto shadow-md flex flex-col h-12 overflow-hidden",
                      EVENT_COLORS[event.type] || EVENT_COLORS.meeting,
                      isDragging
                        ? "z-50 shadow-2xl brightness-110 border-primary cursor-none"
                        : "z-10 hover:shadow-xl hover:z-20 cursor-move",
                    )}
                    style={{
                      ...style,
                      transition: isDragging
                        ? "none"
                        : "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    draggable
                    onDragStart={(e) => handleEventDragStart(e, event.id)}
                    onDragEnd={() => {
                      setDraggingEvent(null);
                      setDragPreview(null);
                    }}
                  >
                    <div className="flex items-start justify-between gap-1 leading-none">
                      <p className="font-black truncate uppercase tracking-tighter text-[10px] flex-1 mt-0.5">
                        {event.title}
                      </p>
                      {!isDragging && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEvent(event.id);
                          }}
                          className="opacity-0 group-hover/event:opacity-100 transition-opacity"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </div>
                    <div className="mt-auto px-1.5 py-0.5 rounded text-[8px] font-black opacity-90 bg-background/30 backdrop-blur-md w-fit border border-white/10 shadow-sm tabular-nums tracking-tighter">
                      {format(
                        isDragging && dragPreview
                          ? dragPreview.time
                          : new Date(event.startTime),
                        "HH:mm",
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Drag Line Indicator */}
            {dragPreview && (
              <div
                className="absolute top-0 bottom-0 w-px bg-primary z-40 pointer-events-none shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                style={{ left: dragPreview.x }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

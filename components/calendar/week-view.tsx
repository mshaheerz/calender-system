"use client";

import React, { useState, useMemo } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachHourOfInterval,
  set,
  isSameDay,
  addMinutes,
  differenceInMinutes,
} from "date-fns";
import { useCalendarContext } from "@/lib/calendar/calendar-context";
import { CalendarEvent } from "@/lib/calendar/types";
import { ChevronLeft, ChevronRight, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WeekViewProps {
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

const PIXELS_PER_HOUR = 60; // Standardize with DayView

export function WeekView({
  date,
  startHour = 6,
  endHour = 22,
  slotDuration = 60,
}: WeekViewProps) {
  const { events, deleteEvent, updateEvent, selectDate } = useCalendarContext();
  const [draggingEvent, setDraggingEvent] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<{
    time: Date;
    day: Date;
    y: number;
  } | null>(null);

  const displayWeekStart = startOfWeek(date);
  const weekEnd = endOfWeek(displayWeekStart);
  const days = eachDayOfInterval({ start: displayWeekStart, end: weekEnd });
  const hours = eachHourOfInterval({
    start: set(displayWeekStart, { hours: startHour, minutes: 0, seconds: 0 }),
    end: set(displayWeekStart, { hours: endHour, minutes: 0, seconds: 0 }),
  });

  const getEventPosition = (
    event: CalendarEvent,
    totalInGroup = 1,
    indexInGroup = 0,
    isDragging = false,
  ) => {
    let startTime = new Date(event.startTime);
    let endTime = new Date(event.endTime);

    if (isDragging && dragPreview) {
      const duration = differenceInMinutes(endTime, startTime);
      startTime = dragPreview.time;
      endTime = addMinutes(startTime, duration);
    }

    const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
    const dayStartMinutes = startHour * 60;
    const top = ((startMinutes - dayStartMinutes) / 60) * PIXELS_PER_HOUR;

    const durationMinutes = differenceInMinutes(endTime, startTime);
    const height = (durationMinutes / 60) * PIXELS_PER_HOUR;

    const width = 95 / totalInGroup;
    const left = indexInGroup * width;

    return {
      top: `${top}px`,
      height: `${Math.max(height, 24)}px`,
      left: `${left}%`,
      width: `${width}%`,
    };
  };

  const getDayEventsWithOverlap = (day: Date) => {
    const dayEvents = events.filter(
      (e) =>
        isSameDay(new Date(e.startTime), day) &&
        !e.allDay &&
        e.id !== draggingEvent,
    );

    if (draggingEvent && dragPreview && isSameDay(dragPreview.day, day)) {
      const ev = events.find((e) => e.id === draggingEvent);
      if (ev) dayEvents.push(ev);
    }

    const timedEvents = dayEvents.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    const groups: CalendarEvent[][] = [];
    timedEvents.forEach((event) => {
      let added = false;
      for (const group of groups) {
        const lastEvent = group[group.length - 1];
        if (new Date(event.startTime) < new Date(lastEvent.endTime)) {
          group.push(event);
          added = true;
          break;
        }
      }
      if (!added) groups.push([event]);
    });

    return timedEvents.map((event) => {
      const group = groups.find((g) => g.includes(event)) || [event];
      const index = group.indexOf(event);
      return { event, total: group.length, index };
    });
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
      });
    }
    setDraggingEvent(null);
    setDragPreview(null);
  };

  const handleDragOver = (e: React.DragEvent, day: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;

    // 60px per hour => 1px = 1 minute
    const totalMinutes = y;
    const hoursFromStart = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    const previewTime = set(day, {
      hours: startHour + hoursFromStart,
      minutes: minutes,
      seconds: 0,
    });
    setDragPreview({ time: previewTime, day, y });
  };

  return (
    <div
      className="flex flex-col h-full bg-background overflow-hidden"
      onDrop={handleSlotDrop}
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-border px-6 py-4 sticky top-0 z-30 bg-background/95 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() =>
                selectDate(
                  new Date(
                    displayWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000,
                  ),
                )
              }
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() =>
                selectDate(
                  new Date(
                    displayWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000,
                  ),
                )
              }
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <span className="font-black text-xl italic tracking-tighter uppercase tabular-nums">
            {format(displayWeekStart, "MMM d")} -{" "}
            {format(weekEnd, "MMM d, yyyy")}
          </span>
        </div>

        {dragPreview && (
          <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-[10px] font-black shadow-xl animate-in zoom-in-95 duration-200 uppercase tracking-widest">
            {format(dragPreview.day, "EEEE")} @{" "}
            {format(dragPreview.time, "HH:mm")}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex min-w-max">
          {/* Time Column */}
          <div className="w-16 flex-shrink-0 bg-muted/30 border-r border-border sticky left-0 z-20 backdrop-blur-sm">
            <div className="h-12 border-b border-border"></div>
            {hours.map((hour, idx) => (
              <div
                key={idx}
                className="h-[60px] border-b border-border/50 p-1 text-[10px] text-muted-foreground font-black flex items-start justify-center pt-2 uppercase tracking-widest"
              >
                {format(hour, "HH:00")}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="flex-1 flex flex-col">
            <div className="flex border-b border-border bg-muted/5 sticky top-0 z-10 backdrop-blur-md">
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className="w-48 flex-1 border-r border-border p-3 text-center transition-colors"
                >
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                    {format(day, "EEE")}
                  </p>
                  <p
                    className={cn(
                      "text-sm font-black tabular-nums",
                      isSameDay(day, new Date())
                        ? "text-primary bg-primary/10 rounded-lg py-1 shadow-sm border border-primary/20"
                        : "text-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-1 relative">
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className="w-48 flex-1 border-r border-border relative group/day min-h-screen"
                  onDragOver={(e) => handleDragOver(e, day)}
                >
                  {hours.map((_, i) => (
                    <div
                      key={i}
                      className="h-[60px] border-b border-border/30 pointer-events-none"
                    />
                  ))}

                  {/* Indicator Line */}
                  {dragPreview && isSameDay(dragPreview.day, day) && (
                    <div
                      className="absolute left-0 right-0 h-px bg-primary z-40 pointer-events-none shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                      style={{ top: dragPreview.y }}
                    />
                  )}

                  {/* Events */}
                  <div className="absolute inset-0 pointer-events-none">
                    {getDayEventsWithOverlap(day).map(
                      ({ event, total, index }) => {
                        const isEventDragging = draggingEvent === event.id;
                        const pos = getEventPosition(
                          event,
                          total,
                          index,
                          isEventDragging,
                        );

                        return (
                          <div
                            key={event.id}
                            className={cn(
                              "absolute p-1 rounded-xl border-l-[3px] text-[10px] transition-all pointer-events-auto shadow-sm select-none",
                              EVENT_COLORS[event.type] || EVENT_COLORS.meeting,
                              isEventDragging
                                ? "z-50 shadow-2xl border-primary brightness-110"
                                : "z-10 hover:shadow-xl hover:z-20",
                              "group/event overflow-hidden",
                            )}
                            style={{
                              top: pos.top,
                              height: pos.height,
                              left: pos.left,
                              width: pos.width,
                              transition: isEventDragging
                                ? "none"
                                : "all 0.2s ease-out",
                            }}
                            draggable
                            onDragStart={(e) =>
                              handleEventDragStart(e, event.id)
                            }
                            onDragEnd={() => {
                              setDraggingEvent(null);
                              setDragPreview(null);
                            }}
                          >
                            <div className="flex flex-col h-full w-full p-1.5">
                              <div className="flex items-start justify-between gap-1 leading-none">
                                <p className="font-black truncate uppercase tracking-tighter text-[9px] flex-1 mt-0.5">
                                  {event.title}
                                </p>
                                {!isEventDragging && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteEvent(event.id);
                                    }}
                                    className="opacity-0 group-hover/event:opacity-100 transition-opacity"
                                  >
                                    <X className="h-2 w-2" />
                                  </button>
                                )}
                              </div>
                              <div className="mt-auto px-1 py-0.5 rounded text-[7.5px] font-black opacity-90 bg-background/30 backdrop-blur-md w-fit border border-white/10 shadow-sm tabular-nums tracking-tighter">
                                {format(
                                  isEventDragging && dragPreview
                                    ? dragPreview.time
                                    : new Date(event.startTime),
                                  "HH:mm",
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

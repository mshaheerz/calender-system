"use client";

import React, { useState, useMemo } from "react";
import {
  format,
  eachHourOfInterval,
  isSameDay,
  set,
  addMinutes,
  differenceInMinutes,
} from "date-fns";
import { useCalendarContext } from "@/lib/calendar/calendar-context";
import { CalendarEvent } from "@/lib/calendar/types";
import { X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DayViewProps {
  date: Date;
  startHour?: number;
  endHour?: number;
  slotDuration?: number;
  onCreateEvent?: (startTime: Date, endTime: Date) => void;
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

export function DayView({
  date,
  startHour = 6,
  endHour = 22,
  slotDuration = 60,
  onCreateEvent,
}: DayViewProps) {
  const { events, deleteEvent, updateEvent } = useCalendarContext();
  const [draggingEvent, setDraggingEvent] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<{
    y: number;
    time: Date;
  } | null>(null);

  const dayEvents = events.filter((e) =>
    isSameDay(new Date(e.startTime), date),
  );

  const hours = eachHourOfInterval({
    start: set(date, { hours: startHour, minutes: 0, seconds: 0 }),
    end: set(date, { hours: endHour, minutes: 0, seconds: 0 }),
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
    const top = ((startMinutes - dayStartMinutes) / slotDuration) * 60;

    const durationMinutes = differenceInMinutes(endTime, startTime);
    const height = (durationMinutes / slotDuration) * 60;

    const width = 100 / totalInGroup;
    const left = indexInGroup * width;

    return {
      top: `${top}px`,
      height: `${Math.max(height, 24)}px`,
      left: `${left}%`,
      width: `${width}%`,
    };
  };

  const getDayEventsWithOverlap = useMemo(() => {
    const timedEvents = dayEvents
      .filter((e) => !e.allDay)
      .sort(
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
  }, [dayEvents]);

  const handleEventDragStart = (e: React.DragEvent, eventId: string) => {
    e.dataTransfer.setData("eventId", eventId);
    e.dataTransfer.effectAllowed = "move";

    // Create empty image to hide default ghost
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;

    // Really flexible 1-minute precision
    const totalMinutes = y;
    const hoursFromStart = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    const previewTime = set(date, {
      hours: startHour + hoursFromStart,
      minutes: minutes,
      seconds: 0,
    });

    setDragPreview({ y, time: previewTime });
  };

  return (
    <div className="flex-1 bg-background flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-6 py-4 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tighter uppercase">
            {format(date, "EEEE, MMM d")}
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
            {dayEvents.length} Active Modules
          </p>
        </div>

        {dragPreview && (
          <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-[10px] font-black shadow-xl animate-in zoom-in-95 duration-200 uppercase tracking-widest border border-primary/20">
            Realtime: {format(dragPreview.time, "HH:mm")}
          </div>
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto relative"
        onDragOver={handleDragOver}
        onDrop={handleSlotDrop}
      >
        {/* Real-time Drag Indicator Line */}
        {dragPreview && (
          <div
            className="absolute left-0 right-0 h-px bg-primary z-40 pointer-events-none transition-all duration-75 shadow-[0_0_15px_rgba(var(--primary),0.5)]"
            style={{ top: dragPreview.y }}
          >
            <div className="absolute left-16 top-0 w-full border-t border-dashed border-primary/30" />
          </div>
        )}

        <div className="flex flex-col">
          {hours.map((hour, idx) => (
            <div
              key={idx}
              className="flex border-b border-border/50 min-h-[60px] relative group"
            >
              <div className="w-16 bg-muted/5 border-r border-border flex items-start justify-center pt-2 text-[10px] text-muted-foreground font-black tracking-widest sticky left-0 z-10 uppercase backdrop-blur-sm">
                {format(hour, "HH:00")}
              </div>
              <div className="flex-1" />
            </div>
          ))}

          {/* Floating Events (Absolutely Positioned) */}
          <div className="absolute top-0 left-16 right-0 bottom-0 pointer-events-none">
            {getDayEventsWithOverlap.map(({ event, total, index }) => {
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
                    "absolute p-1 rounded-xl border-l-[3px] text-xs transition-all pointer-events-auto shadow-sm select-none",
                    EVENT_COLORS[event.type] || EVENT_COLORS.meeting,
                    isEventDragging
                      ? "z-50 shadow-2xl scale-[1.02] border-primary brightness-110"
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
                      : "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  draggable
                  onDragStart={(e) => handleEventDragStart(e, event.id)}
                  onDragEnd={() => {
                    setDraggingEvent(null);
                    setDragPreview(null);
                  }}
                >
                  <div className="flex flex-col h-full w-full p-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-black truncate uppercase tracking-tighter text-[10px] leading-none flex-1 mt-0.5">
                        {event.title}
                      </p>
                      {!isEventDragging && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEvent(event.id);
                          }}
                          className="opacity-0 group-hover/event:opacity-100 transition-opacity shrink-0"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      )}
                    </div>

                    <div className="mt-auto flex items-center gap-1">
                      <div className="bg-background/40 backdrop-blur-md border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-black tabular-nums tracking-tighter shadow-sm">
                        {format(
                          isEventDragging && dragPreview
                            ? dragPreview.time
                            : new Date(event.startTime),
                          "HH:mm",
                        )}
                      </div>
                      {parseFloat(pos.height) > 40 && (
                        <div className="opacity-40 text-[8px] font-bold uppercase truncate">
                          {event.type}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
